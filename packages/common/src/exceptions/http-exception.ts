/**
 * Options for HTTP exceptions.
 */
export interface HttpExceptionOptions {
  /**
   * The underlying cause of the exception.
   */
  cause?: Error;

  /**
   * Additional error description.
   */
  description?: string;
}

/**
 * Response object for HTTP exceptions.
 */
export type HttpExceptionResponse = string | Record<string, any>;

/**
 * Base class for HTTP exceptions.
 *
 * @example
 * ```typescript
 * throw new HttpException('Custom error', HttpStatus.BAD_REQUEST);
 * ```
 *
 * @example
 * ```typescript
 * throw new HttpException(
 *   { message: 'Validation failed', errors: [...] },
 *   HttpStatus.UNPROCESSABLE_ENTITY
 * );
 * ```
 */
export class HttpException extends Error {
  /**
   * Creates an HTTP exception.
   *
   * @param response - The error response (string or object)
   * @param status - HTTP status code
   * @param options - Additional options
   */
  constructor(
    private readonly response: HttpExceptionResponse,
    private readonly status: number,
    options?: HttpExceptionOptions,
  ) {
    super();
    this.initMessage();
    this.initName();
    this.initCause(options?.cause);
  }

  /**
   * Gets the HTTP status code.
   */
  getStatus(): number {
    return this.status;
  }

  /**
   * Gets the error response.
   */
  getResponse(): HttpExceptionResponse {
    return this.response;
  }

  /**
   * Initializes the error message.
   */
  private initMessage(): void {
    if (typeof this.response === 'string') {
      this.message = this.response;
    } else if (
      typeof this.response === 'object' &&
      this.response !== null &&
      'message' in this.response &&
      typeof this.response.message === 'string'
    ) {
      this.message = this.response.message;
    } else {
      this.message = `Http Exception (status: ${this.status})`;
    }
  }

  /**
   * Initializes the error name.
   */
  private initName(): void {
    this.name = this.constructor.name;
  }

  /**
   * Initializes the error cause.
   */
  private initCause(cause?: Error): void {
    if (cause) {
      this.cause = cause;
    }
  }

  /**
   * Creates a JSON representation of the exception.
   */
  toJSON(): Record<string, any> {
    return {
      statusCode: this.status,
      message: this.message,
      ...(typeof this.response === 'object' ? this.response : {}),
    };
  }
}
