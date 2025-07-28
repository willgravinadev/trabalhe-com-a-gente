import { wwwENV } from '@github-search/env'

export const getBaseUrl = () => {
  const base = wwwENV.NEXT_PUBLIC_SITE_URL ?? wwwENV.VERCEL_URL
  if (base) return `https://${base}`
  return `http://localhost:3000`
}
