import { type Linter } from 'eslint'

import { nextPlugin } from '@/plugins'

export const next: Linter.Config[] = [
  {
    name: 'willgravinadev:next',
    plugins: {
      '@next/next': nextPlugin as never
    },
    rules: {
      ...(nextPlugin.configs.recommended.rules as Record<string, unknown>),
      ...(nextPlugin.configs['core-web-vitals'].rules as Record<string, unknown>),
      '@next/next/no-html-link-for-pages': 'error',
      '@next/next/no-sync-scripts': 'error'
    }
  }
]
