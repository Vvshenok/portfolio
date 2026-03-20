const { kvGet, kvSet } = require("../../lib/kv");

const KEY = "vs:activity";
const API_KEY_ENV = "ACTIVITY_API_KEY";
const STALE_MS = 90 * 1000; // 90 seconds

export default async function handler(req, res) {
  if (req.method === "GET") {
    const activity = await kvGet(KEY);
    if (!activity) return res.status(200).json({ activity: null });
    // Return null if data is stale (VS Code closed or went idle)
    const age = Date.now() - (activity.updatedAt || 0);
    if (age > STALE_MS) return res.status(200).json({ activity: null });
    return res.status(200).json({ activity });
  }

  if (req.method === "POST") {
    const key = req.headers["x-api-key"];
    const validKey = process.env[API_KEY_ENV];
    if (!validKey || key !== validKey) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const { active, app, state, file, line, fileType, workspace } = req.body || {};
    // Only persist when actively editing a file — ignore offline/idle signals
    if (!active || state === "offline" || !file) {
      return res.status(200).json({ ok: true });
    }
    const payload = {
      active: true,
      app: app || null,
      state: "editing",
      file,
      line: line || null,
      fileType: fileType || null,
      workspace: workspace || null,
      updatedAt: Date.now(),
    };
    await kvSet(KEY, payload);
    return res.status(200).json({ ok: true });
  }

  return res.status(405).end();
}
