import { type ProviderError } from '@errors/_shared/provider.error'
import { type User } from '@models/user.model'
import { StatusError } from '@shared/status-error'

export class UserNotFoundError {
  readonly status: StatusError
  readonly errorMessage: string
  readonly name: 'UserNotFoundError'
  readonly errorValue: null | ProviderError

  constructor(parameters: { user: Pick<User, 'id'> }) {
    this.errorMessage = `User not found with id: ${parameters.user.id.value}`
    this.status = StatusError.NOT_FOUND
    this.errorValue = null
    this.name = 'UserNotFoundError'
  }
}
