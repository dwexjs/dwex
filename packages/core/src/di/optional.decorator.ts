import "reflect-metadata";
import { OPTIONAL_DEPS } from "@dwexjs/common";

/**
 * Marks a dependency as optional. If the dependency cannot be resolved,
 * `undefined` will be injected instead of throwing an error.
 *
 * @returns Parameter decorator
 *
 * @example
 * ```typescript
 * @Injectable()
 * class UserService {
 *   constructor(
 *     @Optional() @Inject('CACHE') private cache?: CacheService
 *   ) {}
 * }
 * ```
 */
export function Optional(): ParameterDecorator {
	return (
		target: object,
		propertyKey: string | symbol | undefined,
		parameterIndex: number,
	) => {
		const existingOptionalParams: number[] =
			Reflect.getOwnMetadata(OPTIONAL_DEPS, target) || [];

		existingOptionalParams.push(parameterIndex);

		Reflect.defineMetadata(OPTIONAL_DEPS, existingOptionalParams, target);
	};
}
