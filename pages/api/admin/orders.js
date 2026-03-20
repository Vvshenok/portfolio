const auth = require('../../../lib/auth');
const { getOrders, createOrder, updateOrder, addChangelog, deleteOrder } = require('../../../lib/orders');

async function guard(req, res) {
  const token = auth.getToken(req);
  if (!await auth.valid(token)) { res.status(401).json({ error: 'Unauthorized' }); return false; }
  return true;
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    if (!await guard(req, res)) return;
    return res.status(200).json({ orders: await getOrders() });
  }

  if (!await guard(req, res)) return;

  if (req.method === 'POST') {
    const { title, description, clientUsername, status, progress } = req.body || {};
    if (!title) return res.status(400).json({ error: 'Title required' });
    const order = await createOrder({ title, description, clientUsername, status, progress });
    return res.status(201).json({ order });
  }

  if (req.method === 'PUT') {
    const { id, changelog, ...fields } = req.body || {};
    if (!id) return res.status(400).json({ error: 'id required' });
    if (changelog) {
      const order = await addChangelog(id, { text: changelog, author: 'Vvshenok' });
      return res.status(200).json({ order });
    }
    const order = await updateOrder(id, fields);
    if (!order) return res.status(404).json({ error: 'Not found' });
    return res.status(200).json({ order });
  }

  if (req.method === 'DELETE') {
    const { id } = req.body || {};
    if (!id) return res.status(400).json({ error: 'id required' });
    const ok = await deleteOrder(id);
    if (!ok) return res.status(404).json({ error: 'Not found' });
    return res.status(200).json({ ok: true });
  }

  return res.status(405).end();
}
