const auth = require("../../../../lib/auth");

export default async function handler(req, res) {
  const { code } = req.query;
  if (!code) return res.redirect("/login?error=no_code");

  const clientId = process.env.DISCORD_CLIENT_ID;
  const clientSecret = process.env.DISCORD_CLIENT_SECRET;
  const allowedId = process.env.DISCORD_ALLOWED_USER_ID;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `https://${req.headers.host}`;
  const redirectUri = `${baseUrl}/api/auth/discord/callback`;

  try {
    const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) return res.redirect("/login?error=token_failed");

    const userRes = await fetch("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const user = await userRes.json();
    if (!user.id) return res.redirect("/login?error=user_failed");

    if (user.id !== allowedId) return res.redirect("/login?error=not_authorized");

    const token = await auth.create();
    auth.setCookie(res, token);
    return res.redirect("/dashboard");
  } catch (e) {
    console.error("Discord OAuth error:", e);
    return res.redirect("/login?error=server_error");
  }
}