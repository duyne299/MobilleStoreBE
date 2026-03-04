import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['localhost'], // thêm hostname của API server
  },
};

export default nextConfig;
