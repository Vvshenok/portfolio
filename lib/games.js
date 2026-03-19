const { kv } = require("@vercel/kv");
const fs = require("fs");
const path = require("path");

const KV_KEY = "portfolio_games";
const LOCAL_FILE = path.join(process.cwd(), "public", "games.json");

function isVercel() {
  return !!process.env.KV_REST_API_URL;
}

function readLocal() {
  try {
    return JSON.parse(fs.readFileSync(LOCAL_FILE, "utf-8"));
  } catch {
    return [];
  }
}

async function read() {
  if (!isVercel()) return readLocal();
  try {
    const data = await kv.get(KV_KEY);
    if (data) return data;
    const seed = readLocal();
    await kv.set(KV_KEY, seed);
    return seed;
  } catch {
    return readLocal();
  }
}

async function write(games) {
  if (!isVercel()) {
    fs.writeFileSync(LOCAL_FILE, JSON.stringify(games, null, 2), "utf-8");
    return;
  }
  await kv.set(KV_KEY, games);
}

async function add(data) {
  const games = await read();
  const game = {
    id: String(Date.now()),
    universeId: data.universeId,
    placeId: data.placeId,
    name: data.name,
    role: data.role,
    description: data.description || "",
    active: true,
  };
  games.push(game);
  await write(games);
  return game;
}

async function update(id, fields) {
  const games = await read();
  const i = games.findIndex((g) => g.id === id);
  if (i === -1) return null;
  games[i] = { ...games[i], ...fields };
  await write(games);
  return games[i];
}

async function remove(id) {
  const games = await read();
  const next = games.filter((g) => g.id !== id);
  if (next.length === games.length) return false;
  await write(next);
  return true;
}

module.exports = { read, add, update, remove };
