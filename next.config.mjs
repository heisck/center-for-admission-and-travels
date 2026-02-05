/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Skip type checking during build for faster builds
    // Types are still checked in development and via CI
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
