const auth = require("../../../lib/auth");

export default function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { username, password } = req.body || {};
  const validUser = process.env.ADMIN_USERNAME;
  const validPass = process.env.ADMIN_PASSWORD;

  if (!validUser || !validPass) {
    return res.status(500).json({ error: "Server not configured" });
  }

  if (username !== validUser || password !== validPass) {
    return res.status(401).json({ error: "Wrong username or password" });
  }

  const token = auth.create();
  auth.setCookie(res, token);
  return res.status(200).json({ ok: true });
}
