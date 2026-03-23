export default async function handler(req, res) {
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');
  try {
    const userId = '5233637325';
    const [userRes, avatarRes] = await Promise.all([
      fetch(`https://users.roblox.com/v1/users/${userId}`),
      fetch(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=150x150&format=Png`)
    ]);
    const user = await userRes.json();
    const avatar = await avatarRes.json();
    const avatarUrl = avatar?.data?.[0]?.imageUrl || null;

    // Friends count
    let friends = 0;
    try {
      const fr = await fetch(`https://friends.roblox.com/v1/users/${userId}/friends/count`);
      const fd = await fr.json();
      friends = fd.count || 0;
    } catch {}

    return res.status(200).json({
      id: user.id,
      name: user.name,
      displayName: user.displayName,
      description: user.description,
      created: user.created,
      avatar: avatarUrl,
      friends,
    });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
