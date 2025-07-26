import {
  InvalidAbbreviatedMonthDateTimeError,
  InvalidAbbreviatedMonthDateTimeMotive
} from '@errors/value-objects/date-time/invalid-abbreviated-month-date-time.error'
import { InvalidDateTimeError, InvalidDateTimeMotive } from '@errors/value-objects/date-time/invalid-date-time.error'
import { InvalidGenerateDateTimeError } from '@errors/value-objects/date-time/invalid-generate-date-time.error'
import { InvalidMonthDateTimeError } from '@errors/value-objects/date-time/invalid-month-date-time.error'
import { InvalidMonthNumberDateTimeError } from '@errors/value-objects/date-time/invalid-month-number-date-time.error'
import { type Either, failure, success } from '@github-search/utils'

export enum AbbreviatedMonth {
  JANUARY = 'JAN',
  FEBRUARY = 'FEB',
  MARCH = 'MAR',
  APRIL = 'APR',
  MAY = 'MAY',
  JUNE = 'JUN',
  JULY = 'JUL',
  AUGUST = 'AUG',
  SEPTEMBER = 'SEP',
  OCTOBER = 'OCT',
  NOVEMBER = 'NOV',
  DECEMBER = 'DEC'
}

export enum AbbreviatedWeekDay {
  SUNDAY = 'SUN',
  MONDAY = 'MON',
  TUESDAY = 'TUE',
  WEDNESDAY = 'WED',
  THURSDAY = 'THU',
  FRIDAY = 'FRI',
  SATURDAY = 'SAT'
}

export enum WeekDay {
  SUNDAY = 'SUNDAY',
  MONDAY = 'MONDAY',
  TUESDAY = 'TUESDAY',
  WEDNESDAY = 'WEDNESDAY',
  THURSDAY = 'THURSDAY',
  FRIDAY = 'FRIDAY',
  SATURDAY = 'SATURDAY'
}

export enum Month {
  JANUARY = 'JANUARY',
  FEBRUARY = 'FEBRUARY',
  MARCH = 'MARCH',
  APRIL = 'APRIL',
  MAY = 'MAY',
  JUNE = 'JUNE',
  JULY = 'JULY',
  AUGUST = 'AUGUST',
  SEPTEMBER = 'SEPTEMBER',
  OCTOBER = 'OCTOBER',
  NOVEMBER = 'NOVEMBER',
  DECEMBER = 'DECEMBER'
}

export enum DayOfWeek {
  SUNDAY = 'SUNDAY',
  MONDAY = 'MONDAY',
  TUESDAY = 'TUESDAY',
  WEDNESDAY = 'WEDNESDAY',
  THURSDAY = 'THURSDAY',
  FRIDAY = 'FRIDAY',
  SATURDAY = 'SATURDAY'
}

export type Hour = `${number}:${number}`

export type DateFormat = 'dd/MM/yyyy' | 'dd/MM/yyyy HH:mm' | 'HH:mm'
export type Locale = 'pt-BR' | 'en-US'

// ============================================================================
// CONSTANTS AND MAPPINGS
// ============================================================================

const MILLISECONDS_PER_SECOND = 1000
const MILLISECONDS_PER_MINUTE = 60 * MILLISECONDS_PER_SECOND
const MILLISECONDS_PER_HOUR = 60 * MILLISECONDS_PER_MINUTE
const MILLISECONDS_PER_DAY = 24 * MILLISECONDS_PER_HOUR
const MILLISECONDS_PER_MONTH = 30 * MILLISECONDS_PER_DAY
const MILLISECONDS_PER_YEAR = 365 * MILLISECONDS_PER_DAY

/**
 * Maps the AbbreviatedMonth enum to number (0-11) and vice versa.
 */
