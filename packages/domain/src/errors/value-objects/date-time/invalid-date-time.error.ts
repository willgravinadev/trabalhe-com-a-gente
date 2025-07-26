import { StatusError } from '@shared/status-error'

export enum InvalidDateTimeMotive {
  DATE_REQUIRED = 'date required',
  IS_NOT_A_DATE = 'is not a date'
}

export class InvalidDateTimeError {
  readonly errorMessage: string
  readonly errorValue: unknown
  readonly name: 'InvalidDateTimeError'
  readonly status: StatusError

  constructor(parameters: { dateTime: string | number | null; motive: InvalidDateTimeMotive }) {
    const dateTimeStr = parameters.dateTime === null ? '.' : `" ${parameters.dateTime}."`
    this.errorMessage = `Invalid date time${dateTimeStr} Motive: ${parameters.motive}`
    this.errorValue = null
    this.name = 'InvalidDateTimeError'
    this.status = StatusError.INVALID
  }
}
