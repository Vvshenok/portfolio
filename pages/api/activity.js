const { kvGet, kvSet } = require("../../lib/kv");

const KEY = "vs:activity";
const API_KEY_ENV = "ACTIVITY_API_KEY";

export default async function handler(req, res) {
  if (req.method === "GET") {
    const activity = await kvGet(KEY);
    return res.status(200).json({ activity: activity || null });
  }

  if (req.method === "POST") {
    const key = req.headers["x-api-key"];
    const validKey = process.env[API_KEY_ENV];
    if (!validKey || key !== validKey) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const { active, app, state, file, line, fileType, workspace } = req.body || {};
    const payload = {
      active: !!active,
      app: app || null,
      state: state || "idle",
      file: file || null,
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