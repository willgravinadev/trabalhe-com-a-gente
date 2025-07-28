import { type RepositoryError } from '@errors/_shared/repository.error'
import { type InvalidIDError } from '@errors/value-objects/id/invalid-id.error'
import { type Either } from '@github-search/utils'
import { type User } from '@models/user.model'
import { type ID } from '@value-objects/id.value-object'

export namespace ValidateIDUsersRepositoryDTO {
  export type Parameters = Readonly<{ userID: ID }>

  export type ResultFailure = Readonly<RepositoryError | InvalidIDError>

  export type FoundUser = Pick<User, 'id'>
  export type ResultSuccess = Readonly<{ foundUser: FoundUser | null }>

  export type Result = Promise<Either<ResultFailure, ResultSuccess>>
}

export interface IValidateIDUsersRepository {
  validateID(parameters: ValidateIDUsersRepositoryDTO.Parameters): ValidateIDUsersRepositoryDTO.Result
}
