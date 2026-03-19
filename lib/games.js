const { kvGet, kvSet } = require("./kv");
const fs = require("fs");
const path = require("path");

const KEY = "vs:games";
const SEED_FILE = path.join(process.cwd(), "public", "games.json");

function seedData() {
  try { return JSON.parse(fs.readFileSync(SEED_FILE, "utf-8")); } catch { return []; }
}

async function read() {
  const data = await kvGet(KEY);
  if (data && Array.isArray(data) && data.length) return data;
  const seed = seedData();
  if (seed.length) await kvSet(KEY, seed);
  return seed;
}

async function write(list) { await kvSet(KEY, list); }

async function add(item) {
  const list = await read();
  const entry = { ...item, id: String(Date.now()), active: true };
  list.push(entry);
  await write(list);
  return entry;
}

async function update(id, fields) {
  const list = await read();
  const i = list.findIndex(x => x.id === id);
  if (i === -1) return null;
  list[i] = { ...list[i], ...fields };
  await write(list);
  return list[i];
}

async function remove(id) {
  const list = await read();
  const next = list.filter(x => x.id !== id);
  if (next.length === list.length) return false;
  await write(next);
  return true;
}

module.exports = { read, add, update, remove };
