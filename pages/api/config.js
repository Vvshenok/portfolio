const cfg = require("../../config");
const { kvGet } = require("../../lib/kv");

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();
  const availability = await kvGet("vs:availability");
  const available = availability && typeof availability.available === "boolean"
    ? availability.available
    : cfg.available;
  res.status(200).json({
    available,
    displayName: cfg.displayName,
    tagline: cfg.tagline,
    bio: cfg.bio,
    bioExtra: cfg.bioExtra,
    discordId: cfg.discordId,
    responseTime: cfg.responseTime,
    socials: cfg.socials,
    stats: cfg.stats,
    emailjs: {
      serviceId: cfg.emailjs.serviceId || "",
      templateId: cfg.emailjs.templateId || "",
      autoReplyTemplateId: cfg.emailjs.autoReplyTemplateId || "",
      publicKey: cfg.emailjs.publicKey || "",
    },
    emailjs2: {
      serviceId: process.env.EMAILJS2_SERVICE_ID || "",
      publicKey: process.env.EMAILJS2_PUBLIC_KEY || "",
      otpTemplate: process.env.EMAILJS2_OTP_TEMPLATE || "",
      welcomeTemplate: process.env.EMAILJS2_WELCOME_TEMPLATE || "",
    },
  });
}
