import eslintConfig from '@github-search/eslint-config'

export default eslintConfig(
  {
    project: './tsconfig.json',
    tsconfigRootDir: import.meta.dirname,
    turbo: true,
    typescript: true
  },
  {
    rules: {
      '@typescript-eslint/no-unsafe-return': 'off',
      'sonarjs/no-async-constructor': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-redundant-type-constituents': 'off',
      '@typescript-eslint/unbound-method': 'off'
    }
  }
)
