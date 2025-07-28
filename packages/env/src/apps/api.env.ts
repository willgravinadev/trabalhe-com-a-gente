import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

export const apiENV = createEnv({
  skipValidation: !!process.env.CI,
  server: {
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.coerce.number().default(2222),
    HOST: z.string().default('0.0.0.0'),
    CORS_ORIGIN: z.string().or(z.array(z.string())).default('*')
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true
})
