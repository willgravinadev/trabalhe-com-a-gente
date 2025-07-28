import { type ISearchRepositoriesGithubProvider } from '@github-search/domain'
import { makeLoggerProvider } from '@github-search/logger'

import { APIGithubProvider } from './infra/api.github-provider'

export const makeGithubProvider = (): ISearchRepositoriesGithubProvider => new APIGithubProvider(makeLoggerProvider())
