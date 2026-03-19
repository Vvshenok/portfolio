const auth = require("../../../lib/auth");

export default async function handler(req, res) {
  const token = auth.getToken(req);
  await auth.destroy(token);
  auth.clearCookie(res);
  return res.status(200).json({ ok: true });
}
