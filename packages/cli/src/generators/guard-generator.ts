import { join } from "node:path";
import { BaseGenerator, type GeneratorOptions } from "./base.js";

/**
 * Guard generator
 */
export class GuardGenerator extends BaseGenerator {
	protected templateDir = "guard";

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
			"guard.ts.ejs",
			join(path, `${fileName}.guard.ts`),
			data,
		);
	}
}
