import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "www.gstatic.com",
        pathname: "/**",
      },
    ],
  },
  serverExternalPackages: ["fastify", "pg", "@stellar/stellar-sdk"],
  outputFileTracingRoot: __dirname,
  rewrites() {
    return Promise.resolve(
      process.env.NEXT_PUBLIC_STELLAR_NETWORK === "LOCAL"
        ? [
            {
              source: "/friendbot",
              destination: "http://localhost:8000/friendbot",
            },
          ]
        : [],
    );
  },
};

export default nextConfig;
