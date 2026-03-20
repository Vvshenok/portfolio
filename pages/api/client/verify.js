const { verifyOTP, verifyClient, getClientByEmail, createClientSession, setClientCookie } = require('../../../lib/clients');

async function sendWelcome(email, username) {
  const apiKey = process.env.ELASTIC_EMAIL_API_KEY;
  const fromEmail = process.env.CONTACT_FROM_EMAIL;
  const welcomeTemplate = process.env.ELASTIC_WELCOME_TEMPLATE;
  if (!apiKey || !fromEmail || !welcomeTemplate) return;
  const params = {
    apikey: apiKey, to: email, from: fromEmail,
    fromName: 'Vvshenok.dev', subject: 'Welcome to Vvshenok.dev',
    isTransactional: 'true', template: welcomeTemplate,
    merge_name: username,
  };
  await fetch('https://api.elasticemail.com/v2/email/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(params),
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { email, otp } = req.body || {};
  if (!email || !otp) return res.status(400).json({ error: 'Missing fields' });

  try {
    const valid = await verifyOTP(email, 'verify', otp);
    if (!valid) return res.status(400).json({ error: 'Invalid or expired code' });

    await verifyClient(email);
    const client = await getClientByEmail(email);
    await sendWelcome(email, client.username).catch(() => {});

    const token = await createClientSession(email);
    setClientCookie(res, token);
    return res.status(200).json({ ok: true, username: client.username });
  } catch (e) {
    return res.status(500).json({ error: 'Verification failed' });
  }
}
