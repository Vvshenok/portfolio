const { kvGet, kvSet } = require('./kv');

const KEY = 'vs:payment-stats';

async function recordCompletedPayment() {
  const stats = await kvGet(KEY);
  const count = Number(stats?.completedPayments) || 0;
  await kvSet(KEY, { completedPayments: count + 1 });
}

async function getCompletedPaymentCount() {
  const stats = await kvGet(KEY);
  return Number(stats?.completedPayments) || 0;
}

module.exports = { recordCompletedPayment, getCompletedPaymentCount };
