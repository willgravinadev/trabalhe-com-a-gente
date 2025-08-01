import { type Linter } from 'eslint'

import { prettierConfig, prettierPlugin } from '@/plugins'

export const prettier: Linter.Config[] = [
  {
    name: 'willgravinadev:prettier',
    plugins: {
      prettier: prettierPlugin
    },
    rules: {
      // Avoid conflicts
      ...prettierConfig.rules,

      'prettier/prettier': ['error', { endOfLine: 'auto' }],
      'arrow-body-style': 'off',
      'prefer-arrow-callback': 'off'
    }
  }
]
