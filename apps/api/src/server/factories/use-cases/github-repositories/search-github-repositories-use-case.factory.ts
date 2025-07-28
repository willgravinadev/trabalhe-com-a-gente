import { type UseCase } from '@github-search/domain'
import { makeGithubProvider } from '@github-search/github'
import { makeLoggerProvider } from '@github-search/logger'
import {
  SearchGithubRepositoriesUseCase,
  type SearchGithubRepositoriesUseCaseDTO
} from '@use-cases/github-repositories/search-github-repositories.use-case'

export const makeSearchGithubRepositoriesUseCase = (): UseCase<
  SearchGithubRepositoriesUseCaseDTO.Parameters,
  SearchGithubRepositoriesUseCaseDTO.ResultFailure,
  SearchGithubRepositoriesUseCaseDTO.ResultSuccess
> => new SearchGithubRepositoriesUseCase(makeLoggerProvider(), makeGithubProvider())
