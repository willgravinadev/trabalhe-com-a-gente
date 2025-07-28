import type { FastifyTypedInstance } from '@server/types'

import { githubRepositoriesRoutes } from './github-repositories/_github-repositories-routes'
import { healthCheckRoute } from './health-check.route'

export function fastifyRoutes(fastify: FastifyTypedInstance) {
  fastify.register(healthCheckRoute)
  fastify.register(githubRepositoriesRoutes)
}
