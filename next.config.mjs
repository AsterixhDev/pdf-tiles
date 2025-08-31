const withTurbopack = require('next/experimental/turbopack')

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    turbo: {
      rules: {
        // Ignore canvas module on client side
        '**/(node_modules|.next)/**/*.node': {
          loader: 'ignore'
        }
      }
    }
  }
}

module.exports = withTurbopack(nextConfig)
