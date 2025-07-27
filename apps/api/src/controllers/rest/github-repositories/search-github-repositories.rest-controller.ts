import {
  type HttpRequest,
  type HttpResponseSuccess,
  InvalidGithubRepositorySortByError,
  type ISendLogErrorLoggerProvider,
  type ISendLogTimeControllerLoggerProvider,
  RestController,
  StatusSuccess,
  type UseCase
} from '@github-search/domain'
import { type Either, failure, success } from '@github-search/utils'
import { type SearchGithubRepositoriesUseCaseDTO } from '@use-cases/github-repositories/search-github-repositories.use-case'

export namespace SearchGithubRepositoriesRestControllerDTO {
  export type Body = Readonly<undefined>
  export type Query = Readonly<{
    query: string
    selected_page: number
    repositories_per_page: number
    sort_by: string | null
  }>
  export type Params = Readonly<undefined>

  export type Parameters = Readonly<HttpRequest<Body, Query, Params>>

  export type ResultFailure = Readonly<InvalidGithubRepositorySortByError | SearchGithubRepositoriesUseCaseDTO.ResultFailure>
  export type ResultSuccess = Readonly<
    HttpResponseSuccess<{
      pagination: {
        total_items: number
        total_pages: number
        current_page: number
        items_per_page: number
        has_next_page: boolean
        has_previous_page: boolean
      }
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
        ssh_url: string
        open_issues_count: number
        topics: string[]
        owner: {
          external_id: string
          username: string
          type: string
          external_avatar_url: string
          external_profile_url: string
        }
      }>
    }>
  >

  export type Result = Promise<Either<ResultFailure, ResultSuccess>>
}

export class SearchGithubRepositoriesRestController extends RestController<
  SearchGithubRepositoriesRestControllerDTO.Parameters,
  SearchGithubRepositoriesRestControllerDTO.ResultFailure,
  SearchGithubRepositoriesRestControllerDTO.ResultSuccess
> {
  constructor(
    loggerProvider: ISendLogErrorLoggerProvider & ISendLogTimeControllerLoggerProvider,
    private readonly searchGithubRepositoriesUseCase: UseCase<
      SearchGithubRepositoriesUseCaseDTO.Parameters,
      SearchGithubRepositoriesUseCaseDTO.ResultFailure,
      SearchGithubRepositoriesUseCaseDTO.ResultSuccess
    >
  ) {
    super(loggerProvider)
  }

  protected async performOperation(request: SearchGithubRepositoriesRestControllerDTO.Parameters): SearchGithubRepositoriesRestControllerDTO.Result {
    if (
      request.query.sort_by !== 'best_match' &&
      request.query.sort_by !== 'most_stars' &&
      request.query.sort_by !== 'most_forks' &&
      request.query.sort_by !== 'recently_updated' &&
      request.query.sort_by !== null
    ) {
      return failure(new InvalidGithubRepositorySortByError({ sortBy: String(request.query.sort_by) }))
    }

    const searchGithubRepositoriesResult = await this.searchGithubRepositoriesUseCase.execute({
      query: request.query.query,
      selectedPage: request.query.selected_page,
      repositoriesPerPage: request.query.repositories_per_page,
      sortBy: request.query.sort_by
    })
    if (searchGithubRepositoriesResult.isFailure()) return failure(searchGithubRepositoriesResult.value)
    const { repositories, pagination } = searchGithubRepositoriesResult.value

    return success({
      status: StatusSuccess.DONE,
      success: {
        pagination: {
          total_items: pagination.totalItems,
          total_pages: pagination.totalPages,
          current_page: pagination.currentPage,
          items_per_page: pagination.itemsPerPage,
          has_next_page: pagination.hasNextPage,
          has_previous_page: pagination.hasPreviousPage
        },
        repositories: repositories.map((repository) => ({
          external_id: repository.externalID,
          name: repository.name,
          full_name: repository.fullName,
          external_url: repository.externalURL.href,
          created_at: repository.createdAt.toISOString(),
          stars_count: repository.starsCount,
          forks_count: repository.forksCount,
          owner: {
            external_id: repository.owner.externalID,
            username: repository.owner.username,
            type: repository.owner.type,
            external_avatar_url: repository.owner.externalAvatarURL.href,
            external_profile_url: repository.owner.externalProfileURL.href
          },
          description: repository.description,
          language: repository.language,
          ssh_url: repository.sshURL,
          open_issues_count: repository.openIssuesCount,
          topics: repository.topics
        }))
      }
    })
  }
}
