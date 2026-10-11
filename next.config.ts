import type { NextConfig } from "next";

// NOTE : `cacheComponents` désactivé volontairement — l'app est
// entièrement dynamique (sessions via cookies(), pages client qui
// fetch l'API au montage). Le prerender statique casserait le build.
const nextConfig: NextConfig = {
  // Évite que `next dev` réécrive AGENTS.md à chaque démarrage.
  allowedDevOrigins: ['192.168.*.*'],
  agentRules: false,

  images: {
    // Event cover pictures hosted on Vercel Blob.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
  },
};

export default nextConfig;
