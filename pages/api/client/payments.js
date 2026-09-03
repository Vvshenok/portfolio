const { getCookieToken, getClientSession, getClientByEmail } = require('../../../lib/clients');
const { getPaymentsForEmail } = require('../../../lib/payment-stats');

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();
  const session = await getClientSession(getCookieToken(req));
  if (!session) return res.status(401).json({ error: 'Unauthorized' });
  const client = await getClientByEmail(session.email);
  if (!client) return res.status(401).json({ error: 'Unauthorized' });
  const payments = await getPaymentsForEmail(client.email);
  return res.status(200).json({ payments });
}