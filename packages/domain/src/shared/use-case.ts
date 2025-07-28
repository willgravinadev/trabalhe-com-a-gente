import { performance } from 'node:perf_hooks'

import { type ISendLogErrorLoggerProvider } from '@contracts/providers/logger/send-log-error.logger-provider'
import { type ISendLogTimeUseCaseLoggerProvider } from '@contracts/providers/logger/send-log-time-use-case.logger-provider'
import { type Either } from '@github-search/utils'

import { SensitiveDataSanitizer } from './sensitive-data-sanitizer'

export abstract class UseCase<Parameters, ResultFailure, ResultSuccess> {
  private readonly dataSanitizer: SensitiveDataSanitizer

  constructor(public readonly loggerProvider: ISendLogTimeUseCaseLoggerProvider & ISendLogErrorLoggerProvider) {
    this.dataSanitizer = new SensitiveDataSanitizer()
  }

  public async execute(parameters: Parameters): Promise<Either<ResultFailure, ResultSuccess>> {
    const startTime = performance.now()

    try {
      const response = await this.performOperation(parameters)
      const runtimeInMs = performance.now() - startTime

      this.loggerProvider.sendLogTimeUseCase({
        message: `${this.constructor.name} took +${runtimeInMs} ms to execute!`,
        parameters: this.dataSanitizer.sanitize(parameters),
        runtimeInMs,
        useCaseName: this.constructor.name,
        isSuccess: response.isSuccess()
      })

      return response
    } catch (error: unknown) {
      const runtimeInMs = performance.now() - startTime

      this.loggerProvider.sendLogError({
        message: `Unexpected error in ${this.constructor.name}: ${this.extractErrorMessage(error)}`,
        value: error
      })

      this.loggerProvider.sendLogTimeUseCase({
        message: `${this.constructor.name} failed after +${runtimeInMs} ms`,
        parameters: this.dataSanitizer.sanitize(parameters),
        runtimeInMs,
        useCaseName: this.constructor.name,
        isSuccess: false
      })

      throw error
    }
  }

  protected abstract performOperation(parameters: Parameters): Promise<Either<ResultFailure, ResultSuccess>>

  private extractErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message
    }

    if (typeof error === 'string') {
      return error
    }

    if (error && typeof error === 'object' && 'errorMessage' in error) {
      const message = (error as { errorMessage: unknown }).errorMessage
      if (typeof message === 'string') {
        return message
      }
    }

    return 'An unexpected error occurred'
  }
}
