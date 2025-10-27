import { join } from "node:path";
import { BaseGenerator, type GeneratorOptions } from "./base.js";

/**
 * Module generator - creates a complete module with controller and service
 */
export class ModuleGenerator extends BaseGenerator {
	protected templateDir = "module";

	async generate(options: GeneratorOptions): Promise<void> {
		const { name, path } = options;

		const className = this.toPascalCase(name);
		const fileName = this.toKebabCase(name);
		const serviceName = this.toCamelCase(name) + "Service";
		const routePath = this.toKebabCase(name);

		const data = {
			className,
			fileName,
			serviceName,
			routePath,
		};

		const moduleDir = join(path, fileName);

		// Generate module file
		await this.generateFile(
			"module.ts.ejs",
			join(moduleDir, `${fileName}.module.ts`),
			data,
		);

		// Generate controller file
		await this.generateFile(
			"controller.ts.ejs",
			join(moduleDir, `${fileName}.controller.ts`),
			data,
		);

		// Generate service file
		await this.generateFile(
			"service.ts.ejs",
			join(moduleDir, `${fileName}.service.ts`),
			data,
		);
	}
}
