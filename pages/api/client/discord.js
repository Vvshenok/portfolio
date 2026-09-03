import crypto from 'crypto';

export default function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();
  if (!process.env.DISCORD_CLIENT_ID || !process.env.NEXT_PUBLIC_BASE_URL) return res.redirect('/portal-auth?discord=not_configured');
  const state = crypto.randomBytes(24).toString('hex');
  const redirect = `${process.env.NEXT_PUBLIC_BASE_URL}/api/client/discord/callback`;
  res.setHeader('Set-Cookie', `vs_discord_state=${state}; HttpOnly; Path=/; Max-Age=600; SameSite=Lax`);
  const params = new URLSearchParams({ client_id: process.env.DISCORD_CLIENT_ID, redirect_uri: redirect, response_type: 'code', scope: 'identify email', state });
  return res.redirect(`https://discord.com/api/oauth2/authorize?${params.toString()}`);
}