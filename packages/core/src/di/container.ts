import "reflect-metadata";
import {
	type ClassProvider,
	type ExistingProvider,
	type FactoryProvider,
	isNil,
	isUndefined,
	type OnModuleInit,
	OPTIONAL_DEPS,
	type Provider,
	SCOPE,
	Scope,
	SELF_DECLARED_DEPS,
	type Type,
	type ValueProvider,
} from "@dwex/common";

/**
 * Token type for dependency injection.
 */
export type InjectionToken = string | symbol | Type<any>;

/**
 * Instance wrapper for managing provider instances.
 */
interface InstanceWrapper<T = any> {
	instance?: T;
	metatype?: Type<T> | FactoryProvider | any;
	scope: Scope;
	isResolved: boolean;
}

/**
 * Dependency injection container that manages providers and their dependencies.
 *
 * @example
 * ```typescript
 * const container = new Container();
 * container.addProvider(UserService);
 * const userService = container.get(UserService);
 * ```
 */
export class Container {
	private readonly providers = new Map<InjectionToken, InstanceWrapper>();
	private readonly resolving = new Set<InjectionToken>();

	/**
	 * Adds a provider to the container.
	 *
	 * @param provider - The provider to add
	 */
	addProvider(provider: Provider): void {
		if (typeof provider === "function") {
			// Class provider
			this.providers.set(provider, {
				instance: undefined,
				metatype: provider,
				scope: this.getScope(provider),
				isResolved: false,
			});
		} else if ("useClass" in provider) {
			const classProvider = provider as ClassProvider;
			const token = classProvider.provide || classProvider.useClass;
			this.providers.set(token, {
				instance: undefined,
				metatype: classProvider.useClass,
				scope: classProvider.scope || this.getScope(classProvider.useClass),
				isResolved: false,
			});
		} else if ("useValue" in provider) {
			const valueProvider = provider as ValueProvider;
			const token = valueProvider.provide!;
			this.providers.set(token, {
				instance: valueProvider.useValue,
				metatype: undefined,
				scope: valueProvider.scope || Scope.SINGLETON,
				isResolved: true,
			});
		} else if ("useFactory" in provider) {
			const factoryProvider = provider as FactoryProvider;
			const token = factoryProvider.provide!;
			this.providers.set(token, {
				instance: undefined,
				metatype: factoryProvider,
				scope: factoryProvider.scope || Scope.SINGLETON,
				isResolved: false,
			});
		} else if ("useExisting" in provider) {
			const existingProvider = provider as ExistingProvider;
			const token = existingProvider.provide!;
			this.providers.set(token, {
				instance: undefined,
				metatype: existingProvider.useExisting,
				scope: existingProvider.scope || Scope.SINGLETON,
				isResolved: false,
			});
		}
	}

	/**
	 * Gets an instance from the container.
	 *
	 * @param token - The injection token
	 * @param optional - Whether the dependency is optional
	 * @returns The resolved instance
	 * @throws Error if the provider is not found and not optional
	 */
	get<T = any>(token: InjectionToken, optional = false): T {
		const wrapper = this.providers.get(token);

		if (!wrapper) {
			if (optional) {
				return undefined as T;
			}
			throw new Error(
				`No provider found for ${this.tokenToString(token)}. ` +
					`Make sure it's decorated with @Injectable() and added to a module.`,
			);
		}

		// Check for circular dependency
		if (this.resolving.has(token)) {
			throw new Error(
				`Circular dependency detected: ${this.tokenToString(token)}`,
			);
		}

		// Return existing instance for singletons
		if (wrapper.scope === Scope.SINGLETON && wrapper.isResolved) {
			return wrapper.instance as T;
		}

		// Always create new instance for transient
		if (wrapper.scope === Scope.TRANSIENT) {
			return this.createInstance(token, wrapper);
		}

		// Resolve and cache for singleton
		if (!wrapper.isResolved) {
			this.resolving.add(token);
			try {
				wrapper.instance = this.createInstance(token, wrapper);
				wrapper.isResolved = true;
			} finally {
				this.resolving.delete(token);
			}
		}

		return wrapper.instance as T;
	}

	/**
	 * Checks if a provider exists in the container.
	 *
	 * @param token - The injection token
	 * @returns true if the provider exists
	 */
	has(token: InjectionToken): boolean {
		return this.providers.has(token);
	}

