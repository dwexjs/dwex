/**
 * Represents a class constructor type.
 *
 * @template T - The type that the constructor produces
 * @example
 * ```typescript
 * class UserService {}
 * const ServiceClass: Type<UserService> = UserService;
 * ```
 */
export interface Type<T = any> extends Function {
	new (...args: any[]): T;
}

/**
 * Represents an abstract class constructor type.
 *
 * @template T - The type that the constructor produces
 */
export interface Abstract<T = any> extends Function {
	prototype: T;
}
