async function getAccessToken() {
  const r = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.GMAIL_CLIENT_ID,
      client_secret: process.env.GMAIL_CLIENT_SECRET,
      refresh_token: process.env.GMAIL_REFRESH_TOKEN,
      grant_type: 'refresh_token',
    }),
  });
  const data = await r.json();
  if (!data.access_token) {
    console.error('[email] Failed to get access token:', JSON.stringify(data));
    throw new Error('Failed to get Gmail access token');
  }
  return data.access_token;
}

function makeRawEmail({ from, to, subject, html, replyTo }) {
  const headers = [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: ${subject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=UTF-8',
    ...(replyTo ? [`Reply-To: ${replyTo}`] : []),
  ].join('\r\n');
  const raw = headers + '\r\n\r\n' + html;
  return Buffer.from(raw).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function sendEmail({ to, subject, html, replyTo }) {
  const user = process.env.GMAIL_USER;
  if (!user || !process.env.GMAIL_CLIENT_ID || !process.env.GMAIL_CLIENT_SECRET || !process.env.GMAIL_REFRESH_TOKEN) {
    console.error('[email] Missing Gmail OAuth env vars');
    return { ok: false, error: 'Email not configured' };
  }

  try {
    console.log('[email] Getting access token...');
    const accessToken = await getAccessToken();

    const raw = makeRawEmail({
      from: `"Vvshenok.dev" <${user}>`,
      to,
      subject,
      html,
      replyTo,
    });

    console.log('[email] Sending to', to);
    const r = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/send`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ raw }),
    });

    const data = await r.json();
    if (data.id) {
      console.log('[email] Sent to', to, '| id:', data.id);
      return { ok: true, id: data.id };
    }
    console.error('[email] Gmail API error:', JSON.stringify(data));
    return { ok: false, error: data.error?.message || JSON.stringify(data) };
  } catch (e) {
    console.error('[email] Error:', e.message);
    return { ok: false, error: e.message };
  }
}

module.exports = { sendEmail };