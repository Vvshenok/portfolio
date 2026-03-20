export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;
  const toNumber = process.env.TWILIO_TO_NUMBER;

  if (!accountSid || !authToken || !messagingServiceSid || !toNumber) {
    return res.status(200).json({ ok: false, reason: 'Twilio not configured' });
  }

  const { from_name, from_email, message } = req.body || {};
  if (!from_name || !from_email) return res.status(400).json({ error: 'Missing fields' });

  const body = `New message on vvshenok.dev\nFrom: ${from_name} (${from_email})\n"${(message || '').slice(0, 100)}${message && message.length > 100 ? '...' : ''}"`;

  try {
    const creds = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
    const r = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${creds}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ To: toNumber, MessagingServiceSid: messagingServiceSid, Body: body }),
    });
    const data = await r.json();
    if (data.sid) return res.status(200).json({ ok: true });
    return res.status(200).json({ ok: false, error: data.message });
  } catch (e) {
    return res.status(200).json({ ok: false, error: e.message });
  }
}