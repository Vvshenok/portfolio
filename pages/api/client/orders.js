const { getCookieToken, getClientSession, getClientByEmail } = require('../../../lib/clients');
const { getOrdersForClient } = require('../../../lib/orders');

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();
  const token = getCookieToken(req);
  const session = await getClientSession(token);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });
  const client = await getClientByEmail(session.email);
  if (!client) return res.status(401).json({ error: 'Unauthorized' });
  const orders = await getOrdersForClient(client.username);
  return res.status(200).json({ orders });
}
