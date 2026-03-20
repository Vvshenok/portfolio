const { getClientByEmail, checkPassword, createClientSession, setClientCookie, saveOTP } = require('../../../lib/clients');
const { sendEmail } = require('../../../lib/email');

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Missing fields' });

  try {
    const client = await getClientByEmail(email);
    console.log('[login] client found:', !!client, '| email:', email);
    if (!client) return res.status(401).json({ error: 'Invalid email or password' });
    if (!checkPassword(client, password)) return res.status(401).json({ error: 'Invalid email or password' });
    if (!client.verified) {
      const otp = await saveOTP(email, 'verify');
      console.log('[login] unverified, resending OTP for', email, '| OTP:', otp);
      // Fire and forget — don't block the response on email sending
      sendEmail({
        to: email,
        subject: 'Verify your email — Vvshenok.dev',
        template: process.env.ELASTIC_OTP_TEMPLATE,
        mergeFields: { name: client.username, otp_code: otp, expiry_minutes: '10' },
      }).then(r => console.log('[login] email result:', JSON.stringify(r)))
        .catch(e => console.error('[login] email error:', e.message));
      return res.status(403).json({ error: 'Please verify your email first', unverified: true });
    }

    const token = await createClientSession(email);
    setClientCookie(res, token);
    return res.status(200).json({ ok: true, username: client.username });
  } catch (e) {
    console.error('[login] error:', e.message);
    return res.status(500).json({ error: e.message });
  }
}