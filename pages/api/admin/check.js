const auth = require("../../../lib/auth");

export default async function handler(req, res) {
  const token = auth.getToken(req);
  return res.status(200).json({ authed: await auth.valid(token) });
}
