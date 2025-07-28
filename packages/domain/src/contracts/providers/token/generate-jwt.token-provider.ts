import { type ProviderError } from '@errors/_shared/provider.error'
import { type Either } from '@github-search/utils'
import { type User } from '@models/user.model'

export namespace GenerateJWTTokenProviderDTO {
  export type Parameters = Readonly<{ user: Pick<User, 'id'> }>

  export type ResultFailure = Readonly<ProviderError>
  export type ResultSuccess = Readonly<{ jwtToken: string }>

  export type Result = Either<ResultFailure, ResultSuccess>
}

export interface IGenerateJWTTokenProvider {
  generateJWT(parameters: GenerateJWTTokenProviderDTO.Parameters): GenerateJWTTokenProviderDTO.Result
}
