const { kvGet, kvSet } = require('../../../lib/kv');
const { sendInvoice } = require('../../../lib/invoice');
const { recordCompletedPayment } = require('../../../lib/payment-stats');
const { accessToken, paypalBase } = require('./paypal-create');

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { orderID } = req.body || {};
  if (!orderID || !process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) return res.status(400).json({ error: 'Invalid PayPal order' });
  try {
    const key = `vs:payment:paypal:${orderID}`;
    if (await kvGet(key)) return res.status(200).json({ ok: true });
    const token = await accessToken();
    const r = await fetch(`${paypalBase()}/v2/checkout/orders/${encodeURIComponent(orderID)}/capture`, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } });
    const data = await r.json();
    if (!r.ok || data.status !== 'COMPLETED') return res.status(400).json({ error: 'PayPal payment was not completed' });
    const unit = data.purchase_units?.[0];
    const capture = unit?.payments?.captures?.[0];
    const details = JSON.parse(Buffer.from(unit?.custom_id || '', 'base64').toString('utf8') || '{}');
    const payment = { invoiceNumber: `VS-${orderID.slice(-8).toUpperCase()}`, email: details.email, description: details.description || unit?.description || 'Roblox scripting services', amount: Number(capture?.amount?.value || unit?.amount?.value || 0), paidAt: Date.now(), method: 'PayPal' };
    if (!payment.email) return res.status(400).json({ error: 'Missing customer email' });
    await sendInvoice({ invoiceNumber: payment.invoiceNumber, customerEmail: payment.email, description: payment.description, amount: payment.amount, paidAt: payment.paidAt, paymentMethod: payment.method });
    await kvSet(key, payment);
    await recordCompletedPayment();
    return res.status(200).json({ ok: true });
  } catch (error) { console.error('[paypal-capture]', error.message); return res.status(500).json({ error: 'Payment succeeded, but the invoice could not be sent. Please contact me.' }); }
}
