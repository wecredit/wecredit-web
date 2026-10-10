import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  trailingSlash: true,
  compiler: {
    removeConsole: process.env.NEXT_PUBLIC_ENVIRONMENT === 'production',
  },
  async redirects() {
    return [
      {
        source: '/terms',
        destination: 'https://www.wecredit.co.in/terms-of-service',
        permanent: true,
      },
    ];
  },

  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/sitemap-page.xml',
          destination: '/sitemap-page/sitemap.xml',
        },
        {
          source: '/sitemap-posts.xml',
          destination: '/sitemap-posts/sitemap.xml',
        },
        {
          source: '/sitemap-loans.xml',
          destination: '/sitemap-loans/sitemap.xml',
        },
        {
          source: '/sitemap-loan-apps.xml',
          destination: '/sitemap-loan-apps/sitemap.xml',
        },
      ],
    };
  },

  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '1337',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: '**.strapi.io',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'wecredit-blogs.s3.ap-south-1.amazonaws.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'wcstaticasset.blob.core.windows.net',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'wecredit-main-website-assets.s3.ap-south-1.amazonaws.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'blog.wecredit.co.in',
        pathname: '/**',
      },
      // Add your production Strapi domain here
      // {
      //   protocol: 'https',
      //   hostname: 'your-strapi-domain.com',
      //   pathname: '/uploads/**',
      // },
    ],
    // Allow localhost for development
    dangerouslyAllowLocalIP: true,
  },
};

export default nextConfig;
