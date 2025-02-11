// next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["dev.thejamb.com"],
    unoptimized: true,
  },
  reactStrictMode: true,
};
 
module.exports = nextConfig;