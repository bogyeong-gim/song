import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/song',
  images: { unoptimized: true },
};

export default nextConfig;
