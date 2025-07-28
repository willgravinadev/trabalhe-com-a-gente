import { type FastifyTypedInstance } from '@server/types'

import { searchGithubRepositoriesRoute } from './search-github-repositories.route'

export function githubRepositoriesRoutes(fastify: FastifyTypedInstance) {
  searchGithubRepositoriesRoute(fastify)
}
