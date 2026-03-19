const auth = require("../../../lib/auth");

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { username, password } = req.body || {};
  if (username !== process.env.ADMIN_USERNAME || password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Wrong username or password" });
  }
  const token = await auth.create();
  auth.setCookie(res, token);
  return res.status(200).json({ ok: true });
}
