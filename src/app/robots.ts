import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://luxury-realestate-crm.com'

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
