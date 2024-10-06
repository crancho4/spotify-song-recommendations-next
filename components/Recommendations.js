// Recommendations.js
const Recommendations = ({ tracks }) => {
  return (
    <div>
      <h2>Recommended Tracks</h2>
      <ul>
        {tracks.map((track) => (
          <li key={track.id}>
            <a href={track.external_urls.spotify} target="_blank" rel="noopener noreferrer">
              {track.name} by {track.artists.map(artist => artist.name).join(', ')}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Recommendations;
