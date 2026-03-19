const auth = require("../../../lib/auth");

export default function handler(req, res) {
  const token = auth.getToken(req);
  return res.status(200).json({ authed: auth.valid(token) });
}
