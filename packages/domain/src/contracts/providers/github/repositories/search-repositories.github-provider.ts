import { type ProviderError } from '@errors/_shared/provider.error'
import { type GithubAuthenticationError } from '@errors/providers/github/github-authentication.error'
import { type GithubInvalidRequestError } from '@errors/providers/github/github-invalid-request.error'
import { type GithubRateLimitError } from '@errors/providers/github/github-rate-limit.error'
import { type Either } from '@github-search/utils'
import { type GithubRepository } from '@models/github/repository.model'

export namespace SearchRepositoriesGithubProviderDTO {
  export type Parameters = Readonly<{
    searchQuery: string
    selectedPage: number
    itemsPerPage: number
  }>

  export type ResultFailure = Readonly<ProviderError | GithubRateLimitError | GithubAuthenticationError | GithubInvalidRequestError>

  export type ResultSuccess = Readonly<{
    repositories: GithubRepository[]
    totalRepositoriesCount: number
  }>

  export type Result = Promise<Either<ResultFailure, ResultSuccess>>
}

export interface ISearchRepositoriesGithubProvider {
  searchRepositories(parameters: SearchRepositoriesGithubProviderDTO.Parameters): SearchRepositoriesGithubProviderDTO.Result
}
