const { verifyOTP, verifyClient, getClientByEmail, createClientSession, setClientCookie } = require('../../../lib/clients');
const { sendEmail } = require('../../../lib/email');

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { email, otp } = req.body || {};
  if (!email || !otp) return res.status(400).json({ error: 'Missing fields' });

  try {
    console.log('[verify] attempt for', email, '| otp:', otp);
    const valid = await verifyOTP(email, 'verify', otp);
    console.log('[verify] OTP valid:', valid);
    if (!valid) return res.status(400).json({ error: 'Invalid or expired code' });

    await verifyClient(email);
    const client = await getClientByEmail(email);

    // Send welcome email (non-blocking)
    sendEmail({
      to: email,
      subject: 'Welcome to Vvshenok.dev',
      template: process.env.ELASTIC_WELCOME_TEMPLATE,
      mergeFields: { name: client.username },
    }).catch(e => console.error('[verify] welcome email failed:', e.message));

    const token = await createClientSession(email);
    setClientCookie(res, token);
    return res.status(200).json({ ok: true, username: client.username });
  } catch (e) {
    console.error('[verify] error:', e.message);
    return res.status(500).json({ error: 'Verification failed' });
  }
}
