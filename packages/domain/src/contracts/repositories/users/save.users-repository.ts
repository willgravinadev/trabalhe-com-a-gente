import { type RepositoryError } from '@errors/_shared/repository.error'
import { type Either } from '@github-search/utils'
import { type User } from '@models/user.model'

export namespace SaveUsersRepositoryDTO {
  export type Parameters = Readonly<{ user: User }>

  export type ResultFailure = Readonly<RepositoryError>
  export type ResultSuccess = Readonly<null>

  export type Result = Promise<Either<ResultFailure, ResultSuccess>>
}

export interface ISaveUsersRepository {
  save(parameters: SaveUsersRepositoryDTO.Parameters): SaveUsersRepositoryDTO.Result
}
