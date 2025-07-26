import { StatusError } from '@shared/status-error'

export class GithubAuthenticationError {
  readonly status: StatusError
  readonly errorMessage: string
  readonly name: 'GithubAuthenticationError'
  readonly errorValue: unknown

  constructor(parameters: { error: unknown }) {
    this.status = StatusError.UNAUTHORIZED
    this.errorValue = parameters.error
    this.errorMessage = 'GitHub API authentication failed. Please check your access token.'
    this.name = 'GithubAuthenticationError'
  }
}
