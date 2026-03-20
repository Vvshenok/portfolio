const { sendContactEmail } = require('../../lib/email');

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { from_name, from_email, message } = req.body || {};
  if (!from_name || !from_email || !message) return res.status(400).json({ error: 'Missing fields' });

  const toEmail = process.env.CONTACT_TO_EMAIL;
  if (!toEmail) return res.status(500).json({ error: 'Email not configured' });

  const timestamp = new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });

  try {
    await sendContactEmail({
      templateId: process.env.EMAILJS_CONTACT_TEMPLATE,
      templateParams: { from_name, from_email, message, timestamp, to_email: toEmail },
    });

    await sendContactEmail({
      templateId: process.env.EMAILJS_AUTOREPLY_TEMPLATE,
      templateParams: { from_name, from_email, message, to_email: from_email },
    });

    fetch('/api/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ from_name, from_email, message }),
    }).catch(() => {});

    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error('[contact] error:', e.message);
    return res.status(500).json({ error: 'Failed to send' });
  }
}
