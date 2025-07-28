import { type RestController } from '@github-search/domain'
import { makeLoggerProvider } from '@github-search/logger'
import {
  SearchGithubRepositoriesRestController,
  type SearchGithubRepositoriesRestControllerDTO
} from '@rest-controllers/github-repositories/search-github-repositories.rest-controller'
import { makeSearchGithubRepositoriesUseCase } from '@server/factories/use-cases/github-repositories/search-github-repositories-use-case.factory'

export const makeSearchGithubRepositoriesRestController = (): RestController<
  SearchGithubRepositoriesRestControllerDTO.Parameters,
  SearchGithubRepositoriesRestControllerDTO.ResultFailure,
  SearchGithubRepositoriesRestControllerDTO.ResultSuccess
> => new SearchGithubRepositoriesRestController(makeLoggerProvider(), makeSearchGithubRepositoriesUseCase())
