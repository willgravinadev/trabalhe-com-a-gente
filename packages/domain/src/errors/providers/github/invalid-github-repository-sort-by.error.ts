import { StatusError } from '@shared/status-error'

export class InvalidGithubRepositorySortByError {
  readonly status: StatusError
  readonly errorMessage: string
  readonly name: 'InvalidGithubRepositorySortByError'
  readonly errorValue: unknown

  constructor(parameters: { sortBy: string }) {
    this.status = StatusError.INVALID
    this.errorValue = undefined
    this.errorMessage = `Invalid GitHub repository sort-by parameter: '${parameters.sortBy}'. Valid options are: 'best_match', 'most_stars', 'most_forks', 'recently_updated'.`
    this.name = 'InvalidGithubRepositorySortByError'
  }
}
