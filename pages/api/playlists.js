import { useState, useEffect } from "react";

function Playlists() {
  const [playlists, setPlaylists] = useState([]);

  useEffect(() => {
    const fetchPlaylists = async () => {
      const response = await fetch("/api/playlists");
      const data = await response.json();
      setPlaylists(data.items);
    };

    fetchPlaylists();
  }, []);

  return (
    <div>
      <h1>Your Spotify Playlists</h1>
      <ul>
        {playlists.map((playlist) => (
          <li key={playlist.id}>{playlist.name}</li>
        ))}
      </ul>
    </div>
  );
}

export default Playlists;
