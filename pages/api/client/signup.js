const { createClient, saveOTP } = require('../../../lib/clients');
const { sendTransactionalEmail } = require('../../../lib/email');

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { username, email, password } = req.body || {};
  if (!username || !email || !password) return res.status(400).json({ error: 'All fields required' });
  if (username.length < 3) return res.status(400).json({ error: 'Username must be at least 3 characters' });
  if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: 'Invalid email address' });

  try {
    const result = await createClient({ username, email, password });
    if (result.error) return res.status(400).json({ error: result.error });

    const otp = await saveOTP(email, 'verify');
    console.log('[signup] created account for', email, '| OTP:', otp);

    sendTransactionalEmail({
      templateId: process.env.EMAILJS2_OTP_TEMPLATE,
      templateParams: {
        to_email: email,
        name: username,
        subject: 'Verify your email — Vvshenok.dev',
        purpose: 'verification',
        otp_code: otp,
        expiry_minutes: '10',
      },
    }).then(r => console.log('[signup] email result:', JSON.stringify(r)))
      .catch(e => console.error('[signup] email error:', e.message));

    return res.status(200).json({ ok: true, otp, username });
  } catch (e) {
    console.error('[signup] error:', e.message);
    return res.status(500).json({ error: e.message });
  }
}
