const cfg = require("../../config");

export default function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();
  res.status(200).json({
    available: cfg.available,
    displayName: cfg.displayName,
    tagline: cfg.tagline,
    bio: cfg.bio,
    bioExtra: cfg.bioExtra,
    socials: cfg.socials,
    stats: cfg.stats,
    emailjs: {
      serviceId: cfg.emailjs.serviceId || "",
      templateId: cfg.emailjs.templateId || "",
      publicKey: cfg.emailjs.publicKey || "",
    },
  });
}
