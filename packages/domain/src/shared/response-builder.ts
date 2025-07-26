import { type HttpResponse, type HttpResponseError, type HttpResponseHeaders, type HttpResponseSuccess } from './rest-controller.types'
import { StatusError } from './status-error'
import { type IStatusMapper } from './status-mapper'
import { type StatusSuccess } from './status-success'

export type ResponseBuilderOptions = {
  readonly defaultHeaders?: HttpResponseHeaders
  readonly includeTimestamp?: boolean
  readonly timestampKey?: string
}

export interface IResponseBuilder {
  buildErrorResponse<TError extends HttpResponseError>(parameters: { error: TError; headers?: HttpResponseHeaders }): HttpResponse<TError>

  buildSuccessResponse<TData>(parameters: {
    data: TData
    status: StatusSuccess
    headers?: HttpResponseHeaders
  }): HttpResponse<HttpResponseSuccess<TData>>
}

export class ResponseBuilder implements IResponseBuilder {
  private readonly defaultHeaders: HttpResponseHeaders
  private readonly includeTimestamp: boolean
  private readonly timestampKey: string

  constructor(
    private readonly statusMapper: IStatusMapper,
    options: ResponseBuilderOptions = {}
  ) {
    this.defaultHeaders = options.defaultHeaders ?? {}
    this.includeTimestamp = options.includeTimestamp ?? false
    this.timestampKey = options.timestampKey ?? 'timestamp'
  }

  public buildErrorResponse<TError extends HttpResponseError>(parameters: { error: TError; headers?: HttpResponseHeaders }): HttpResponse<TError> {
    const { error, headers } = parameters

    const responseHeaders = this.mergeHeaders({ additionalHeaders: headers })
    const statusCode = this.statusMapper.mapToHttpStatusCode({ status: error.status })
    const errorData = this.includeTimestamp ? ({ ...error, [this.timestampKey]: new Date().toISOString() } as TError) : error
    return {
      statusCode,
      data: errorData,
      headers: responseHeaders
    }
  }

  public buildSuccessResponse<TData>(parameters: {
    data: TData
    status: StatusSuccess
    headers?: HttpResponseHeaders
  }): HttpResponse<HttpResponseSuccess<TData>> {
    const { data, status, headers } = parameters
    const responseHeaders = this.mergeHeaders({ additionalHeaders: headers })
    const statusCode = this.statusMapper.mapToHttpStatusCode({ status })
    const successData: HttpResponseSuccess<TData> = {
      success: data,
      status
    }
    const responseData = this.includeTimestamp ? { ...successData, [this.timestampKey]: new Date().toISOString() } : successData
    return {
      statusCode,
      data: responseData,
      headers: responseHeaders
    }
  }

  public buildCustomResponse<TData>(parameters: {
    data: TData
    status: StatusError | StatusSuccess
    headers?: HttpResponseHeaders
  }): HttpResponse<TData> {
    const responseHeaders = this.mergeHeaders({
      additionalHeaders: parameters.headers
    })
    const statusCode = this.statusMapper.mapToHttpStatusCode({ status: parameters.status })
    const responseData = this.includeTimestamp
      ? ({ ...(parameters.data as object), [this.timestampKey]: new Date().toISOString() } as TData)
      : parameters.data
    return {
      statusCode,
      data: responseData,
      headers: responseHeaders
    }
  }

  public buildInternalErrorResponse(parameters: { errorMessage?: string; headers?: HttpResponseHeaders }): HttpResponse<HttpResponseError> {
    return this.buildErrorResponse({
      error: {
        errorMessage: parameters.errorMessage ?? 'Internal server error occurred',
        status: StatusError.INTERNAL_ERROR
      },
      headers: parameters.headers
    })
  }

  public setDefaultHeader(key: string, value: string | string[]): void {
    ;(this.defaultHeaders as Record<string, string | string[]>)[key] = value
  }

  public removeDefaultHeader(key: string): void {
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete -- this is a valid use case
    delete (this.defaultHeaders as Record<string, string | string[]>)[key]
  }

  private mergeHeaders(parameters: { additionalHeaders?: HttpResponseHeaders }): HttpResponseHeaders {
    if (!parameters.additionalHeaders || Object.keys(parameters.additionalHeaders).length === 0) {
      return this.defaultHeaders
    }
    return {
      ...this.defaultHeaders,
      ...parameters.additionalHeaders
    }
  }

  public static createDefault(parameters: { statusMapper: IStatusMapper }): ResponseBuilder {
    return new ResponseBuilder(parameters.statusMapper, {
      defaultHeaders: {
        'Content-Type': 'application/json',
        'X-Powered-By': 'GitHub Search API'
      },
      includeTimestamp: true
    })
  }

  public static createMinimal(parameters: { statusMapper: IStatusMapper }): ResponseBuilder {
    return new ResponseBuilder(parameters.statusMapper, {
      includeTimestamp: false,
      defaultHeaders: {
        'Content-Type': 'application/json'
      }
    })
  }
}
