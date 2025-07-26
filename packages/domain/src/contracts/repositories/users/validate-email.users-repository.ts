import { type RepositoryError } from '@errors/_shared/repository.error'
import { type InvalidEmailError } from '@errors/value-objects/email/invalid-email.error'
import { type InvalidIDError } from '@errors/value-objects/id/invalid-id.error'
import { type Either } from '@github-search/utils'
import { type User } from '@models/user.model'

export namespace ValidateEmailUsersRepositoryDTO {
  export type Parameters = Readonly<{ user: Pick<User, 'email'> }>

  export type ResultFailure = Readonly<RepositoryError | InvalidEmailError | InvalidIDError>

  export type FoundUser = Pick<User, 'id'> & {
    email: Pick<User['email'], 'value'>
  }

  export type ResultSuccess = Readonly<{ foundUser: null | FoundUser }>

  export type Result = Promise<Either<ResultFailure, ResultSuccess>>
}

export interface IValidateEmailUsersRepository {
  validateEmail(parameters: ValidateEmailUsersRepositoryDTO.Parameters): ValidateEmailUsersRepositoryDTO.Result
}
