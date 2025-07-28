import {
  GithubAuthenticationError,
  GithubInvalidRequestError,
  GithubProviderMethods,
  GithubRateLimitError,
  type GithubRepository,
  type GithubRepositoryOwner,
  InvalidItemsPerPageError,
  InvalidQueryError,
  InvalidSelectedPageError,
  InvalidTotalItemsError,
  type ISearchRepositoriesGithubProvider,
  type ISendLogErrorLoggerProvider,
  type ISendLogTimeUseCaseLoggerProvider,
  Pagination,
  ProviderError,
  ProvidersNames
} from '@github-search/domain'
import { DateTime } from '@github-search/domain'
import { failure, success } from '@github-search/utils'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { mock, type MockProxy } from 'vitest-mock-extended'

import { SearchGithubRepositoriesUseCase } from '../search-github-repositories.use-case'

describe('[USE-CASE] Search Github Repositories', () => {
  let sut: SearchGithubRepositoriesUseCase
  let logger: MockProxy<ISendLogTimeUseCaseLoggerProvider & ISendLogErrorLoggerProvider>
  let githubProvider: MockProxy<ISearchRepositoriesGithubProvider>

  const validParameters = {
    query: 'react',
    selectedPage: 1,
    repositoriesPerPage: 10,
    sortBy: 'best_match' as const
  }

  const mockRepositoryOwner: GithubRepositoryOwner = {
    externalID: '123',
    username: 'facebook',
    type: 'Organization',
    externalAvatarURL: new URL('https://github.com/facebook.png'),
    externalProfileURL: new URL('https://github.com/facebook')
  }

  const mockRepository: GithubRepository = {
    createdAt: (DateTime.validate({ date: '2022-01-01T00:00:00Z' }).value as { dateValidated: DateTime }).dateValidated,
    description: 'A declarative, efficient, and flexible JavaScript library for building user interfaces.',
    externalID: '10270250',
    externalURL: new URL('https://github.com/facebook/react'),
    forksCount: 42_000,
    fullName: 'facebook/react',
    language: 'JavaScript',
    name: 'react',
    openIssuesCount: 1500,
    owner: mockRepositoryOwner,
    sshURL: 'git@github.com:facebook/react.git',
    starsCount: 220_000,
    topics: ['javascript', 'react', 'frontend', 'ui']
  }

  const mockProviderResponse = {
    repositories: [mockRepository],
    totalRepositoriesCount: 1000
  }

  beforeAll(() => {
    logger = mock()
    logger.sendLogTimeUseCase.mockReturnValue(null)
    logger.sendLogError.mockReturnValue(null)
    githubProvider = mock()
  })

  beforeEach(() => {
    vi.clearAllMocks()
    githubProvider.searchRepositories.mockResolvedValue(success(mockProviderResponse))
    sut = new SearchGithubRepositoriesUseCase(logger, githubProvider)
  })

  describe('successful scenarios', () => {
    it('should return repositories and pagination when search is successful', async () => {
      const result = await sut.execute(validParameters)

      expect(result.isSuccess()).toBe(true)
      if (result.isSuccess()) {
        expect(result.value.repositories).toEqual([mockRepository])
        expect(result.value.pagination).toBeInstanceOf(Pagination)
        expect(result.value.pagination.totalItems).toBe(1000)
        expect(result.value.pagination.currentPage).toBe(1)
        expect(result.value.pagination.itemsPerPage).toBe(10)
        expect(result.value.pagination.totalPages).toBe(100)
        expect(result.value.pagination.hasNextPage).toBe(true)
        expect(result.value.pagination.hasPreviousPage).toBe(false)
      }

      expect(githubProvider.searchRepositories).toHaveBeenCalledWith({
        searchQuery: 'react',
        selectedPage: 1,
        itemsPerPage: 10,
        sortBy: 'best_match'
      })
    })

    it('should handle null sortBy parameter', async () => {
      const parameters = { ...validParameters, sortBy: null }
      const result = await sut.execute(parameters)

      expect(result.isSuccess()).toBe(true)
      expect(githubProvider.searchRepositories).toHaveBeenCalledWith({
        searchQuery: 'react',
        selectedPage: 1,
        itemsPerPage: 10,
        sortBy: null
      })
    })

    it('should trim query whitespace', async () => {
      const parameters = { ...validParameters, query: '  react  ' }
      const result = await sut.execute(parameters)

      expect(result.isSuccess()).toBe(true)
      expect(githubProvider.searchRepositories).toHaveBeenCalledWith({
        searchQuery: 'react',
        selectedPage: 1,
        itemsPerPage: 10,
        sortBy: 'best_match'
      })
    })

    it('should handle empty repositories result', async () => {
      githubProvider.searchRepositories.mockResolvedValue(
        success({
          repositories: [],
          totalRepositoriesCount: 0
        })
      )

      const result = await sut.execute(validParameters)

      expect(result.isSuccess()).toBe(true)
      if (result.isSuccess()) {
        expect(result.value.repositories).toEqual([])
        expect(result.value.pagination.totalItems).toBe(0)
        expect(result.value.pagination.totalPages).toBe(0)
      }
    })
  })

  describe('query validation', () => {
    it('should fail when query is empty', async () => {
      const parameters = { ...validParameters, query: '' }
      const result = await sut.execute(parameters)

      expect(result.isFailure()).toBe(true)
      expect(result.value).toEqual(new InvalidQueryError({ query: '' }))
      expect(githubProvider.searchRepositories).not.toHaveBeenCalled()
    })

    it('should fail when query is only whitespace', async () => {
      const parameters = { ...validParameters, query: '   ' }
      const result = await sut.execute(parameters)

      expect(result.isFailure()).toBe(true)
      expect(result.value).toEqual(new InvalidQueryError({ query: '   ' }))
      expect(githubProvider.searchRepositories).not.toHaveBeenCalled()
    })

    it('should fail when query exceeds 100 characters', async () => {
      const longQuery = 'a'.repeat(101)
      const parameters = { ...validParameters, query: longQuery }
      const result = await sut.execute(parameters)

      expect(result.isFailure()).toBe(true)
      expect(result.value).toEqual(new InvalidQueryError({ query: longQuery }))
      expect(githubProvider.searchRepositories).not.toHaveBeenCalled()
    })

    it('should succeed when query is exactly 100 characters', async () => {
      const maxQuery = 'a'.repeat(100)
      const parameters = { ...validParameters, query: maxQuery }
      const result = await sut.execute(parameters)

      expect(result.isSuccess()).toBe(true)
      expect(githubProvider.searchRepositories).toHaveBeenCalledWith({
        searchQuery: maxQuery,
        selectedPage: 1,
        itemsPerPage: 10,
        sortBy: 'best_match'
      })
    })
  })

  describe('pagination validation', () => {
    it('should fail when selectedPage is less than 1', async () => {
      const parameters = { ...validParameters, selectedPage: 0 }
      const result = await sut.execute(parameters)

      expect(result.isFailure()).toBe(true)
      expect(result.value).toEqual(new InvalidSelectedPageError({ selectedPage: 0 }))
      expect(githubProvider.searchRepositories).not.toHaveBeenCalled()
    })

    it('should fail when selectedPage is not an integer', async () => {
      const parameters = { ...validParameters, selectedPage: 1.5 }
      const result = await sut.execute(parameters)

      expect(result.isFailure()).toBe(true)
      expect(result.value).toEqual(new InvalidSelectedPageError({ selectedPage: 1.5 }))
      expect(githubProvider.searchRepositories).not.toHaveBeenCalled()
    })

    it('should fail when repositoriesPerPage is less than 1', async () => {
      const parameters = { ...validParameters, repositoriesPerPage: 0 }
      const result = await sut.execute(parameters)

      expect(result.isFailure()).toBe(true)
      expect(result.value).toEqual(new InvalidItemsPerPageError({ itemsPerPage: 0 }))
      expect(githubProvider.searchRepositories).not.toHaveBeenCalled()
    })

    it('should fail when repositoriesPerPage exceeds 100', async () => {
      const parameters = { ...validParameters, repositoriesPerPage: 101 }
      const result = await sut.execute(parameters)

      expect(result.isFailure()).toBe(true)
      expect(result.value).toEqual(new InvalidItemsPerPageError({ itemsPerPage: 101 }))
      expect(githubProvider.searchRepositories).not.toHaveBeenCalled()
    })

    it('should fail when repositoriesPerPage is not an integer', async () => {
      const parameters = { ...validParameters, repositoriesPerPage: 10.5 }
      const result = await sut.execute(parameters)

      expect(result.isFailure()).toBe(true)
      expect(result.value).toEqual(new InvalidItemsPerPageError({ itemsPerPage: 10.5 }))
      expect(githubProvider.searchRepositories).not.toHaveBeenCalled()
    })

    it('should succeed at pagination boundaries', async () => {
      const parameters = { ...validParameters, selectedPage: 1, repositoriesPerPage: 100 }
      const result = await sut.execute(parameters)

      expect(result.isSuccess()).toBe(true)
      expect(githubProvider.searchRepositories).toHaveBeenCalledWith({
        searchQuery: 'react',
        selectedPage: 1,
        itemsPerPage: 100,
        sortBy: 'best_match'
      })
    })
  })

  describe('provider error scenarios', () => {
    it('should propagate ProviderError from github provider', async () => {
      const providerError = new ProviderError({
        error: new Error('Network error'),
        provider: {
          name: ProvidersNames.GITHUB,
          method: GithubProviderMethods.SEARCH_REPOSITORIES
        }
      })
      githubProvider.searchRepositories.mockResolvedValue(failure(providerError))

      const result = await sut.execute(validParameters)

      expect(result.isFailure()).toBe(true)
      expect(result.value).toEqual(providerError)
    })

    it('should propagate GithubRateLimitError from github provider', async () => {
      const rateLimitError = new GithubRateLimitError({
        error: new Error('Rate limit exceeded'),
        resetTime: new Date('2024-01-01T12:00:00Z'),
        remainingRequests: 0
      })
      githubProvider.searchRepositories.mockResolvedValue(failure(rateLimitError))

      const result = await sut.execute(validParameters)

      expect(result.isFailure()).toBe(true)
      expect(result.value).toEqual(rateLimitError)
    })

    it('should propagate GithubAuthenticationError from github provider', async () => {
      const authError = new GithubAuthenticationError({
        error: new Error('Invalid token')
      })
      githubProvider.searchRepositories.mockResolvedValue(failure(authError))

      const result = await sut.execute(validParameters)

      expect(result.isFailure()).toBe(true)
      expect(result.value).toEqual(authError)
    })

    it('should propagate GithubInvalidRequestError from github provider', async () => {
      const invalidRequestError = new GithubInvalidRequestError({
        error: new Error('Invalid request format'),
        message: 'Malformed query'
      })
      githubProvider.searchRepositories.mockResolvedValue(failure(invalidRequestError))

      const result = await sut.execute(validParameters)

      expect(result.isFailure()).toBe(true)
      expect(result.value).toEqual(invalidRequestError)
    })
  })

  describe('pagination creation errors', () => {
    it('should fail when pagination creation fails due to invalid total items', async () => {
      githubProvider.searchRepositories.mockResolvedValue(
        success({
          repositories: [],
          totalRepositoriesCount: -1 // Invalid total count
        })
      )

      const result = await sut.execute(validParameters)

      expect(result.isFailure()).toBe(true)
      expect(result.value).toEqual(new InvalidTotalItemsError({ totalItems: -1 }))
    })
  })

  describe('max items available constraint', () => {
    it('should apply maxItemsAvailable constraint when total exceeds 1000', async () => {
      githubProvider.searchRepositories.mockResolvedValue(
        success({
          repositories: [mockRepository],
          totalRepositoriesCount: 5000 // Exceeds maxItemsAvailable of 1000
        })
      )

      const result = await sut.execute(validParameters)

      expect(result.isSuccess()).toBe(true)
      if (result.isSuccess()) {
        expect(result.value.pagination.totalItems).toBe(5000) // Original total preserved
        expect(result.value.pagination.totalPages).toBe(100) // But totalPages calculated with max 1000 items (1000/10)
      }
    })

    it('should not apply constraint when total is within 1000 limit', async () => {
      githubProvider.searchRepositories.mockResolvedValue(
        success({
          repositories: [mockRepository],
          totalRepositoriesCount: 500
        })
      )

      const result = await sut.execute(validParameters)

      expect(result.isSuccess()).toBe(true)
      if (result.isSuccess()) {
        expect(result.value.pagination.totalItems).toBe(500)
        expect(result.value.pagination.totalPages).toBe(50) // 500/10
      }
    })
  })

  describe('different sort options', () => {
    const sortOptions = ['best_match', 'most_stars', 'most_forks', 'recently_updated'] as const

    for (const sortBy of sortOptions) {
      it(`should handle ${sortBy} sorting`, async () => {
        const parameters = { ...validParameters, sortBy }
        const result = await sut.execute(parameters)

        expect(result.isSuccess()).toBe(true)
        expect(githubProvider.searchRepositories).toHaveBeenCalledWith({
          searchQuery: 'react',
          selectedPage: 1,
          itemsPerPage: 10,
          sortBy
        })
      })
    }
  })
})
