import { type InvalidGenerateDateTimeError } from '@errors/value-objects/date-time/invalid-generate-date-time.error'
import { InvalidEmailError } from '@errors/value-objects/email/invalid-email.error'
import { type GenerateIDError } from '@errors/value-objects/id/generate-id.error'
import { type Either, failure, success } from '@github-search/utils'

export class Email {
  public readonly value: string

  private constructor(parameters: { email: string }) {
    this.value = parameters.email.toLowerCase().trim()
    Object.freeze(this)
  }

  public static getDomain(parameters: { email: Email }): Either<InvalidEmailError, { domain: string }> {
    const atSymbolCount = (parameters.email.value.match(/@/g) ?? []).length

    if (atSymbolCount !== 1) {
      return failure(new InvalidEmailError({ email: parameters.email.value }))
    }

    const [, domain] = parameters.email.value.split('@')
    if (!domain || domain.trim() === '') {
      return failure(new InvalidEmailError({ email: parameters.email.value }))
    }

    return success({ domain })
  }

  public static validateEmailAddress(parameters: { email: string }): Either<InvalidEmailError, { emailValidated: Email }> {
    const emailFormatted = parameters.email.toLowerCase().trim()

    const MAX_EMAIL_SIZE = 320

    if (
      Email.emptyOrTooLarge({
        string: emailFormatted,
        maxSize: MAX_EMAIL_SIZE
      }) ||
      Email.nonConformant(emailFormatted)
    ) {
      return failure(new InvalidEmailError({ email: emailFormatted }))
    }

    const [local, domain] = emailFormatted.split('@')
    const MAX_LOCAL_SIZE = 64
    const MAX_DOMAIN_SIZE = 255

    if (!local || local.trim() === '') {
      return failure(new InvalidEmailError({ email: emailFormatted }))
    }

    if (!domain || domain.trim() === '') {
      return failure(new InvalidEmailError({ email: emailFormatted }))
    }

    if (
      Email.emptyOrTooLarge({
        string: local,
        maxSize: MAX_LOCAL_SIZE
      }) ||
      Email.emptyOrTooLarge({
        string: domain,
        maxSize: MAX_DOMAIN_SIZE
      })
    ) {
      return failure(new InvalidEmailError({ email: emailFormatted }))
    }

    if (Email.somePartIsTooLargeIn(domain)) {
      return failure(new InvalidEmailError({ email: emailFormatted }))
    }

    return success({ emailValidated: new Email({ email: emailFormatted }) })
  }

  private static emptyOrTooLarge(parameters: { string: string; maxSize: number }): boolean {
    return !parameters.string || parameters.string.length > parameters.maxSize
  }

  private static nonConformant(email: string): boolean {
    // biome-ignore lint/performance/useTopLevelRegex: <explanation>
    const emailRegex = /^[\w!#$%&'*+/=?^`{|}~-](\.?[\w!#$%&'*+/=?^`{|}~-])*@[\dA-Za-z](-*\.?[\dA-Za-z])*\.[A-Za-z](-?[\dA-Za-z])+$/
    return !emailRegex.test(email)
  }

  private static somePartIsTooLargeIn(domain: string): boolean {
    const maxPartSize = 63
    const domainParts = domain.split('.')
    return domainParts.some((part) => part.length > maxPartSize)
  }

  public static createNewEmail(parameters: {
    email: string
  }): Either<GenerateIDError | InvalidEmailError | InvalidGenerateDateTimeError, { emailCreated: Email }> {
    const resultValidateEmailAddress = Email.validateEmailAddress({ email: parameters.email })
    if (resultValidateEmailAddress.isFailure()) {
      return failure(resultValidateEmailAddress.value)
    }
    const { emailValidated } = resultValidateEmailAddress.value

    return success({ emailCreated: new Email({ email: emailValidated.value }) })
  }

  public equals(parameters: { emailToCompare: Pick<Email, 'value'> }): boolean {
    return this.value.toLowerCase().trim() === parameters.emailToCompare.value.toLowerCase().trim()
  }
}
