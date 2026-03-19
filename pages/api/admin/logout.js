const auth = require("../../../lib/auth");

export default function handler(req, res) {
  const token = auth.getToken(req);
  if (token) auth.destroy(token);
  auth.clearCookie(res);
  return res.status(200).json({ ok: true });
}
