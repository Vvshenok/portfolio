const { getList } = require("../../lib/store");
const { kvGet } = require("../../lib/kv");

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();
  try {
    const [libraries, projects, groups, testimonials, status, pricing] = await Promise.all([
      getList("vs:libraries"),
      getList("vs:projects"),
      getList("vs:groups"),
      getList("vs:testimonials"),
      kvGet("vs:status"),
      kvGet("vs:pricing"),
    ]);

    const refreshedGroups = await Promise.all(groups.map(async g => {
      try {
        const [groupRes, thumbRes] = await Promise.all([
          fetch(`https://groups.roblox.com/v1/groups/${g.groupId}`),
          fetch(`https://thumbnails.roblox.com/v1/groups/icons?groupIds=${g.groupId}&size=150x150&format=Webp&isCircular=false`),
        ]);
        if (!groupRes.ok) return g;
        const gd = await groupRes.json();
        let icon = g.icon;
        if (thumbRes.ok) {
          const td = await thumbRes.json();
          icon = td.data?.[0]?.imageUrl || icon;
        }
        return { ...g, memberCount: gd.memberCount || g.memberCount, isVerified: gd.hasVerifiedBadge || g.isVerified, icon };
      } catch { return g; }
    }));

    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=300");
    return res.status(200).json({
      libraries,
      projects,
      groups: refreshedGroups,
      testimonials,
      status: status || { text: "", active: false },
      pricing: pricing || [],
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to load portfolio data" });
  }
}