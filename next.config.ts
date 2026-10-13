import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    // Старая страница регистрации мастеров больше не нужна
    return [{ source: "/register", destination: "/", permanent: false }];
  },
};

export default nextConfig;