const ABBREVIATED_MONTH_TO_NUMBER_MAP: Record<AbbreviatedMonth, number> = {
  [AbbreviatedMonth.JANUARY]: 0,
  [AbbreviatedMonth.FEBRUARY]: 1,
  [AbbreviatedMonth.MARCH]: 2,
  [AbbreviatedMonth.APRIL]: 3,
  [AbbreviatedMonth.MAY]: 4,
  [AbbreviatedMonth.JUNE]: 5,
  [AbbreviatedMonth.JULY]: 6,
  [AbbreviatedMonth.AUGUST]: 7,
  [AbbreviatedMonth.SEPTEMBER]: 8,
  [AbbreviatedMonth.OCTOBER]: 9,
  [AbbreviatedMonth.NOVEMBER]: 10,
  [AbbreviatedMonth.DECEMBER]: 11
}

const NUMBER_TO_ABBREVIATED_MONTH_MAP: Record<number, AbbreviatedMonth> = Object.fromEntries(
  Object.entries(ABBREVIATED_MONTH_TO_NUMBER_MAP).map(([key, value]) => [value, key])
) as Record<number, AbbreviatedMonth>

/**
 * Maps the Month enum to number (0-11) and vice versa.
 */
const MONTH_TO_NUMBER_MAP: Record<Month, number> = {
  [Month.JANUARY]: 0,
  [Month.FEBRUARY]: 1,
  [Month.MARCH]: 2,
  [Month.APRIL]: 3,
  [Month.MAY]: 4,
  [Month.JUNE]: 5,
  [Month.JULY]: 6,
  [Month.AUGUST]: 7,
  [Month.SEPTEMBER]: 8,
  [Month.OCTOBER]: 9,
  [Month.NOVEMBER]: 10,
  [Month.DECEMBER]: 11
}

const NUMBER_TO_MONTH_MAP: Record<number, Month> = Object.fromEntries(
  Object.entries(MONTH_TO_NUMBER_MAP).map(([key, value]) => [value, key])
) as Record<number, Month>

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

/**
 * Parses a date input into a Date object.
 */
const parseDateInput = (input: string | Date | number): Date => {
  if (typeof input === 'string') {
    return new Date(input.trim())
  }
  if (typeof input === 'number') {
    return new Date(input)
  }
  return input
}

/**
 * Validates if a Date object is valid.
 */
const isValidDate = (date: Date): boolean => {
  return !Number.isNaN(date.getTime())
}

/**
 * Immutable DateTime value object that provides type-safe date and time operations.
 *
 * This class encapsulates date/time logic and provides a rich API for:
 * - Date validation and creation
 * - Date arithmetic operations
 * - Date comparison and formatting
 * - Month and day enumeration
 *
 * All methods that modify dates return new instances to maintain immutability.
 */
export class DateTime {
  public readonly value: Date

  constructor(input: { date: Date }) {
    this.value = new Date(input.date) // Create a copy to prevent mutation
    Object.freeze(this)
  }

  // ============================================================================
  // FACTORY METHODS
  // ============================================================================

  /**
   * Creates a valid DateTime instance from a string, Date, or timestamp.
   *
   * @param parameters - Object containing the date input
   * @returns Either a validation error or a validated DateTime instance
   *
   * @example
   * ```typescript
   * const result = DateTime.validate({ date: '2023-12-25' })
   * if (result.isSuccess()) {
   *   const dateTime = result.value.dateValidated
   * }
   * ```
   */
  public static validate(parameters: { date: string | Date | number }): Either<InvalidDateTimeError, { dateValidated: DateTime }> {
    const { date } = parameters

    if (typeof date === 'string' && date.trim() === '') {
      return failure(
        new InvalidDateTimeError({
          dateTime: date,
          motive: InvalidDateTimeMotive.DATE_REQUIRED
        })
      )
    }

    const parsedDate = parseDateInput(date)

    if (!isValidDate(parsedDate)) {
      return failure(
        new InvalidDateTimeError({
          dateTime: date.toString(),
          motive: InvalidDateTimeMotive.IS_NOT_A_DATE
        })
      )
    }

    return success({ dateValidated: new DateTime({ date: parsedDate }) })
  }

