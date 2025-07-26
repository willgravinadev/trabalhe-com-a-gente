import { HttpStatusCode } from '@github-search/utils'

import { StatusError } from './status-error'
import { StatusSuccess } from './status-success'

export interface IStatusMapper {
  mapToHttpStatusCode(parameters: { status: StatusError | StatusSuccess }): HttpStatusCode
  registerCustomMapping(parameters: { status: StatusError | StatusSuccess; httpCode: HttpStatusCode }): void
}

export type StatusMapperOptions = {
  readonly customMappings?: ReadonlyMap<StatusError | StatusSuccess, HttpStatusCode>
}

export class StatusMapper implements IStatusMapper {
  private readonly statusMap: Map<StatusError | StatusSuccess, HttpStatusCode>

  private static readonly DEFAULT_ERROR_MAPPINGS: ReadonlyMap<StatusError, HttpStatusCode> = new Map([
    [StatusError.CONFLICT, HttpStatusCode.CONFLICT],
    [StatusError.INVALID, HttpStatusCode.BAD_REQUEST],
    [StatusError.NOT_FOUND, HttpStatusCode.NOT_FOUND],
    [StatusError.NOT_EXISTS, HttpStatusCode.NOT_FOUND],
    [StatusError.UNAUTHORIZED, HttpStatusCode.UNAUTHORIZED],
    [StatusError.PROVIDER_ERROR, HttpStatusCode.INTERNAL_SERVER_ERROR],
    [StatusError.REPOSITORY_ERROR, HttpStatusCode.INTERNAL_SERVER_ERROR],
    [StatusError.INTERNAL_ERROR, HttpStatusCode.INTERNAL_SERVER_ERROR],
    [StatusError.TOO_MANY_REQUESTS, HttpStatusCode.TOO_MANY_REQUESTS]
  ])

  private static readonly DEFAULT_SUCCESS_MAPPINGS: ReadonlyMap<StatusSuccess, HttpStatusCode> = new Map([
    [StatusSuccess.CREATED, HttpStatusCode.CREATED],
    [StatusSuccess.DONE, HttpStatusCode.OK],
    [StatusSuccess.UPDATED, HttpStatusCode.OK],
    [StatusSuccess.DELETED, HttpStatusCode.OK]
  ])

  constructor(options: StatusMapperOptions = {}) {
    this.statusMap = new Map([
      ...StatusMapper.DEFAULT_ERROR_MAPPINGS,
      ...StatusMapper.DEFAULT_SUCCESS_MAPPINGS,
      ...(options.customMappings ?? new Map())
    ])
  }

  public mapToHttpStatusCode(parameters: { status: StatusError | StatusSuccess }): HttpStatusCode {
    const { status } = parameters
    const httpCode = this.statusMap.get(status)
    if (httpCode === undefined) {
      console.warn(`Unknown status: ${status}. Falling back to INTERNAL_SERVER_ERROR`)
      return HttpStatusCode.INTERNAL_SERVER_ERROR
    }
    return httpCode
  }

  public registerCustomMapping(parameters: { status: StatusError | StatusSuccess; httpCode: HttpStatusCode }): void {
    this.statusMap.set(parameters.status, parameters.httpCode)
  }

  public getAllMappings(): ReadonlyMap<StatusError | StatusSuccess, HttpStatusCode> {
    return new Map(this.statusMap)
  }

  public hasMapping(parameters: { status: StatusError | StatusSuccess }): boolean {
    return this.statusMap.has(parameters.status)
  }

  public static createDefault(): StatusMapper {
    return new StatusMapper()
  }

  public static withCustomErrorMappings(parameters: { customErrorMappings: ReadonlyMap<StatusError, HttpStatusCode> }): StatusMapper {
    return new StatusMapper({
      customMappings: new Map([...StatusMapper.DEFAULT_ERROR_MAPPINGS, ...parameters.customErrorMappings])
    })
  }

  public static withCustomSuccessMappings(parameters: { customSuccessMappings: ReadonlyMap<StatusSuccess, HttpStatusCode> }): StatusMapper {
    return new StatusMapper({
      customMappings: new Map([...StatusMapper.DEFAULT_SUCCESS_MAPPINGS, ...parameters.customSuccessMappings])
    })
  }
}
