import { StatusError } from '@shared/status-error'

export class GithubInvalidRequestError {
  readonly status: StatusError
  readonly errorMessage: string
  readonly name: 'GithubInvalidRequestError'
  readonly errorValue: unknown

  constructor(parameters: { message?: string; error: unknown }) {
    this.errorMessage = parameters.message ? `GitHub API request invalid: ${parameters.message}` : 'GitHub API request is invalid'
    this.status = StatusError.INVALID
    this.errorValue = parameters.error
    this.name = 'GithubInvalidRequestError'
  }
}
