import { mergeConfig } from 'vitest/config'

import { sharedProjectConfig } from '../../vitest.shared'

const resolve = (path: string) => new URL(path, import.meta.url).pathname

export default mergeConfig(sharedProjectConfig, {
  plugins: [],
  test: {
    environment: 'node'
  },
  resolve: {
    alias: {
      '@rest-controllers': resolve('./src/controllers/rest'),
      '@server': resolve('./src/server'),
      '@use-cases': resolve('./src/use-cases')
    }
  }
})
