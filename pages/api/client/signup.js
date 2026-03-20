const { createClient, saveOTP } = require('../../../lib/clients');

async function sendEmail(apiKey, fromEmail, { to, subject, template, mergeFields, replyTo }) {
  const params = {
    apikey: apiKey,
    to,
    from: fromEmail,
    fromName: 'Vvshenok.dev',
    subject,
    isTransactional: 'true',
    ...(replyTo ? { replyTo } : {}),
    ...(template ? { template } : {}),
  };
  Object.entries(mergeFields || {}).forEach(([k, v]) => { params['merge_' + k] = v; });
  const r = await fetch('https://api.elasticemail.com/v2/email/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(params),
  });
  return r.json();
}

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

    const apiKey = process.env.ELASTIC_EMAIL_API_KEY;
    const fromEmail = process.env.CONTACT_FROM_EMAIL;
    const otpTemplate = process.env.ELASTIC_OTP_TEMPLATE;
    const welcomeTemplate = process.env.ELASTIC_WELCOME_TEMPLATE;

    if (apiKey && fromEmail) {
      await sendEmail(apiKey, fromEmail, {
        to: email,
        subject: 'Verify your email — Vvshenok.dev',
        template: otpTemplate,
        mergeFields: { name: username, otp_code: otp, expiry_minutes: '10' },
      });
    }

    return res.status(200).json({ ok: true, message: 'Account created. Check your email for a verification code.' });
  } catch (e) {
    console.error('signup error', e);
    return res.status(500).json({ error: 'Signup failed' });
  }
}
