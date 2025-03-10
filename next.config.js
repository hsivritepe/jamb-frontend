/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'dev.thejamb.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  reactStrictMode: true,
};

module.exports = nextConfig;