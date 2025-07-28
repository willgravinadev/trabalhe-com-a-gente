import { SITE_URL } from '@utils/constants.util'
import { type MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/api/avatar/*'],
        disallow: ['/api/']
      }
    ],
    sitemap: `${SITE_URL}/sitemap.xml`
  }
}
