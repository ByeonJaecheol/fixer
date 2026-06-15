import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    // 빌드 시 ESLint 검사 무시
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ["cdn.imweb.me"],
  },
  /* config options here */
};

export default nextConfig;
