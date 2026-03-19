const config = {
  available: true,

  username: "Vvshenok",
  displayName: "Vvshenok",
  tagline: "Roblox Developer / Lua Scripter",
  bio: "I build Roblox games and script in Lua. I've contributed to titles with hundreds of millions of visits — from core gameplay systems to UI, datastores, and monetization.",
  bioExtra: "Clean code, good architecture, and player experience first. Always.",

  socials: {
    roblox: "https://www.roblox.com/users/YOUR_ROBLOX_USER_ID/profile",
    twitter: "https://x.com/YOUR_TWITTER_HANDLE",
    discord: "yourDiscordTag#0000",
  },

  emailjs: {
    serviceId: process.env.EMAILJS_SERVICE_ID,
    templateId: process.env.EMAILJS_TEMPLATE_ID,
    publicKey: process.env.EMAILJS_PUBLIC_KEY,
  },

  stats: {
    years: "3+",
    gamesWorkedOn: "13",
    totalVisits: "555M+",
    totalFavorites: "18M+",
  },
};

module.exports = config;
