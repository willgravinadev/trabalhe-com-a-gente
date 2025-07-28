import { type RepositoryError } from '@errors/_shared/repository.error'
import { type InvalidIDError } from '@errors/value-objects/id/invalid-id.error'
import { type Either } from '@github-search/utils'
import { type User } from '@models/user.model'

export namespace FindProfileUsersRepositoryDTO {
  export type Parameters = Readonly<{ user: Pick<User, 'id'> }>

  export type ResultFailure = Readonly<RepositoryError | InvalidIDError>

  export type FoundUser = Pick<User, 'id' | 'name'>
  export type ResultSuccess = Readonly<{ foundUser: null | FoundUser }>

  export type Result = Promise<Either<ResultFailure, ResultSuccess>>
}

export interface IFindProfileUsersRepository {
  findProfile(parameters: FindProfileUsersRepositoryDTO.Parameters): FindProfileUsersRepositoryDTO.Result
}
