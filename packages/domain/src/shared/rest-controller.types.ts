import { type Readable } from 'node:stream'

import { type HttpStatusCode } from '@github-search/utils'

import { type StatusError } from './status-error'
import { type StatusSuccess } from './status-success'

export type HttpResponseError = {
  readonly errorMessage: string
  readonly status: StatusError
}

export type HttpResponseSuccess<T = unknown> = {
  readonly success: T
  readonly status: StatusSuccess
}

export type HttpResponseHeaders = Readonly<Record<string, string | string[] | undefined>>

export type HttpResponse<TData = unknown> = {
  readonly statusCode: HttpStatusCode
  readonly data: TData
  readonly headers?: HttpResponseHeaders
}

export type HttpRequest<
  TBody = unknown,
  TQuery = Record<string, unknown>,
  TParams = Record<string, unknown>,
  THeaders extends Record<string, string | string[] | undefined> = Record<string, string | string[] | undefined>
> = {
  readonly body: TBody
  readonly query: TQuery
  readonly params: TParams
  readonly headers: THeaders
  readonly accessToken: string
  readonly file?: FileUpload
}

export type FileUpload = {
  readonly type: 'file'
  readonly fieldname: string
  readonly filename: string
  readonly encoding: string
  readonly mimetype: string
  toBuffer(): Promise<Buffer>
  readonly file: Readable
}

export type ControllerResponse<TData = unknown> = Promise<HttpResponse<TData>>

export interface IController<TRequest = unknown, TResponse = unknown> {
  handle(request: TRequest): ControllerResponse<TResponse>
}

export type PerformanceMetrics<TRequest = unknown, TResponse = unknown> = {
  readonly request: TRequest
  readonly response: TResponse
  readonly startTime: number
  readonly endTime: number
  readonly runtimeMs: number
  readonly success: boolean
  readonly controllerName: string
}

export type LoggingContext = {
  readonly controllerName: string
  readonly method: string
  readonly correlationId?: string
}
