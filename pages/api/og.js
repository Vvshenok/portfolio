export default function handler(req, res) {
  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 'public, max-age=86400');

  const svg = `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0c0c0c"/>
      <stop offset="100%" style="stop-color:#141414"/>
    </linearGradient>
  </defs>
  
  <!-- Background -->
  <rect width="1200" height="630" fill="url(#bg)"/>
  
  <!-- Accent border top -->
  <rect x="0" y="0" width="1200" height="3" fill="#c8ff00"/>
  
  <!-- Grid decoration -->
  <rect x="800" y="0" width="1" height="630" fill="#242424"/>
  <rect x="0" y="400" width="1200" height="1" fill="#242424"/>
  
  <!-- Tag -->
  <rect x="80" y="120" width="220" height="28" rx="4" fill="rgba(200,255,0,0.08)" stroke="#c8ff00" stroke-width="1" stroke-opacity="0.3"/>
  <text x="190" y="139" font-family="monospace" font-size="11" fill="#c8ff00" text-anchor="middle" letter-spacing="2">ROBLOX DEVELOPER</text>
  
  <!-- Name -->
  <text x="80" y="230" font-family="Arial Black, Arial" font-size="88" font-weight="900" fill="#f0f0f0" letter-spacing="-3">Vvshenok</text>
  <text x="626" y="230" font-family="Arial Black, Arial" font-size="88" font-weight="900" fill="#c8ff00">.</text>
  
  <!-- Tagline -->
  <text x="80" y="285" font-family="Arial, sans-serif" font-size="22" fill="#777">Lua Scripter · 555M+ visits · Available for hire</text>
  
  <!-- Stats -->
  <rect x="80" y="340" width="140" height="80" rx="6" fill="#141414" stroke="#242424" stroke-width="1"/>
  <text x="150" y="378" font-family="monospace" font-size="26" font-weight="700" fill="#f0f0f0" text-anchor="middle">555M+</text>
  <text x="150" y="400" font-family="monospace" font-size="10" fill="#555" text-anchor="middle" letter-spacing="1">TOTAL VISITS</text>
  
  <rect x="240" y="340" width="140" height="80" rx="6" fill="#141414" stroke="#242424" stroke-width="1"/>
  <text x="310" y="378" font-family="monospace" font-size="26" font-weight="700" fill="#f0f0f0" text-anchor="middle">13+</text>
  <text x="310" y="400" font-family="monospace" font-size="10" fill="#555" text-anchor="middle" letter-spacing="1">GAMES SHIPPED</text>
  
  <rect x="400" y="340" width="140" height="80" rx="6" fill="#141414" stroke="#242424" stroke-width="1"/>
  <text x="470" y="378" font-family="monospace" font-size="26" font-weight="700" fill="#f0f0f0" text-anchor="middle">4+</text>
  <text x="470" y="400" font-family="monospace" font-size="10" fill="#555" text-anchor="middle" letter-spacing="1">YEARS SCRIPTING</text>
  
  <!-- URL -->
  <text x="80" y="560" font-family="monospace" font-size="16" fill="#404040">portfolio-rho-lemon-27.vercel.app</text>
  
  <!-- Right decoration -->
  <text x="950" y="350" font-family="monospace" font-size="120" fill="#1a1a1a" text-anchor="middle">&lt;/&gt;</text>
</svg>`;

  res.status(200).send(svg);
}