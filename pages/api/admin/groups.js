const auth = require("../../../lib/auth");
const { getList, addItem, removeItem } = require("../../../lib/store");

const KEY = "vs:groups";
const MY_USER_ID = "5233637325";

async function guard(req, res) {
  const token = auth.getToken(req);
  if (!await auth.valid(token)) { res.status(401).json({ error: "Unauthorized" }); return false; }
  return true;
}

async function fetchGroupInfo(groupId) {
  try {
    const [groupRes, thumbRes] = await Promise.all([
      fetch(`https://groups.roblox.com/v1/groups/${groupId}`),
      fetch(`https://thumbnails.roblox.com/v1/groups/icons?groupIds=${groupId}&size=150x150&format=Webp&isCircular=false`),
    ]);
    if (!groupRes.ok) return null;
    const group = await groupRes.json();
    let icon = null;
    if (thumbRes.ok) {
      const td = await thumbRes.json();
      icon = td.data?.[0]?.imageUrl || null;
    }
    let myRank = null;
    try {
      const rankRes = await fetch(`https://groups.roblox.com/v1/users/${MY_USER_ID}/groups/roles`);
      if (rankRes.ok) {
        const rd = await rankRes.json();
        const found = rd.data?.find(g => String(g.group.id) === String(groupId));
        if (found) myRank = found.role.name;
      }
    } catch {}
    return {
      groupId: String(groupId),
      name: group.name,
      description: group.description || "",
      memberCount: group.memberCount || 0,
      isVerified: group.hasVerifiedBadge || false,
      icon,
      myRank: myRank || "Member",
      url: `https://www.roblox.com/groups/${groupId}`,
    };
  } catch { return null; }
}

export default async function handler(req, res) {
  if (req.method === "GET") {
    const groups = await getList(KEY);
    const refreshed = await Promise.all(groups.map(async g => {
      try {
        const live = await fetchGroupInfo(g.groupId);
        if (!live) return g;
        return { ...g, memberCount: live.memberCount, icon: live.icon, isVerified: live.isVerified, myRank: live.myRank };
      } catch { return g; }
    }));
    return res.status(200).json({ groups: refreshed });
  }

  if (!await guard(req, res)) return;

  if (req.method === "POST") {
    const { groupId } = req.body || {};
    if (!groupId) return res.status(400).json({ error: "groupId required" });
    const info = await fetchGroupInfo(groupId);
    if (!info) return res.status(400).json({ error: "Could not fetch group. Check the Group ID." });
    const existing = await getList(KEY);
    if (existing.find(g => g.groupId === String(groupId))) {
      return res.status(400).json({ error: "Group already added." });
    }
    const item = await addItem(KEY, info);
    return res.status(201).json({ item });
  }

  if (req.method === "DELETE") {
    const { id } = req.body || {};
    if (!id) return res.status(400).json({ error: "id required" });
    const ok = await removeItem(KEY, id);
    if (!ok) return res.status(404).json({ error: "Not found" });
    return res.status(200).json({ ok: true });
  }

  return res.status(405).end();
}
