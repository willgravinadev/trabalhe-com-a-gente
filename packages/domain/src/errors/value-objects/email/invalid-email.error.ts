import { type ProviderError } from '@errors/_shared/provider.error'
import { StatusError } from '@shared/status-error'

export class InvalidEmailError {
  readonly status: StatusError
  readonly errorMessage: string
  readonly name: 'InvalidEmailError'
  readonly errorValue: null | ProviderError

  constructor(parameters: { email: string }) {
    this.errorMessage = `The email ${parameters.email} is invalid`
    this.errorValue = null
    this.name = 'InvalidEmailError'
    this.status = StatusError.INVALID
  }
}
