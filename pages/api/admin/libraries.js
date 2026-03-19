const auth = require("../../../lib/auth");
const { getList, addItem, removeItem } = require("../../../lib/store");

const KEY = "vs:libraries";

async function guard(req, res) {
  const token = auth.getToken(req);
  if (!await auth.valid(token)) { res.status(401).json({ error: "Unauthorized" }); return false; }
  return true;
}

export default async function handler(req, res) {
  if (req.method === "GET") {
    return res.status(200).json({ libraries: await getList(KEY) });
  }
  if (!await guard(req, res)) return;

  if (req.method === "POST") {
    const { name, url, description, category } = req.body || {};
    if (!name) return res.status(400).json({ error: "name required" });
    const item = await addItem(KEY, { name, url: url || "", description: description || "", category: category || "Library" });
    return res.status(201).json({ item });
  }

  if (req.method === "DELETE") {
    const { id } = req.body || {};
    if (!id) return res.status(400).json({ error: "id required" });
    const ok = await removeItem(KEY, id);
    if (!ok) return res.status(404).json({ error: "Not found" });
    return res.status(200).json({ ok: true });
  }

  return res.status(405).end();
}
