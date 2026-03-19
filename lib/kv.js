const fs = require("fs");
const path = require("path");

function isCloud() {
  return !!(
    process.env.KV_REST_API_URL ||
    process.env.STORAGE_REST_API_URL ||
    process.env.UPSTASH_REDIS_REST_URL
  );
}

async function getClient() {
  const { Redis } = require("@upstash/redis");

  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    return new Redis({
      url: process.env.KV_REST_API_URL,
      token: process.env.KV_REST_API_TOKEN,
    });
  }
  if (process.env.STORAGE_REST_API_URL && process.env.STORAGE_REST_API_TOKEN) {
    return new Redis({
      url: process.env.STORAGE_REST_API_URL,
      token: process.env.STORAGE_REST_API_TOKEN,
    });
  }
  return Redis.fromEnv();
}

const LOCAL_DIR = path.join(process.cwd(), "public");

function localPath(key) {
  const safe = key.replace(/[^a-zA-Z0-9_-]/g, "_");
  return path.join(LOCAL_DIR, safe + ".json");
}

async function kvGet(key) {
  if (isCloud()) {
    try {
      const client = await getClient();
      return await client.get(key);
    } catch (e) {
      console.error("kvGet error:", e);
      return null;
    }
  }
  try {
    return JSON.parse(fs.readFileSync(localPath(key), "utf-8"));
  } catch {
    return null;
  }
}

async function kvSet(key, value) {
  if (isCloud()) {
    try {
      const client = await getClient();
      await client.set(key, value);
    } catch (e) {
      console.error("kvSet error:", e);
    }
    return;
  }
  try {
    fs.writeFileSync(localPath(key), JSON.stringify(value, null, 2), "utf-8");
  } catch (e) {
    console.error("kvSet local error:", e);
  }
}

module.exports = { kvGet, kvSet, isCloud };
