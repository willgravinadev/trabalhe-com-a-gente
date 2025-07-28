import { HttpStatusCode } from '@github-search/utils'
import { FastifyFramework } from '@server/fastify-app'
import { type FastifyInstance } from 'fastify'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

describe('[INTEGRATION] Health Check Route', () => {
  let app: FastifyInstance

  beforeAll(async () => {
    const fastifyFramework = new FastifyFramework()
    app = fastifyFramework.app
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  describe('GET /health-check', () => {
    it('should return success response when health check is called', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/health-check'
      })

      expect(response.statusCode).toBe(HttpStatusCode.OK)

      const body = JSON.parse(response.body)
      expect(body).toEqual({
        status: 'DONE',
        message: 'OK'
      })
    })

    it('should have correct content-type header', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/health-check'
      })

      expect(response.headers['content-type']).toBe('application/json; charset=utf-8')
    })

    it('should respond quickly', async () => {
      const startTime = Date.now()

      await app.inject({
        method: 'GET',
        url: '/health-check'
      })

      const endTime = Date.now()
      const responseTime = endTime - startTime

      expect(responseTime).toBeLessThan(100)
    })
  })
})
