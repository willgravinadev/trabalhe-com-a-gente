import { StatusError } from '@shared/status-error'

export class InvalidMonthNumberDateTimeError {
  readonly errorMessage: string
  readonly errorValue: unknown
  readonly name: 'InvalidMonthNumberDateTimeError'
  readonly status: StatusError

  constructor(parameters: { monthNumber: number }) {
    this.errorMessage = `Invalid month number: ${parameters.monthNumber}`
    this.errorValue = null
    this.name = 'InvalidMonthNumberDateTimeError'
    this.status = StatusError.INVALID
  }
}
