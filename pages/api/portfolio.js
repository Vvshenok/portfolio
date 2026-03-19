const { getList } = require("../../lib/store");

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();
  try {
    const [libraries, projects, groups] = await Promise.all([
      getList("vs:libraries"),
      getList("vs:projects"),
      getList("vs:groups"),
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

    res.setHeader("Cache-Control", "s-maxage=120, stale-while-revalidate=600");
    return res.status(200).json({ libraries, projects, groups: refreshedGroups });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to load portfolio data" });
  }
}
