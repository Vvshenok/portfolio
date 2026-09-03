const Stripe = require('stripe');

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  if (!process.env.STRIPE_SECRET_KEY) return res.status(503).json({ error: 'Stripe is not configured' });
  const { email, description, amount } = req.body || {};
  const cents = Math.round(Number(amount) * 100);
  if (!/^\S+@\S+\.\S+$/.test(email || '') || !description || !Number.isInteger(cents) || cents < 100 || cents > 10000000) {
    return res.status(400).json({ error: 'Enter a valid email, service description, and amount between $1 and $100,000.' });
  }
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: email,
      line_items: [{ price_data: { currency: 'usd', product_data: { name: 'Roblox scripting services', description }, unit_amount: cents }, quantity: 1 }],
      payment_intent_data: { description: description.slice(0, 500) },
      success_url: `${process.env.PUBLIC_SITE_URL || 'http://localhost:3000'}/pay?success=1`,
      cancel_url: `${process.env.PUBLIC_SITE_URL || 'http://localhost:3000'}/pay?cancelled=1`,
      metadata: { description: description.slice(0, 500) },
    });
    return res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('[stripe-checkout]', error.message);
    return res.status(500).json({ error: 'Unable to create checkout session' });
  }
}
