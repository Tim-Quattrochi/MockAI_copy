/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true, // Only use this temporarily
  },
  outputFileTracing: true,
  reactStrictMode: false,
  images: {
    domains: ["lh3.googleusercontent.com"], // External image domain
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "3mb",
    },
  },
};

module.exports = nextConfig;
