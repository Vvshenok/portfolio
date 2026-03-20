const { kvGet, kvSet } = require('./kv');
const crypto = require('crypto');

function hashPassword(password) {
  return crypto.createHash('sha256').update(password + process.env.SESSION_SECRET).digest('hex');
}

function makeToken(len = 64) {
  return crypto.randomBytes(len).toString('hex');
}

function makeOTP() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

async function createClient({ username, email, password }) {
  const key = 'vs:client:' + email.toLowerCase();
  const existing = await kvGet(key);
  if (existing) return { error: 'Email already registered' };

  const byUsername = await kvGet('vs:client:u:' + username.toLowerCase());
  if (byUsername) return { error: 'Username already taken' };

  const client = {
    username,
    email: email.toLowerCase(),
    password: hashPassword(password),
    verified: false,
    createdAt: Date.now(),
  };
  await kvSet(key, client);
  await kvSet('vs:client:u:' + username.toLowerCase(), email.toLowerCase());
  return { ok: true, client };
}

async function getClientByEmail(email) {
  return await kvGet('vs:client:' + email.toLowerCase());
}

async function verifyClient(email) {
  const key = 'vs:client:' + email.toLowerCase();
  const client = await kvGet(key);
  if (!client) return false;
  client.verified = true;
  await kvSet(key, client);
  return true;
}

async function updatePassword(email, newPassword) {
  const key = 'vs:client:' + email.toLowerCase();
  const client = await kvGet(key);
  if (!client) return false;
  client.password = hashPassword(newPassword);
  await kvSet(key, client);
  return true;
}

async function createClientSession(email) {
  const token = makeToken();
  await kvSet('vs:csession:' + token, { email: email.toLowerCase(), ts: Date.now() });
  return token;
}

async function getClientSession(token) {
  if (!token) return null;
  const session = await kvGet('vs:csession:' + token);
  if (!session) return null;
  // 30 day expiry
  if (Date.now() - session.ts > 30 * 24 * 60 * 60 * 1000) return null;
  return session;
}

async function deleteClientSession(token) {
  if (!token) return;
  try {
    const { Redis } = require('@upstash/redis');
    let client;
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      client = new Redis({ url: process.env.KV_REST_API_URL, token: process.env.KV_REST_API_TOKEN });
    } else {
      client = Redis.fromEnv();
    }
    await client.del('vs:csession:' + token);
  } catch {}
}

async function saveOTP(email, type) {
  const otp = makeOTP();
  await kvSet('vs:otp:' + email.toLowerCase() + ':' + type, {
    otp,
    expires: Date.now() + 10 * 60 * 1000, // 10 minutes
  });
  return otp;
}

async function verifyOTP(email, type, code) {
  const data = await kvGet('vs:otp:' + email.toLowerCase() + ':' + type);
  if (!data) return false;
  if (Date.now() > data.expires) return false;
  if (data.otp !== String(code)) return false;
  // Delete after use
  try {
    const { Redis } = require('@upstash/redis');
    let client;
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      client = new Redis({ url: process.env.KV_REST_API_URL, token: process.env.KV_REST_API_TOKEN });
    } else {
      client = Redis.fromEnv();
    }
    await client.del('vs:otp:' + email.toLowerCase() + ':' + type);
  } catch {}
  return true;
}

function checkPassword(client, password) {
  return client.password === hashPassword(password);
}

function getCookieToken(req) {
  const cookies = req.headers.cookie || '';
  const map = {};
  cookies.split(';').forEach(c => {
    const [k, ...v] = c.trim().split('=');
    if (k) map[k.trim()] = v.join('=');
  });
  return map['vs_client'] || null;
}

function setClientCookie(res, token) {
  res.setHeader('Set-Cookie', `vs_client=${token}; HttpOnly; Path=/; Max-Age=${30 * 24 * 60 * 60}; SameSite=Strict`);
}

function clearClientCookie(res) {
  res.setHeader('Set-Cookie', `vs_client=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict`);
}

module.exports = {
  createClient, getClientByEmail, verifyClient, updatePassword,
  createClientSession, getClientSession, deleteClientSession,
  saveOTP, verifyOTP, checkPassword,
  getCookieToken, setClientCookie, clearClientCookie,
};
