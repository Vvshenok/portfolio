const COOKIE_NAME = "vs_session";
const DURATION_S = 60 * 60 * 8;

const sessions = new Map();

function makeToken() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let t = "";
  for (let i = 0; i < 64; i++) t += chars[Math.floor(Math.random() * chars.length)];
  return t;
}

function create() {
  const token = makeToken();
  sessions.set(token, Date.now() + DURATION_S * 1000);
  return token;
}

function valid(token) {
  if (!token) return false;
  const exp = sessions.get(token);
  if (!exp) return false;
  if (Date.now() > exp) { sessions.delete(token); return false; }
  return true;
}

function destroy(token) {
  sessions.delete(token);
}

function getToken(req) {
  const header = req.headers.cookie || "";
  const map = Object.fromEntries(
    header.split(";").map((c) => {
      const [k, ...v] = c.trim().split("=");
      return [k.trim(), v.join("=")];
    })
  );
  return map[COOKIE_NAME] || null;
}

function setCookie(res, token) {
  res.setHeader(
    "Set-Cookie",
    `${COOKIE_NAME}=${token}; HttpOnly; Path=/; Max-Age=${DURATION_S}; SameSite=Strict`
  );
}

function clearCookie(res) {
  res.setHeader(
    "Set-Cookie",
    `${COOKIE_NAME}=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict`
  );
}

module.exports = { create, valid, destroy, getToken, setCookie, clearCookie };
