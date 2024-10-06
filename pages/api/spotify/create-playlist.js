import { getSession } from 'next-auth/react';


export default async (req, res) => {
  const { trackIds } = req.body;

  if (!trackIds || !Array.isArray(trackIds) || !trackIds.length) {
    return res.status(400).json({ error: 'No tracks selected' });
  }

  const { accessToken } = await getSession({ req });

  if (!accessToken) {
    return res.status(401).json({ error: 'Access token is required' });
  }

  try {
    const userProfileRes = await fetch('https://api.spotify.com/v1/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (userProfileRes.status === 401) {
      return res.status(401).json({ error: 'Invalid or expired access token' });
    }

    if (!userProfileRes.ok) {
      const errorMsg = await userProfileRes.text();
      console.error('Error fetching user profile:', errorMsg);
      return res.status(userProfileRes.status).json({ error: 'Failed to fetch user profile' });
    }

    const userProfile = await userProfileRes.json();
    const userId = userProfile.id;

    const createPlaylistRes = await fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'My New Playlist',
        description: 'Playlist created from my app',
        public: false,
      }),
    });

    if (!createPlaylistRes.ok) {
      const errorMsg = await createPlaylistRes.text();
      console.error('Error creating playlist:', errorMsg);
      return res.status(createPlaylistRes.status).json({ error: 'Failed to create playlist' });
    }

    const playlistData = await createPlaylistRes.json();

    const addTracksRes = await fetch(`https://api.spotify.com/v1/playlists/${playlistData.id}/tracks`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        uris: trackIds.map((id) => `spotify:track:${id}`),
      }),
    });

    if (!addTracksRes.ok) {
      const errorMsg = await addTracksRes.text();
      console.error('Error adding tracks:', errorMsg);
      return res.status(addTracksRes.status).json({ error: 'Failed to add tracks to playlist' });
    }

    return res.status(201).json({
      message: 'Playlist created successfully',
      playlistUrl: playlistData.external_urls.spotify,
      playlistId: playlistData.id,
      playlistName: playlistData.name,
    });
  } catch (error) {
    console.error('Error creating playlist:', error.message || error);
    return res.status(500).json({ error: 'Failed to create playlist or add tracks' });
  }
};
