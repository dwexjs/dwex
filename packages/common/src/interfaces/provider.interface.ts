import type { Type } from './type.interface.js';

/**
 * Scope of a provider instance.
 */
export enum Scope {
  /**
   * A single instance is shared across the entire application.
   */
  SINGLETON = 'SINGLETON',

  /**
   * A new instance is created for each request.
   */
  REQUEST = 'REQUEST',

  /**
   * A new instance is created every time it's injected.
   */
  TRANSIENT = 'TRANSIENT',
}

/**
 * Base provider interface.
 */
export interface BaseProvider {
  /**
   * Optional injection token.
   */
  provide?: string | symbol | Type<any>;

  /**
   * Optional scope for the provider.
   */
  scope?: Scope;
}

/**
 * Class provider - uses a class constructor.
 *
 * @example
 * ```typescript
 * {
 *   provide: 'UserService',
 *   useClass: UserServiceImpl,
 * }
 * ```
 */
export interface ClassProvider<T = any> extends BaseProvider {
  useClass: Type<T>;
}

/**
 * Value provider - uses a static value.
 *
 * @example
 * ```typescript
 * {
 *   provide: 'CONFIG',
 *   useValue: { apiKey: '123' },
 * }
 * ```
 */
export interface ValueProvider<T = any> extends BaseProvider {
  useValue: T;
}

/**
 * Factory provider - uses a factory function.
 *
 * @example
 * ```typescript
 * {
 *   provide: 'DATABASE',
 *   useFactory: (config: Config) => createConnection(config),
 *   inject: [Config],
 * }
 * ```
 */
export interface FactoryProvider<T = any> extends BaseProvider {
  useFactory: (...args: any[]) => T | Promise<T>;
  inject?: Array<Type<any> | string | symbol>;
}

/**
 * Existing provider - creates an alias to an existing provider.
 *
 * @example
 * ```typescript
 * {
 *   provide: 'AliasService',
 *   useExisting: UserService,
 * }
 * ```
 */
export interface ExistingProvider extends BaseProvider {
  useExisting: Type<any> | string | symbol;
}

/**
 * Union type of all provider types.
 */
export type Provider =
  | Type<any>
  | ClassProvider
  | ValueProvider
  | FactoryProvider
  | ExistingProvider;
