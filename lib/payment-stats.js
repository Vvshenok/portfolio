const { kvGet, kvSet } = require('./kv');

const KEY = 'vs:payment-stats';

async function recordCompletedPayment(payment) {
  const stats = await kvGet(KEY);
  const count = Number(stats?.completedPayments) || 0;
  const payments = Array.isArray(stats?.payments) ? stats.payments : [];
  payments.unshift({
    invoiceNumber: payment.invoiceNumber,
    email: payment.email.toLowerCase(),
    description: payment.description,
    amount: payment.amount,
    paidAt: payment.paidAt,
    method: payment.method,
  });
  await kvSet(KEY, { completedPayments: count + 1, payments: payments.slice(0, 1000) });
}

async function getCompletedPaymentCount() {
  const stats = await kvGet(KEY);
  return Number(stats?.completedPayments) || 0;
}

async function getPaymentsForEmail(email) {
  const stats = await kvGet(KEY);
  return (Array.isArray(stats?.payments) ? stats.payments : [])
    .filter(payment => payment.email === email.toLowerCase());
}

module.exports = { recordCompletedPayment, getCompletedPaymentCount, getPaymentsForEmail };
