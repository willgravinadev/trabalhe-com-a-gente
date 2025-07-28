import { createEnv } from '@t3-oss/env-nextjs'
import { vercel } from '@t3-oss/env-nextjs/presets-zod'
import { z } from 'zod'

export const wwwENV = createEnv({
  skipValidation: !!process.env.CI,
  extends: [vercel()],

  server: {
    GOOGLE_TAG_MANAGER_ID: z.string().optional(),
    GOOGLE_ANALYTICS_ID: z.string().optional()
  },
  client: {
    NEXT_PUBLIC_SITE_URL: z.string().optional(),
    NEXT_PUBLIC_API_URL: z.string().default('http://localhost:2222')
  },
  experimental__runtimeEnv: {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL
  },

  emptyStringAsUndefined: true
})