	/**
	 * Creates an instance of a provider.
	 *
	 * @param token - The injection token
	 * @param wrapper - The instance wrapper
	 * @returns The created instance
	 */
	private createInstance<T = any>(
		token: InjectionToken,
		wrapper: InstanceWrapper,
	): T {
		const providerDef = wrapper.metatype;

		// Handle factory provider
		if (this.isFactoryProvider(providerDef)) {
			const factoryProvider = providerDef as FactoryProvider;
			const dependencies = this.resolveDependencies(
				factoryProvider.inject || [],
			);
			return factoryProvider.useFactory(...dependencies);
		}

		// Handle existing provider
		if (this.isExistingProvider(providerDef)) {
			return this.get(providerDef as InjectionToken);
		}

		// Handle class provider
		const ClassToInstantiate = providerDef as Type<T>;

		// Get constructor dependencies
		const dependencies =
			this.resolveConstructorDependencies(ClassToInstantiate);

		return new ClassToInstantiate(...dependencies);
	}

	/**
	 * Resolves constructor dependencies for a class.
	 *
	 * @param target - The target class
	 * @returns Array of resolved dependencies
	 */
	private resolveConstructorDependencies(target: Type<any>): any[] {
		const paramTypes: any[] =
			Reflect.getMetadata("design:paramtypes", target) || [];

		const selfDeclaredDeps: Array<{ index: number; token: any }> =
			Reflect.getMetadata(SELF_DECLARED_DEPS, target) || [];

		const optionalParams: number[] =
			Reflect.getMetadata(OPTIONAL_DEPS, target) || [];

		return paramTypes.map((paramType, index) => {
			// Check for explicit @Inject
			const selfDeclared = selfDeclaredDeps.find((dep) => dep.index === index);
			const token = selfDeclared ? selfDeclared.token : paramType;

			// Check if optional
			const isOptional = optionalParams.includes(index);

			// Skip undefined dependencies if optional
			if (isUndefined(token) || isNil(token)) {
				if (isOptional) {
					return undefined;
				}
				throw new Error(
					`Cannot resolve dependency at index ${index} for ${target.name}. ` +
						`Make sure the dependency is decorated with @Injectable() or use @Inject().`,
				);
			}

			return this.get(token, isOptional);
		});
	}

	/**
	 * Resolves an array of dependencies.
	 *
	 * @param tokens - Array of injection tokens
	 * @returns Array of resolved dependencies
	 */
	private resolveDependencies(tokens: InjectionToken[]): any[] {
		return tokens.map((token) => this.get(token));
	}

	/**
	 * Gets the scope for a provider.
	 *
	 * @param target - The target class
	 * @returns The scope
	 */
	private getScope(target: Type<any>): Scope {
		return Reflect.getMetadata(SCOPE, target) || Scope.SINGLETON;
	}

	/**
	 * Checks if a provider definition is a factory provider.
	 */
	private isFactoryProvider(providerDef: any): boolean {
		return (
			typeof providerDef === "object" &&
			providerDef !== null &&
			"useFactory" in providerDef
		);
	}

	/**
	 * Checks if a provider definition is an existing provider.
	 */
	private isExistingProvider(providerDef: any): boolean {
		return typeof providerDef === "string" || typeof providerDef === "symbol";
	}

	/**
	 * Converts a token to a string for error messages.
	 */
	private tokenToString(token: InjectionToken): string {
		if (typeof token === "string") {
			return `"${token}"`;
		}
		if (typeof token === "symbol") {
			return token.toString();
		}
		return token.name;
	}

	/**
	 * Calls the onModuleInit lifecycle hook on an instance if it implements OnModuleInit.
	 *
	 * @param instance - The instance to call the hook on
	 */
	async callModuleInitHook<T>(instance: T): Promise<void> {
		if (this.hasOnModuleInit(instance)) {
			await (instance as unknown as OnModuleInit).onModuleInit();
		}
	}

	/**
	 * Checks if an instance implements OnModuleInit.
	 *
	 * @param instance - The instance to check
	 * @returns true if the instance has an onModuleInit method
	 */
	private hasOnModuleInit<T>(instance: T): instance is T & OnModuleInit {
		return (
			typeof instance === "object" &&
			instance !== null &&
			"onModuleInit" in instance &&
			typeof (instance as any).onModuleInit === "function"
		);
	}

	/**
	 * Clears all providers from the container.
	 */
	clear(): void {
		this.providers.clear();
		this.resolving.clear();
	}
}
