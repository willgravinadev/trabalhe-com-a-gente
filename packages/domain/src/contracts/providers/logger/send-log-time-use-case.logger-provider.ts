export namespace SendLogTimeUseCaseLoggerProviderDTO {
  export type Parameters = Readonly<{
    message: string
    runtimeInMs: number
    useCaseName: string
    parameters: string
    isSuccess: boolean
  }>
  export type Result = Readonly<null>
}

export interface ISendLogTimeUseCaseLoggerProvider {
  sendLogTimeUseCase(parameters: SendLogTimeUseCaseLoggerProviderDTO.Parameters): SendLogTimeUseCaseLoggerProviderDTO.Result
}
