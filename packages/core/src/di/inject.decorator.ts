import "reflect-metadata";
import type { Type } from "@dwex/common";
import { SELF_DECLARED_DEPS } from "@dwex/common";

/**
 * Decorator to explicitly inject a dependency.
 * Useful when TypeScript's emitDecoratorMetadata doesn't provide enough information,
 * or when using injection tokens.
 *
 * @param token - The injection token (class, string, or symbol)
 * @returns Parameter decorator
 *
 * @example
 * ```typescript
 * @Injectable()
 * class UserService {
 *   constructor(
 *     @Inject('DATABASE_CONNECTION') private db: any
 *   ) {}
 * }
 * ```
 */
export function Inject(token: string | symbol | Type<any>): ParameterDecorator {
  return (
    target: object,
    propertyKey: string | symbol | undefined,
    parameterIndex: number
  ) => {
    const existingInjectedParams: Array<{ index: number; token: any }> =
      Reflect.getOwnMetadata(SELF_DECLARED_DEPS, target) || [];

    existingInjectedParams.push({ index: parameterIndex, token });

    Reflect.defineMetadata(SELF_DECLARED_DEPS, existingInjectedParams, target);
  };
}
