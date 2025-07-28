import { StatusError } from '@shared/status-error'

export enum InvalidAbbreviatedMonthDateTimeMotive {
  INVALID_ABBREVIATED_MONTH = 'invalid abbreviated month'
}

export class InvalidAbbreviatedMonthDateTimeError {
  readonly errorMessage: string
  readonly errorValue: unknown
  readonly name: 'InvalidAbbreviatedMonthDateTimeError'
  readonly status: StatusError

  constructor(parameters: { abbreviatedMonth: string; motive: InvalidAbbreviatedMonthDateTimeMotive }) {
    this.errorMessage = `Invalid abbreviated month "${parameters.abbreviatedMonth}". Motive: ${parameters.motive}`
    this.errorValue = null
    this.name = 'InvalidAbbreviatedMonthDateTimeError'
    this.status = StatusError.INVALID
  }
}
