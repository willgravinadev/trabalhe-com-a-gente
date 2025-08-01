import { type Linter } from 'eslint'

import { GLOB_E2E } from '@/globs'
import { playwrightPlugin } from '@/plugins'

export const playwright: Linter.Config[] = [
  {
    name: 'willgravinadev:playwright',
    ...playwrightPlugin.configs['flat/recommended'],
    files: [GLOB_E2E]
  }
]
