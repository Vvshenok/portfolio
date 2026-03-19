const { kvGet, kvSet } = require("./kv");

async function getList(key) {
  const data = await kvGet(key);
  return Array.isArray(data) ? data : [];
}

async function addItem(key, item) {
  const list = await getList(key);
  const entry = { ...item, id: String(Date.now()) };
  list.push(entry);
  await kvSet(key, list);
  return entry;
}

async function removeItem(key, id) {
  const list = await getList(key);
  const next = list.filter(x => x.id !== id);
  if (next.length === list.length) return false;
  await kvSet(key, next);
  return true;
}

async function updateItem(key, id, fields) {
  const list = await getList(key);
  const i = list.findIndex(x => x.id === id);
  if (i === -1) return null;
  list[i] = { ...list[i], ...fields };
  await kvSet(key, list);
  return list[i];
}

module.exports = { getList, addItem, removeItem, updateItem };
