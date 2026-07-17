import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://catravels.com'

  const disallowAdmin = [
    '/admin',
    '/admin/',
    '/admin-login',
    '/admin-forgot-password',
    '/admin-reset-password',
    '/api/',
    '/checkout',
    '/my-payments',
    '/payment/',
    '/signin',
    '/signup',
    '/forgot-password',
    '/reset-password',
    '/profile',
  ]

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: disallowAdmin,
      },
      // Explicitly welcome major AI / answer-engine crawlers
      {
        userAgent: 'GPTBot',
        allow: '/',
        disallow: disallowAdmin,
      },
      {
        userAgent: 'ChatGPT-User',
        allow: '/',
        disallow: disallowAdmin,
      },
      {
        userAgent: 'Google-Extended',
        allow: '/',
        disallow: disallowAdmin,
      },
      {
        userAgent: 'ClaudeBot',
        allow: '/',
        disallow: disallowAdmin,
      },
      {
        userAgent: 'Claude-Web',
        allow: '/',
        disallow: disallowAdmin,
      },
      {
        userAgent: 'PerplexityBot',
        allow: '/',
        disallow: disallowAdmin,
      },
      {
        userAgent: 'Applebot-Extended',
        allow: '/',
        disallow: disallowAdmin,
      },
      {
        userAgent: 'CCBot',
        allow: '/',
        disallow: disallowAdmin,
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  }
}
