/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // Prevent node canvas from being bundled on the client side
    config.resolve.fallback = {
      ...config.resolve.fallback,
      canvas: false,
    }
    return config
  },
}

module.exports = nextConfig
