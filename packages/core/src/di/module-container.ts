import "reflect-metadata";
import {
	GLOBAL_MODULE,
	type Provider,
	type Type,
} from "@dwex/common";
import type { InjectionToken } from "./container.js";

/**
 * Represents a single module with its providers and relationships
 */
export class ModuleRef {
	/**
	 * The module's own providers container
	 */
	private readonly providers = new Map<InjectionToken, Provider>();

	/**
	 * Tokens that this module exports (makes available to importing modules)
	 */
	private readonly exports = new Set<InjectionToken>();

	/**
	 * Modules that this module imports
	 */
	private readonly imports = new Set<ModuleRef>();

	constructor(
		public readonly moduleClass: Type<any>,
		public readonly isGlobal: boolean = false,
	) {}

	/**
	 * Adds a provider to this module
	 */
	addProvider(provider: Provider): void {
		const token = this.getProviderToken(provider);
		this.providers.set(token, provider);
	}

	/**
	 * Marks a token as exported by this module
	 */
	addExport(token: InjectionToken): void {
		this.exports.add(token);
	}

	/**
	 * Adds an imported module reference
	 */
	addImport(moduleRef: ModuleRef): void {
		this.imports.add(moduleRef);
	}

	/**
	 * Checks if this module has a provider
	 */
	hasProvider(token: InjectionToken): boolean {
		return this.providers.has(token);
	}

	/**
	 * Gets a provider from this module
	 */
	getProvider(token: InjectionToken): Provider | undefined {
		return this.providers.get(token);
	}

	/**
	 * Checks if this module exports a token
	 */
	exportsToken(token: InjectionToken): boolean {
		return this.exports.has(token);
	}

	/**
	 * Gets all providers in this module
	 */
	getAllProviders(): Map<InjectionToken, Provider> {
		return new Map(this.providers);
	}

	/**
	 * Gets all imported module references
	 */
	getImports(): Set<ModuleRef> {
		return new Set(this.imports);
	}

	/**
	 * Gets the module name for error messages
	 */
	getName(): string {
		return this.moduleClass.name;
	}

	/**
	 * Extracts the injection token from a provider
	 */
	private getProviderToken(provider: Provider): InjectionToken {
		if (typeof provider === "function") {
			return provider;
		}
		if ("provide" in provider && provider.provide) {
			return provider.provide;
		}
		if ("useClass" in provider) {
			return provider.useClass;
		}
		throw new Error("Invalid provider: cannot determine injection token");
	}
}

/**
 * Manages all modules and their relationships in the application
 */
export class ModuleContainer {
	/**
	 * All module references indexed by their class
	 */
	private readonly modules = new Map<Type<any>, ModuleRef>();

	/**
	 * Global modules that are accessible from anywhere
	 */
	private readonly globalModules = new Set<ModuleRef>();

	/**
	 * Creates or gets a module reference
	 */
	addModule(moduleClass: Type<any>): ModuleRef {
		if (this.modules.has(moduleClass)) {
			return this.modules.get(moduleClass)!;
		}

		const isGlobal = Reflect.getMetadata(GLOBAL_MODULE, moduleClass) || false;
		const moduleRef = new ModuleRef(moduleClass, isGlobal);

		this.modules.set(moduleClass, moduleRef);

		if (isGlobal) {
			this.globalModules.add(moduleRef);
		}

		return moduleRef;
	}

	/**
	 * Gets a module reference
	 */
	getModule(moduleClass: Type<any>): ModuleRef | undefined {
		return this.modules.get(moduleClass);
	}

	/**
	 * Checks if a module exists
	 */
	hasModule(moduleClass: Type<any>): boolean {
		return this.modules.has(moduleClass);
	}

	/**
	 * Gets all global modules
	 */
	getGlobalModules(): Set<ModuleRef> {
		return new Set(this.globalModules);
	}

	/**
	 * Marks a module as global (for testing purposes)
	 */
	markAsGlobal(moduleRef: ModuleRef): void {
		this.globalModules.add(moduleRef);
	}

	/**
	 * Resolves a provider by searching through module hierarchy
	 *
	 * @param token - The injection token to resolve
	 * @param requestingModule - The module requesting the provider
	 * @returns The provider and the module it was found in, or undefined
	 */
	resolveProvider(
		token: InjectionToken,
		requestingModule: ModuleRef,
	): { provider: Provider; module: ModuleRef } | undefined {
		// 1. Check the requesting module's own providers
		const ownProvider = requestingModule.getProvider(token);
		if (ownProvider) {
			return { provider: ownProvider, module: requestingModule };
		}

		// 2. Check global modules
		for (const globalModule of this.globalModules) {
			const provider = globalModule.getProvider(token);
			if (provider) {
				return { provider, module: globalModule };
			}
		}

		// 3. Check imported modules (only their exports)
		for (const importedModule of requestingModule.getImports()) {
			const provider = importedModule.getProvider(token);
			if (provider && importedModule.exportsToken(token)) {
				return { provider, module: importedModule };
			}
		}

		// 4. Not found
		return undefined;
	}

	/**
	 * Generates a helpful error message when a provider is not found
	 */
	generateNotFoundError(
		token: InjectionToken,
		requestingModule: ModuleRef,
	): string {
		const tokenName = this.tokenToString(token);
		let message = `No provider found for ${tokenName} in ${requestingModule.getName()}.\n`;

		// Check if the provider exists in any module
		const modulesWithProvider: Array<{ module: ModuleRef; isExported: boolean }> =
			[];

		for (const [, moduleRef] of this.modules) {
			if (moduleRef.hasProvider(token)) {
				modulesWithProvider.push({
					module: moduleRef,
					isExported: moduleRef.exportsToken(token),
				});
			}
		}

		if (modulesWithProvider.length > 0) {
			message += "\nHowever, this provider exists in:\n";
			for (const { module, isExported } of modulesWithProvider) {
				if (isExported) {
					message += `  - ${module.getName()} (exported) - Add this module to '${requestingModule.getName()}.imports'\n`;
				} else {
					message += `  - ${module.getName()} (not exported) - Add ${tokenName} to '${module.getName()}.exports'\n`;
				}
			}
		} else {
			message += `\nMake sure:\n`;
			message += `  1. It's decorated with @Injectable()\n`;
			message += `  2. It's added to a module's providers array\n`;
			message += `  3. The module is imported into ${requestingModule.getName()}\n`;
		}

		return message;
	}

	/**
	 * Converts a token to a string for error messages
	 */
	private tokenToString(token: InjectionToken): string {
		if (typeof token === "string") {
			return `"${token}"`;
		}
		if (typeof token === "symbol") {
			return token.toString();
		}
		return token.name || "Unknown";
	}

	/**
	 * Clears all modules
	 */
	clear(): void {
		this.modules.clear();
		this.globalModules.clear();
	}
}
