import { performance } from 'node:perf_hooks'

import { type ISendLogTimeControllerLoggerProvider } from '@contracts/providers/logger/send-log-time-controller.logger-provider'

import { type LoggingContext, type PerformanceMetrics } from './rest-controller.types'
import { type ISensitiveDataSanitizer } from './sensitive-data-sanitizer'

export type PerformanceTrackerOptions = {
  readonly enableLogging?: boolean
  readonly logSlowRequests?: boolean
  readonly slowRequestThresholdMs?: number
  readonly includeRequestData?: boolean
  readonly includeResponseData?: boolean
}

export interface IPerformanceTracker {
  startTracking(): PerformanceSession
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters -- this is a valid use case
  trackRequest<TRequest, TResponse>(parameters: {
    request: TRequest
    response: TResponse
    context: LoggingContext
    success: boolean
    startTime: number
  }): void
}

export type PerformanceSession = {
  readonly startTime: number
  readonly sessionId: string
  end(): number
}

class PerformanceSessionImpl implements PerformanceSession {
  public readonly startTime: number
  public readonly sessionId: string

  constructor() {
    this.startTime = performance.now()
    this.sessionId = this.generateSessionId()
  }

  public end(): number {
    return performance.now() - this.startTime
  }

  private generateSessionId(): string {
    return `perf_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
  }
}

/**
 * Tracks performance metrics for REST controllers
 */
export class PerformanceTracker implements IPerformanceTracker {
  private readonly enableLogging: boolean
  private readonly logSlowRequests: boolean
  private readonly slowRequestThresholdMs: number
  private readonly includeRequestData: boolean
  private readonly includeResponseData: boolean

  constructor(
    private readonly loggerProvider: ISendLogTimeControllerLoggerProvider,
    private readonly dataSanitizer: ISensitiveDataSanitizer,
    options: PerformanceTrackerOptions = {}
  ) {
    this.enableLogging = options.enableLogging ?? true
    this.logSlowRequests = options.logSlowRequests ?? true
    this.slowRequestThresholdMs = options.slowRequestThresholdMs ?? 1000 // 1 second
    this.includeRequestData = options.includeRequestData ?? true
    this.includeResponseData = options.includeResponseData ?? true
  }

  public startTracking(): PerformanceSession {
    return new PerformanceSessionImpl()
  }

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters -- this is a valid use case
  public trackRequest<TRequest, TResponse>(parameters: {
    request: TRequest
    response: TResponse
    context: LoggingContext
    success: boolean
    startTime: number
  }): void {
    if (!this.enableLogging) {
      return
    }

    const endTime = performance.now()
    const runtimeMs = endTime - parameters.startTime

    const metrics: PerformanceMetrics<TRequest, TResponse> = {
      request: parameters.request,
      response: parameters.response,
      startTime: parameters.startTime,
      endTime: endTime,
      runtimeMs,
      success: parameters.success,
      controllerName: parameters.context.controllerName
    }

    this.logMetrics({ metrics, context: parameters.context })

    if (this.logSlowRequests && this.isSlowRequest(runtimeMs)) {
      this.logSlowRequest({ metrics, context: parameters.context })
    }
  }

  private logMetrics<TRequest, TResponse>(parameters: { metrics: PerformanceMetrics<TRequest, TResponse>; context: LoggingContext }): void {
    const sanitizedRequest = this.includeRequestData ? this.dataSanitizer.sanitize(parameters.metrics.request) : '[REQUEST_LOGGING_DISABLED]'

    const sanitizedResponse = this.includeResponseData ? this.dataSanitizer.sanitize(parameters.metrics.response) : '[RESPONSE_LOGGING_DISABLED]'

    const message = this.buildLogMessage({ metrics: parameters.metrics, context: parameters.context })

    this.loggerProvider.sendLogTimeController({
      message,
      controllerName: parameters.metrics.controllerName,
      runtimeInMs: parameters.metrics.runtimeMs,
      httpRequest: sanitizedRequest,
      httpResponse: sanitizedResponse,
      isSuccess: parameters.metrics.success
    })
  }

  private logSlowRequest<TRequest, TResponse>(parameters: { metrics: PerformanceMetrics<TRequest, TResponse>; context: LoggingContext }): void {
    const message = `SLOW REQUEST: ${this.buildLogMessage({ metrics: parameters.metrics, context: parameters.context })}`

    this.loggerProvider.sendLogTimeController({
      message,
      controllerName: parameters.metrics.controllerName,
      runtimeInMs: parameters.metrics.runtimeMs,
      httpRequest: this.dataSanitizer.sanitize(parameters.metrics.request),
      httpResponse: this.dataSanitizer.sanitize(parameters.metrics.response),
      isSuccess: parameters.metrics.success
    })
  }

  private buildLogMessage<TRequest, TResponse>(parameters: { metrics: PerformanceMetrics<TRequest, TResponse>; context: LoggingContext }): string {
    const statusText = parameters.metrics.success ? 'SUCCESS' : 'FAILURE'
    const formattedRuntime = parameters.metrics.runtimeMs.toFixed(2)

    let message = `${parameters.metrics.controllerName}.${parameters.context.method}() executed in ${formattedRuntime}ms [${statusText}]`

    if (parameters.context.correlationId) {
      message += ` [CorrelationId: ${parameters.context.correlationId}]`
    }

    return message
  }

  private isSlowRequest(runtimeMs: number): boolean {
    return runtimeMs > this.slowRequestThresholdMs
  }

  public static createDefault(loggerProvider: ISendLogTimeControllerLoggerProvider, dataSanitizer: ISensitiveDataSanitizer): PerformanceTracker {
    return new PerformanceTracker(loggerProvider, dataSanitizer, {
      enableLogging: true,
      logSlowRequests: true,
      slowRequestThresholdMs: 1000,
      includeRequestData: true,
      includeResponseData: true
    })
  }

  public static createProductionOptimized(
    loggerProvider: ISendLogTimeControllerLoggerProvider,
    dataSanitizer: ISensitiveDataSanitizer
  ): PerformanceTracker {
    return new PerformanceTracker(loggerProvider, dataSanitizer, {
      enableLogging: true,
      logSlowRequests: true,
      slowRequestThresholdMs: 500, // More aggressive for production
      includeRequestData: false, // Don't log request data in production
      includeResponseData: false // Don't log response data in production
    })
  }
}
