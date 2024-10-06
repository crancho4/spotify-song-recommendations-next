import { useEffect, useState } from 'react';
import { signIn, signOut, useSession } from 'next-auth/react';


export default function Home() {
  const { data: session } = useSession();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
