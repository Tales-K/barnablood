import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['firebase-admin'],
  images: {
    localPatterns: [
      { pathname: '/*' },
      { pathname: '/**/*' },
    ],
  },
};

export default nextConfig;
