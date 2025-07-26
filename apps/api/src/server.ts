import { makeLoggerProvider } from '@github-search/logger'
import { FastifyFramework } from '@server/fastify-app'

const loggerProvider = makeLoggerProvider()

const shutdown = async (server: FastifyFramework): Promise<never> => {
  loggerProvider.sendLogInfo({ message: 'Starting server shutdown...' })
  await server.app.close()
  // await Database.getInstance().prisma.$disconnect()
  loggerProvider.sendLogInfo({ message: 'Shutdown completed. Bye 👋' })
  throw new Error('Server shutdown requested')
}

const start = async () => {
  try {
    // const database = Database.getInstance()
    // await database.connect()

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
