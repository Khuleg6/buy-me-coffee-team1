import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "192.168.1.117",
    "192.168.12.40",
    ...(process.env.NEXT_PUBLIC_BASE_URL
      ? [new URL(process.env.NEXT_PUBLIC_BASE_URL).hostname]
      : []),
  ],
  images: {
    remotePatterns: [
      {
        // matches any hostname, any port, any protocol
        protocol: "http",
        hostname: "**",
        pathname: "/uploads/**",
      },
      {
        protocol: "https",
        hostname: "**",
        pathname: "/uploads/**",
      },
    ],
  },
};

export default nextConfig;
