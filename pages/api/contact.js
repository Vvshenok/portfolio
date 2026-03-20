export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { from_name, from_email, message } = req.body || {};
  if (!from_name || !from_email || !message) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  const apiKey = process.env.ELASTIC_EMAIL_API_KEY;
  const toEmail = process.env.CONTACT_TO_EMAIL;
  const fromEmail = process.env.CONTACT_FROM_EMAIL;
  const contactTemplate = process.env.ELASTIC_CONTACT_TEMPLATE;
  const autoReplyTemplate = process.env.ELASTIC_AUTOREPLY_TEMPLATE;
  const timestamp = new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });

  if (!apiKey || !toEmail || !fromEmail) {
    return res.status(500).json({ error: 'Email not configured' });
  }

  async function sendEmail({ to, subject, template, mergeFields, replyTo }) {
    const params = {
      apikey: apiKey,
      to,
      from: fromEmail,
      fromName: 'Vvshenok.dev',
      subject,
      isTransactional: 'true',
      ...(replyTo ? { replyTo } : {}),
    };

    if (template) {
      // Use saved template with merge fields
      params.template = template;
      Object.entries(mergeFields || {}).forEach(([key, value]) => {
        params[`merge_${key}`] = value;
      });
    }

    const r = await fetch('https://api.elasticemail.com/v2/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(params),
    });
    return r.json();
  }

  const mergeFields = {
    from_name,
    from_email,
    message,
    timestamp,
  };

  try {
    // Contact Us — goes to you
    await sendEmail({
      to: toEmail,
      subject: `New message from ${from_name}`,
      replyTo: from_email,
      template: contactTemplate || undefined,
      mergeFields,
    });

    // Auto-reply — goes to sender
    await sendEmail({
      to: from_email,
      subject: `Got your message, ${from_name}`,
      replyTo: toEmail,
      template: autoReplyTemplate || undefined,
      mergeFields,
    });

    // SMS notify (fire and forget)
    fetch('/api/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ from_name, from_email, message }),
    }).catch(() => {});

    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error('contact error', e);
    return res.status(500).json({ error: 'Failed to send' });
  }
}