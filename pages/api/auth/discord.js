export default function handler(req, res) {
  const clientId = process.env.DISCORD_CLIENT_ID;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `https://${req.headers.host}`;
  const redirect = encodeURIComponent(`${baseUrl}/api/auth/discord/callback`);
  const scope = encodeURIComponent("identify");
  const url = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirect}&response_type=code&scope=${scope}`;
  res.redirect(url);
}