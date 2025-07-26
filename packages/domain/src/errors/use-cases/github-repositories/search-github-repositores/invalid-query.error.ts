import { type ProviderError } from '@errors/_shared/provider.error'
import { StatusError } from '@shared/status-error'

export class InvalidQueryError {
  readonly status: StatusError
  readonly errorMessage: string
  readonly name: 'InvalidQueryError'
  readonly errorValue: null | ProviderError

  constructor(parameters: { query: string }) {
    this.errorMessage = `The query "${parameters.query}" is invalid. Query cannot be empty or contain only whitespace or exceed 100 characters.`
    this.errorValue = null
    this.name = 'InvalidQueryError'
    this.status = StatusError.INVALID
  }
}
