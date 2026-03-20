const { getCookieToken, getClientSession, getClientByEmail } = require('../../../lib/clients');

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();
  try {
    const token = getCookieToken(req);
    if (!token) return res.status(200).json({ authed: false });
    const session = await getClientSession(token);
    if (!session) return res.status(200).json({ authed: false });
    const client = await getClientByEmail(session.email);
    if (!client) return res.status(200).json({ authed: false });
    return res.status(200).json({ authed: true, username: client.username, email: client.email });
  } catch (e) {
    console.error('[me] error:', e.message);
    return res.status(200).json({ authed: false });
  }
}
