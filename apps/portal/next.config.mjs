/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@agent-hub/shared'],
  },
  transpilePackages: ['@agent-hub/shared'],
  eslint: {
    ignoreDuringBuilds: true,
  },
}

export default nextConfig
