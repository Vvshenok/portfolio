const { getCookieToken, getClientSession, getClientByEmail } = require('../../../lib/clients');

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();
  const token = getCookieToken(req);
  const session = await getClientSession(token);
  if (!session) return res.status(401).json({ authed: false });
  const client = await getClientByEmail(session.email);
  if (!client) return res.status(401).json({ authed: false });
  return res.status(200).json({ authed: true, username: client.username, email: client.email });
}
