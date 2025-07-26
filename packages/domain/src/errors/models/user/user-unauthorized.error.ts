import { type ProviderError } from '@errors/_shared/provider.error'
import { StatusError } from '@shared/status-error'

type ParametersConstructorDTO = {
  motive: UserUnauthorizedMotive | null
  message: string | null
  error: null | ProviderError | Error
}

export enum UserUnauthorizedMotive {
  INVALID_CREDENTIALS = 'invalid credentials',
  INVALID_TOKEN = 'invalid token',
  INVALID_PHONE_NUMBER = 'invalid phone number',
  USER_NOT_ADMIN = 'user not admin',
  USER_NOT_ADVISOR = 'user not advisor',
  USER_NOT_CUSTOMER = 'user not customer',
  USER_NOT_FOUND = 'user not found',
  USER_NOT_FOUND_IN_WALLET = 'user not found in wallet'
}

export class UserUnauthorizedError {
  readonly status: StatusError
  readonly errorMessage: string
  readonly name: 'UserUnauthorizedError'
  readonly errorValue: null | ProviderError | Error

  constructor(parameters: ParametersConstructorDTO) {
    this.errorMessage =
      parameters.message !== null && parameters.message !== ''
        ? parameters.message
        : (parameters.motive ?? 'User is not authorized to access this resource')
    this.status = StatusError.UNAUTHORIZED
    this.name = 'UserUnauthorizedError'
    this.errorValue = parameters.error
  }
}
