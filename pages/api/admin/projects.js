const auth = require("../../../lib/auth");
const { getList, addItem, removeItem } = require("../../../lib/store");

const KEY = "vs:projects";

async function guard(req, res) {
  const token = auth.getToken(req);
  if (!await auth.valid(token)) { res.status(401).json({ error: "Unauthorized" }); return false; }
  return true;
}

async function fetchGithubRepo(url) {
  try {
    const match = url.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (!match) return null;
    const [, owner, repo] = match;
    const r = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: { "Accept": "application/vnd.github+json", "User-Agent": "vvshenok-portfolio" }
    });
    if (!r.ok) return null;
    const d = await r.json();
    return {
      name: d.name,
      description: d.description || "",
      stars: d.stargazers_count || 0,
      forks: d.forks_count || 0,
      language: d.language || "",
      url: d.html_url,
    };
  } catch { return null; }
}

export default async function handler(req, res) {
  if (req.method === "GET") {
    return res.status(200).json({ projects: await getList(KEY) });
  }
  if (!await guard(req, res)) return;

  if (req.method === "POST") {
    const { githubUrl, description } = req.body || {};
    if (!githubUrl) return res.status(400).json({ error: "githubUrl required" });
    const meta = await fetchGithubRepo(githubUrl);
    if (!meta) return res.status(400).json({ error: "Could not fetch GitHub repo. Check the URL." });
    const item = await addItem(KEY, {
      ...meta,
      description: description || meta.description,
      githubUrl,
    });
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
