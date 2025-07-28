/* eslint-disable eslint-comments/disable-enable-pair -- this is a test file */
/* eslint-disable @typescript-eslint/unbound-method -- this is a test file */
import { DateTime, type ISendLogErrorLoggerProvider, ProviderError } from '@github-search/domain'
import axios from 'axios'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { APIGithubProvider } from '../api.github-provider'

// Mock axios
vi.mock('axios', () => ({
  default: {
    get: vi.fn()
  }
}))

const mockedAxiosGet = vi.mocked(axios.get)

describe('[GITHUB PROVIDER] API GitHub', () => {
  let sut: APIGithubProvider
  let mockLogger: ISendLogErrorLoggerProvider

  const mockGithubApiResponse = {
    total_count: 2,
    incomplete_results: false,
    items: [
      {
        id: 10_270_250,
        name: 'react',
        full_name: 'facebook/react',
        html_url: 'https://github.com/facebook/react',
        description: 'A declarative, efficient, and flexible JavaScript library for building user interfaces.',
        language: 'JavaScript',
        open_issues_count: 1500,
        ssh_url: 'git@github.com:facebook/react.git',
        topics: ['javascript', 'react', 'frontend', 'ui'],
        created_at: '2013-05-24T16:15:54Z',
        stargazers_count: 228_000,
        forks_count: 46_700,
        owner: {
          id: 69_631,
          login: 'facebook',
          type: 'Organization',
          avatar_url: 'https://avatars.githubusercontent.com/u/69631?v=4',
          html_url: 'https://github.com/facebook'
        }
      },
      {
        id: 2_126_244,
        name: 'vue',
        full_name: 'vuejs/vue',
        html_url: 'https://github.com/vuejs/vue',
        description: 'This is the repo for Vue 2. For Vue 3, go to https://github.com/vuejs/core',
        language: 'TypeScript',
        open_issues_count: 355,
        ssh_url: 'git@github.com:vuejs/vue.git',
        topics: ['vue', 'framework', 'frontend'],
        created_at: '2011-07-29T21:40:40Z',
        stargazers_count: 207_000,
        forks_count: 33_700,
        owner: {
          id: 6_128_107,
          login: 'vuejs',
          type: 'Organization',
          avatar_url: 'https://avatars.githubusercontent.com/u/6128107?v=4',
          html_url: 'https://github.com/vuejs'
        }
      }
    ]
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockLogger = {
      sendLogError: vi.fn()
    }
    sut = new APIGithubProvider(mockLogger)
  })

  describe('searchRepositories', () => {
    describe('successful scenarios', () => {
      it('should search repositories successfully with default sorting (best_match)', async () => {
        mockedAxiosGet.mockResolvedValueOnce({ data: mockGithubApiResponse })

        const parameters = {
          searchQuery: 'react',
          selectedPage: 1,
          itemsPerPage: 10,
          sortBy: 'best_match' as const
        }

        const result = await sut.searchRepositories(parameters)

        expect(result.isSuccess()).toBe(true)
        expect(mockedAxiosGet).toHaveBeenCalledWith('https://api.github.com/search/repositories', {
          params: {
            q: 'react',
            page: 1,
            per_page: 10,
            order: 'desc',
            sort: ''
          }
        })

        if (result.isSuccess()) {
          expect(result.value.repositories).toHaveLength(2)
          expect(result.value.totalRepositoriesCount).toBe(2)

          const firstRepo = result.value.repositories[0]
          expect(firstRepo).toEqual({
            externalID: '10270250',
            name: 'react',
            fullName: 'facebook/react',
            externalURL: new URL('https://github.com/facebook/react'),
            createdAt: new DateTime({ date: new Date('2013-05-24T16:15:54Z') }),
            description: 'A declarative, efficient, and flexible JavaScript library for building user interfaces.',
            language: 'JavaScript',
            openIssuesCount: 1500,
            sshURL: 'git@github.com:facebook/react.git',
            topics: ['javascript', 'react', 'frontend', 'ui'],
            starsCount: 228_000,
            forksCount: 46_700,
            owner: {
              externalID: '69631',
              username: 'facebook',
              type: 'Organization',
              externalAvatarURL: new URL('https://avatars.githubusercontent.com/u/69631?v=4'),
              externalProfileURL: new URL('https://github.com/facebook')
            }
          })
        }
      })

      it('should handle repositories with null description and language', async () => {
        const responseWithNulls = {
          ...mockGithubApiResponse,
          items: [
            {
              ...mockGithubApiResponse.items[0],
              description: null,
              language: null
            }
          ]
        }

        mockedAxiosGet.mockResolvedValueOnce({ data: responseWithNulls })

        const parameters = {
          searchQuery: 'test',
          selectedPage: 1,
          itemsPerPage: 10,
          sortBy: 'best_match' as const
        }

        const result = await sut.searchRepositories(parameters)

        expect(result.isSuccess()).toBe(true)
        if (result.isSuccess()) {
          const repo = result.value.repositories[0]
          expect(repo?.description).toBe('')
          expect(repo?.language).toBeNull()
        }
      })

      it('should handle empty results', async () => {
        const emptyResponse = {
          total_count: 0,
          incomplete_results: false,
          items: []
        }

        mockedAxiosGet.mockResolvedValueOnce({ data: emptyResponse })

        const parameters = {
          searchQuery: 'nonexistent',
          selectedPage: 1,
          itemsPerPage: 10,
          sortBy: 'best_match' as const
        }

        const result = await sut.searchRepositories(parameters)

        expect(result.isSuccess()).toBe(true)
        if (result.isSuccess()) {
          expect(result.value.repositories).toHaveLength(0)
          expect(result.value.totalRepositoriesCount).toBe(0)
        }
      })
    })

    describe('sorting options', () => {
      beforeEach(() => {
        mockedAxiosGet.mockResolvedValueOnce({ data: mockGithubApiResponse })
      })

      it('should use "stars" sort for most_stars', async () => {
        const parameters = {
          searchQuery: 'react',
          selectedPage: 1,
          itemsPerPage: 10,
          sortBy: 'most_stars' as const
        }

        await sut.searchRepositories(parameters)

        expect(mockedAxiosGet).toHaveBeenCalledWith('https://api.github.com/search/repositories', {
          params: {
            q: 'react',
            page: 1,
            per_page: 10,
            order: 'desc',
            sort: 'stars'
          }
        })
      })

      it('should use "forks" sort for most_forks', async () => {
        const parameters = {
          searchQuery: 'react',
          selectedPage: 1,
          itemsPerPage: 10,
          sortBy: 'most_forks' as const
        }

        await sut.searchRepositories(parameters)

        expect(mockedAxiosGet).toHaveBeenCalledWith('https://api.github.com/search/repositories', {
          params: {
            q: 'react',
            page: 1,
            per_page: 10,
            order: 'desc',
            sort: 'forks'
          }
        })
      })

      it('should use "updated" sort for recently_updated', async () => {
        const parameters = {
          searchQuery: 'react',
          selectedPage: 1,
          itemsPerPage: 10,
          sortBy: 'recently_updated' as const
        }

        await sut.searchRepositories(parameters)

        expect(mockedAxiosGet).toHaveBeenCalledWith('https://api.github.com/search/repositories', {
          params: {
            q: 'react',
            page: 1,
            per_page: 10,
            order: 'desc',
            sort: 'updated'
          }
        })
      })

      it('should use empty sort for null sortBy', async () => {
        const parameters = {
          searchQuery: 'react',
          selectedPage: 1,
          itemsPerPage: 10,
          sortBy: null
        }

        await sut.searchRepositories(parameters)

        expect(mockedAxiosGet).toHaveBeenCalledWith('https://api.github.com/search/repositories', {
          params: {
            q: 'react',
            page: 1,
            per_page: 10,
            order: 'desc',
            sort: ''
          }
        })
      })
    })

    describe('error scenarios', () => {
      it('should handle network errors', async () => {
        const networkError = new Error('Network Error')
        mockedAxiosGet.mockRejectedValueOnce(networkError)

        const parameters = {
          searchQuery: 'react',
          selectedPage: 1,
          itemsPerPage: 10,
          sortBy: 'best_match' as const
        }

        const result = await sut.searchRepositories(parameters)

        expect(result.isFailure()).toBe(true)
        expect(mockLogger.sendLogError).toHaveBeenCalledWith({
          message: expect.any(String),
          value: expect.any(ProviderError)
        })

        if (result.isFailure()) {
          expect(result.value).toBeInstanceOf(ProviderError)
          expect(result.value.name).toBe('ProviderError')
        }
      })

      it('should handle HTTP errors (e.g., 403 rate limit)', async () => {
        const httpError = {
          response: {
            status: 403,
            data: {
              message: 'API rate limit exceeded',
              documentation_url: 'https://docs.github.com/rest/overview/resources-in-the-rest-api#rate-limiting'
            }
          }
        }
        mockedAxiosGet.mockRejectedValueOnce(httpError)

        const parameters = {
          searchQuery: 'react',
          selectedPage: 1,
          itemsPerPage: 10,
          sortBy: 'best_match' as const
        }

        const result = await sut.searchRepositories(parameters)

        expect(result.isFailure()).toBe(true)
        expect(mockLogger.sendLogError).toHaveBeenCalled()

        if (result.isFailure()) {
          expect(result.value).toBeInstanceOf(ProviderError)
        }
      })

      it('should handle invalid response schema', async () => {
        const invalidResponse = {
          total_count: 'invalid', // should be number
          items: [
            {
              id: 'invalid', // should be number
              name: 123 // should be string
            }
          ]
        }
        mockedAxiosGet.mockResolvedValueOnce({ data: invalidResponse })

        const parameters = {
          searchQuery: 'react',
          selectedPage: 1,
          itemsPerPage: 10,
          sortBy: 'best_match' as const
        }

        const result = await sut.searchRepositories(parameters)

        expect(result.isFailure()).toBe(true)
        expect(mockLogger.sendLogError).toHaveBeenCalled()

        if (result.isFailure()) {
          expect(result.value).toBeInstanceOf(ProviderError)
        }
      })

      it('should handle missing required fields in response', async () => {
        const incompleteResponse = {
          total_count: 1,
          incomplete_results: false,
          items: [
            {
              id: 123,
              name: 'test'
              // missing required fields like full_name, html_url, etc.
            }
          ]
        }
        mockedAxiosGet.mockResolvedValueOnce({ data: incompleteResponse })

        const parameters = {
          searchQuery: 'react',
          selectedPage: 1,
          itemsPerPage: 10,
          sortBy: 'best_match' as const
        }

        const result = await sut.searchRepositories(parameters)

        expect(result.isFailure()).toBe(true)
        expect(mockLogger.sendLogError).toHaveBeenCalled()
      })
    })

    describe('pagination and parameters', () => {
      beforeEach(() => {
        mockedAxiosGet.mockResolvedValueOnce({ data: mockGithubApiResponse })
      })

      it('should pass correct pagination parameters', async () => {
        const parameters = {
          searchQuery: 'typescript',
          selectedPage: 3,
          itemsPerPage: 25,
          sortBy: 'most_stars' as const
        }

        await sut.searchRepositories(parameters)

        expect(mockedAxiosGet).toHaveBeenCalledWith('https://api.github.com/search/repositories', {
          params: {
            q: 'typescript',
            page: 3,
            per_page: 25,
            order: 'desc',
            sort: 'stars'
          }
        })
      })

      it('should handle special characters in search query', async () => {
        const parameters = {
          searchQuery: 'react+hooks language:typescript',
          selectedPage: 1,
          itemsPerPage: 10,
          sortBy: 'best_match' as const
        }

        await sut.searchRepositories(parameters)

        expect(mockedAxiosGet).toHaveBeenCalledWith('https://api.github.com/search/repositories', {
          params: {
            q: 'react+hooks language:typescript',
            page: 1,
            per_page: 10,
            order: 'desc',
            sort: ''
          }
        })
      })
    })
  })
})
