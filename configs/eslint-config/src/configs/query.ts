import { type Linter } from 'eslint'

import { queryPlugin } from '@/plugins'

export const query: Linter.Config[] = [
  {
    name: 'willgravinadev:query',
    plugins: {
      '@tanstack/query': queryPlugin as unknown as Record<string, unknown>
    },
    rules: {
      ...queryPlugin.configs.recommended.rules
    }
  }
]