  /**
   * Creates a DateTime instance representing the current date and time.
   *
   * @returns Either a generation error or the current DateTime
   */
  public static now(): Either<InvalidGenerateDateTimeError, { now: DateTime }> {
    try {
      return success({ now: new DateTime({ date: new Date() }) })
    } catch {
      return failure(new InvalidGenerateDateTimeError())
    }
  }

  /**
   * Creates a DateTime instance from a specific date.
   *
   * @param parameters - Object containing year, month, and day
   * @returns A new DateTime instance
   */
  public static fromDate(parameters: {
    year: number
    month: number // 0-11
    day: number
    hour?: number
    minute?: number
    second?: number
    millisecond?: number
  }): DateTime {
    const { year, month, day, hour = 0, minute = 0, second = 0, millisecond = 0 } = parameters
    return new DateTime({ date: new Date(year, month, day, hour, minute, second, millisecond) })
  }

  // ============================================================================
  // GETTER METHODS
  // ============================================================================

  /**
   * Gets the stored time value in milliseconds since midnight, January 1, 1970 UTC.
   */
  public getTime(): number {
    return this.value.getTime()
  }

  public getFullYear(): number {
    return this.value.getFullYear()
  }

  public getMonth(): number {
    return this.value.getMonth()
  }

  public getDate(): number {
    return this.value.getDate()
  }

  public getDay(): number {
    return this.value.getDay()
  }

  public getHours(): number {
    return this.value.getHours()
  }

  public getMinutes(): number {
    return this.value.getMinutes()
  }

  public getSeconds(): number {
    return this.value.getSeconds()
  }

  public getMilliseconds(): number {
    return this.value.getMilliseconds()
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Calculates age from a birth date.
   *
   * @param parameters - Object containing the birth date
   * @returns The calculated age in years
   */
  public static getAge(parameters: { birthDate: DateTime }): number {
    const { birthDate } = parameters
    const now = new Date()
    let age = now.getFullYear() - birthDate.getFullYear()

    // Adjust for cases where birthday hasn't occurred yet this year
    const monthDiff = now.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birthDate.getDate())) {
      age--
    }

