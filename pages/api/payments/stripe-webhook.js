const Stripe = require('stripe');
const { kvGet, kvSet } = require('../../../lib/kv');
const { sendInvoice } = require('../../../lib/invoice');
const { recordCompletedPayment } = require('../../../lib/payment-stats');

export const config = { api: { bodyParser: false } };

async function rawBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  if (req.method !== 'POST' || !process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) return res.status(400).end();
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const event = stripe.webhooks.constructEvent(await rawBody(req), req.headers['stripe-signature'], process.env.STRIPE_WEBHOOK_SECRET);
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const paymentKey = `vs:payment:${session.id}`;
      if (!await kvGet(paymentKey)) {
        const payment = { invoiceNumber: `VS-${session.id.slice(-8).toUpperCase()}`, email: session.customer_details?.email, description: session.metadata?.description || 'Roblox scripting services', amount: (session.amount_total || 0) / 100, paidAt: Date.now(), method: 'Stripe' };
        await sendInvoice({ invoiceNumber: payment.invoiceNumber, customerEmail: payment.email, description: payment.description, amount: payment.amount, paidAt: payment.paidAt, paymentMethod: payment.method });
        await kvSet(paymentKey, payment);
        await recordCompletedPayment(payment);
      }
    }
    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('[stripe-webhook]', error.message);
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }
}
