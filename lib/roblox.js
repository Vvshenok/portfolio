async function fetchGameDetails(universeIds) {
  if (!universeIds.length) return [];
  const ids = universeIds.join(",");
  try {
    const res = await fetch(
      `https://games.roblox.com/v1/games?universeIds=${ids}`,
      { headers: { "Accept": "application/json" } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.data || [];
  } catch {
    return [];
  }
}

async function fetchGameThumbnails(universeIds) {
  if (!universeIds.length) return [];
  const ids = universeIds.join(",");
  try {
    const res = await fetch(
      `https://thumbnails.roblox.com/v1/games/multiget/thumbnails?universeIds=${ids}&countPerUniverse=1&defaults=true&size=768x432&format=Webp&isCircular=false`,
      { headers: { "Accept": "application/json" } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.data || [];
  } catch {
    return [];
  }
}

async function enrichGames(games) {
  const active = games.filter((g) => g.active);
  if (!active.length) return [];

  const universeIds = active.map((g) => g.universeId);

  const [details, thumbs] = await Promise.all([
    fetchGameDetails(universeIds),
    fetchGameThumbnails(universeIds),
  ]);

  const detailMap = {};
  details.forEach((d) => { detailMap[String(d.id)] = d; });

  const thumbMap = {};
  thumbs.forEach((t) => {
    if (t.thumbnails && t.thumbnails[0]) {
      thumbMap[String(t.universeId)] = t.thumbnails[0].imageUrl;
    }
  });

  return active.map((game) => {
    const d = detailMap[String(game.universeId)] || {};
    return {
      id: game.id,
      universeId: game.universeId,
      placeId: game.placeId,
      name: game.name,
      role: game.role,
      description: game.description,
      visits: d.visits || 0,
      playing: d.playing || 0,
      thumbnail: thumbMap[String(game.universeId)] || null,
      robloxUrl: `https://www.roblox.com/games/${game.placeId}`,
    };
  });
}

module.exports = { enrichGames };
