import { wwwENV } from '@github-search/env'
import { useQuery } from '@tanstack/react-query'

export type GithubRepository = {
  createdAt: Date
  externalURL: string
  description: string
  fullName: string
  forksCount: number
  openIssuesCount: number
  starsCount: number
  topics: string[]

  externalID: string
  language: string | null
  name: string
  owner: {
    externalID: string
    username: string
    type: string
    externalAvatarURL: string
    externalProfileURL: string
  }
  sshURL: string
}

export type GitHubRepositoriesAPIResponse = {
  status: string
  error?: {
    message: string
  }
  success?: {
    repositories: Array<{
      external_id: string
      name: string
      full_name: string
      external_url: string
      created_at: string
      stars_count: number
      forks_count: number
      description: string
      language: string | null
      open_issues_count: number
      ssh_url: string
      topics: string[]
      owner: {
        external_id: string
        username: string
        type: string
        external_avatar_url: string
        external_profile_url: string
      }
    }>
    pagination: {
      total_items: number
      total_pages: number
      current_page: number
      items_per_page: number
      has_next_page: boolean
      has_previous_page: boolean
    }
  }
}

export type GitHubRepositoriesPagination = {
  totalItems: number
  totalPages: number
  currentPage: number
  itemsPerPage: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export type SearchGitHubRepositoriesParams = {
  query: string
  selectedPage?: number
  repositoriesPerPage?: number
  sortBy?: string
}

class GitHubRepositoriesApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public statusText: string
  ) {
    super(message)
    this.name = 'GitHubRepositoriesApiError'
  }
}

function buildSearchUrl(params: SearchGitHubRepositoriesParams): string {
  const searchParams = new URLSearchParams()
  searchParams.append('query', params.query)
  if (params.selectedPage !== undefined) {
    searchParams.append('selected_page', params.selectedPage.toString())
  }
  if (params.repositoriesPerPage !== undefined) {
    searchParams.append('repositories_per_page', params.repositoriesPerPage.toString())
  }
  if (params.sortBy !== undefined && params.sortBy !== '') {
    searchParams.append('sort_by', params.sortBy)
  }
  return `${wwwENV.NEXT_PUBLIC_API_URL}/github-repositories/search?${searchParams.toString()}`
}

async function fetchGitHubRepositories(params: SearchGitHubRepositoriesParams): Promise<{
  repositories: GithubRepository[]
  pagination: GitHubRepositoriesPagination
}> {
  try {
    const response = await fetch(buildSearchUrl(params), {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    })
    const data: GitHubRepositoriesAPIResponse = await response.json()
    if (response.ok && data.success) {
      return {
        repositories: data.success.repositories.map((repository) => ({
          externalID: repository.external_id,
          name: repository.name,
          fullName: repository.full_name,
          externalURL: repository.external_url,
          createdAt: new Date(repository.created_at),
          starsCount: repository.stars_count,
          forksCount: repository.forks_count,
          description: repository.description,
          language: repository.language,
          openIssuesCount: repository.open_issues_count,
          sshURL: repository.ssh_url,
          topics: repository.topics,
          owner: {
            externalID: repository.owner.external_id,
            username: repository.owner.username,
            type: repository.owner.type as 'user' | 'organization',
            externalAvatarURL: repository.owner.external_avatar_url,
            externalProfileURL: repository.owner.external_profile_url
          }
        })),
        pagination: {
          totalItems: data.success.pagination.total_items,
          totalPages: data.success.pagination.total_pages,
          currentPage: data.success.pagination.current_page,
          itemsPerPage: data.success.pagination.items_per_page,
          hasNextPage: data.success.pagination.has_next_page,
          hasPreviousPage: data.success.pagination.has_previous_page
        }
      }
    }

    if (data.error) {
      throw new GitHubRepositoriesApiError(data.error.message, response.status, response.statusText)
    }

    throw new GitHubRepositoriesApiError(`Unexpected response format from server`, response.status, response.statusText)
  } catch (error) {
    if (error instanceof GitHubRepositoriesApiError) throw error
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new GitHubRepositoriesApiError('Failed to connect to the server. Please check your internet connection.', 0, 'Network Error')
    }
    throw new GitHubRepositoriesApiError('An unexpected error occurred while fetching repositories.', 0, 'Unknown Error')
  }
}

export function useSearchGithubRepositories(params: SearchGitHubRepositoriesParams) {
  return useQuery({
    queryKey: ['searchGithubRepositories', params],
    queryFn: () => fetchGitHubRepositories(params),
    enabled: Boolean(params.query.trim()),
    staleTime: 3 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: (failureCount, error) => {
      if (error instanceof GitHubRepositoriesApiError) {
        const status = error.status
        if (status >= 400 && status < 500 && status !== 408) {
          return false
        }
      }
      return failureCount < 3
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30_000)
  })
}
