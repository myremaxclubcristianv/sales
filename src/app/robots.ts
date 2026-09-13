import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://sales.cristianvaduva.com'

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/properties',
          '/properties/*',
          '/requests',
          '/about',
          '/contact',
          '/legal',
          '/privacy-policy',
          '/cookie-policy',
          '/terms',
          '/gdpr',
          '/data-protection',
          '/marketing-consent',
          '/imprint',
          '/accessibility',
          '/complaints',
        ],
        disallow: [
          '/admin/',
          '/admin/*',
          '/api/',
          '/api/*',
          '/login',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}

