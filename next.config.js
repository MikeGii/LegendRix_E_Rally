/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optimize for Vercel deployment
  experimental: {
    // Disable server components for auth consistency
    serverComponentsExternalPackages: ['@supabase/supabase-js']
  },
  
  // Reduce memory usage and improve cold starts
  webpack: (config, { isServer }) => {
    // Optimize bundle size
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        ...config.optimization.splitChunks,
        cacheGroups: {
          ...config.optimization.splitChunks?.cacheGroups,
          supabase: {
            name: 'supabase',
            test: /[\\/]node_modules[\\/]@supabase[\\/]/,
            chunks: 'all',
            priority: 10,
          },
        },
      },
    }

    return config
  },

  // Improve performance on Vercel
  swcMinify: true,
  
  // Optimize images - Updated for your project
  images: {
    domains: ['localhost'], // Add your domain when deploying
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000, // 1 year cache for static images
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Add headers for better caching
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
        ],
      },
      // Optimize image caching
      {
        source: '/image/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/_next/image(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },

  // Environment variables validation
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },

  // Disable source maps in production for better performance
  productionBrowserSourceMaps: false,

  // Optimize output
  output: 'standalone',
  
  // Compress responses
  compress: true,

  // Optimize for Vercel Edge Runtime where possible
  runtime: 'nodejs',
}

module.exports = nextConfig