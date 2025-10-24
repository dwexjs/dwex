import { HttpStatus } from '../enums/http-status.enum.js';
import {
  HttpException,
  type HttpExceptionOptions,
  type HttpExceptionResponse,
} from './http-exception.js';

/**
 * Exception for 500 Internal Server Error.
 *
 * @example
 * ```typescript
 * throw new InternalServerErrorException('An unexpected error occurred');
 * ```
 */
export class InternalServerErrorException extends HttpException {
  constructor(
    response: HttpExceptionResponse = 'Internal Server Error',
    options?: HttpExceptionOptions,
  ) {
    super(response, HttpStatus.INTERNAL_SERVER_ERROR, options);
  }
}

/**
 * Exception for 501 Not Implemented.
 *
 * @example
 * ```typescript
 * throw new NotImplementedException('Feature not yet implemented');
 * ```
 */
export class NotImplementedException extends HttpException {
  constructor(
    response: HttpExceptionResponse = 'Not Implemented',
    options?: HttpExceptionOptions,
  ) {
    super(response, HttpStatus.NOT_IMPLEMENTED, options);
  }
}

/**
 * Exception for 502 Bad Gateway.
 *
 * @example
 * ```typescript
 * throw new BadGatewayException('Upstream service returned invalid response');
 * ```
 */
export class BadGatewayException extends HttpException {
  constructor(
    response: HttpExceptionResponse = 'Bad Gateway',
    options?: HttpExceptionOptions,
  ) {
    super(response, HttpStatus.BAD_GATEWAY, options);
  }
}

/**
 * Exception for 503 Service Unavailable.
 *
 * @example
 * ```typescript
 * throw new ServiceUnavailableException('Service temporarily unavailable');
 * ```
 */
export class ServiceUnavailableException extends HttpException {
  constructor(
    response: HttpExceptionResponse = 'Service Unavailable',
    options?: HttpExceptionOptions,
  ) {
    super(response, HttpStatus.SERVICE_UNAVAILABLE, options);
  }
}

/**
 * Exception for 504 Gateway Timeout.
 *
 * @example
 * ```typescript
 * throw new GatewayTimeoutException('Upstream service timed out');
 * ```
 */
export class GatewayTimeoutException extends HttpException {
  constructor(
    response: HttpExceptionResponse = 'Gateway Timeout',
    options?: HttpExceptionOptions,
  ) {
    super(response, HttpStatus.GATEWAY_TIMEOUT, options);
  }
}
