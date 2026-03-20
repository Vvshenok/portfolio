const { getClientByEmail, saveOTP } = require('../../../lib/clients');
const { sendTransactionalEmail } = require('../../../lib/email');

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { email } = req.body || {};
  if (!email) return res.status(400).json({ error: 'Email required' });

  try {
    const client = await getClientByEmail(email);
    if (!client) return res.status(200).json({ ok: true });

    const otp = await saveOTP(email, 'reset');
    console.log('[forgot] reset OTP for', email, '| OTP:', otp);

    return res.status(200).json({ ok: true, otp, username: client.username });
  } catch (e) {
    console.error('[forgot] error:', e.message);
    return res.status(500).json({ error: 'Failed' });
  }
}
