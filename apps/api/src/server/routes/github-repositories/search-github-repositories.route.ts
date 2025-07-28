import { HttpStatusCode } from '@github-search/utils'
import { makeSearchGithubRepositoriesRestController } from '@server/factories/rest-controllers/github-repositories/search-github-repositories-rest-controller.factory'
import { fastifyRouteAdapter } from '@server/fastify.adapter'
import { type FastifyTypedInstance } from '@server/types'
import { z } from 'zod'

import { Tags } from '../tags'

export function searchGithubRepositoriesRoute(fastify: FastifyTypedInstance) {
  fastify.get(
    '/github-repositories/search',
    {
      schema: {
        tags: [Tags.GITHUB_REPOSITORIES],
        description: 'Search for github repositories',
        summary: 'Search for github repositories',
        querystring: z.object({
          query: z.string().describe('Search query'),
          selected_page: z.string().describe('Selected page').transform(Number).default(1).optional(),
          repositories_per_page: z.string().describe('Items per page').transform(Number).default(22).optional(),
          sort_by: z.enum(['best_match', 'most_stars', 'most_forks', 'recently_updated']).describe('Sort by').default('best_match').optional()
        }),
        operationId: 'searchGithubRepositories',
        response: {
          [HttpStatusCode.OK]: z
            .object({
              status: z.string(),
              success: z.object({
                pagination: z.object({
                  total_items: z.number(),
                  total_pages: z.number(),
                  current_page: z.number(),
                  items_per_page: z.number(),
                  has_next_page: z.boolean(),
                  has_previous_page: z.boolean()
                }),
                repositories: z.array(
                  z.object({
                    external_id: z.string(),
                    name: z.string(),
                    full_name: z.string(),
                    external_url: z.string(),
                    created_at: z.string(),
                    stars_count: z.number(),
                    forks_count: z.number(),
                    description: z.string(),
                    language: z.string().nullable(),
                    ssh_url: z.string(),
                    open_issues_count: z.number(),
                    topics: z.array(z.string()),
                    owner: z.object({
                      external_id: z.string(),
                      username: z.string(),
                      type: z.string(),
                      external_avatar_url: z.string(),
                      external_profile_url: z.string()
                    })
                  })
                )
              })
            })
            .describe('Success'),
          [HttpStatusCode.BAD_REQUEST]: z
            .object({
              status: z.string(),
              error: z.object({ message: z.string() })
            })
            .describe('Invalid request data'),
          [HttpStatusCode.NOT_ACCEPTABLE]: z
            .object({
              status: z.string(),
              error: z.object({
                message: z.string(),
                details: z.object({
                  issues: z.unknown(),
                  method: z.string(),
                  url: z.string()
                })
              })
            })
            .describe('Invalid request data')
        }
      }
    },

    fastifyRouteAdapter(makeSearchGithubRepositoriesRestController())
  )
}
