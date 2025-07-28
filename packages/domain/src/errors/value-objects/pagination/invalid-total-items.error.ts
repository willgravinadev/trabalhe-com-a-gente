import { StatusError } from '@shared/status-error'

export class InvalidTotalItemsError {
  public readonly errorMessage: string
  public readonly errorValue: unknown
  public readonly name: 'InvalidTotalItemsError'
  public readonly status: StatusError

  constructor(parameters: { totalItems: number }) {
    this.errorMessage = `Invalid total items for pagination: ${parameters.totalItems}. Total items must be a non-negative integer.`
    this.errorValue = parameters.totalItems
    this.name = 'InvalidTotalItemsError'
    this.status = StatusError.INVALID
  }
}
