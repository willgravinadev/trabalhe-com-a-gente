export const isProduction = process.env.NODE_ENV === 'production'
// eslint-disable-next-line unicorn/prefer-global-this -- using `typeof window` to safely detect non-browser environments; `globalThis` is always defined
export const isServer = typeof window === 'undefined'

export const SITE_URL: string = isProduction ? 'https://githubsearch.gravina.dev' : 'http://localhost:3000'

export const SITE_NAME = 'GitHub Search'
export const SITE_KEYWORDS = ['GitHub Search', 'Repositories', 'Repositorios']
