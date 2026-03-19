const auth = require("../../../lib/auth");
const db = require("../../../lib/games");

function guard(req, res) {
  const token = auth.getToken(req);
  if (!auth.valid(token)) { res.status(401).json({ error: "Unauthorized" }); return false; }
  return true;
}

export default function handler(req, res) {
  if (!guard(req, res)) return;

  if (req.method === "GET") {
    return res.status(200).json({ games: db.read() });
  }

  if (req.method === "POST") {
    const { universeId, placeId, name, role, description } = req.body || {};
    if (!universeId || !placeId || !name || !role) {
      return res.status(400).json({ error: "universeId, placeId, name and role are required" });
    }
    const game = db.add({ universeId, placeId, name, role, description });
    return res.status(201).json({ game });
  }

  if (req.method === "PUT") {
    const { id, ...fields } = req.body || {};
    if (!id) return res.status(400).json({ error: "id required" });
    const game = db.update(id, fields);
    if (!game) return res.status(404).json({ error: "Not found" });
    return res.status(200).json({ game });
  }

  if (req.method === "DELETE") {
    const { id } = req.body || {};
    if (!id) return res.status(400).json({ error: "id required" });
    const ok = db.remove(id);
    if (!ok) return res.status(404).json({ error: "Not found" });
    return res.status(200).json({ ok: true });
  }

  return res.status(405).end();
}
