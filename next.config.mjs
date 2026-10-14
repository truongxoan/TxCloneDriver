/** @type {import('next').NextConfig} */
const nextConfig = {
  // Xuất bản standalone giúp giảm 80% dung lượng server, khởi động siêu tốc
  output: "standalone",
  reactStrictMode: false,
  poweredByHeader: false,
  compress: true,
  images: {
    unoptimized: true,
  },
  // Tối ưu hóa Tree-shaking và giảm kích thước bundle của các thư viện lớn
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "framer-motion",
      "date-fns",
    ],
  },
  // Giảm thiểu rò rỉ log trên môi trường production để tăng tốc render
  compiler: {
    removeConsole: process.env.NODE_ENV === "production" ? { exclude: ["error", "warn"] } : false,
  },
  // Thiết lập HTTP Caching Headers cho tài nguyên tĩnh để đạt tốc độ nạp 0ms
  async headers() {
    return [
      {
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/(icon.svg|manifest.json|favicon.ico)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=604800",
          },
        ],
      },
    ];
  },
};

export default nextConfig;

