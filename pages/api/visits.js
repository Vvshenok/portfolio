const { kvGet, kvSet } = require("../../lib/kv");

const KEY = "vs:visits";

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const current = await kvGet(KEY) || 0;
      const next = Number(current) + 1;
      await kvSet(KEY, next);
      return res.status(200).json({ visits: next });
    } catch {
      return res.status(200).json({ visits: 0 });
    }
  }
  if (req.method === "GET") {
    try {
      const visits = await kvGet(KEY) || 0;
      return res.status(200).json({ visits: Number(visits) });
    } catch {
      return res.status(200).json({ visits: 0 });
    }
  }
  return res.status(405).end();
}