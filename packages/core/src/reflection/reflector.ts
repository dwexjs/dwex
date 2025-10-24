import "reflect-metadata";

/**
 * Utility class for working with metadata using reflect-metadata.
 *
 * @example
 * ```typescript
 * const reflector = new Reflector();
 * reflector.set('key', 'value', TargetClass);
 * const value = reflector.get('key', TargetClass); // 'value'
 * ```
 */
export class Reflector {
	/**
	 * Sets metadata for a target.
	 *
	 * @param metadataKey - The metadata key
	 * @param metadataValue - The metadata value
	 * @param target - The target (class, method, or property)
	 */
	set<T = any>(
		metadataKey: string | symbol,
		metadataValue: T,
		target: object | Function,
	): void {
		Reflect.defineMetadata(metadataKey, metadataValue, target);
	}

	/**
	 * Gets metadata from a target.
	 *
	 * @param metadataKey - The metadata key
	 * @param target - The target (class, method, or property)
	 * @returns The metadata value or undefined
	 */
	get<T = any>(
		metadataKey: string | symbol,
		target: object | Function,
	): T | undefined {
		return Reflect.getMetadata(metadataKey, target);
	}

	/**
	 * Gets all metadata keys from a target.
	 *
	 * @param target - The target (class, method, or property)
	 * @returns Array of metadata keys
	 */
	getKeys(target: object | Function): Array<string | symbol> {
		return Reflect.getMetadataKeys(target);
	}

	/**
	 * Checks if metadata exists for a target.
	 *
	 * @param metadataKey - The metadata key
	 * @param target - The target (class, method, or property)
	 * @returns true if the metadata exists
	 */
	has(metadataKey: string | symbol, target: object | Function): boolean {
		return Reflect.hasMetadata(metadataKey, target);
	}

	/**
	 * Gets the design type metadata for a target.
	 *
	 * @param target - The target class
	 * @param propertyKey - The property key
	 * @returns The design type
	 */
	getDesignType<T = any>(target: object, propertyKey: string | symbol): T {
		return Reflect.getMetadata("design:type", target, propertyKey);
	}

	/**
	 * Gets the parameter types for a constructor or method.
	 *
	 * @param target - The target class or method
	 * @param propertyKey - The property key (optional, for methods)
	 * @returns Array of parameter types
	 */
	getParamTypes<T = any>(
		target: object | Function,
		propertyKey?: string | symbol,
	): T[] {
		if (propertyKey) {
			return (
				Reflect.getMetadata("design:paramtypes", target, propertyKey) || []
			);
		}
		return Reflect.getMetadata("design:paramtypes", target) || [];
	}

	/**
	 * Gets the return type for a method.
	 *
	 * @param target - The target class
	 * @param propertyKey - The property key
	 * @returns The return type
	 */
	getReturnType<T = any>(target: object, propertyKey: string | symbol): T {
		return Reflect.getMetadata("design:returntype", target, propertyKey);
	}

	/**
	 * Deletes metadata from a target.
	 *
	 * @param metadataKey - The metadata key
	 * @param target - The target (class, method, or property)
	 * @returns true if the metadata was deleted
	 */
	delete(metadataKey: string | symbol, target: object | Function): boolean {
		return Reflect.deleteMetadata(metadataKey, target);
	}
}
