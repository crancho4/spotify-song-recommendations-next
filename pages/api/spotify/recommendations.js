import { getSession } from 'next-auth/react';

export default async (req, res) => {
  const session = await getSession({ req });

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { seed_tracks } = req.query;

  const response = await fetch(
    `https://api.spotify.com/v1/recommendations?seed_tracks=${seed_tracks}`,
    {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    }
  );

  const data = await response.json();
  res.status(200).json({ recommendations: data.tracks });
};
