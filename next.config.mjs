/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable image optimization and configure domains for weather icons
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'openweathermap.org',
        pathname: '/img/w/**',
      },
    ],
  },
  // Add security headers
  headers: async () => [
    {
      source: '/:path*',
      headers: [
        {
          key: 'X-Frame-Options',
          value: 'DENY',
        },
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',
        },
        {
          key: 'Referrer-Policy',
          value: 'origin-when-cross-origin',
        },
        {
          key: 'Strict-Transport-Security',
          value: 'max-age=31536000; includeSubDomains',
        },
      ],
    },
  ],
  // Disable ESLint during builds
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Disable TypeScript error checking during builds
  typescript: {
    ignoreBuildErrors: true,
  },
  // Enable React strict mode for better development
  reactStrictMode: true,
  // Disable x-powered-by header for security
  poweredByHeader: false,
  // Enable experimental features we might need
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', 'my-weather.vercel.app', 'my-weather-tawny.vercel.app'],
      bodySizeLimit: '2mb'
    }
  },
};

export default nextConfig;