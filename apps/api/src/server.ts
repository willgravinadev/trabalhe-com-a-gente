import { makeLoggerProvider } from '@github-search/logger'
import { FastifyFramework } from '@server/fastify-app'

const loggerProvider = makeLoggerProvider()

const shutdown = async (server: FastifyFramework): Promise<never> => {
  loggerProvider.sendLogInfo({ message: 'Starting server shutdown...' })

  const forceExitTimeout = setTimeout(() => {
    loggerProvider.sendLogError({
      message: 'Graceful shutdown timeout reached, forcing exit',
      value: 'Timeout exceeded'
    })
    // eslint-disable-next-line unicorn/no-process-exit -- force exit after timeout
    process.exit(1)
  }, 10_000)

  try {
    await server.app.close()
    clearTimeout(forceExitTimeout)
    loggerProvider.sendLogInfo({ message: 'Shutdown completed. Bye 👋' })
    // eslint-disable-next-line unicorn/no-process-exit -- this is the entry point of the server
    process.exit(0)
  } catch (error: unknown) {
    clearTimeout(forceExitTimeout)
    loggerProvider.sendLogError({
      message: 'Error during shutdown',
      value: error
    })
    // eslint-disable-next-line unicorn/no-process-exit -- exit with error code
    process.exit(1)
  }
}

const start = async () => {
  try {
    const server = new FastifyFramework()
    await server.execute()

    process.on('SIGINT', () => void shutdown(server))
    process.on('SIGTERM', () => void shutdown(server))
  } catch (error: unknown) {
    loggerProvider.sendLogError({
      message: 'Fatal server error',
      value: error
    })
    throw error
  }
}

start()
