import { join } from "node:path";
import { BaseGenerator, type GeneratorOptions } from "./base.js";

/**
 * Middleware generator
 */
export class MiddlewareGenerator extends BaseGenerator {
	protected templateDir = "middleware";

	async generate(options: GeneratorOptions): Promise<void> {
		const { name, path } = options;

		const className = this.toPascalCase(name);
		const fileName = this.toKebabCase(name);

		const data = {
			className,
			fileName,
			serviceName: "",
			routePath: "",
		};

		await this.generateFile(
			"middleware.ts.ejs",
			join(path, `${fileName}.middleware.ts`),
			data,
		);
	}
}
