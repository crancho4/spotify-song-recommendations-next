// components/SongRecommendations.js
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export default function SongRecommendations({ mood }) {
  const { data: session } = useSession();
  const [songs, setSongs] = useState([]);

  useEffect(() => {
    if (session && mood) {
      fetch(`/api/recommendations?accessToken=${session.accessToken}&mood=${mood}`)
        .then((res) => res.json())
        .then((data) => {
          setSongs(data.tracks);
        });
    }
  }, [session, mood]);

  return (
    <div>
      <h3>Recommended Songs for {mood} Mood:</h3>
      {songs?.length > 0 ? (
        songs.map((song) => (
          <div key={song.id}>
            <p>{song.name} by {song.artists[0].name}</p>
            <audio controls src={song.preview_url} />
          </div>
        ))
      ) : (
        <p>No recommendations available.</p>
      )}
    </div>
  );
}
