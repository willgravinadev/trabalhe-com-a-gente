import { randomUUID } from 'node:crypto'

import { GenerateIDError } from '@errors/value-objects/id/generate-id.error'
import { InvalidIDError } from '@errors/value-objects/id/invalid-id.error'
import { type Either, failure, success } from '@github-search/utils'
import { type ModelName } from '@models/_model-name'
import { type ValueObjectName } from '@value-objects/_value-object-name'

export class ID {
  public readonly value: string

  constructor(parameters: { id: string }) {
    this.value = parameters.id
    Object.freeze(this)
  }

  public toString(): string {
    return this.value
  }

  public static validate(
    parameters: ({ id: string } & { modelName: ModelName }) | ({ id: string } & { valueObjectName: ValueObjectName })
  ): Either<InvalidIDError, { idValidated: ID }> {
    if (parameters.id.length !== 36) {
      return failure(
        new InvalidIDError({
          id: parameters.id,
          ...('modelName' in parameters ? { modelName: parameters.modelName } : { valueObjectName: parameters.valueObjectName })
        })
      )
    }
    return success({ idValidated: new ID({ id: parameters.id }) })
  }

  public static generate(parameters: { modelName: ModelName } | { valueObjectName: ValueObjectName }): Either<GenerateIDError, { idGenerated: ID }> {
    try {
      return success({ idGenerated: new ID({ id: randomUUID({ disableEntropyCache: true }) }) })
    } catch (error: unknown) {
      return failure(
        new GenerateIDError({
          modelNameOrValueObjectName: 'modelName' in parameters ? parameters.modelName : parameters.valueObjectName,
          error: error instanceof Error ? error : new Error(String(error))
        })
      )
    }
  }

  public equals(parameters: { otherID: ID }): boolean {
    return this.value === parameters.otherID.value
  }
}
