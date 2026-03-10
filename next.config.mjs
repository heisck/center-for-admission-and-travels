/** @type {import('next').NextConfig} */
const isProduction = process.env.NODE_ENV === 'production'
const scriptSrc = isProduction
  ? "script-src 'self' 'unsafe-inline' https://js.paystack.co https://*.paystack.co"
  : "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.paystack.co https://*.paystack.co"

const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "font-src 'self' data: https:",
  "img-src 'self' data: blob: https:",
  "object-src 'none'",
  scriptSrc,
  "style-src 'self' 'unsafe-inline' https:",
  "connect-src 'self' https: wss:",
  "frame-src 'self' https://js.paystack.co https://*.paystack.co",
  "frame-ancestors 'none'",
  "form-action 'self'",
  isProduction ? 'upgrade-insecure-requests' : '',
].filter(Boolean).join('; ')

const nextConfig = {
  images: {
    unoptimized: true,
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
          { key: 'Cross-Origin-Resource-Policy', value: 'same-origin' },
          { key: 'Content-Security-Policy', value: contentSecurityPolicy },
          ...(isProduction
            ? [{ key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' }]
            : []),
        ],
      },
    ]
  },
}

export default nextConfig
