import { StatusSuccess } from '@github-search/domain'
import { HttpStatusCode } from '@github-search/utils'
import { type FastifyTypedInstance } from '@server/types'
import { z } from 'zod'

import { Tags } from './tags'

const responseSchema = {
  [HttpStatusCode.OK]: z
    .object({
      status: z.string(),
      message: z.string()
    })
    .describe('Success'),
  [HttpStatusCode.INTERNAL_SERVER_ERROR]: z
    .object({
      status: z.string(),
      message: z.string()
    })
    .describe('Internal Server Error')
}

export function healthCheckRoute(fastify: FastifyTypedInstance) {
  fastify.get(
    '/health-check',
    {
      schema: {
        tags: [Tags.HEALTH_CHECK],
        summary: 'Health Check',
        description: 'Health Check',
        operationId: 'healthCheck',
        response: responseSchema
      }
    },
    async (_request, reply) => {
      return reply.status(HttpStatusCode.OK).send({
        status: StatusSuccess.DONE,
        message: 'OK'
      })
    }
  )
}
