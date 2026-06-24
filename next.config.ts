import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 允许 Stripe 和 Supabase 的图片域名
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.supabase.co" },
    ],
  },
  // 禁用 React Compiler 以避免第三方库兼容问题
  // 跳过 TypeScript 和 ESLint 在构建时的检查（本地已通过）
};

export default nextConfig;
