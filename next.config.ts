import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Docker için standalone output
  output: 'standalone',

  // X-Powered-By header'ı kaldır (SEO ve güvenlik)
  poweredByHeader: false,

  // Resim optimizasyonu
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
  },

  // Security ve SEO headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },

  // www -> non-www redirect (veya tersi)
  async redirects() {
    return [
      // Trailing slash normalize
      {
        source: '/:path+/',
        destination: '/:path+',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
