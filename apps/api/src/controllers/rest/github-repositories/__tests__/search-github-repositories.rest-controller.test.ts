/* eslint-disable eslint-comments/disable-enable-pair -- this is a test file */
/* eslint-disable @typescript-eslint/unbound-method -- this is a test file */
import {
  DateTime,
  type GithubRepository,
  type GithubRepositoryOwner,
  InvalidGithubRepositorySortByError,
  type ISendLogErrorLoggerProvider,
  type ISendLogTimeControllerLoggerProvider,
  Pagination,
  StatusSuccess,
  type UseCase
} from '@github-search/domain'
import { failure, success } from '@github-search/utils'
import { type SearchGithubRepositoriesUseCaseDTO } from '@use-cases/github-repositories/search-github-repositories.use-case'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { mock, type MockProxy } from 'vitest-mock-extended'

import { SearchGithubRepositoriesRestController, type SearchGithubRepositoriesRestControllerDTO } from '../search-github-repositories.rest-controller'

// Test class to access protected method
class TestableSearchGithubRepositoriesRestController extends SearchGithubRepositoriesRestController {
  public async performOperationPublic(
    request: SearchGithubRepositoriesRestControllerDTO.Parameters
  ): SearchGithubRepositoriesRestControllerDTO.Result {
    return this.performOperation(request)
  }
}

