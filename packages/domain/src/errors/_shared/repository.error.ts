import { StatusError } from '@shared/status-error'

type ParametersConstructorDTO = {
  error: unknown
  repository: {
    name: RepositoryNames
    method: UsersRepositoryMethods
    externalName?: RepositoryExternalName
  }
}

export enum RepositoryExternalName {
  PRISMA = 'prisma'
}

export enum RepositoryNames {
  USERS = 'users'
}

export enum UsersRepositoryMethods {
  FIND_PROFILE = 'find profile',
  SAVE = 'save',
  VALIDATE_EMAIL = 'validate email',
  VALIDATE_ID = 'validate id'
}

export class RepositoryError {
  readonly status: StatusError
  readonly errorMessage: string
  readonly name: 'RepositoryError'
  readonly errorValue: unknown

  constructor(parameters: ParametersConstructorDTO) {
    this.errorMessage = `Error in ${parameters.repository.name} repository in ${parameters.repository.method} method.${
      parameters.repository.externalName === undefined ? '' : ` Error in external lib name: ${parameters.repository.externalName}.`
    }`
    this.errorValue = parameters.error
    this.name = 'RepositoryError'
    this.status = StatusError.REPOSITORY_ERROR
  }
}
