import { join } from "node:path";
import type { IProcessor, ProcessorContext } from "../types.js";
import { TemplateService } from "../services/template.service.js";

/**
 * Processor for applying feature files and modifications
 *
 * This processor runs AFTER the base template processor to layer
 * feature-specific files and modifications on top of the base structure.
 *
 * Features can:
 * 1. Add new files from templates/features/{feature}/files/
 * 2. Override existing base files (if a feature provides a file with the same path)
 * 3. Modify core files (app.module.ts, main.ts, app.controller.ts) via configuration
 *
 * The base template is always processed first, so all base files (including
 * .gitignore, config files, etc.) are guaranteed to be present.
 */
export class FeatureProcessor implements IProcessor {
	constructor(private readonly templateService: TemplateService) {}

	async process(context: ProcessorContext): Promise<void> {
		// Apply feature files - these may add new files or override base files
		for (const feature of context.features) {
			await this.templateService.processFeatureFiles(
				feature.id,
				context.projectPath,
				context.config,
			);
		}

		// Apply feature modifications to core files
		await this.applyFeaturesToAppModule(context);
		await this.applyFeaturesToMain(context);
		await this.applyFeaturesToAppController(context);
	}

	/**
	 * Modifies app.module.ts to include feature imports and configurations
	 */
	private async applyFeaturesToAppModule(
		context: ProcessorContext,
	): Promise<void> {
		const appModulePath = join(context.projectPath, "src", "app.module.ts");
		let content = await Bun.file(appModulePath).text();

		const allImports: Set<string> = new Set();
		const moduleImports: Set<string> = new Set(["LoggerModule"]);
		const controllers: Set<string> = new Set(["AppController"]);
		const providers: Set<string> = new Set();

		// Collect all feature configurations (using Sets to avoid duplicates)
		for (const feature of context.features) {
			if (feature.imports) {
				for (const imp of feature.imports) {
					allImports.add(imp);
				}
			}
			if (feature.moduleConfig?.imports) {
				for (const imp of feature.moduleConfig.imports) {
					moduleImports.add(imp);
				}
			}
			if (feature.moduleConfig?.controllers) {
				for (const ctrl of feature.moduleConfig.controllers) {
					controllers.add(ctrl);
				}
			}
			if (feature.moduleConfig?.providers) {
				for (const prov of feature.moduleConfig.providers) {
					providers.add(prov);
				}
			}
		}

		// Build the new imports section
		const baseImports =
			'import { Module } from "@dwex/core";\nimport { LoggerModule } from "@dwex/logger";\nimport { AppController } from "./app.controller";';
		const newImports = [baseImports, ...Array.from(allImports)].join("\n");

		// Build the module decorator
		let moduleDecorator = "@Module({\n";
		moduleDecorator += `\timports: [${Array.from(moduleImports).join(", ")}],\n`;
		moduleDecorator += `\tcontrollers: [${Array.from(controllers).join(", ")}],\n`;
		if (providers.size > 0) {
			moduleDecorator += `\tproviders: [${Array.from(providers).join(", ")}],\n`;
		}
		moduleDecorator += "})";

		// Replace the entire file with the new content
		content = `${newImports}\n\n/**\n * Root application module\n */\n${moduleDecorator}\nexport class AppModule {}\n`;

		await Bun.write(appModulePath, content);
	}

	/**
	 * Modifies main.ts to include feature setup
	 */
	private async applyFeaturesToMain(context: ProcessorContext): Promise<void> {
		const mainPath = join(context.projectPath, "src", "main.ts");
		let content = await Bun.file(mainPath).text();

		const allImports: string[] = [];
		const beforeListen: string[] = [];
		const afterListen: string[] = [];

		// Collect all feature configurations
		for (const feature of context.features) {
			if (feature.mainAdditions?.imports) {
				allImports.push(...feature.mainAdditions.imports);
			}
			if (feature.mainAdditions?.beforeListen) {
				beforeListen.push(...feature.mainAdditions.beforeListen);
			}
			if (feature.mainAdditions?.afterListen) {
				afterListen.push(...feature.mainAdditions.afterListen);
			}
		}

		// If there are additions, rebuild the main.ts file
		if (
			allImports.length > 0 ||
			beforeListen.length > 0 ||
			afterListen.length > 0
		) {
			// Add imports at the top
			if (allImports.length > 0) {
				const importSection = allImports.join("\n");
				content = content.replace(
					'import { DwexFactory } from "@dwex/core";\nimport { AppModule } from "./app.module";',
					`import { DwexFactory } from "@dwex/core";\nimport { AppModule } from "./app.module";\n${importSection}`,
				);
			}

			// Add before listen code
			if (beforeListen.length > 0) {
				const beforeListenCode = beforeListen.join("\n\t");
				content = content.replace(
					/(\s+)await app\.listen\(port\);/,
					`\n${beforeListenCode}\n\n$1await app.listen(port);`,
				);
			}

			// Add after listen code
			if (afterListen.length > 0) {
				const afterListenCode = afterListen.join("\n\t");
				content = content.replace(
					/(\s+)await app\.listen\(port\);/,
					`$1await app.listen(port);\n\n${afterListenCode}`,
				);
			}

			await Bun.write(mainPath, content);
		}
	}

	/**
	 * Modifies app.controller.ts to include feature additions
	 */
	private async applyFeaturesToAppController(
		context: ProcessorContext,
	): Promise<void> {
		const appControllerPath = join(
			context.projectPath,
			"src",
			"app.controller.ts",
		);
		let content = await Bun.file(appControllerPath).text();

		const allImports: string[] = [];
		const methods: string[] = [];

		// Collect all feature configurations
		for (const feature of context.features) {
			if (feature.appControllerAdditions?.imports) {
				allImports.push(...feature.appControllerAdditions.imports);
			}
			if (feature.appControllerAdditions?.methods) {
				for (const method of feature.appControllerAdditions.methods) {
					methods.push(method.code);
				}
			}
		}

		// If there are additions, modify the file
		if (allImports.length > 0 || methods.length > 0) {
			// Add imports
			if (allImports.length > 0) {
				const importSection = allImports.join("\n");
				content = content.replace(
					'import { Controller, Get, Injectable } from "@dwex/core";',
					`import { Controller, Get, Injectable } from "@dwex/core";\n${importSection}`,
				);
			}

			// Add methods before the closing brace
			if (methods.length > 0) {
				const methodsCode = methods.join("\n\n");
				content = content.replace(/}\s*$/, `\n${methodsCode}\n}\n`);
			}

			await Bun.write(appControllerPath, content);
		}
	}
}
