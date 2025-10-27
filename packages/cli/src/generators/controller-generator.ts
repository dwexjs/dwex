import { join } from "node:path";
import { BaseGenerator, type GeneratorOptions } from "./base.js";

/**
 * Controller generator
 */
export class ControllerGenerator extends BaseGenerator {
	protected templateDir = "controller";

	async generate(options: GeneratorOptions): Promise<void> {
		const { name, path } = options;

		const className = this.toPascalCase(name);
		const fileName = this.toKebabCase(name);
		const routePath = this.toKebabCase(name);

		const data = {
			className,
			fileName,
			routePath,
			serviceName: "",
		};

		await this.generateFile(
			"controller.ts.ejs",
			join(path, `${fileName}.controller.ts`),
			data,
		);
	}
}
