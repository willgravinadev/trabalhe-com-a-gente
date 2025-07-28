import { StatusError } from '@shared/status-error'

export class GithubRateLimitError {
  readonly status: StatusError
  readonly errorMessage: string
  readonly name: 'GithubRateLimitError'
  readonly errorValue: unknown

  constructor(parameters: { resetTime?: Date; remainingRequests?: number; error: unknown }) {
    const resetInfo = parameters.resetTime ? ` Rate limit resets at: ${parameters.resetTime.toISOString()}` : ''
    const remainingInfo = parameters.remainingRequests === undefined ? '' : ` Remaining requests: ${parameters.remainingRequests}`

    this.errorMessage = `GitHub API rate limit exceeded.${resetInfo}${remainingInfo}`
    this.status = StatusError.TOO_MANY_REQUESTS
    this.errorValue = parameters.error
    this.name = 'GithubRateLimitError'
  }
}
