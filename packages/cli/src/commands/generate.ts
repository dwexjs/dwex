import type { Command } from "commander";
import * as clack from "@clack/prompts";
import pc from "picocolors";
import {
	ModuleGenerator,
	ControllerGenerator,
	ServiceGenerator,
	GuardGenerator,
	MiddlewareGenerator,
} from "../generators/index.js";
import {
	findModules,
	getModulesDir,
	hasModulesDir,
	logger,
} from "../utils/index.js";
import { mkdirSync } from "node:fs";

type SchematicType =
	| "module"
	| "controller"
	| "service"
	| "guard"
	| "middleware";

/**
 * Generate command - scaffolds code with interactive prompts
 */
export async function generateCommand(program: Command): Promise<void> {
	program
		.command("generate")
		.alias("g")
		.description("Generate code scaffolding")
		.argument("[schematic]", "Type of code to generate (module, controller, service, guard, middleware)")
		.argument("[name]", "Name of the schematic")
		.action(async (schematic?: SchematicType, name?: string) => {
			try {
				clack.intro(pc.bgCyan(pc.black(" Dwex Generator ")));

				// If schematic not provided, prompt for it
				if (!schematic) {
					const result = await clack.select({
						message: "What would you like to generate?",
						options: [
							{
								value: "module",
								label: "Module",
								hint: "Complete module with controller and service",
							},
							{
								value: "controller",
								label: "Controller",
								hint: "REST API controller",
							},
							{
								value: "service",
								label: "Service",
								hint: "Business logic service",
							},
							{
								value: "guard",
								label: "Guard",
								hint: "Route guard for authorization",
							},
							{
								value: "middleware",
								label: "Middleware",
								hint: "HTTP middleware",
							},
						],
					});

					if (clack.isCancel(result)) {
						clack.cancel("Operation cancelled");
						process.exit(0);
					}

					schematic = result as SchematicType;
				}

				// Validate schematic type
				const validSchematics: SchematicType[] = [
					"module",
					"controller",
					"service",
					"guard",
					"middleware",
				];
				if (!validSchematics.includes(schematic)) {
					logger.error(
						`Invalid schematic type: ${schematic}. Valid types: ${validSchematics.join(", ")}`,
					);
					process.exit(1);
				}

				// If name not provided, prompt for it
				if (!name) {
					const result = await clack.text({
						message: `What is the name of the ${schematic}?`,
						placeholder: `my-${schematic}`,
						validate: (value) => {
							if (!value) return "Name is required";
							if (!/^[a-z0-9-_]+$/i.test(value)) {
								return "Name can only contain letters, numbers, hyphens, and underscores";
							}
							return undefined;
						},
					});

					if (clack.isCancel(result)) {
						clack.cancel("Operation cancelled");
						process.exit(0);
					}

					name = result;
				}

				// Determine target path based on schematic type
				let targetPath: string;

				if (schematic === "module") {
					// Modules always go into modules/ directory
					if (!hasModulesDir()) {
						const spinner = clack.spinner();
						spinner.start("Creating modules directory...");
						mkdirSync(getModulesDir(), { recursive: true });
						spinner.stop("Created modules directory");
					}
					targetPath = getModulesDir();
				} else {
					// For other schematics, ask which module to put them in
					const modules = findModules();

					if (modules.length === 0) {
						logger.error(
							"No modules found. Create a module first using 'dwex g module'",
						);
						process.exit(1);
					}

					const result = await clack.select({
						message: `Which module should contain this ${schematic}?`,
						options: modules.map((m) => ({
							value: m.path,
							label: m.name,
						})),
					});

					if (clack.isCancel(result)) {
						clack.cancel("Operation cancelled");
						process.exit(0);
					}

					targetPath = result as string;
				}

				// Generate the code
				const spinner = clack.spinner();
				spinner.start(`Generating ${schematic}...`);

				try {
					switch (schematic) {
						case "module": {
							const generator = new ModuleGenerator();
							await generator.generate({ name, path: targetPath });
							break;
						}
						case "controller": {
							const generator = new ControllerGenerator();
							await generator.generate({ name, path: targetPath });
							break;
						}
						case "service": {
							const generator = new ServiceGenerator();
							await generator.generate({ name, path: targetPath });
							break;
						}
						case "guard": {
							const generator = new GuardGenerator();
							await generator.generate({ name, path: targetPath });
							break;
						}
						case "middleware": {
							const generator = new MiddlewareGenerator();
							await generator.generate({ name, path: targetPath });
							break;
						}
					}

					spinner.stop(pc.green("Generated successfully!"));

					clack.outro(
						pc.green(
							`Don't forget to register your ${schematic} in the module!`,
						),
					);
				} catch (error) {
					spinner.stop(pc.red("Generation failed"));
					throw error;
				}
			} catch (error) {
				logger.error(
					error instanceof Error ? error.message : String(error),
				);
				process.exit(1);
			}
		});
}
