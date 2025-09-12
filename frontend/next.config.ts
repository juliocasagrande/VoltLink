import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: { ignoreDuringBuilds: true },      // não falha o build por lint
  typescript: { ignoreBuildErrors: true },   // não falha o build por erros TS
};

export default nextConfig;