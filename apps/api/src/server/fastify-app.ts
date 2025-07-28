import { fastifyCors } from '@fastify/cors'
import fastifyMultipart from '@fastify/multipart'
import rateLimit from '@fastify/rate-limit'
import { fastifySwagger } from '@fastify/swagger'
import { fastifySwaggerUi } from '@fastify/swagger-ui'
import { type ISendLogErrorLoggerProvider, type ISendLogInfoLoggerProvider } from '@github-search/domain'
import { apiENV } from '@github-search/env'
import { makeLoggerProvider } from '@github-search/logger'
import { HttpStatusCode } from '@github-search/utils'
import { fastify, type FastifyError, type FastifyInstance } from 'fastify'
import {
  createJsonSchemaTransformObject,
  hasZodFastifySchemaValidationErrors,
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider
} from 'fastify-type-provider-zod'
import { SwaggerTheme, SwaggerThemeNameEnum } from 'swagger-themes'

import pkg from '../../package.json'

import { fastifyRoutes } from './routes/fastify-routes'

export class FastifyFramework {
  public app: FastifyInstance
  private readonly port: number = apiENV.PORT
  private readonly loggerProvider: ISendLogErrorLoggerProvider & ISendLogInfoLoggerProvider

  constructor() {
    this.loggerProvider = makeLoggerProvider()
    this.app = fastify().withTypeProvider<ZodTypeProvider>()
    this.app.register(fastifyMultipart)
    this.app.register(rateLimit, {
      max: 100,
      timeWindow: '1 minute',
      hook: 'preHandler',
      keyGenerator: (req) => req.ip
    })
    this.setupValidation()
    this.setupCors()
    this.setupSwagger()
    this.setupErrorHandler()
    this.setupRoutes()
  }

  public async execute(): Promise<FastifyInstance> {
    try {
      await this.app.listen({
        port: this.port,
        host: '0.0.0.0'
      })
      this.loggerProvider.sendLogInfo({
        message: `Server is running... 🚀 in port ${this.port}`
      })
      return this.app
    } catch (error) {
      this.loggerProvider.sendLogError({
        message: 'Error starting server',
        value: error
      })
      throw new Error('Failed to start server')
    }
  }

  private setupValidation(): void {
    this.app.setValidatorCompiler(validatorCompiler)
    this.app.setSerializerCompiler(serializerCompiler)
  }

  private setupCors(): void {
    this.app.register(fastifyCors, { origin: apiENV.CORS_ORIGIN })
  }

  private setupSwagger(): void {
    this.app.register(fastifySwagger, {
      openapi: {
        info: {
          title: 'Github Search API',
          description: 'Github Search API',
          version: pkg.version
        }
      },
      transform: jsonSchemaTransform,
      transformObject: createJsonSchemaTransformObject({})
    })

    const theme = new SwaggerTheme()
    const content = theme.getBuffer(SwaggerThemeNameEnum.ONE_DARK)

    this.app.register(fastifySwaggerUi, {
      routePrefix: '/docs',
      uiConfig: {
        docExpansion: 'full',
        deepLinking: true,
        syntaxHighlight: { theme: 'nord', activate: true }
      },
      theme: { css: [{ filename: 'theme.css', content }] }
    })
  }

  private setupErrorHandler(): void {
    this.app.setErrorHandler((error: FastifyError, request, reply) => {
      if (hasZodFastifySchemaValidationErrors(error)) {
        return reply.status(HttpStatusCode.NOT_ACCEPTABLE).send({
          status: 'error',
          error: {
            message: 'Invalid request data',
            details: {
              issues: error.validation,
              method: request.method,
              url: request.url
            }
          }
        })
      }

      if (error.statusCode && error.statusCode >= 500) {
        this.loggerProvider.sendLogError({
          message: `Unhandled error: ${error.message}`,
          value: error
        })
      }

      return reply.status(error.statusCode ?? 500).send({
        status: 'error',
        error: {
          message: error.message || 'Internal Server Error',
          code: error.code
        }
      })
    })
  }

  private setupRoutes(): void {
    this.app.register(fastifyRoutes)
  }
}
