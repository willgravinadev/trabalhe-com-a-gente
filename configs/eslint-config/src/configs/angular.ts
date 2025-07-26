import { type Linter } from 'eslint'

import { angularEslintPlugin, angularTemplatePlugin } from '@/plugins'

export const angular: Linter.Config[] = [
  {
    name: 'willgravinadev:angular',
    files: ['**/*.ts'],
    plugins: {
      '@angular-eslint': angularEslintPlugin as never
    },
    languageOptions: {
      parser: '@angular-eslint/template-parser' as never
    },
    rules: {
      ...(angularEslintPlugin.configs.recommended.rules as Record<string, unknown>),
      '@angular-eslint/component-class-suffix': 'error',
      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: 'app',
          style: 'kebab-case'
        }
      ],
      '@angular-eslint/directive-class-suffix': 'error',
      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: 'app',
          style: 'camelCase'
        }
      ],
      '@angular-eslint/no-empty-lifecycle-method': 'error',
      '@angular-eslint/no-host-metadata-property': 'error',
      '@angular-eslint/no-input-rename': 'error',
      '@angular-eslint/no-inputs-metadata-property': 'error',
      '@angular-eslint/no-output-native': 'error',
      '@angular-eslint/no-output-on-prefix': 'error',
      '@angular-eslint/no-output-rename': 'error',
      '@angular-eslint/no-outputs-metadata-property': 'error',
      '@angular-eslint/use-lifecycle-interface': 'error',
      '@angular-eslint/use-pipe-transform-interface': 'error'
    }
  },
  {
    name: 'willgravinadev:angular-template',
    files: ['**/*.html'],
    plugins: {
      '@angular-eslint/template': angularTemplatePlugin as never
    },
    languageOptions: {
      parser: '@angular-eslint/template-parser' as never
    },
    rules: {
      ...(angularTemplatePlugin.configs.recommended.rules as Record<string, unknown>),
      '@angular-eslint/template/banana-in-box': 'error',
      '@angular-eslint/template/cyclomatic-complexity': ['error', { maxComplexity: 10 }],
      '@angular-eslint/template/no-call-expression': 'error',
      '@angular-eslint/template/no-negated-async': 'error',
      '@angular-eslint/template/use-track-by-function': 'error'
    }
  }
]
