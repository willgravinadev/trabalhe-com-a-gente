import { StatusError } from '@shared/status-error'

export class InvalidMonthDateTimeError {
  readonly status: StatusError
  readonly errorMessage: string
  readonly name: 'InvalidMonthDateTimeError'
  readonly errorValue: unknown

  constructor(parameters: { month: string }) {
    this.errorMessage = `Invalid month: ${parameters.month}`
    this.errorValue = null
    this.name = 'InvalidMonthDateTimeError'
    this.status = StatusError.INVALID
  }
}
