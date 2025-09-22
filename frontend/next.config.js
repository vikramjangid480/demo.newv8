/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['images.unsplash.com', 'localhost', '10.2.0.2'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
      },
      {
        protocol: 'http',
        hostname: '10.2.0.2',
        port: '3000',
      }
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },
  async rewrites() {
    return [
      {
        source: '/api/blogs',
        destination: 'http://localhost:8000/api/blogs',
      },
      {
        source: '/api/blogs/slug/:slug',
        destination: 'http://localhost:8000/api/blogs/slug/:slug',
      },
      {
        source: '/api/blogs/:id',
        destination: 'http://localhost:8000/api/blogs/:id',
      },
      {
        source: '/blogdetails/:id',
        destination: '/blogdetails/:id',
      },
      {
        source: '/api/categories',
        destination: 'http://localhost:8000/api/categories',
      },
      {
        source: '/api/banner',
        destination: 'http://localhost:8000/api/banner',
      },
      {
        source: '/api/admin/blogs',
        destination: 'http://localhost:8000/api/admin/blogs',
      },
      {
        source: '/api/admin/blogs/:id',
        destination: 'http://localhost:8000/api/admin/blogs/:id',
      },
      {
        source: '/api/auth/login',
        destination: 'http://localhost:8000/api/auth/login',
      },
    ]
  },
  env: {
    BACKEND_URL: process.env.NODE_ENV === 'production' 
      ? 'https://your-backend-domain.com' 
      : 'http://localhost:8000',
  },
}

module.exports = nextConfig