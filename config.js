const config = {
  available: true,

  username: "Vvshenok",
  displayName: "Vvshenok",
  tagline: "Roblox Developer / Lua Scripter",
  bio: "I build Roblox games and script in Lua. I've contributed to titles with hundreds of millions of visits, from core gameplay systems to UI, datastores, and monetization.",
  bioExtra: "Clean code, good architecture, and player experience first. Always.",

  discordId: "858733960443199538",

  responseTime: "Usually replies within 24 hours",

  socials: {
    roblox: "https://www.roblox.com/users/5233637325/profile",
    twitter: "https://x.com/Vvshenok",
    discord: "vvshenok",
  },

  emailjs: {
    serviceId: process.env.EMAILJS_SERVICE_ID,
    templateId: process.env.EMAILJS_TEMPLATE_ID,
    publicKey: process.env.EMAILJS_PUBLIC_KEY,
  },

  discord: {
    clientId: process.env.DISCORD_CLIENT_ID,
    clientSecret: process.env.DISCORD_CLIENT_SECRET,
    allowedUserId: process.env.DISCORD_ALLOWED_USER_ID,
  },

  stats: {
    years: "3+",
    gamesWorkedOn: "13",
    totalVisits: "555M+",
    totalFavorites: "18M+",
  },
};

module.exports = config;