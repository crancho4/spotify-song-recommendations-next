import axios from 'axios';

export default async function handler(req, res) {
  const { mood, accessToken } = req.body;

  const moodCriteria = {
    happy: { energy: 0.8, tempo: 120 },
    sad: { energy: 0.3, tempo: 60 },
    energetic: { energy: 0.9, tempo: 140 },
  };

  try {
    const response = await axios.get(
      `https://api.spotify.com/v1/recommendations`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: {
          limit: 10,
          seed_genres: 'pop',
          target_energy: moodCriteria[mood].energy,
          target_tempo: moodCriteria[mood].tempo,
        },
      }
    );
    res.status(200).json(response.data.tracks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch recommendations' });
  }
}
