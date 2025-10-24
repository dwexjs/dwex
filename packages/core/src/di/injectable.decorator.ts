import 'reflect-metadata';
import { INJECTABLE, SCOPE } from '@dwexjs/common';
import type { Scope } from '@dwexjs/common';

/**
 * Options for the Injectable decorator.
 */
export interface InjectableOptions {
  /**
   * The scope of the injectable.
   * - SINGLETON: Single instance shared across the application (default)
   * - REQUEST: New instance per request
   * - TRANSIENT: New instance every time it's injected
   */
  scope?: Scope;
}

/**
 * Marks a class as injectable, making it available for dependency injection.
 *
 * @param options - Injectable configuration options
 * @returns Class decorator
 *
 * @example
 * ```typescript
 * @Injectable()
 * class UserService {
 *   constructor(private db: DatabaseService) {}
 * }
 * ```
 *
 * @example
 * ```typescript
 * @Injectable({ scope: Scope.REQUEST })
 * class RequestScopedService {
 *   // New instance per request
 * }
 * ```
 */
export function Injectable(options?: InjectableOptions): ClassDecorator {
  return (target: Function) => {
    Reflect.defineMetadata(INJECTABLE, true, target);

    if (options?.scope) {
      Reflect.defineMetadata(SCOPE, options.scope, target);
    }
  };
}
