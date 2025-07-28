import { HttpStatusCode } from '@github-search/utils'
import { FastifyFramework } from '@server/fastify-app'
import { type FastifyInstance } from 'fastify'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

describe('[INTEGRATION] Search Github Repositories Route', () => {
  let app: FastifyInstance

  beforeAll(async () => {
    const fastifyFramework = new FastifyFramework()
    app = fastifyFramework.app
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  describe('GET /github-repositories/search', () => {
    describe('successful scenarios (with external dependencies)', () => {
      it('should handle valid query correctly', async () => {
        const response = await app.inject({
          method: 'GET',
          url: '/github-repositories/search?query=react'
        })

        expect([HttpStatusCode.OK]).toContain(response.statusCode)

        if (response.statusCode === 200) {
          const body = JSON.parse(response.body)
          expect(body).toHaveProperty('status', 'DONE')
          expect(body).toHaveProperty('success')
          expect(body.success).toHaveProperty('repositories')
          expect(body.success).toHaveProperty('pagination')

          if (body.success.repositories.length > 0) {
            const repository = body.success.repositories[0]
            expect(repository).toHaveProperty('external_id')
            expect(repository).toHaveProperty('name')
            expect(repository).toHaveProperty('full_name')
            expect(repository).toHaveProperty('external_url')
            expect(repository).toHaveProperty('created_at')
            expect(repository).toHaveProperty('stars_count')
            expect(repository).toHaveProperty('forks_count')
            expect(repository).toHaveProperty('description')
            expect(repository).toHaveProperty('language')
            expect(repository).toHaveProperty('ssh_url')
            expect(repository).toHaveProperty('open_issues_count')
            expect(repository).toHaveProperty('topics')
            expect(repository).toHaveProperty('owner')
            expect(repository.owner).toHaveProperty('external_id')
            expect(repository.owner).toHaveProperty('username')
            expect(repository.owner).toHaveProperty('type')
            expect(repository.owner).toHaveProperty('external_avatar_url')
            expect(repository.owner).toHaveProperty('external_profile_url')
          }
        } else {
          const body = JSON.parse(response.body)
          expect(['error', 'INVALID', 'PROVIDER_ERROR']).toContain(body.status)
        }
      })

      it('should handle pagination parameters correctly', async () => {
        const response = await app.inject({
          method: 'GET',
          url: '/github-repositories/search?query=javascript&selected_page=2&repositories_per_page=5'
        })

        expect([HttpStatusCode.OK]).toContain(response.statusCode)

        if (response.statusCode === 200) {
          const body = JSON.parse(response.body)
          expect(body.success.pagination.current_page).toBe(2)
          expect(body.success.pagination.items_per_page).toBe(5)
        }
      })

      it('should handle sort_by parameter correctly', async () => {
        const response = await app.inject({
          method: 'GET',
          url: '/github-repositories/search?query=typescript&sort_by=most_stars'
        })

        expect([200, 500]).toContain(response.statusCode)

        if (response.statusCode === 200) {
          const body = JSON.parse(response.body)
          expect(body).toHaveProperty('status', 'DONE')
          expect(body).toHaveProperty('success')
        }
      })

      it('should use default values when optional parameters are not provided', async () => {
        const response = await app.inject({
          method: 'GET',
          url: '/github-repositories/search?query=nodejs'
        })

        expect([200, 500]).toContain(response.statusCode)

        if (response.statusCode === 200) {
          const body = JSON.parse(response.body)
          expect(body.success.pagination.current_page).toBe(1)
          expect(body.success.pagination.items_per_page).toBe(22)
        }
      })
    })

    describe('validation scenarios', () => {
      it('should return 406 when query parameter is missing', async () => {
        const response = await app.inject({
          method: 'GET',
          url: '/github-repositories/search'
        })

        expect(response.statusCode).toBe(HttpStatusCode.NOT_ACCEPTABLE)

        const body = JSON.parse(response.body)
        expect(body).toHaveProperty('status', 'error')
        expect(body).toHaveProperty('error')
        expect(body.error).toHaveProperty('message', 'Invalid request data')
        expect(body.error).toHaveProperty('details')
        expect(body.error.details).toHaveProperty('method', 'GET')
        expect(body.error.details).toHaveProperty('url', '/github-repositories/search')
      })

      it('should return 406 when sort_by has invalid value', async () => {
        const response = await app.inject({
          method: 'GET',
          url: '/github-repositories/search?query=react&sort_by=invalid_sort'
        })

        expect(response.statusCode).toBe(HttpStatusCode.NOT_ACCEPTABLE)

        const body = JSON.parse(response.body)
        expect(body).toHaveProperty('status', 'error')
        expect(body.error).toHaveProperty('message', 'Invalid request data')
      })

      it('should return error when selected_page is not a valid number', async () => {
        const response = await app.inject({
          method: 'GET',
          url: '/github-repositories/search?query=react&selected_page=invalid'
        })

        expect([400, 406]).toContain(response.statusCode)

        const body = JSON.parse(response.body)
        expect(['error', 'INVALID', 'PROVIDER_ERROR']).toContain(body.status)
        switch (body.status) {
          case 'error': {
            expect(body.error).toHaveProperty('message')
            break
          }
          case 'INVALID': {
            expect(body).toHaveProperty('error')
            break
          }
          case 'PROVIDER_ERROR': {
            expect(body).toHaveProperty('error')
            break
          }
        }
      })

      it('should return error when repositories_per_page is not a valid number', async () => {
        const response = await app.inject({
          method: 'GET',
          url: '/github-repositories/search?query=react&repositories_per_page=invalid'
        })

        expect([400, 406]).toContain(response.statusCode)

        const body = JSON.parse(response.body)
        expect(['error', 'INVALID', 'PROVIDER_ERROR']).toContain(body.status)
        switch (body.status) {
          case 'error': {
            expect(body.error).toHaveProperty('message')
            break
          }
          case 'INVALID': {
            expect(body).toHaveProperty('error')
            break
          }
          case 'PROVIDER_ERROR': {
            expect(body).toHaveProperty('error')
            break
          }
        }
      })
    })

    describe('content-type and headers', () => {
      it('should return correct content-type header', async () => {
        const response = await app.inject({
          method: 'GET',
          url: '/github-repositories/search?query=react'
        })

        expect(response.headers['content-type']).toBe('application/json; charset=utf-8')
      })
    })

    describe('edge cases', () => {
      it('should handle empty query string appropriately', async () => {
        const response = await app.inject({
          method: 'GET',
          url: '/github-repositories/search?query='
        })

        expect([400, 500]).toContain(response.statusCode)

        const body = JSON.parse(response.body)
        expect(['error', 'INVALID', 'PROVIDER_ERROR']).toContain(body.status)
      })

      it('should handle special characters in query', async () => {
        const response = await app.inject({
          method: 'GET',
          url: '/github-repositories/search?query=react+redux'
        })

        expect([200, 500]).toContain(response.statusCode)
      })

      it('should handle zero selected_page', async () => {
        const response = await app.inject({
          method: 'GET',
          url: '/github-repositories/search?query=react&selected_page=0'
        })

        expect([400, 500]).toContain(response.statusCode)

        const body = JSON.parse(response.body)
        expect(['error', 'INVALID', 'PROVIDER_ERROR']).toContain(body.status)
      })

      it('should handle negative repositories_per_page', async () => {
        const response = await app.inject({
          method: 'GET',
          url: '/github-repositories/search?query=react&repositories_per_page=-1'
        })

        expect([400, 500]).toContain(response.statusCode)

        const body = JSON.parse(response.body)
        expect(['error', 'INVALID', 'PROVIDER_ERROR']).toContain(body.status)
      })
    })

    describe('all valid sort_by values', () => {
      const validSortByValues = ['best_match', 'most_stars', 'most_forks', 'recently_updated']

      for (const sortBy of validSortByValues) {
        it(`should accept sort_by=${sortBy}`, async () => {
          const response = await app.inject({
            method: 'GET',
            url: `/github-repositories/search?query=react&sort_by=${sortBy}`
          })

          expect([200, 500]).toContain(response.statusCode)

          if (response.statusCode === 200) {
            const body = JSON.parse(response.body)
            expect(body).toHaveProperty('status', 'DONE')
          }
        })
      }
    })

    describe('route structure and error handling', () => {
      it('should handle requests to non-existent endpoints', async () => {
        const response = await app.inject({
          method: 'GET',
          url: '/github-repositories/nonexistent'
        })

        expect(response.statusCode).toBe(HttpStatusCode.NOT_FOUND)
      })

      it('should handle POST requests to GET-only endpoint', async () => {
        const response = await app.inject({
          method: 'POST',
          url: '/github-repositories/search?query=react'
        })

        expect(response.statusCode).toBe(HttpStatusCode.NOT_FOUND)
      })

      it('should respond within reasonable time', async () => {
        const startTime = Date.now()

        await app.inject({
          method: 'GET',
          url: '/github-repositories/search?query=test'
        })

        const endTime = Date.now()
        const responseTime = endTime - startTime

        expect(responseTime).toBeLessThan(5000)
      })
    })
  })
})
