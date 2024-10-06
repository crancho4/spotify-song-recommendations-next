import { useEffect, useState } from 'react';
import { signIn, signOut, useSession } from 'next-auth/react';


export default function Home() {
  const { data: session } = useSession();
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    if (session) {
      fetchRecommendations();
    }
  }, [session]);

  const fetchRecommendations = async () => {
    try {
      // Fetch user's top tracks
      const topTracksRes = await fetch('/api/spotify/top-tracks');
      const { topTracks } = await topTracksRes.json();
  
      // Log topTracks to debug the response
      console.log('Top Tracks:', topTracks);
  
      if (!topTracks || topTracks.length === 0) {
        console.error('No top tracks found');
        return;
      }
  
      // Get the top 5 track IDs as seeds
      const seedTracks = topTracks.slice(0, 5).map((track) => track.id).join(',');
  
      // Fetch recommendations using the seed tracks
      const recRes = await fetch(`/api/spotify/recommendations?seed_tracks=${seedTracks}`);
      const { recommendations } = await recRes.json();
  
      // Log recommendations to debug the response
      console.log('Recommendations:', recommendations);
      setRecommendations(recommendations);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
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
            <div style={styles.recommendations}>
            {recommendations.map((track) => (
              <a 
                key={track.id} 
                href={track.external_urls.spotify} 
                target="_blank" 
                rel="noopener noreferrer" 
                style={styles.trackLink}
              >
                <div style={styles.track}>
                  <img src={track.album.images[0].url} alt={track.name} style={styles.trackImage} />
                  <div>
                    <h4>{track.name}</h4>
                    <p>{track.artists.map(artist => artist.name).join(', ')}</p>
                  </div>
                </div>
              </a>
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
  // existing styles...
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
