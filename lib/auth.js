const { kvGet, kvSet, isCloud } = require("./kv");

const COOKIE = "vs_session";
const TTL_S = 60 * 60 * 24 * 30;

function makeToken() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let t = "";
  for (let i = 0; i < 64; i++) t += chars[Math.floor(Math.random() * chars.length)];
  return t;
}

async function create() {
  const token = makeToken();
  await kvSet("vs:session:" + token, { ts: Date.now() });
  return token;
}

async function valid(token) {
  if (!token) return false;
  try {
    const data = await kvGet("vs:session:" + token);
    return !!data;
  } catch {
    return false;
  }
}

async function destroy(token) {
  if (!token) return;
  try {
    if (isCloud()) {
      const { Redis } = require("@upstash/redis");
      const url = process.env.STORAGE_REST_API_URL || process.env.KV_REST_API_URL;
      const tk = process.env.STORAGE_REST_API_TOKEN || process.env.KV_REST_API_TOKEN;
      if (url && tk) {
        const client = new Redis({ url, token: tk });
        await client.del("vs:session:" + token);
      }
    }
  } catch {}
}

function getToken(req) {
  const header = req.headers.cookie || "";
  const map = {};
  header.split(";").forEach(c => {
    const [k, ...v] = c.trim().split("=");
    if (k) map[k.trim()] = v.join("=");
  });
  return map[COOKIE] || null;
}

function setCookie(res, token) {
  res.setHeader("Set-Cookie",
    `${COOKIE}=${token}; HttpOnly; Path=/; Max-Age=${TTL_S}; SameSite=Strict`);
}

function clearCookie(res) {
  res.setHeader("Set-Cookie",
    `${COOKIE}=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict`);
}

module.exports = { create, valid, destroy, getToken, setCookie, clearCookie };
