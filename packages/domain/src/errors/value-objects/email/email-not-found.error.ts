import { type ProviderError } from '@errors/_shared/provider.error'
import { StatusError } from '@shared/status-error'
import { type Email } from '@value-objects/email.value-object'

export class EmailNotFoundError {
  readonly status: StatusError
  readonly errorMessage: string
  readonly name: 'EmailNotFoundError'
  readonly errorValue: null | ProviderError

  constructor(parameters: { email: Pick<Email, 'value'> }) {
    this.errorMessage = `The email ${parameters.email.value} was not found.`
    this.errorValue = null
    this.name = 'EmailNotFoundError'
    this.status = StatusError.NOT_FOUND
  }
}
