/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverComponentsExternalPackages: [
      '@sparticuz/chromium',
      'playwright-core',
      'playwright',
      'sharp',
    ],
    outputFileTracingIncludes: {
      '/api/**/*': ['./node_modules/@sparticuz/chromium/bin/**'],
    },
  },
};

export default nextConfig;
