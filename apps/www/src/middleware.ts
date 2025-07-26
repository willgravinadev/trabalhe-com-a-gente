import { NextResponse } from 'next/server'

/**
 * Content Security Policy configuration
 * Defines security policies for different resource types
 */
const CSP_DIRECTIVES = {
  'default-src': "'self'",
  'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'", '*.gravina.dev', 'vercel.live', 'va.vercel-scripts.com', 'unpkg.com'].join(' '),
  'style-src': "'self' 'unsafe-inline' vercel.live",
  'img-src': '* blob: data:',
  'font-src': "'self' data: assets.vercel.com vercel.live",
  'object-src': "'none'",
  'base-uri': "'self'",
  'form-action': "'self'",
  'connect-src': '*',
  'media-src': "'self'",
  'frame-ancestors': "'none'",
  'frame-src': 'vercel.live',
  'worker-src': "blob: 'self'",
  'block-all-mixed-content': '',
  'upgrade-insecure-requests': ''
} as const

/**
 * Converts CSP directives object to header string
 */
const buildCSPHeader = (directives: typeof CSP_DIRECTIVES): string => {
  return Object.entries(directives)
    .map(([directive, value]) => `${directive} ${value}`.trim())
    .join('; ')
}

/**
 * Next.js middleware for setting security headers
 */
const middleware = () => {
  const response = NextResponse.next()

  // Set Content Security Policy header
  const cspHeader = buildCSPHeader(CSP_DIRECTIVES)
  response.headers.set('Content-Security-Policy', cspHeader)

  return response
}

/**
 * Middleware configuration
 * Applies to all routes except:
 * - API routes (/api/*)
 * - RPC routes (/rpc/*)
 * - Next.js static files
 * - Vercel internals
 * - Public assets (favicon, images, etc.)
 * - SEO files (sitemap.xml, robots.txt, rss.xml)
 */
export const config = {
  matcher: ['/((?!api|rpc|_next/static|_next/image|_vercel|og|favicon|fonts|images|videos|favicon.ico|sitemap.xml|robots.txt|rss.xml).*)']
}

export default middleware
