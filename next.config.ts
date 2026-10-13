import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // sharp (обработка фото) и pg работают на сервере как есть
  serverExternalPackages: ["sharp", "pg"],
  async redirects() {
    return [{ source: "/register", destination: "/signup", permanent: false }];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
