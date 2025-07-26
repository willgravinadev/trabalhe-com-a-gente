import { type Config } from 'prettier'
import { type PluginOptions as TailwindOptions } from 'prettier-plugin-tailwindcss'

export type Options = Config & TailwindOptions

const prettierConfig = (options: Options = {}): Options => {
  const { plugins = [], ...rest } = options

  return {
    arrowParens: 'always',
    singleQuote: true,
    jsxSingleQuote: true,
    tabWidth: 2,
    semi: false,
    trailingComma: 'none',
    endOfLine: 'lf',
    plugins: [
      ...plugins,
      'prettier-plugin-packagejson',
      'prettier-plugin-tailwindcss' // must be loaded last
    ],
    printWidth: 150,

    // Tailwind CSS
    tailwindFunctions: ['cn', 'clsx', 'cva', 'tv'],
    ...rest
  }
}

export default prettierConfig
