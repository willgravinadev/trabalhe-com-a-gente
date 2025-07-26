/**
 * Interface for handling sensitive data sanitization
 */
export interface ISensitiveDataSanitizer {
  sanitize(data: unknown): string
  isSensitiveField(key: string): boolean
  addSensitiveField(field: string): void
  removeSensitiveField(field: string): void
}

/**
 * Configuration options for sensitive data sanitization
 */
export interface SensitiveDataSanitizerOptions {
  readonly redactionText?: string
  readonly maxDepth?: number
  readonly additionalSensitiveFields?: readonly string[]
}

/**
 * Enhanced sensitive data sanitizer with better performance and configurability
 */
export class SensitiveDataSanitizer implements ISensitiveDataSanitizer {
  private readonly sensitiveFields: Set<string>
  private readonly redactionText: string

  private static readonly DEFAULT_SENSITIVE_FIELDS = [
    'password',
    'token',
    'access_token',
    'refresh_token',
    'secret',
    'api_key',
    'private_key',
    'authorization',
    'auth',
    'bearer',
    'credential',
    'credentials',
    'key',
    'pass',
    'pwd',
    'security_token',
    'session_token',
    'csrf_token'
  ] as const

  constructor(options: SensitiveDataSanitizerOptions = {}) {
    this.redactionText = options.redactionText ?? '[REDACTED]'
    this.sensitiveFields = new Set([...SensitiveDataSanitizer.DEFAULT_SENSITIVE_FIELDS, ...(options.additionalSensitiveFields ?? [])])
  }

  public sanitize(data: unknown): string {
    try {
      return JSON.stringify(data, this.createReplacerFunction(), 2)
    } catch {
      return this.sanitizeCircularSafe(data)
    }
  }

  public isSensitiveField(key: string): boolean {
    const normalizedKey = key.toLowerCase().trim()
    return this.sensitiveFields.has(normalizedKey) || this.containsSensitivePattern(normalizedKey)
  }

  public addSensitiveField(field: string): void {
    this.sensitiveFields.add(field.toLowerCase().trim())
  }

  public removeSensitiveField(field: string): void {
    this.sensitiveFields.delete(field.toLowerCase().trim())
  }

  private createReplacerFunction(): (key: string, value: unknown) => unknown {
    const visited = new WeakSet()
    return (key: string, value: unknown): unknown => {
      if (typeof value === 'object' && value !== null) {
        if (visited.has(value)) return '[CIRCULAR_REFERENCE]'
        visited.add(value)
      }

      if (key && this.isSensitiveField(key)) return this.redactionText

      if (value instanceof Date) return value.toISOString()

      if (value instanceof Error) {
        return {
          name: value.name,
          message: value.message,
          stack: value.stack
        }
      }

      return value
    }
  }

  private containsSensitivePattern(key: string): boolean {
    const sensitivePatterns: RegExp[] = [/password/i, /token/i, /secret/i, /key/i, /auth/i, /credential/i]

    return sensitivePatterns.some((pattern) => pattern.test(key))
  }

  private sanitizeCircularSafe(data: unknown): string {
    try {
      if (data === null || data === undefined) return String(data)

      if (typeof data === 'string' || typeof data === 'number' || typeof data === 'boolean') return String(data)

      if (Array.isArray(data)) return `[Array with ${data.length} items]`

      if (typeof data === 'object') {
        const keys = Object.keys(data as Record<string, unknown>)
        const sanitizedKeys = keys.filter((key) => !this.isSensitiveField(key))
        return `{Object with keys: ${sanitizedKeys.join(', ')}}`
      }

      return '[UNSERIALIZABLE_DATA]'
    } catch {
      return '[SANITIZATION_ERROR]'
    }
  }
}
