export default function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();
  res.status(200).json({ clientId: process.env.PAYPAL_CLIENT_ID || '' });
}
