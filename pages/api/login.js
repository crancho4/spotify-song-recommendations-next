import querystring from 'querystring';

export default function handler(req, res) {
  const scope = process.env.NEXT_PUBLIC_SPOTIFY_SCOPES;
  const redirectUri = process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI;
  const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;

  const spotifyUrl = 'https://accounts.spotify.com/authorize?' + 
    querystring.stringify({
      response_type: 'code',
      client_id: clientId,
      scope: scope,
      redirect_uri: redirectUri,
    });

  res.redirect(spotifyUrl);
}

