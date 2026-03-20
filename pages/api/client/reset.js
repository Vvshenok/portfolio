const { verifyOTP, updatePassword, createClientSession, setClientCookie, getClientByEmail } = require('../../../lib/clients');

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { email, otp, password } = req.body || {};
  if (!email || !otp || !password) return res.status(400).json({ error: 'Missing fields' });
  if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });

  try {
    const valid = await verifyOTP(email, 'reset', otp);
    if (!valid) return res.status(400).json({ error: 'Invalid or expired code' });

    await updatePassword(email, password);
    const client = await getClientByEmail(email);
    const token = await createClientSession(email);
    setClientCookie(res, token);
    return res.status(200).json({ ok: true, username: client.username });
  } catch (e) {
    return res.status(500).json({ error: 'Reset failed' });
  }
}
