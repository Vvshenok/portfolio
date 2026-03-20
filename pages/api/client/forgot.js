const { getClientByEmail, saveOTP } = require('../../../lib/clients');

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { email } = req.body || {};
  if (!email) return res.status(400).json({ error: 'Email required' });

  try {
    const client = await getClientByEmail(email);
    // Always return ok to prevent email enumeration
    if (!client) return res.status(200).json({ ok: true });

    const otp = await saveOTP(email, 'reset');
    const apiKey = process.env.ELASTIC_EMAIL_API_KEY;
    const fromEmail = process.env.CONTACT_FROM_EMAIL;
    const resetTemplate = process.env.ELASTIC_RESET_TEMPLATE;

    if (apiKey && fromEmail) {
      const params = {
        apikey: apiKey, to: email, from: fromEmail,
        fromName: 'Vvshenok.dev', subject: 'Reset your password — Vvshenok.dev',
        isTransactional: 'true',
        ...(resetTemplate ? { template: resetTemplate } : {}),
        merge_name: client.username,
        merge_otp_code: otp,
        merge_expiry_minutes: '10',
        merge_reset_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://vvshenok.is-a.dev'}/portal?reset=1&email=${encodeURIComponent(email)}`,
      };
      await fetch('https://api.elasticemail.com/v2/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(params),
      });
    }
    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: 'Failed' });
  }
}
