const { getClientByEmail, saveOTP } = require('../../../lib/clients');
const { sendEmail } = require('../../../lib/email');

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { email } = req.body || {};
  if (!email) return res.status(400).json({ error: 'Email required' });

  try {
    const client = await getClientByEmail(email);
    if (!client) return res.status(200).json({ ok: true }); // prevent enumeration

    const otp = await saveOTP(email, 'reset');
    console.log('[forgot] reset OTP for', email, ':', otp);

    await sendEmail({
      to: email,
      subject: 'Reset your password — Vvshenok.dev',
      template: process.env.ELASTIC_RESET_TEMPLATE,
      mergeFields: {
        name: client.username,
        otp_code: otp,
        expiry_minutes: '10',
        reset_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://vvshenok.is-a.dev'}/portal-auth?reset=1&email=${encodeURIComponent(email)}`,
      },
    });

    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error('[forgot] error:', e.message);
    return res.status(500).json({ error: 'Failed' });
  }
}
