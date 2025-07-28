import { StatusError } from '@shared/status-error'

export class InvalidGenerateDateTimeError {
  readonly errorMessage: string
  readonly errorValue: unknown
  readonly name: 'InvalidGenerateDateTimeError'
  readonly status: StatusError

  constructor() {
    this.errorMessage = `Invalid generate date time.`
    this.errorValue = null
    this.name = 'InvalidGenerateDateTimeError'
    this.status = StatusError.INVALID
  }
}
