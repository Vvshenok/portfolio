const { read } = require("../../lib/games");
const { enrichGames } = require("../../lib/roblox");

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();
  try {
    const games = await read();
    const enriched = await enrichGames(games);
    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=300");
    return res.status(200).json({ games: enriched });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to load games" });
  }
}
