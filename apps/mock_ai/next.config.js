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
  rewrites: async () => ({
    beforeFiles: [
      {
        source: "/service/:path*",
        destination:
          process.env.NODE_ENV === "production"
            ? "/api/"
            : "http://127.0.0.1:3001/service/:path*",
      },
    ],
  }),
};

module.exports = nextConfig;
