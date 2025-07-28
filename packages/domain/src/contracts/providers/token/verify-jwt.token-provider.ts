import { type ProviderError } from '@errors/_shared/provider.error'
import { type UserUnauthorizedError } from '@errors/models/user/user-unauthorized.error'
import { type InvalidIDError } from '@errors/value-objects/id/invalid-id.error'
import { type Either } from '@github-search/utils'
import { type ModelName } from '@models/_model-name'
import { type User } from '@models/user.model'

export namespace VerifyJWTTokenProviderDTO {
  export type Parameters = Readonly<{
    jwtToken: string
    type: ModelName.USER
  }>

  export type ResultFailure = Readonly<ProviderError | InvalidIDError | UserUnauthorizedError>
  export type ResultSuccess = Readonly<{ user: Pick<User, 'id'> }>

  export type Result = Either<ResultFailure, ResultSuccess>
}

export interface IVerifyJWTTokenProvider {
  verifyJWT(parameters: VerifyJWTTokenProviderDTO.Parameters): VerifyJWTTokenProviderDTO.Result
}
