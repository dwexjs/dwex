import { HttpStatus } from '../enums/http-status.enum.js';
import {
  HttpException,
  type HttpExceptionOptions,
  type HttpExceptionResponse,
} from './http-exception.js';

/**
 * Exception for 400 Bad Request.
 *
 * @example
 * ```typescript
 * throw new BadRequestException('Invalid input data');
 * ```
 */
export class BadRequestException extends HttpException {
  constructor(
    response: HttpExceptionResponse = 'Bad Request',
    options?: HttpExceptionOptions,
  ) {
    super(response, HttpStatus.BAD_REQUEST, options);
  }
}

/**
 * Exception for 401 Unauthorized.
 *
 * @example
 * ```typescript
 * throw new UnauthorizedException('Invalid credentials');
 * ```
 */
export class UnauthorizedException extends HttpException {
  constructor(
    response: HttpExceptionResponse = 'Unauthorized',
    options?: HttpExceptionOptions,
  ) {
    super(response, HttpStatus.UNAUTHORIZED, options);
  }
}

/**
 * Exception for 402 Payment Required.
 *
 * @example
 * ```typescript
 * throw new PaymentRequiredException('Payment required to access this resource');
 * ```
 */
export class PaymentRequiredException extends HttpException {
  constructor(
    response: HttpExceptionResponse = 'Payment Required',
    options?: HttpExceptionOptions,
  ) {
    super(response, HttpStatus.PAYMENT_REQUIRED, options);
  }
}

/**
 * Exception for 403 Forbidden.
 *
 * @example
 * ```typescript
 * throw new ForbiddenException('Access denied');
 * ```
 */
export class ForbiddenException extends HttpException {
  constructor(
    response: HttpExceptionResponse = 'Forbidden',
    options?: HttpExceptionOptions,
  ) {
    super(response, HttpStatus.FORBIDDEN, options);
  }
}

/**
 * Exception for 404 Not Found.
 *
 * @example
 * ```typescript
 * throw new NotFoundException('User not found');
 * ```
 */
export class NotFoundException extends HttpException {
  constructor(
    response: HttpExceptionResponse = 'Not Found',
    options?: HttpExceptionOptions,
  ) {
    super(response, HttpStatus.NOT_FOUND, options);
  }
}

/**
 * Exception for 405 Method Not Allowed.
 *
 * @example
 * ```typescript
 * throw new MethodNotAllowedException('POST method not allowed');
 * ```
 */
export class MethodNotAllowedException extends HttpException {
  constructor(
    response: HttpExceptionResponse = 'Method Not Allowed',
    options?: HttpExceptionOptions,
  ) {
    super(response, HttpStatus.METHOD_NOT_ALLOWED, options);
  }
}

/**
 * Exception for 406 Not Acceptable.
 *
 * @example
 * ```typescript
 * throw new NotAcceptableException('Content type not acceptable');
 * ```
 */
export class NotAcceptableException extends HttpException {
  constructor(
    response: HttpExceptionResponse = 'Not Acceptable',
    options?: HttpExceptionOptions,
  ) {
    super(response, HttpStatus.NOT_ACCEPTABLE, options);
  }
}

/**
 * Exception for 408 Request Timeout.
 *
 * @example
 * ```typescript
 * throw new RequestTimeoutException('Request took too long');
 * ```
 */
export class RequestTimeoutException extends HttpException {
  constructor(
    response: HttpExceptionResponse = 'Request Timeout',
    options?: HttpExceptionOptions,
  ) {
    super(response, HttpStatus.REQUEST_TIMEOUT, options);
  }
}

/**
 * Exception for 409 Conflict.
 *
 * @example
 * ```typescript
 * throw new ConflictException('Email already exists');
 * ```
 */
export class ConflictException extends HttpException {
  constructor(
    response: HttpExceptionResponse = 'Conflict',
    options?: HttpExceptionOptions,
  ) {
    super(response, HttpStatus.CONFLICT, options);
  }
}

/**
 * Exception for 410 Gone.
 *
 * @example
 * ```typescript
 * throw new GoneException('This resource is no longer available');
 * ```
 */
export class GoneException extends HttpException {
  constructor(
    response: HttpExceptionResponse = 'Gone',
    options?: HttpExceptionOptions,
  ) {
    super(response, HttpStatus.GONE, options);
  }
}

/**
 * Exception for 413 Payload Too Large.
 *
 * @example
 * ```typescript
 * throw new PayloadTooLargeException('File size exceeds limit');
 * ```
 */
export class PayloadTooLargeException extends HttpException {
  constructor(
    response: HttpExceptionResponse = 'Payload Too Large',
    options?: HttpExceptionOptions,
  ) {
    super(response, HttpStatus.PAYLOAD_TOO_LARGE, options);
  }
}

/**
 * Exception for 415 Unsupported Media Type.
 *
 * @example
 * ```typescript
 * throw new UnsupportedMediaTypeException('Only JSON is supported');
 * ```
 */
export class UnsupportedMediaTypeException extends HttpException {
  constructor(
    response: HttpExceptionResponse = 'Unsupported Media Type',
    options?: HttpExceptionOptions,
  ) {
    super(response, HttpStatus.UNSUPPORTED_MEDIA_TYPE, options);
  }
}

/**
 * Exception for 422 Unprocessable Entity.
 *
 * @example
 * ```typescript
 * throw new UnprocessableEntityException('Validation failed');
 * ```
 */
export class UnprocessableEntityException extends HttpException {
  constructor(
    response: HttpExceptionResponse = 'Unprocessable Entity',
    options?: HttpExceptionOptions,
  ) {
    super(response, HttpStatus.UNPROCESSABLE_ENTITY, options);
  }
}

/**
 * Exception for 429 Too Many Requests.
 *
 * @example
 * ```typescript
 * throw new TooManyRequestsException('Rate limit exceeded');
 * ```
 */
export class TooManyRequestsException extends HttpException {
  constructor(
    response: HttpExceptionResponse = 'Too Many Requests',
    options?: HttpExceptionOptions,
  ) {
    super(response, HttpStatus.TOO_MANY_REQUESTS, options);
  }
}
