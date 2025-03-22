import type { NextConfig } from "next";

/**
 * Next.jsの設定
 * ハイドレーションの問題を解決するための設定を含む
 */
const nextConfig: NextConfig = {
  reactStrictMode: false, // ハイドレーションエラーを減らすために無効化
  swcMinify: true,
  modularizeImports: {
    '@mui/icons-material': {
      transform: '@mui/icons-material/{{member}}',
    },
  },
  compiler: {
    emotion: true, // Emotionの適切な処理を有効化
  },
};

export default nextConfig;
