import { type ProviderError } from '@errors/_shared/provider.error'
import { type ModelName } from '@models/_model-name'
import { StatusError } from '@shared/status-error'
import { ValueObjectName } from '@value-objects/_value-object-name'

export class GenerateIDError {
  readonly errorMessage: string
  readonly errorValue: null | ProviderError | Error
  readonly name: 'GenerateIDError'
  readonly status: StatusError

  constructor(parameters: { modelNameOrValueObjectName: ModelName | ValueObjectName; error: Error | ProviderError | null }) {
    this.errorMessage = `Error generating id to ${
      parameters.modelNameOrValueObjectName in ValueObjectName ? 'value object' : 'model'
    } ${parameters.modelNameOrValueObjectName}`
    this.errorValue = parameters.error
    this.name = 'GenerateIDError'
    this.status = StatusError.INVALID
  }
}
