import "reflect-metadata";
import { HTTP_METHOD, RequestMethod, ROUTE_PATH } from "@dwex/common";

/**
 * Creates a route handler decorator for a specific HTTP method.
 *
 * @param method - The HTTP method
 * @param path - The route path (optional)
 * @returns Method decorator
 */
function createMethodDecorator(method: RequestMethod) {
  return (path = ""): MethodDecorator => {
    return (
      target: object,
      propertyKey: string | symbol,
      descriptor: PropertyDescriptor
    ) => {
      Reflect.defineMetadata(ROUTE_PATH, path, descriptor.value);
      Reflect.defineMetadata(HTTP_METHOD, method, descriptor.value);
      return descriptor;
    };
  };
}

/**
 * Declares a route handler for GET requests.
 *
 * @param path - The route path (optional)
 * @returns Method decorator
 *
 * @example
 * ```typescript
 * @Controller('users')
 * class UserController {
 *   @Get()
 *   findAll() {
 *     return 'This action returns all users';
 *   }
 *
 *   @Get(':id')
 *   findOne(@Param('id') id: string) {
 *     return `This action returns user #${id}`;
 *   }
 * }
 * ```
 */
export const Get = createMethodDecorator(RequestMethod.GET);

/**
 * Declares a route handler for POST requests.
 *
 * @param path - The route path (optional)
 * @returns Method decorator
 *
 * @example
 * ```typescript
 * @Controller('users')
 * class UserController {
 *   @Post()
 *   create(@Body() createUserDto: CreateUserDto) {
 *     return 'This action adds a new user';
 *   }
 * }
 * ```
 */
export const Post = createMethodDecorator(RequestMethod.POST);

/**
 * Declares a route handler for PUT requests.
 *
 * @param path - The route path (optional)
 * @returns Method decorator
 *
 * @example
 * ```typescript
 * @Controller('users')
 * class UserController {
 *   @Put(':id')
 *   update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
 *     return `This action updates user #${id}`;
 *   }
 * }
 * ```
 */
export const Put = createMethodDecorator(RequestMethod.PUT);

/**
 * Declares a route handler for DELETE requests.
 *
 * @param path - The route path (optional)
 * @returns Method decorator
 *
 * @example
 * ```typescript
 * @Controller('users')
 * class UserController {
 *   @Delete(':id')
 *   remove(@Param('id') id: string) {
 *     return `This action removes user #${id}`;
 *   }
 * }
 * ```
 */
export const Delete = createMethodDecorator(RequestMethod.DELETE);

/**
 * Declares a route handler for PATCH requests.
 *
 * @param path - The route path (optional)
 * @returns Method decorator
 *
 * @example
 * ```typescript
 * @Controller('users')
 * class UserController {
 *   @Patch(':id')
 *   partialUpdate(@Param('id') id: string, @Body() patchDto: PatchUserDto) {
 *     return `This action partially updates user #${id}`;
 *   }
 * }
 * ```
 */
export const Patch = createMethodDecorator(RequestMethod.PATCH);

/**
 * Declares a route handler for OPTIONS requests.
 *
 * @param path - The route path (optional)
 * @returns Method decorator
 *
 * @example
 * ```typescript
 * @Controller('users')
 * class UserController {
 *   @Options()
 *   options() {
 *     return 'OPTIONS';
 *   }
 * }
 * ```
 */
export const Options = createMethodDecorator(RequestMethod.OPTIONS);

/**
 * Declares a route handler for HEAD requests.
 *
 * @param path - The route path (optional)
 * @returns Method decorator
 *
 * @example
 * ```typescript
 * @Controller('users')
 * class UserController {
 *   @Head()
 *   head() {
 *     return;
 *   }
 * }
 * ```
 */
export const Head = createMethodDecorator(RequestMethod.HEAD);

/**
 * Declares a route handler for all HTTP methods.
 *
 * @param path - The route path (optional)
 * @returns Method decorator
 *
 * @example
 * ```typescript
 * @Controller('users')
 * class UserController {
 *   @All()
 *   handleAll() {
 *     return 'This handles all HTTP methods';
 *   }
 * }
 * ```
 */
export const All = createMethodDecorator(RequestMethod.ALL);
