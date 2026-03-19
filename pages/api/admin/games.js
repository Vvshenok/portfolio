const auth = require("../../../lib/auth");
const db = require("../../../lib/games");

async function guard(req, res) {
  const token = auth.getToken(req);
  if (!await auth.valid(token)) { res.status(401).json({ error: "Unauthorized" }); return false; }
  return true;
}

async function fetchGameMeta(universeId) {
  try {
    const r = await fetch(`https://games.roblox.com/v1/games?universeIds=${universeId}`);
    if (!r.ok) return {};
    const d = await r.json();
    const g = d.data?.[0];
    if (!g) return {};
    return { name: g.name, placeId: String(g.rootPlaceId || "") };
  } catch { return {}; }
}

export default async function handler(req, res) {
  if (req.method === "GET" && req.query.lookup) {
    const meta = await fetchGameMeta(req.query.lookup);
    return res.status(200).json(meta);
  }

  if (!await guard(req, res)) return;

  if (req.method === "GET") {
    return res.status(200).json({ games: await db.read() });
  }

  if (req.method === "POST") {
    let { universeId, placeId, name, role, description } = req.body || {};
    if (!universeId || !role) return res.status(400).json({ error: "universeId and role are required" });
    if (!name || !placeId) {
      const meta = await fetchGameMeta(universeId);
      if (!name) name = meta.name || "Unknown Game";
      if (!placeId) placeId = meta.placeId || "";
    }
    const game = await db.add({ universeId, placeId, name, role, description: description || "" });
    return res.status(201).json({ game });
  }

  if (req.method === "PUT") {
    const { id, ...fields } = req.body || {};
    if (!id) return res.status(400).json({ error: "id required" });
    const game = await db.update(id, fields);
    if (!game) return res.status(404).json({ error: "Not found" });
    return res.status(200).json({ game });
  }

  if (req.method === "DELETE") {
    const { id } = req.body || {};
    if (!id) return res.status(400).json({ error: "id required" });
    const ok = await db.remove(id);
    if (!ok) return res.status(404).json({ error: "Not found" });
    return res.status(200).json({ ok: true });
  }

  return res.status(405).end();
}
