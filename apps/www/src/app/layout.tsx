import '@styles/tailwind.css'

import { wwwENV } from '@github-search/env'
import { cn } from '@github-search/utils'
import { GoogleAnalytics, GoogleTagManager } from '@next/third-parties/google'
import { SITE_KEYWORDS, SITE_NAME, SITE_URL } from '@utils/constants.util'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { type Metadata, type Viewport } from 'next'
import { M_PLUS_Rounded_1c } from 'next/font/google'
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { type ReactNode } from 'react'

import { Providers } from './providers'

export const generateMetadata = (): Metadata => {
  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: SITE_NAME,
      template: `%s | ${SITE_NAME}`
    },
    description: 'GitHub Search',
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1
      }
    },
    authors: {
      name: 'W I L L',
      url: SITE_URL
    },
    manifest: '/favicon/site.webmanifest',
    twitter: {
      card: 'summary_large_image',
      title: SITE_NAME
    },
    keywords: SITE_KEYWORDS,
    creator: 'W I L L',
    openGraph: {
      url: SITE_URL,
      type: 'website',
      title: SITE_NAME,
      siteName: SITE_NAME,
      description: 'GitHub Search',
      images: []
    },
    icons: {
      icon: '/favicon/favicon.svg',
      shortcut: '/favicon/favicon.svg',
      apple: [
        {
          url: '/favicon/apple-touch-icon.png',
          sizes: '180x180',
          type: 'image/png'
        }
      ],
      other: [
        {
          rel: 'icon',
          type: 'image/png',
          sizes: '16x16',
          url: '/favicon/favicon-16x16.png'
        },
        {
          rel: 'icon',
          type: 'image/png',
          sizes: '32x32',
          url: '/favicon/favicon-32x32.png'
        }
      ]
    }
  }
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' }
  ]
}

const font = M_PLUS_Rounded_1c({
  subsets: ['latin'],
  variable: '--font-main',
  weight: ['300', '400', '700']
})

export default function Layout(props: Readonly<{ children: ReactNode }>) {
  return (
    <html lang='pt-BR' className={cn(font.variable)} suppressHydrationWarning>
      <body className='font-main dark relative flex min-h-screen flex-col font-normal antialiased'>
        <NuqsAdapter>
          <Providers>{props.children}</Providers>
        </NuqsAdapter>
        <GoogleTagManager gtmId={wwwENV.GOOGLE_TAG_MANAGER_ID ?? ''} />
        <GoogleAnalytics gaId={wwwENV.GOOGLE_ANALYTICS_ID ?? ''} />
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  )
}
