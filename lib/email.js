async function sendEmail({ to, subject, html, replyTo }) {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.CONTACT_FROM_EMAIL || 'noreply@vvshenok.dev';

  if (!apiKey) {
    console.error('[email] Missing RESEND_API_KEY');
    return { ok: false, error: 'Email not configured' };
  }

  const body = {
    from: `Vvshenok.dev <${fromEmail}>`,
    to: Array.isArray(to) ? to : [to],
    subject,
    html,
    ...(replyTo ? { reply_to: replyTo } : {}),
  };

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    const data = await r.json();
    if (data.id) {
      console.log('[email] Sent to', to, '| id:', data.id);
      return { ok: true, id: data.id };
    }
    console.error('[email] Resend error:', JSON.stringify(data));
    return { ok: false, error: data.message || JSON.stringify(data) };
  } catch (e) {
    console.error('[email] Fetch error:', e.message);
    return { ok: false, error: e.message };
  }
}

module.exports = { sendEmail };
