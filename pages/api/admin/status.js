const auth = require("../../../lib/auth");
const { kvGet, kvSet } = require("../../../lib/kv");

const STATUS_KEY = "vs:status";
const PRICING_KEY = "vs:pricing";
const AVAILABILITY_KEY = "vs:availability";

async function guard(req, res) {
  const token = auth.getToken(req);
  if (!await auth.valid(token)) { res.status(401).json({ error: "Unauthorized" }); return false; }
  return true;
}

export default async function handler(req, res) {
  if (req.method === "GET") {
    const [status, pricing, availability] = await Promise.all([
      kvGet(STATUS_KEY),
      kvGet(PRICING_KEY),
      kvGet(AVAILABILITY_KEY),
    ]);
    return res.status(200).json({
      status: status || { text: "", active: false },
      pricing: pricing || [],
      availability: availability || { available: true },
    });
  }
  if (!await guard(req, res)) return;
  if (req.method === "PUT") {
    const { status, pricing, availability } = req.body || {};
    if (status !== undefined) await kvSet(STATUS_KEY, status);
    if (pricing !== undefined) await kvSet(PRICING_KEY, pricing);
    if (availability !== undefined) await kvSet(AVAILABILITY_KEY, availability);
    return res.status(200).json({ ok: true });
  }
  return res.status(405).end();
}
