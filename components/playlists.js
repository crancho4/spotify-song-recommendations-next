import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

export default function Playlists() {
  const { data: session } = useSession();
  const [playlists, setPlaylists] = useState([]);

  useEffect(() => {
    if (session) {
      fetch('https://api.spotify.com/v1/me/playlists', {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      })
        .then(res => res.json())
        .then(data => setPlaylists(data.items));
    }
  }, [session]);

  if (!session) {
    return <p>Please log in to see your playlists</p>;
  }

  return (
    <div>
      <h1>Your Spotify Playlists</h1>
      <ul>
        {playlists.map(playlist => (
          <li key={playlist.id}>
            {playlist.name} - {playlist.tracks.total} songs
          </li>
        ))}
      </ul>
    </div>
  );
}
