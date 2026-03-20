/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["tr.rbxcdn.com", "rbxcdn.com"],
  },
  async rewrites() {
    return [
      { source: "/", destination: "/index.html" },
      { source: "/login", destination: "/login.html" },
      { source: "/dashboard", destination: "/dashboard.html" },
      { source: "/portal", destination: "/portal.html" },
      { source: "/portal-auth", destination: "/portal-auth.html" },
    ];
  },
};

module.exports = nextConfig;
