import "reflect-metadata";
import { ROUTE_PARAMS } from "@dwexjs/common";

/**
 * Route parameter metadata.
 */
export interface RouteParamMetadata {
	index: number;
	type: ParamType;
	data?: string;
	pipes?: any[];
}

/**
 * Parameter types.
 */
export enum ParamType {
	BODY = "body",
	QUERY = "query",
	PARAM = "param",
	HEADERS = "headers",
	COOKIES = "cookies",
	REQUEST = "request",
	RESPONSE = "response",
	NEXT = "next",
	SESSION = "session",
	IP = "ip",
	HOST = "host",
}

/**
 * Creates a parameter decorator.
 *
 * @param type - The parameter type
 * @param data - Optional data (e.g., specific param name)
 * @returns Parameter decorator
 */
function createParamDecorator(
	type: ParamType,
	data?: string,
): ParameterDecorator {
	return (
		target: object,
		propertyKey: string | symbol | undefined,
		parameterIndex: number,
	) => {
		const handler = propertyKey
			? (target.constructor as any).prototype[propertyKey]
			: target;

		const existingParams: RouteParamMetadata[] =
			Reflect.getOwnMetadata(ROUTE_PARAMS, handler) || [];

		existingParams.push({
			index: parameterIndex,
			type,
			data,
		});

		Reflect.defineMetadata(ROUTE_PARAMS, existingParams, handler);
	};
}

/**
 * Injects the request body or a specific property from it.
 *
 * @param property - Optional property name to extract from body
 * @returns Parameter decorator
 *
 * @example
 * ```typescript
 * @Post()
 * create(@Body() createDto: CreateUserDto) {
 *   return createDto;
 * }
 * ```
 *
 * @example
 * ```typescript
 * @Post()
 * create(@Body('name') name: string) {
 *   return { name };
 * }
 * ```
 */
export function Body(property?: string): ParameterDecorator {
	return createParamDecorator(ParamType.BODY, property);
}

/**
 * Injects a route parameter or all route parameters.
 *
 * @param param - Optional param name to extract
 * @returns Parameter decorator
 *
 * @example
 * ```typescript
 * @Get(':id')
 * findOne(@Param('id') id: string) {
 *   return { id };
 * }
 * ```
 *
 * @example
 * ```typescript
 * @Get(':userId/posts/:postId')
 * findPost(@Param() params: { userId: string; postId: string }) {
 *   return params;
 * }
 * ```
 */
export function Param(param?: string): ParameterDecorator {
	return createParamDecorator(ParamType.PARAM, param);
}

/**
 * Injects a query parameter or all query parameters.
 *
 * @param query - Optional query param name to extract
 * @returns Parameter decorator
 *
 * @example
 * ```typescript
 * @Get()
 * findAll(@Query('page') page: string) {
 *   return { page };
 * }
 * ```
 *
 * @example
 * ```typescript
 * @Get()
 * findAll(@Query() query: { page?: string; limit?: string }) {
 *   return query;
 * }
 * ```
 */
export function Query(query?: string): ParameterDecorator {
	return createParamDecorator(ParamType.QUERY, query);
}

/**
 * Injects a request header or all headers.
 *
 * @param header - Optional header name to extract
 * @returns Parameter decorator
 *
 * @example
 * ```typescript
 * @Get()
 * findAll(@Headers('authorization') auth: string) {
 *   return { auth };
 * }
 * ```
 *
 * @example
 * ```typescript
 * @Get()
 * findAll(@Headers() headers: Record<string, string>) {
 *   return headers;
 * }
 * ```
 */
export function Headers(header?: string): ParameterDecorator {
	return createParamDecorator(ParamType.HEADERS, header);
}

/**
 * Injects a cookie or all cookies.
 *
 * @param cookie - Optional cookie name to extract
 * @returns Parameter decorator
 *
 * @example
 * ```typescript
 * @Get()
 * findAll(@Cookies('sessionId') sessionId: string) {
 *   return { sessionId };
 * }
 * ```
 *
 * @example
 * ```typescript
 * @Get()
 * findAll(@Cookies() cookies: Record<string, string>) {
 *   return cookies;
 * }
 * ```
 */
export function Cookies(cookie?: string): ParameterDecorator {
	return createParamDecorator(ParamType.COOKIES, cookie);
}

/**
 * Injects the entire request object.
 *
 * @returns Parameter decorator
 *
 * @example
 * ```typescript
 * @Get()
 * findAll(@Req() request: Request) {
 *   return { url: request.url };
 * }
 * ```
 */
export function Req(): ParameterDecorator {
	return createParamDecorator(ParamType.REQUEST);
}

/**
 * Alias for @Req().
 */
export const Request = Req;

/**
 * Injects the response object.
 *
 * @returns Parameter decorator
 *
 * @example
 * ```typescript
 * @Get()
 * findAll(@Res() response: Response) {
 *   response.status(200).send('OK');
 * }
 * ```
 */
export function Res(): ParameterDecorator {
	return createParamDecorator(ParamType.RESPONSE);
}

/**
 * Alias for @Res().
 */
export const Response = Res;

/**
 * Injects the next function (for middleware).
 *
 * @returns Parameter decorator
 *
 * @example
 * ```typescript
 * @Get()
 * findAll(@Next() next: () => void) {
 *   next();
 * }
 * ```
 */
export function Next(): ParameterDecorator {
	return createParamDecorator(ParamType.NEXT);
}

/**
 * Injects the session object.
 *
 * @returns Parameter decorator
 *
 * @example
 * ```typescript
 * @Get()
 * getSession(@Session() session: any) {
 *   return session;
 * }
 * ```
 */
export function Session(): ParameterDecorator {
	return createParamDecorator(ParamType.SESSION);
}

/**
 * Injects the client's IP address.
 *
 * @returns Parameter decorator
 *
 * @example
 * ```typescript
 * @Get()
 * getIp(@Ip() ip: string) {
 *   return { ip };
 * }
 * ```
 */
export function Ip(): ParameterDecorator {
	return createParamDecorator(ParamType.IP);
}

/**
 * Injects the host (hostname).
 *
 * @returns Parameter decorator
 *
 * @example
 * ```typescript
 * @Get()
 * getHost(@Host() host: string) {
 *   return { host };
 * }
 * ```
 */
export function Host(): ParameterDecorator {
	return createParamDecorator(ParamType.HOST);
}
