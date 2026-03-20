const { getCookieToken, deleteClientSession, clearClientCookie } = require('../../../lib/clients');

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const token = getCookieToken(req);
  await deleteClientSession(token);
  clearClientCookie(res);
  return res.status(200).json({ ok: true });
}
