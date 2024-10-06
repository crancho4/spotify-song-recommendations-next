import NextAuth from 'next-auth';
import SpotifyProvider from 'next-auth/providers/spotify';

const scopes = [
  'playlist-read-private',
  'user-read-private',
  'user-read-email',
  'playlist-read-collaborative',
  'user-top-read',
  'playlist-modify-public',  
  'playlist-modify-private',
].join(',');

// Utility function to handle Spotify API requests with rate-limiting logic
async function spotifyApiRequest(url, options) {
  try {
    const response = await fetch(url, options);

    // Handle rate limit (HTTP 429)
    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After');
      console.warn(`Rate limit hit, retrying after ${retryAfter} seconds`);
      await new Promise((resolve) => setTimeout(resolve, retryAfter * 1000)); // Wait for Retry-After time
      return spotifyApiRequest(url, options); // Retry the request
    }

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Spotify API request failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Error with Spotify API request:', error);
    throw error;
  }
}

// Refresh the Spotify access token
async function refreshAccessToken(token) {
  try {
    const url = 'https://accounts.spotify.com/api/token';
    const params = new URLSearchParams();
    params.append('grant_type', 'refresh_token');
    params.append('refresh_token', token.refreshToken);
    params.append('client_id', process.env.SPOTIFY_CLIENT_ID);
    params.append('client_secret', process.env.SPOTIFY_CLIENT_SECRET);

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    };

    const refreshedTokens = await spotifyApiRequest(url, options);

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000, // 1 hour
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken, // Fall back to old refresh token
    };
  } catch (error) {
    console.error('Error refreshing access token:', error);

    return {
      ...token,
      error: 'RefreshAccessTokenError',
    };
  }
}

// Main NextAuth configuration
export default NextAuth({
  providers: [
    SpotifyProvider({
      clientId: process.env.SPOTIFY_CLIENT_ID,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
      authorization: {
        params: {
          scope: scopes,
        },
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, account }) {
      // Initial sign in
      if (account) {
        return {
          accessToken: account.access_token,
          accessTokenExpires: Date.now() + account.expires_in * 1000, // handling expiration time in ms
          refreshToken: account.refresh_token,
          user: account,
        };
      }

      // If the access token has not expired, return the previous token
      if (Date.now() < token.accessTokenExpires - 5 * 60 * 1000) { // 5-minute buffer
        return token;
      }

      // Access token has expired, refresh it
      return refreshAccessToken(token);
    },

    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.error = token.error;
      return session;
    },
  },
});
