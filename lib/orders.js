const { kvGet, kvSet } = require('./kv');

const KEY = 'vs:orders';

async function getOrders() {
  const data = await kvGet(KEY);
  return Array.isArray(data) ? data : [];
}

async function saveOrders(orders) {
  await kvSet(KEY, orders);
}

async function createOrder({ title, description, clientUsername, status, progress }) {
  const orders = await getOrders();
  const order = {
    id: String(Date.now()),
    title,
    description: description || '',
    clientUsername: clientUsername || '',
    status: status || 'in_progress',
    progress: Number(progress) || 0,
    changelog: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  orders.push(order);
  await saveOrders(orders);
  return order;
}

async function updateOrder(id, fields) {
  const orders = await getOrders();
  const i = orders.findIndex(o => o.id === id);
  if (i === -1) return null;
  orders[i] = { ...orders[i], ...fields, updatedAt: Date.now() };
  await saveOrders(orders);
  return orders[i];
}

async function addChangelog(id, { text, author }) {
  const orders = await getOrders();
  const i = orders.findIndex(o => o.id === id);
  if (i === -1) return null;
  const entry = { id: String(Date.now()), text, author: author || 'Vvshenok', ts: Date.now() };
  orders[i].changelog = orders[i].changelog || [];
  orders[i].changelog.unshift(entry);
  orders[i].updatedAt = Date.now();
  await saveOrders(orders);
  return orders[i];
}

async function deleteOrder(id) {
  const orders = await getOrders();
  const next = orders.filter(o => o.id !== id);
  if (next.length === orders.length) return false;
  await saveOrders(next);
  return true;
}

async function getOrdersForClient(username) {
  const orders = await getOrders();
  return orders.filter(o => o.clientUsername.toLowerCase() === username.toLowerCase());
}

module.exports = { getOrders, createOrder, updateOrder, addChangelog, deleteOrder, getOrdersForClient };
