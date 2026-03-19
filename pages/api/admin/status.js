const auth = require("../../../lib/auth");
const { kvGet, kvSet } = require("../../../lib/kv");

const STATUS_KEY = "vs:status";
const PRICING_KEY = "vs:pricing";

async function guard(req, res) {
  const token = auth.getToken(req);
  if (!await auth.valid(token)) { res.status(401).json({ error: "Unauthorized" }); return false; }
  return true;
}

export default async function handler(req, res) {
  if (req.method === "GET") {
    const [status, pricing] = await Promise.all([
      kvGet(STATUS_KEY),
      kvGet(PRICING_KEY),
    ]);
    return res.status(200).json({
      status: status || { text: "", active: false },
      pricing: pricing || [],
    });
  }
  if (!await guard(req, res)) return;
  if (req.method === "PUT") {
    const { status, pricing } = req.body || {};
    if (status !== undefined) await kvSet(STATUS_KEY, status);
    if (pricing !== undefined) await kvSet(PRICING_KEY, pricing);
    return res.status(200).json({ ok: true });
  }
  return res.status(405).end();
}