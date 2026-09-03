function paypalBase() { return process.env.PAYPAL_ENV === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com'; }

async function accessToken() {
  const auth = Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString('base64');
  const r = await fetch(`${paypalBase()}/v1/oauth2/token`, { method: 'POST', headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'grant_type=client_credentials' });
  const data = await r.json();
  if (!r.ok) throw new Error(data.error_description || 'PayPal authentication failed');
  return data.access_token;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) return res.status(503).json({ error: 'PayPal is not configured' });
  const { email, description, amount } = req.body || {};
  const value = Number(amount).toFixed(2);
  if (!/^\S+@\S+\.\S+$/.test(email || '') || !description || Number(value) < 1 || Number(value) > 100000) return res.status(400).json({ error: 'Enter valid payment details.' });
  try {
    const token = await accessToken();
    const r = await fetch(`${paypalBase()}/v2/checkout/orders`, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ intent: 'CAPTURE', purchase_units: [{ description: description.slice(0, 127), amount: { currency_code: 'USD', value }, custom_id: Buffer.from(JSON.stringify({ email, description })).toString('base64').slice(0, 127) }] }) });
    const data = await r.json();
    if (!r.ok) throw new Error(data.message || 'PayPal order failed');
    return res.status(200).json({ id: data.id });
  } catch (error) { console.error('[paypal-create]', error.message); return res.status(500).json({ error: 'Unable to create PayPal order' }); }
}

export { accessToken, paypalBase };
