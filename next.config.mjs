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
  },
};

export default nextConfig;
