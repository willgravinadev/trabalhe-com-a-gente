import { type ModelName } from '@models/_model-name'
import { StatusError } from '@shared/status-error'
import { type ValueObjectName } from '@value-objects/_value-object-name'

export class InvalidIDError {
  public readonly errorMessage: string
  public readonly errorValue: unknown
  public readonly name: 'InvalidIDError'
  public readonly status: StatusError

  constructor(parameters: { id: string; modelName: ModelName } | { id: string; valueObjectName: ValueObjectName }) {
    this.errorMessage = `Invalid ID to ${
      'valueObjectName' in parameters ? 'value object' : 'model'
    } ${'valueObjectName' in parameters ? parameters.valueObjectName : parameters.modelName}`
    this.errorValue = undefined
    this.name = 'InvalidIDError'
    this.status = StatusError.INVALID
  }
}
