import { StatusError } from '@shared/status-error'

type ParametersConstructorDTO = {
  error: unknown
  provider: {
    name: ProvidersNames
    method: GithubProviderMethods
    externalName?: string
  }
}

export enum ProvidersNames {
  GITHUB = 'github'
}

export enum GithubProviderMethods {
  SEARCH_REPOSITORIES = 'search repositories'
}

export class ProviderError {
  readonly status: StatusError

  readonly errorMessage: string

  readonly name: 'ProviderError'

  readonly errorValue: unknown

  constructor(parameters: ParametersConstructorDTO) {
    this.errorMessage = `Error in ${parameters.provider.name} provider in ${parameters.provider.method} method.${
      parameters.provider.externalName === undefined ? '' : ` Error in external lib name: ${parameters.provider.externalName}.`
    }`
    this.status = StatusError.PROVIDER_ERROR
    this.errorValue = parameters.error
    this.name = 'ProviderError'
  }
}
