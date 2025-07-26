import { type ModelName } from '../../../models/_model-name'
import { StatusError } from '../../../shared/status-error'
import { type Email } from '../../../value-objects/email.value-object'
import { type ProviderError } from '../../_shared/provider.error'

export class EmailAlreadyInUseError {
  readonly status: StatusError
  readonly errorMessage: string
  readonly name: 'EmailAlreadyInUseError'
  readonly errorValue: ProviderError | null

  constructor(parameters: { email: Pick<Email, 'value'>; model: ModelName.USER }) {
    this.errorMessage = `The email "${parameters.email.value}" is already in use for a ${parameters.model}. Please use a different email address.`
    this.errorValue = null
    this.name = 'EmailAlreadyInUseError'
    this.status = StatusError.CONFLICT
  }
}
