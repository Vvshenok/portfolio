const crypto = require('crypto');
const { kvGet, kvSet } = require('../../../../lib/kv');
const { createClient, getClientByEmail, getClientByDiscordId, linkDiscordClient, createClientSession, setClientCookie } = require('../../../../lib/clients');

function cookieValue(req, name) {
  const cookies = req.headers.cookie || '';
  const item = cookies.split(';').map(value => value.trim()).find(value => value.startsWith(`${name}=`));
  return item ? decodeURIComponent(item.slice(name.length + 1)) : '';
}

function safeUsername(value) {
  const name = String(value || 'client').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 24);
  return name.length >= 3 ? name : `client${name}`.slice(0, 24);
}

async function uniqueUsername(base) {
  let username = safeUsername(base);
  let suffix = 1;
  while (await kvGet('vs:client:u:' + username.toLowerCase())) {
    username = `${safeUsername(base).slice(0, 19)}${suffix++}`;
  }
  return username;
}

export default async function handler(req, res) {
  const { code, state } = req.query;
  const savedState = cookieValue(req, 'vs_discord_state');
  const stateBuffer = Buffer.from(String(state || ''));
  const savedStateBuffer = Buffer.from(savedState);
  if (!code || !state || !savedState || stateBuffer.length !== savedStateBuffer.length || !crypto.timingSafeEqual(stateBuffer, savedStateBuffer)) return res.redirect('/portal-auth?discord=invalid_state');

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  const redirectUri = `${baseUrl}/api/client/discord/callback`;
  try {
    const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ client_id: process.env.DISCORD_CLIENT_ID, client_secret: process.env.DISCORD_CLIENT_SECRET, grant_type: 'authorization_code', code, redirect_uri: redirectUri }),
    });
    const token = await tokenResponse.json();
    if (!token.access_token) return res.redirect('/portal-auth?discord=token_failed');
    const userResponse = await fetch('https://discord.com/api/users/@me', { headers: { Authorization: `Bearer ${token.access_token}` } });
    const user = await userResponse.json();
    if (!user.id || !user.email || user.verified === false) return res.redirect('/portal-auth?discord=email_required');

    let client = await getClientByDiscordId(user.id);
    if (!client) client = await getClientByEmail(user.email);
    if (client) {
      client.verified = true;
      client = await linkDiscordClient(client, user.id);
    } else {
      const username = await uniqueUsername(user.global_name || user.username);
      const result = await createClient({ username, email: user.email, password: crypto.randomBytes(32).toString('hex') });
      if (result.error) return res.redirect('/portal-auth?discord=account_failed');
      client = await linkDiscordClient({ ...result.client, verified: true }, user.id);
    }
    const session = await createClientSession(client.email);
    setClientCookie(res, session);
    res.setHeader('Set-Cookie', ['vs_client=' + session + '; HttpOnly; Path=/; Max-Age=2592000; SameSite=Strict', 'vs_discord_state=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax']);
    return res.redirect('/portal');
  } catch (error) {
    console.error('[client-discord] error:', error.message);
    return res.redirect('/portal-auth?discord=server_error');
  }
}