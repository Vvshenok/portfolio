const ELASTIC_API = 'https://api.elasticemail.com/v2/email/send';

async function sendEmail({ to, subject, template, mergeFields, replyTo, bodyHtml }) {
  const apiKey = process.env.ELASTIC_EMAIL_API_KEY;
  const fromEmail = process.env.CONTACT_FROM_EMAIL;

  if (!apiKey || !fromEmail) {
    console.error('[email] Missing ELASTIC_EMAIL_API_KEY or CONTACT_FROM_EMAIL');
    return { ok: false, error: 'Email not configured' };
  }

  const params = {
    apikey: apiKey,
    to,
    from: fromEmail,
    fromName: 'Vvshenok.dev',
    subject,
    isTransactional: 'true',
    ...(replyTo ? { replyTo } : {}),
    ...(template ? { template } : {}),
    ...(bodyHtml ? { bodyHtml } : {}),
  };

  Object.entries(mergeFields || {}).forEach(([k, v]) => {
    params['merge_' + k] = String(v);
  });

  try {
    const r = await fetch(ELASTIC_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(params),
    });
    const data = await r.json();
    if (data.success === false || data.error) {
      console.error('[email] Elastic Email error:', JSON.stringify(data));
      return { ok: false, error: data.error || 'Unknown error' };
    }
    console.log('[email] Sent to', to, '| template:', template || 'inline', '| msgid:', data.data?.messageid);
    return { ok: true };
  } catch (e) {
    console.error('[email] Fetch error:', e.message);
    return { ok: false, error: e.message };
  }
}

module.exports = { sendEmail };
