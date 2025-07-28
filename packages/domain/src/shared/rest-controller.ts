import type { IPerformanceTracker } from './performance-tracker'
import type { IResponseBuilder } from './response-builder'
import type { ControllerResponse, HttpResponse, HttpResponseError, HttpResponseSuccess, LoggingContext } from './rest-controller.types'
import type { ISensitiveDataSanitizer } from './sensitive-data-sanitizer'
import type { IStatusMapper } from './status-mapper'
import type { ISendLogErrorLoggerProvider } from '@contracts/providers/logger/send-log-error.logger-provider'
import type { ISendLogTimeControllerLoggerProvider } from '@contracts/providers/logger/send-log-time-controller.logger-provider'

import { type Either } from '@github-search/utils'

import { PerformanceTracker } from './performance-tracker'
import { ResponseBuilder } from './response-builder'
import { SensitiveDataSanitizer } from './sensitive-data-sanitizer'
import { StatusError } from './status-error'
import { StatusMapper } from './status-mapper'

export type RestControllerOptions = {
  readonly controllerName?: string
  readonly sensitiveDataSanitizer?: ISensitiveDataSanitizer
  readonly statusMapper?: IStatusMapper
  readonly responseBuilder?: IResponseBuilder
  readonly performanceTracker?: IPerformanceTracker
  readonly enableErrorRecovery?: boolean
  readonly correlationIdHeader?: string
}

export type ControllerConstraints<TRequest, TFailure, TSuccess> = {
  request: TRequest
  failure: TFailure extends HttpResponseError ? TFailure : never
  success: TSuccess extends HttpResponseSuccess ? TSuccess : never
}

export abstract class RestController<TRequest, TFailure extends HttpResponseError, TSuccess extends HttpResponseSuccess> {
  protected readonly controllerName: string
  protected readonly sensitiveDataSanitizer: ISensitiveDataSanitizer
  protected readonly statusMapper: IStatusMapper
  protected readonly responseBuilder: IResponseBuilder
  protected readonly performanceTracker: IPerformanceTracker
  protected readonly enableErrorRecovery: boolean
  protected readonly correlationIdHeader: string

  constructor(
    protected readonly loggerProvider: ISendLogErrorLoggerProvider & ISendLogTimeControllerLoggerProvider,
    options: RestControllerOptions = {}
  ) {
    this.controllerName = options.controllerName ?? this.constructor.name
    this.sensitiveDataSanitizer = options.sensitiveDataSanitizer ?? new SensitiveDataSanitizer()
    this.statusMapper = options.statusMapper ?? StatusMapper.createDefault()
    this.responseBuilder =
      options.responseBuilder ??
      ResponseBuilder.createDefault({
        statusMapper: this.statusMapper
      })
    this.performanceTracker = options.performanceTracker ?? PerformanceTracker.createDefault(this.loggerProvider, this.sensitiveDataSanitizer)
    this.enableErrorRecovery = options.enableErrorRecovery ?? true
    this.correlationIdHeader = options.correlationIdHeader ?? 'x-correlation-id'
  }

  protected abstract performOperation(request: TRequest): Promise<Either<TFailure, TSuccess>>

  public async handle(request: TRequest): ControllerResponse<TFailure | TSuccess> {
    const context = this.createLoggingContext(request)
    const session = this.performanceTracker.startTracking()

    try {
      const result = await this.performOperation(request)

      if (result.isFailure()) {
        const errorResponse = this.responseBuilder.buildErrorResponse({ error: result.value })
        this.logError(result.value, context)
        this.trackPerformance(request, errorResponse.data, context, false, session.startTime)
        return errorResponse
      }

      const successResponse = this.responseBuilder.buildSuccessResponse({
        data: result.value.success,
        status: result.value.status
      }) as HttpResponse<TSuccess>
      this.trackPerformance(request, successResponse.data, context, true, session.startTime)
      return successResponse
    } catch (error: unknown) {
      return this.handleUnexpectedError(error, request, context, session.startTime)
    }
  }

  protected handleUnexpectedError(error: unknown, request: TRequest, context: LoggingContext, startTime: number): HttpResponse<TFailure> {
    const errorMessage = this.extractErrorMessage(error)
    this.logError(error, context)

    const genericError = this.createGenericError(errorMessage)
    const errorResponse = this.responseBuilder.buildErrorResponse({ error: genericError })
    this.trackPerformance(request, errorResponse.data, context, false, startTime)

    return errorResponse
  }

  protected extractCorrelationId(request: TRequest): string | undefined {
    if (request && typeof request === 'object' && 'headers' in request) {
      const headers = (request as { headers: Record<string, unknown> }).headers
      if (typeof headers === 'object') {
        const correlationId = headers[this.correlationIdHeader]
        return typeof correlationId === 'string' ? correlationId : undefined
      }
    }
    return undefined
  }

  protected createLoggingContext(request: TRequest): LoggingContext {
    return {
      controllerName: this.controllerName,
      method: 'handle',
      correlationId: this.extractCorrelationId(request)
    }
  }

  protected logError(error: unknown, context: LoggingContext): void {
    const errorMessage = `${context.controllerName}.${context.method}() error`
    const correlationInfo = context.correlationId ? ` [CorrelationId: ${context.correlationId}]` : ''

    this.loggerProvider.sendLogError({
      message: `${errorMessage}${correlationInfo}`,
      value: error
    })
  }

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters -- it's a valid use case
  protected trackPerformance<TResponse>(request: TRequest, response: TResponse, context: LoggingContext, success: boolean, startTime: number): void {
    this.performanceTracker.trackRequest({
      request,
      response,
      context,
      success,
      startTime
    })
  }

  protected extractErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message
    }

    if (typeof error === 'string') {
      return error
    }

    if (error && typeof error === 'object' && 'message' in error) {
      const message = (error as { message: unknown }).message
      if (typeof message === 'string') {
        return message
      }
    }

    return 'An unexpected error occurred'
  }

  protected createGenericError(message: string): TFailure {
    return {
      errorMessage: message,
      status: StatusError.INTERNAL_ERROR
    } as TFailure
  }
}
