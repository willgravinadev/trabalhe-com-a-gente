# @github-search/eslint-config

A comprehensive ESLint configuration for TypeScript, React, Next.js, and more.

## Features

- **TypeScript** - TypeScript support with strict rules
- **React** - React and JSX support with accessibility rules
- **Next.js** - Next.js specific rules
- **TanStack Query** - TanStack Query (React Query) best practices
- **Testing** - Playwright and Testing Library support
- **TailwindCSS** - TailwindCSS class sorting and validation
- **Import sorting** - Automatic import organization
- **Code quality** - SonarJS, Unicorn, and other quality rules

## Usage

```javascript
import eslintConfig from '@github-search/eslint-config'

export default eslintConfig({
  project: './tsconfig.json',
  tsconfigRootDir: import.meta.dirname,
  react: true,
  next: true,
  query: true, // Enable TanStack Query (React Query) rules
  typescript: true,
  playwright: true,
  testingLibrary: true,
  tailwindcss: true
})
```

## Options

- `typescript` - Enable TypeScript rules (default: auto-detected)
- `react` - Enable React and JSX rules
- `next` - Enable Next.js specific rules
- `query` - Enable TanStack Query rules
- `playwright` - Enable Playwright testing rules
- `testingLibrary` - Enable Testing Library rules
- `tailwindcss` - Enable TailwindCSS rules
- `turbo` - Enable Turborepo rules
- `project` - Path to tsconfig.json for TypeScript parser
- `tsconfigRootDir` - Root directory for TypeScript configuration
