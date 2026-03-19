const fs = require("fs");
const path = require("path");

const FILE = path.join(process.cwd(), "public", "games.json");

function read() {
  try {
    return JSON.parse(fs.readFileSync(FILE, "utf-8"));
  } catch {
    return [];
  }
}

function write(games) {
  fs.writeFileSync(FILE, JSON.stringify(games, null, 2), "utf-8");
}

function add(data) {
  const games = read();
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
  write(games);
  return game;
}

function update(id, fields) {
  const games = read();
  const i = games.findIndex((g) => g.id === id);
  if (i === -1) return null;
  games[i] = { ...games[i], ...fields };
  write(games);
  return games[i];
}

function remove(id) {
  const games = read();
  const next = games.filter((g) => g.id !== id);
  if (next.length === games.length) return false;
  write(next);
  return true;
}

module.exports = { read, add, update, remove };
