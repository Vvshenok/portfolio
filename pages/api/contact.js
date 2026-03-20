const { sendEmail } = require('../../lib/email');

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { from_name, from_email, message } = req.body || {};
  if (!from_name || !from_email || !message) return res.status(400).json({ error: 'Missing fields' });

  const toEmail = process.env.CONTACT_TO_EMAIL;
  if (!toEmail) return res.status(500).json({ error: 'Email not configured' });

  const timestamp = new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
  const mergeFields = { from_name, from_email, message, timestamp };

  try {
    // Contact Us — goes to you
    await sendEmail({
      to: toEmail,
      subject: `New message from ${from_name}`,
      replyTo: from_email,
      template: process.env.ELASTIC_CONTACT_TEMPLATE,
      mergeFields,
    });

    // Auto-reply — goes to sender
    await sendEmail({
      to: from_email,
      subject: `Got your message, ${from_name}`,
      replyTo: toEmail,
      template: process.env.ELASTIC_AUTOREPLY_TEMPLATE,
      mergeFields,
    });

    // SMS (fire and forget)
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
