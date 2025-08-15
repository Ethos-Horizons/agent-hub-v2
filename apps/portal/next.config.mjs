/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@agent-hub/shared'],
  eslint: {
    ignoreDuringBuilds: true,
  },
}

export default nextConfig
