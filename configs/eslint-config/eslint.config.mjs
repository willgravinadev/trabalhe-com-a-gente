import eslintConfig from './dist/index.js'

export default eslintConfig({
  project: './tsconfig.json',
  tsconfigRootDir: import.meta.dirname,
  react: true,
  next: true,
  query: true,
  playwright: true,
  testingLibrary: true,
  turbo: true,
  typescript: true
})
