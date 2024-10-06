import { getSession } from "next-auth/react";
import axios from "axios";

export default async (req, res) => {
  const session = await getSession({ req });

  if (!session) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  try {
    const { data } = await axios.get("https://api.spotify.com/v1/me/playlists", {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    });

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch playlists" });
  }
};
