import { mkdir, readdir } from "node:fs/promises";
import { join } from "node:path";
import ejs from "ejs";
import type { Feature, ProjectConfig } from "./types.js";

/**
 * Discovers available features by reading the features directory
 */
export async function discoverFeatures(): Promise<Feature[]> {
	const featuresDir = join(import.meta.dirname, "..", "templates", "features");

	try {
		const entries = await readdir(featuresDir, { withFileTypes: true });
		const features: Feature[] = [];

		for (const entry of entries) {
			if (entry.isDirectory()) {
				const featurePath = join(featuresDir, entry.name, "feature.json");
				try {
					const featureConfig = await Bun.file(featurePath).json();
					features.push(featureConfig);
				} catch (error) {
					console.warn(`Failed to load feature ${entry.name}:`, error);
				}
			}
		}

		return features;
	} catch (error) {
		return [];
	}
}

/**
 * Recursively processes template files with EJS
 */
export async function processTemplateFiles(
	sourceDir: string,
	targetDir: string,
	config: ProjectConfig,
): Promise<void> {
	const entries = await readdir(sourceDir, { withFileTypes: true });

	for (const entry of entries) {
		const sourcePath = join(sourceDir, entry.name);
		let targetPath = join(targetDir, entry.name);

		if (entry.isDirectory()) {
			await mkdir(targetPath, { recursive: true });
			await processTemplateFiles(sourcePath, targetPath, config);
		} else {
			// Check if file has .ejs extension
			const hasEjsExtension = entry.name.endsWith(".ejs");

			// If file ends with .ejs, remove the extension from target path
			if (hasEjsExtension) {
				targetPath = targetPath.slice(0, -4); // Remove .ejs extension
			}

			// Process file with EJS
			const content = await Bun.file(sourcePath).text();
			const rendered = ejs.render(content, config);
			await Bun.write(targetPath, rendered);
		}
	}
}

/**
 * Gets the path to the base template directory
 */
export function getBaseTemplatePath(): string {
	return join(import.meta.dirname, "..", "templates", "base");
}

/**
 * Gets the path to a feature directory
 */
export function getFeaturePath(featureId: string): string {
	return join(import.meta.dirname, "..", "templates", "features", featureId);
}

/**
 * Loads a feature configuration
 */
export async function loadFeature(
	featureId: string,
	config: ProjectConfig,
): Promise<Feature> {
	const featurePath = join(getFeaturePath(featureId), "feature.json");
	const content = await Bun.file(featurePath).text();
	const rendered = ejs.render(content, config);
	return JSON.parse(rendered);
}

/**
 * Merges package.json dependencies from features
 */
async function mergePackageJson(
	projectPath: string,
	features: Feature[],
): Promise<void> {
	const packageJsonPath = join(projectPath, "package.json");
	const packageJson = JSON.parse(await Bun.file(packageJsonPath).text());

	// Merge dependencies from all features
	for (const feature of features) {
		if (feature.dependencies) {
			packageJson.dependencies = {
				...packageJson.dependencies,
				...feature.dependencies,
			};
		}
	}

	// Write back the merged package.json
	await Bun.write(
		packageJsonPath,
		JSON.stringify(packageJson, null, "\t") + "\n",
	);
}

/**
 * Applies a feature's files to the project
 */
async function applyFeatureFiles(
	featureId: string,
	projectPath: string,
	config: ProjectConfig,
): Promise<void> {
	const featureFilesPath = join(getFeaturePath(featureId), "files");

	// Check if feature has files to copy
	try {
		const entries = await readdir(featureFilesPath);
		if (entries.length === 0) {
			return;
		}
	} catch {
		return; // No files to copy
	}

	// Copy feature files
	await processTemplateFiles(featureFilesPath, projectPath, config);
}

/**
 * Modifies app.module.ts to include feature imports and configurations
 */
async function applyFeaturesToAppModule(
	projectPath: string,
	features: Feature[],
): Promise<void> {
	const appModulePath = join(projectPath, "src", "app.module.ts");
	let content = await Bun.file(appModulePath).text();

	const allImports: string[] = [];
	const moduleImports: string[] = ["LoggerModule"];
	const controllers: string[] = ["AppController"];
	const providers: string[] = [];

	// Collect all feature configurations
	for (const feature of features) {
		if (feature.imports) {
			allImports.push(...feature.imports);
		}
		if (feature.moduleConfig?.imports) {
			moduleImports.push(...feature.moduleConfig.imports);
		}
		if (feature.moduleConfig?.controllers) {
			controllers.push(...feature.moduleConfig.controllers);
		}
		if (feature.moduleConfig?.providers) {
			providers.push(...feature.moduleConfig.providers);
		}
	}

	// Build the new imports section
	const baseImports =
		'import { Module } from "@dwex/core";\nimport { LoggerModule } from "@dwex/logger";\nimport { AppController } from "./app.controller";';
	const newImports = [baseImports, ...allImports].join("\n");

	// Build the module decorator
	let moduleDecorator = "@Module({\n";
	moduleDecorator += `\timports: [${moduleImports.join(", ")}],\n`;
	moduleDecorator += `\tcontrollers: [${controllers.join(", ")}],\n`;
	if (providers.length > 0) {
		moduleDecorator += `\tproviders: [${providers.join(", ")}],\n`;
	}
	moduleDecorator += "})";

	// Replace the entire file with the new content
	content = `${newImports}\n\n/**\n * Root application module\n */\n${moduleDecorator}\nexport class AppModule {}\n`;

	await Bun.write(appModulePath, content);
}

/**
 * Modifies main.ts to include feature setup
 */
async function applyFeaturesToMain(
	projectPath: string,
	features: Feature[],
	config: ProjectConfig,
): Promise<void> {
	const mainPath = join(projectPath, "src", "main.ts");
	let content = await Bun.file(mainPath).text();

	const allImports: string[] = [];
	const beforeListen: string[] = [];
	const afterListen: string[] = [];

	// Collect all feature configurations
	for (const feature of features) {
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
async function applyFeaturesToAppController(
	projectPath: string,
	features: Feature[],
): Promise<void> {
	const appControllerPath = join(projectPath, "src", "app.controller.ts");
	let content = await Bun.file(appControllerPath).text();

	const allImports: string[] = [];
	const methods: string[] = [];

	// Collect all feature configurations
	for (const feature of features) {
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

/**
 * Composes a project from base template and selected features
 */
export async function composeProject(
	projectPath: string,
	config: ProjectConfig,
): Promise<void> {
	// 1. Copy base template
	const baseTemplatePath = getBaseTemplatePath();
	await processTemplateFiles(baseTemplatePath, projectPath, config);

	// 2. Load all selected features
	const features: Feature[] = [];
	for (const featureId of config.features) {
		const feature = await loadFeature(featureId, config);
		features.push(feature);
	}

	// 3. Apply feature files
	for (const featureId of config.features) {
		await applyFeatureFiles(featureId, projectPath, config);
	}

	// 4. Merge package.json dependencies
	await mergePackageJson(projectPath, features);

	// 5. Apply features to app.module.ts
	await applyFeaturesToAppModule(projectPath, features);

	// 6. Apply features to main.ts
	await applyFeaturesToMain(projectPath, features, config);

	// 7. Apply features to app.controller.ts
	await applyFeaturesToAppController(projectPath, features);
}
