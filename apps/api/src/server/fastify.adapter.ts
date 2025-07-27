import { type HttpRequest, type HttpResponse, type HttpResponseError, type IController } from '@github-search/domain'
import { HttpStatusCode } from '@github-search/utils'
import { type FastifyReply, type FastifyRequest } from 'fastify'

export function fastifyRouteAdapter<TRequest, TResponse>(controller: IController<TRequest, TResponse>) {
  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    try {
      console.log(request.query)
      const httpRequest = await adaptRequest(request)
      const result = await controller.handle(httpRequest as never)
      await adaptResponse(reply, result)
    } catch (error) {
      await handleError(reply, error)
    }
  }
}
async function adaptRequest(request: FastifyRequest): Promise<HttpRequest> {
  let file = undefined

  if (request.isMultipart()) {
    try {
      file = await request.file()
    } catch (error) {
      console.error('Error processing file upload:', error)
    }
  }

  return {
    body: request.body ?? {},
    query: request.query as Record<string, unknown>,
    params: request.params as Record<string, unknown>,
    headers: request.headers,
    accessToken: request.headers.authorization ? (request.headers.authorization.split(' ')[1] ?? '') : '',
    file
  }
}

async function adaptResponse(reply: FastifyReply, result: HttpResponse): Promise<void> {
  const { statusCode, data, headers } = result

  // Set any custom headers if provided
  if (headers) {
    for (const [key, value] of Object.entries(headers)) {
      if (value) {
        reply.header(key, value)
      }
    }
  }

  if (statusCode >= HttpStatusCode.BAD_REQUEST) {
    const isError = isErrorResponse(data)
    return isError
      ? reply.status(statusCode).send({
          status: data.status,
          error: { message: data.errorMessage }
        })
      : reply.status(statusCode).send({
          error: { message: 'Unknown error' }
        })
  }

  // Success response
  return await reply.status(statusCode).send(data)
}

function isErrorResponse(data: unknown): data is HttpResponseError {
  return typeof data === 'object' && data !== null && 'status' in data && 'errorMessage' in data
}

async function handleError(reply: FastifyReply, error: unknown): Promise<void> {
  console.error('Unhandled error in FastifyAdapter:', error)

  await reply.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send({
    status: 'INTERNAL_SERVER_ERROR',
    error: {
      message: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }
  })
}