    return age
  }

  /**
   * Creates a new DateTime with time set to 00:00:00.000.
   */
  public setTimeToZero(): DateTime {
    const newDate = new Date(this.value)
    newDate.setHours(0, 0, 0, 0)
    return new DateTime({ date: newDate })
  }

  /**
   * Creates a new DateTime with time set to 23:59:59.999.
   */
  public setTimeToMax(): DateTime {
    const newDate = new Date(this.value)
    newDate.setHours(23, 59, 59, 999)
    return new DateTime({ date: newDate })
  }

  /**
   * Returns the ISO representation of the stored date.
   */
  public toISOString(): string {
    return this.value.toISOString()
  }

  /**
   * Formats the date according to the specified locale and format.
   *
   * @param parameters - Object containing locale and format options
   * @returns Formatted date string
   */
  public toStringFormatted(parameters: { locale: Locale; format: DateFormat }): string {
    const { locale, format } = parameters

    switch (format) {
      case 'dd/MM/yyyy': {
        return this.value.toLocaleDateString(locale, {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        })
      }

      case 'HH:mm': {
        return this.value.toLocaleTimeString(locale, {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        })
      }

      case 'dd/MM/yyyy HH:mm': {
        return this.value.toLocaleDateString(locale, {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      }

      default: {
        return this.toISOString()
      }
    }
  }

  // ============================================================================
  // ARITHMETIC OPERATIONS
  // ============================================================================

  /**
   * Adds the specified time units to the date.
   *
   * @param parameters - Object containing time units to add
   * @returns Either a generation error or the new DateTime
   */
  public static add(parameters: {
    date?: DateTime
    seconds?: number
    minutes?: number
    hours?: number
    days?: number
    months?: number
    years?: number
  }): Either<InvalidGenerateDateTimeError, { dateAdded: DateTime }> {
    const { date, seconds = 0, minutes = 0, hours = 0, days = 0, months = 0, years = 0 } = parameters

    const nowResult = DateTime.now()
    if (nowResult.isFailure()) {
      return failure(nowResult.value)
    }

    const baseDate = date ?? nowResult.value.now
    const totalMilliseconds: number =
      seconds * MILLISECONDS_PER_SECOND +
      minutes * MILLISECONDS_PER_MINUTE +
      hours * MILLISECONDS_PER_HOUR +
      days * MILLISECONDS_PER_DAY +
      months * MILLISECONDS_PER_MONTH +
      years * MILLISECONDS_PER_YEAR

    const newDate = new Date(baseDate.getTime() + totalMilliseconds)
    return success({ dateAdded: new DateTime({ date: newDate }) })
  }

  /**
   * Adds days to a DateTime. If date is null, uses the current date.
   */
  public static addDays(parameters: { date: DateTime | null; days: number }): Either<InvalidGenerateDateTimeError, { dateAdded: DateTime }> {
    return DateTime.add({ date: parameters.date ?? undefined, days: parameters.days })
  }

  /**
   * Adds minutes to a DateTime. If date is null, uses the current date.
   */
  public static addMinutes(parameters: { date: DateTime | null; minutes: number }): Either<InvalidGenerateDateTimeError, { dateAdded: DateTime }> {
    return DateTime.add({ date: parameters.date ?? undefined, minutes: parameters.minutes })
  }

  // ============================================================================
  // COMPARISON METHODS
  // ============================================================================

  /**
   * Checks if the date is before the current date.
   */
  public static isBeforeNow(parameters: { date: DateTime }): Either<InvalidGenerateDateTimeError, { isBeforeNow: boolean }> {
    const nowResult = DateTime.now()
    if (nowResult.isFailure()) {
      return failure(nowResult.value)
    }

    const isBefore = parameters.date.getTime() < nowResult.value.now.getTime()
    return success({ isBeforeNow: isBefore })
  }

  /**
   * Checks if the date is after the current date.
   */
  public static isAfterNow(parameters: { date: DateTime }): Either<InvalidGenerateDateTimeError, { isAfterNow: boolean }> {
    const nowResult = DateTime.now()
    if (nowResult.isFailure()) return failure(nowResult.value)
    const isAfter = parameters.date.getTime() > nowResult.value.now.getTime()
    return success({ isAfterNow: isAfter })
  }

  /**
   * Checks if two dates represent the same day (ignoring time).
   */
  public static isSameDate(parameters: { firstDate: DateTime; secondDate: DateTime }): Either<InvalidDateTimeError, { isSameDate: boolean }> {
    const { firstDate, secondDate } = parameters

    const firstNormalized = firstDate.setTimeToZero()
    const secondNormalized = secondDate.setTimeToZero()

    const isSameDate = firstNormalized.getTime() === secondNormalized.getTime()
    return success({ isSameDate })
  }

  /**
   * Compares two dates and returns their relationship.
   */
  public static compare(parameters: { firstDate: DateTime; secondDate: DateTime }): {
    comparison: 'before' | 'after' | 'same'
  } {
    const { firstDate, secondDate } = parameters
    const firstTime = firstDate.getTime()
    const secondTime = secondDate.getTime()

    if (firstTime < secondTime) return { comparison: 'before' }
    if (firstTime > secondTime) return { comparison: 'after' }
    return { comparison: 'same' }
  }

  // ============================================================================
  // MONTH VALIDATION AND CONVERSION
  // ============================================================================

  /**
   * Validates an abbreviated month string.
   */
  public static validateAbbreviatedMonth(parameters: {
    abbreviatedMonth: string
  }): Either<InvalidAbbreviatedMonthDateTimeError, { abbreviatedMonthValidated: AbbreviatedMonth }> {
    const { abbreviatedMonth } = parameters
    const upper = abbreviatedMonth.toUpperCase() as AbbreviatedMonth

    if (upper in ABBREVIATED_MONTH_TO_NUMBER_MAP) {
      return success({ abbreviatedMonthValidated: upper })
    }

    return failure(
      new InvalidAbbreviatedMonthDateTimeError({
        abbreviatedMonth,
        motive: InvalidAbbreviatedMonthDateTimeMotive.INVALID_ABBREVIATED_MONTH
      })
    )
  }

  /**
   * Validates a full month string.
   */
  public static validateMonth(parameters: { month: string }): Either<InvalidMonthDateTimeError, { monthValidated: Month }> {
    const { month } = parameters
    const upper = month.toUpperCase() as Month

    if (upper in MONTH_TO_NUMBER_MAP) {
      return success({ monthValidated: upper })
    }

    return failure(new InvalidMonthDateTimeError({ month }))
  }

  /**
   * Returns the first day of a specific month.
   */
  public static getFirstDayOfMonth(parameters: {
    date: { year: number; month: AbbreviatedMonth }
  }): Either<InvalidAbbreviatedMonthDateTimeError, { firstDayOfMonth: Date }> {
    const { year, month } = parameters.date

    if (!(month in ABBREVIATED_MONTH_TO_NUMBER_MAP)) {
      return failure(
        new InvalidAbbreviatedMonthDateTimeError({
          abbreviatedMonth: month,
          motive: InvalidAbbreviatedMonthDateTimeMotive.INVALID_ABBREVIATED_MONTH
        })
      )
    }

    const monthNumber = ABBREVIATED_MONTH_TO_NUMBER_MAP[month]
    const firstDay = new Date(year, monthNumber, 1)

    return success({ firstDayOfMonth: firstDay })
  }

  /**
   * Returns abbreviated month from a number (0-11).
   */
  public static selectMonthAbbreviateByNumber(parameters: {
    monthNumber: number
  }): Either<InvalidMonthNumberDateTimeError, { monthAbbreviated: AbbreviatedMonth }> {
    const { monthNumber } = parameters

    const abbreviatedMonth = NUMBER_TO_ABBREVIATED_MONTH_MAP[monthNumber]
    if (abbreviatedMonth) {
      return success({ monthAbbreviated: abbreviatedMonth })
    }

    return failure(new InvalidMonthNumberDateTimeError({ monthNumber }))
  }

  /**
   * Returns a Month enum value from a number (0-11).
   */
  public static selectMonthByNumber(parameters: { month: number }): Either<InvalidMonthNumberDateTimeError, { monthSelected: Month }> {
    const { month } = parameters

    const selectedMonth = NUMBER_TO_MONTH_MAP[month]
    if (selectedMonth) {
      return success({ monthSelected: selectedMonth })
    }

    return failure(new InvalidMonthNumberDateTimeError({ monthNumber: month }))
  }

  /**
   * Returns the number (0-11) corresponding to a Month.
   */
  public static selectMonthNumber(parameters: { month: Month }): Either<InvalidMonthNumberDateTimeError, { monthNumber: number }> {
    const { month } = parameters

    if (month in MONTH_TO_NUMBER_MAP) {
      return success({ monthNumber: MONTH_TO_NUMBER_MAP[month] })
    }

    return failure(new InvalidMonthNumberDateTimeError({ monthNumber: -1 }))
  }

  /**
   * Returns the number (0-11) corresponding to an AbbreviatedMonth.
   */
  public static selectAbbreviatedMonthNumber(parameters: { month: AbbreviatedMonth }): Either<InvalidMonthDateTimeError, { monthNumber: number }> {
    const { month } = parameters

    if (month in ABBREVIATED_MONTH_TO_NUMBER_MAP) {
      return success({ monthNumber: ABBREVIATED_MONTH_TO_NUMBER_MAP[month] })
    }

    return failure(new InvalidMonthDateTimeError({ month }))
  }
}
