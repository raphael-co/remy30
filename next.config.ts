import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pub-7dba0d2af4cb4475ab6b113a0f14679c.r2.dev",
        pathname: "/**",
      },
      // si tu utilises aussi l’autre base url R2 mémorisée
      {
        protocol: "https",
        hostname: "pub-325a480330684380a641eb095cd28b94.r2.dev",
        pathname: "/**",
      },
      // optionnel: si tu as plusieurs buckets avec des hostnames pub-* différents
      {
        protocol: "https",
        hostname: "*.r2.dev",
        pathname: "/**",
      },
      { protocol: "https", hostname: "images.unsplash.com" }
    ],
  },
};

export default nextConfig;
