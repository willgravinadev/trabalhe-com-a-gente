import {
  type GithubAuthenticationError,
  type GithubInvalidRequestError,
  type GithubRateLimitError,
  type GithubRepository,
  type InvalidItemsPerPageError,
  InvalidQueryError,
  type InvalidSelectedPageError,
  type InvalidTotalItemsError,
  type ISearchRepositoriesGithubProvider,
  type ISendLogErrorLoggerProvider,
  type ISendLogTimeUseCaseLoggerProvider,
  Pagination,
  type ProviderError
} from '@github-search/domain'
import { UseCase } from '@github-search/domain'
import { type Either, failure, success } from '@github-search/utils'

export namespace SearchGithubRepositoriesUseCaseDTO {
  export type Parameters = Readonly<{
    query: string
    selectedPage: number
    repositoriesPerPage: number
  }>

  export type ResultFailure = Readonly<
    | ProviderError
    | InvalidQueryError
    | InvalidTotalItemsError
    | InvalidSelectedPageError
    | InvalidItemsPerPageError
    | GithubRateLimitError
    | GithubAuthenticationError
    | GithubInvalidRequestError
  >

  export type ResultSuccess = Readonly<{
    repositories: GithubRepository[]
    pagination: Pagination
  }>

  export type Result = Promise<Either<ResultFailure, ResultSuccess>>
}

export class SearchGithubRepositoriesUseCase extends UseCase<
  SearchGithubRepositoriesUseCaseDTO.Parameters,
  SearchGithubRepositoriesUseCaseDTO.ResultFailure,
  SearchGithubRepositoriesUseCaseDTO.ResultSuccess
> {
  constructor(
    loggerProvider: ISendLogTimeUseCaseLoggerProvider & ISendLogErrorLoggerProvider,
    private readonly githubProvider: ISearchRepositoriesGithubProvider
  ) {
    super(loggerProvider)
  }

  protected async performOperation(parameters: SearchGithubRepositoriesUseCaseDTO.Parameters): SearchGithubRepositoriesUseCaseDTO.Result {
    const validationResult = this.validatePaginationParameters(parameters)
    if (validationResult.isFailure()) return failure(validationResult.value)
    const { selectedPageValidated, itemsPerPageValidated, queryValidated } = validationResult.value

    const searchResult = await this.githubProvider.searchRepositories({
      searchQuery: queryValidated,
      selectedPage: selectedPageValidated,
      itemsPerPage: itemsPerPageValidated
    })
    if (searchResult.isFailure()) return failure(searchResult.value)
    const { repositories, totalRepositoriesCount } = searchResult.value

    const paginationResult = Pagination.create({
      totalItems: totalRepositoriesCount,
      selectedPage: selectedPageValidated,
      itemsPerPage: itemsPerPageValidated,
      maxItemsAvailable: 1000
    })
    if (paginationResult.isFailure()) return failure(paginationResult.value)
    const { paginationCreated } = paginationResult.value

    return success({ repositories, pagination: paginationCreated })
  }

  private validatePaginationParameters(
    parameters: SearchGithubRepositoriesUseCaseDTO.Parameters
  ): Either<
    InvalidQueryError | InvalidSelectedPageError | InvalidItemsPerPageError,
    { selectedPageValidated: number; itemsPerPageValidated: number; queryValidated: string }
  > {
    const queryFormatted = parameters.query.trim()
    if (queryFormatted.length === 0 || queryFormatted.length > 100) {
      return failure(new InvalidQueryError({ query: parameters.query }))
    }
    const resultValidateSelectedPage = Pagination.validateSelectedPage(parameters.selectedPage)
    if (resultValidateSelectedPage.isFailure()) return failure(resultValidateSelectedPage.value)
    const { selectedPageValidated } = resultValidateSelectedPage.value
    const resultValidateItemsPerPage = Pagination.validateItemsPerPage(parameters.repositoriesPerPage)
    if (resultValidateItemsPerPage.isFailure()) return failure(resultValidateItemsPerPage.value)
    const { itemsPerPageValidated } = resultValidateItemsPerPage.value
    return success({ selectedPageValidated, itemsPerPageValidated, queryValidated: queryFormatted })
  }
}
