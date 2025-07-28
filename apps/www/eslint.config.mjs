import eslintConfig, { GLOB_E2E, GLOB_TS, GLOB_TSX } from '@github-search/eslint-config'

export default eslintConfig(
  {
    project: './tsconfig.json',
    tsconfigRootDir: import.meta.dirname,
    react: true,
    next: true,
    playwright: true,
    testingLibrary: true,
    query: true,
    typescript: true,
    turbo: true,
    tailwindcss: true,
    tailwindcssConfig: {
      entryPoint: 'src/styles/tailwind.css',
      ignoreClasses: ['']
    }
  },
  {
    files: [GLOB_E2E],
    rules: {
      'playwright/expect-expect': [
        'error',
        {
          assertFunctionNames: ['checkStoredTheme', 'checkAppliedTheme', 'a11y']
        }
      ]
    }
  },
  {
    files: [GLOB_TS, GLOB_TSX],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: "JSXOpeningElement[name.name='a']",
          message: 'Using `<a>` elements directly is discouraged. Please use `<Link>` from `@/components/link` instead.'
        }
      ]
    }
  }
)
