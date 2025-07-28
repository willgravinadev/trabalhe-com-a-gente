import { StatusError } from '@shared/status-error'

export class InvalidItemsPerPageError {
  public readonly errorMessage: string
  public readonly errorValue: unknown
  public readonly name: 'InvalidItemsPerPageError'
  public readonly status: StatusError

  constructor(parameters: { itemsPerPage: number }) {
    this.errorMessage = `Invalid items per page for pagination: ${parameters.itemsPerPage}. Items per page must be a positive integer.`
    this.errorValue = parameters.itemsPerPage
    this.name = 'InvalidItemsPerPageError'
    this.status = StatusError.INVALID
  }
}
