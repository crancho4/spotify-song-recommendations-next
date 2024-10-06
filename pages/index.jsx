import { useEffect, useState } from 'react';
import { signIn, signOut, useSession } from 'next-auth/react';


export default function Home() {
  const { data: session } = useSession();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedTracks, setSelectedTracks] = useState([]);


  useEffect(() => {
    if (session && recommendations.length === 0) {
      fetchRecommendations(); // Automatically fetch recommendations when the session is available
    }
  }, [session]);

  const fetchRecommendations = async () => {
  setLoading(true);
  setError(null);

  try {
    // Fetch user's top tracks
    const topTracksRes = await fetch('/api/spotify/top-tracks');
    const { topTracks } = await topTracksRes.json();

    if (!topTracks || topTracks.length === 0) {
      console.error('No top tracks found');
      setError('No top tracks available');
      return;
    }

    const seedTracks = topTracks.slice(0, 5).map(track => track.id).join(',');

    // Fetch recommendations
    const recRes = await fetch(`/api/spotify/recommendations?seed_tracks=${seedTracks}`);
    const { recommendations } = await recRes.json();

    if (!recommendations) {
      setError('No recommendations found');
      return;
    }

    setRecommendations(recommendations);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      setError('Failed to fetch recommendations');
    } finally {
      setLoading(false);
    }
  };


  


  const toggleTrackSelection = (track) => {
    setSelectedTracks((prevSelected) =>
      prevSelected.includes(track.id)
        ? prevSelected.filter((id) => id !== track.id)
        : [...prevSelected, track.id]
    );
  };

  const createPlaylist = async () => {
    if (!selectedTracks.length) {
      alert('Please select at least one track to create a playlist.');
      return;
    }

    try {
      // Fetch user ID
      const userIdRes = await fetch('https://api.spotify.com/v1/me', {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      });
      const { id: userId } = await userIdRes.json();

      // Create a new playlist
      const url = `https://api.spotify.com/v1/users/${userId}/playlists`; // Use userId here
      const options = {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'My New Playlist',
          description: 'A playlist created from my app',
          public: false,
        }),
      };

      const response = await fetch(url, options);
      const playlist = await response.json();

      if (playlist.id) {
        // Now add selected tracks to the created playlist
        await addTracksToPlaylist(playlist.id);
      }
    } catch (error) {
      console.error('Error creating playlist:', error);
    }
  };

  // Function to add selected tracks to the playlist
  const addTracksToPlaylist = async (playlistId) => {
    const url = `https://api.spotify.com/v1/playlists/${playlistId}/tracks`;
    const options = {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        uris: selectedTracks.map((trackId) => `spotify:track:${trackId}`),
      }),
    };

    try {
      await fetch(url, options);
      alert('Playlist created successfully!');
    } catch (error) {
      console.error('Error adding tracks to playlist:', error);
    }
  };
  
  

  return (
    <div style={styles.container}>
      <main style={styles.main}>
        {!session ? (
          <div style={styles.welcome}>
            <button style={styles.largeButton} onClick={() => signIn('spotify')}>
              Login with Spotify
            </button>
          </div>
        ) : (
          <>
            <h2 style={styles.recommendationTitle}>Recommended for You</h2>
            <button style={styles.refreshButton} onClick={fetchRecommendations} disabled={loading}>
              {loading ? 'Refreshing...' : 'Refresh Recommendations'}
            </button>
            <div style={styles.recommendations}>
            {recommendations.map((track) => (
              <div key={track.id} style={styles.track}>
                <img src={track.album.images[0].url} alt={track.name} style={styles.trackImage} />
                <div>
                  <h4>{track.name}</h4>
                  <p>{track.artists.map((artist) => artist.name).join(', ')}</p>
                </div>

                {/* Checkbox to select/deselect the track */}
                <input
                  type="checkbox"
                  checked={selectedTracks.includes(track.id)}
                  onChange={() => toggleTrackSelection(track)}
                />

                {/* Check if the track has a preview URL */}
                {track.preview_url ? (
                  <audio controls style={styles.audioPlayer}>
                    <source src={track.preview_url} type="audio/mpeg" />
                    Your browser does not support the audio element.
                  </audio>
                ) : (
                  <p style={styles.noPreviewText}>No Preview Available</p>
                )}

                {/* Link to Spotify */}
                <a href={track.external_urls.spotify} target="_blank" rel="noopener noreferrer" style={styles.trackLink}>
                  Open in Spotify
                </a>
                
              </div>
            ))}
          </div>
          </>
        )}
      </main>
      <button onClick={createPlaylist} style={styles.createPlaylistButton}>
        Create Playlist
      </button>
    </div>
  );
}

// Refined styles
const styles = {
  
  audioPlayer: {
    width: '100%',
    marginTop: '10px',
  },
  noPreviewText: {
    marginTop: '10px',
    fontStyle: 'italic',
    color: 'gray',
  },
  
  recommendationTitle: {
    marginTop: '40px',
    fontSize: '24px',
  },
  recommendations: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: '20px',
    marginTop: '20px',
  },
  track: {
    backgroundColor: '#1e1e1e',
    borderRadius: '10px',
    padding: '10px',
    textAlign: 'center',
    maxWidth: '200px',
  },
  trackImage: {
    width: '100%',
    borderRadius: '10px',
  },
};
