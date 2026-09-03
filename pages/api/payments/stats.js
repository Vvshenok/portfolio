const { getCompletedPaymentCount } = require('../../../lib/payment-stats');

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();
  try {
    const completedPayments = await getCompletedPaymentCount();
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
    return res.status(200).json({ completedPayments });
  } catch (error) {
    console.error('[payment-stats]', error.message);
    return res.status(200).json({ completedPayments: 0 });
  }
}