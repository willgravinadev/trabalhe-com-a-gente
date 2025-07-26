import { URL } from 'node:url'

import { type InvalidEmailError } from '@errors/value-objects/email/invalid-email.error'
import { type GenerateIDError } from '@errors/value-objects/id/generate-id.error'
import { type InvalidIDError } from '@errors/value-objects/id/invalid-id.error'
import { type Either, failure, success } from '@github-search/utils'
import { ModelName } from '@models/_model-name'
import { Email } from '@value-objects/email.value-object'
import { ID } from '@value-objects/id.value-object'

export class User {
  public readonly name: string
  public readonly email: Email
  public readonly avatarURL: URL | null
  public readonly id: ID

  private constructor(parameters: { name: string; email: Email; avatarURL: URL | null; id: ID }) {
    this.name = parameters.name
    this.email = parameters.email
    this.avatarURL = parameters.avatarURL

    this.id = parameters.id
    Object.freeze(this)
  }

  public static create(parameters: { name: string; email: Email; avatarURL: URL | null }): Either<GenerateIDError, { userCreated: User }> {
    const resultGenerateID = ID.generate({ modelName: ModelName.USER })
    if (resultGenerateID.isFailure()) return failure(resultGenerateID.value)
    const { idGenerated } = resultGenerateID.value

    return success({
      userCreated: new User({
        email: parameters.email,
        name: parameters.name,
        id: idGenerated,
        avatarURL: parameters.avatarURL
      })
    })
  }

  public static validateFromDatabase(parameters: {
    id: string
    name: string
    email: string
    avatarURL: string | null
  }): Either<InvalidEmailError | InvalidIDError, { userValidated: User }> {
    const resultEmail = Email.validateEmailAddress({ email: parameters.email })
    if (resultEmail.isFailure()) return failure(resultEmail.value)
    const { emailValidated } = resultEmail.value

    const resultID = ID.validate({ id: parameters.id, modelName: ModelName.USER })
    if (resultID.isFailure()) return failure(resultID.value)
    const { idValidated } = resultID.value

    const avatarURL: URL | null = parameters.avatarURL ? new URL(parameters.avatarURL) : null

    return success({
      userValidated: new User({
        email: emailValidated,
        name: parameters.name,
        avatarURL,
        id: idValidated
      })
    })
  }
}
