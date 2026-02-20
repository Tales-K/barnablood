import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    localPatterns: [
      { pathname: '/*' },
      { pathname: '/**/*' },
    ],
  },
};

export default nextConfig;
