import { StatusError } from '@shared/status-error'

export class InvalidSelectedPageError {
  public readonly errorMessage: string
  public readonly errorValue: unknown
  public readonly name: 'InvalidSelectedPageError'
  public readonly status: StatusError

  constructor(parameters: { selectedPage: number }) {
    this.errorMessage = `Invalid selected page for pagination: ${parameters.selectedPage}. Selected page must be a positive integer.`
    this.errorValue = parameters.selectedPage
    this.name = 'InvalidSelectedPageError'
    this.status = StatusError.INVALID
  }
}
