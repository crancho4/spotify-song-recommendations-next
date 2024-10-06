export default async function handler(req, res) {
    const {
      SPOTIFY_CLIENT_ID,
      SPOTIFY_CLIENT_SECRET,
      SPOTIFY_REDIRECT_URI,
      SPOTIFY_SCOPES,
    } = process.env;
  
    // Console log the credentials to check if they're being loaded
    console.log({
      SPOTIFY_CLIENT_ID,
      SPOTIFY_CLIENT_SECRET,
      SPOTIFY_REDIRECT_URI,
      SPOTIFY_SCOPES,
    });
  
    // Basic Authorization Header
    const authHeader = Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64');
  
    try {
      // Send a POST request to Spotify's /api/token endpoint to test the credentials
      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${authHeader}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
        }).toString(),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error fetching Spotify token:", errorData);
        return res.status(500).json({ error: 'Failed to authenticate with Spotify' });
      }
  
      const data = await response.json();
      console.log("Spotify Token Response:", data);
  
      res.status(200).json({
        message: 'Spotify credentials are working',
        token: data,
      });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ error: 'Something went wrong' });
    }
  }
  