describe('[REST-CONTROLLER] Search Github Repositories', () => {
  let sut: TestableSearchGithubRepositoriesRestController
  let logger: MockProxy<ISendLogTimeControllerLoggerProvider & ISendLogErrorLoggerProvider>
  let mockUseCase: MockProxy<
    UseCase<
      SearchGithubRepositoriesUseCaseDTO.Parameters,
      SearchGithubRepositoriesUseCaseDTO.ResultFailure,
      SearchGithubRepositoriesUseCaseDTO.ResultSuccess
    >
  >

  const validRequest: SearchGithubRepositoriesRestControllerDTO.Parameters = {
    body: undefined,
    query: {
      query: 'react',
      selected_page: 1,
      repositories_per_page: 10,
      sort_by: 'best_match'
    },
    params: undefined,
    headers: {},
    accessToken: 'test-token'
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

  // eslint-disable-next-line unicorn/consistent-function-scoping -- this is a test function
  const createMockPagination = (totalItems: number, selectedPage: number, itemsPerPage: number) => {
    const paginationResult = Pagination.create({
      totalItems,
      selectedPage,
      itemsPerPage,
      maxItemsAvailable: 1000
    })
    if (paginationResult.isFailure()) {
      throw new Error(`Failed to create pagination: ${paginationResult.value.errorMessage}`)
    }
    return paginationResult.value.paginationCreated
  }

  const mockPagination = createMockPagination(1000, 1, 10)

  const mockUseCaseSuccess: SearchGithubRepositoriesUseCaseDTO.ResultSuccess = {
    repositories: [mockRepository],
    pagination: mockPagination
  }

  beforeAll(() => {
    logger = mock()
    logger.sendLogTimeController.mockReturnValue(null)
    logger.sendLogError.mockReturnValue(null)
    mockUseCase = mock()
  })

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseCase.execute.mockResolvedValue(success(mockUseCaseSuccess))
    sut = new TestableSearchGithubRepositoriesRestController(logger, mockUseCase)
  })

  describe('successful scenarios', () => {
    it('should return formatted repositories and pagination when request is successful', async () => {
      const result = await sut.performOperationPublic(validRequest)

      expect(result.isSuccess()).toBe(true)
      if (result.isSuccess()) {
        expect(result.value.status).toBe(StatusSuccess.DONE)
        expect(result.value.success.repositories).toHaveLength(1)
        expect(result.value.success.repositories[0]).toEqual({
          external_id: '10270250',
          name: 'react',
          full_name: 'facebook/react',
          external_url: 'https://github.com/facebook/react',
          created_at: '2022-01-01T00:00:00.000Z',
          stars_count: 220_000,
          forks_count: 42_000,
          description: 'A declarative, efficient, and flexible JavaScript library for building user interfaces.',
          language: 'JavaScript',
          ssh_url: 'git@github.com:facebook/react.git',
          open_issues_count: 1500,
          topics: ['javascript', 'react', 'frontend', 'ui'],
          owner: {
            external_id: '123',
            username: 'facebook',
            type: 'Organization',
            external_avatar_url: 'https://github.com/facebook.png',
            external_profile_url: 'https://github.com/facebook'
          }
        })
        expect(result.value.success.pagination).toEqual({
          total_items: 1000,
          total_pages: 100,
          current_page: 1,
          items_per_page: 10,
          has_next_page: true,
          has_previous_page: false
        })
      }

      expect(mockUseCase.execute).toHaveBeenCalledWith({
        query: 'react',
        selectedPage: 1,
        repositoriesPerPage: 10,
        sortBy: 'best_match'
      })
    })

    it('should handle null sort_by parameter', async () => {
      const request = { ...validRequest, query: { ...validRequest.query, sort_by: null } }
      const result = await sut.performOperationPublic(request)

      expect(result.isSuccess()).toBe(true)
      expect(mockUseCase.execute).toHaveBeenCalledWith({
        query: 'react',
        selectedPage: 1,
        repositoriesPerPage: 10,
        sortBy: null
      })
    })

    it('should handle empty repositories result', async () => {
      const emptyPagination = createMockPagination(0, 1, 10)

      mockUseCase.execute.mockResolvedValue(
        success({
          repositories: [],
          pagination: emptyPagination
        })
      )

      const result = await sut.performOperationPublic(validRequest)

      expect(result.isSuccess()).toBe(true)
      if (result.isSuccess()) {
        expect(result.value.success.repositories).toEqual([])
        expect(result.value.success.pagination.total_items).toBe(0)
        expect(result.value.success.pagination.total_pages).toBe(0)
      }
    })
  })

  describe('sort_by validation', () => {
    it('should fail when sort_by is invalid', async () => {
      const request = { ...validRequest, query: { ...validRequest.query, sort_by: 'invalid_sort' } }
      const result = await sut.performOperationPublic(request)

      expect(result.isFailure()).toBe(true)
      expect(result.value).toEqual(new InvalidGithubRepositorySortByError({ sortBy: 'invalid_sort' }))
      expect(mockUseCase.execute).not.toHaveBeenCalled()
    })

    it('should allow best_match sort_by', async () => {
      const request = { ...validRequest, query: { ...validRequest.query, sort_by: 'best_match' } }
      const result = await sut.performOperationPublic(request)

      expect(result.isSuccess()).toBe(true)
      expect(mockUseCase.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          sortBy: 'best_match'
        })
      )
    })

    it('should allow most_stars sort_by', async () => {
      const request = { ...validRequest, query: { ...validRequest.query, sort_by: 'most_stars' } }
      const result = await sut.performOperationPublic(request)

      expect(result.isSuccess()).toBe(true)
      expect(mockUseCase.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          sortBy: 'most_stars'
        })
      )
    })

    it('should allow most_forks sort_by', async () => {
      const request = { ...validRequest, query: { ...validRequest.query, sort_by: 'most_forks' } }
      const result = await sut.performOperationPublic(request)

      expect(result.isSuccess()).toBe(true)
      expect(mockUseCase.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          sortBy: 'most_forks'
        })
      )
    })

    it('should allow recently_updated sort_by', async () => {
      const request = { ...validRequest, query: { ...validRequest.query, sort_by: 'recently_updated' } }
      const result = await sut.performOperationPublic(request)

      expect(result.isSuccess()).toBe(true)
      expect(mockUseCase.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          sortBy: 'recently_updated'
        })
      )
    })

    it('should allow null sort_by', async () => {
      const request = { ...validRequest, query: { ...validRequest.query, sort_by: null } }
      const result = await sut.performOperationPublic(request)

      expect(result.isSuccess()).toBe(true)
      expect(mockUseCase.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          sortBy: null
        })
      )
    })
  })

  describe('use case error propagation', () => {
    it('should propagate use case failures', async () => {
      const useCaseError = new Error('Use case error')
      mockUseCase.execute.mockResolvedValue(failure(useCaseError as unknown as SearchGithubRepositoriesUseCaseDTO.ResultFailure))

      const result = await sut.performOperationPublic(validRequest)

      expect(result.isFailure()).toBe(true)
      expect(result.value).toBe(useCaseError)
    })
  })

  describe('parameter mapping', () => {
    it('should correctly map REST parameters to use case parameters', async () => {
      const request: SearchGithubRepositoriesRestControllerDTO.Parameters = {
        body: undefined,
        query: {
          query: 'typescript',
          selected_page: 5,
          repositories_per_page: 25,
          sort_by: 'most_stars'
        },
        params: undefined,
        headers: {},
        accessToken: 'test-token'
      }

      await sut.performOperationPublic(request)

      expect(mockUseCase.execute).toHaveBeenCalledWith({
        query: 'typescript',
        selectedPage: 5,
        repositoriesPerPage: 25,
        sortBy: 'most_stars'
      })
    })
  })

  describe('response transformation', () => {
    it('should correctly transform domain objects to REST response format', async () => {
      const mockRepoWithNullLanguage: GithubRepository = {
        ...mockRepository,
        language: null
      }

      mockUseCase.execute.mockResolvedValue(
        success({
          repositories: [mockRepoWithNullLanguage],
          pagination: mockPagination
        })
      )

      const result = await sut.performOperationPublic(validRequest)

      expect(result.isSuccess()).toBe(true)
      if (result.isSuccess()) {
        const repository = result.value.success.repositories[0]
        expect(repository?.language).toBeNull()
        expect(repository?.external_url).toBe('https://github.com/facebook/react')
        expect(repository?.created_at).toBe('2022-01-01T00:00:00.000Z')
      }
    })

    it('should transform pagination correctly', async () => {
      const customPagination = createMockPagination(1500, 3, 20)

      mockUseCase.execute.mockResolvedValue(
        success({
          repositories: [mockRepository],
          pagination: customPagination
        })
      )

      const result = await sut.performOperationPublic(validRequest)

      expect(result.isSuccess()).toBe(true)
      if (result.isSuccess()) {
        expect(result.value.success.pagination).toEqual({
          total_items: 1500,
          total_pages: 50,
          current_page: 3,
          items_per_page: 20,
          has_next_page: true,
          has_previous_page: true
        })
      }
    })
  })
})
