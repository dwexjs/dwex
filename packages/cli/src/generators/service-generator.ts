import { join } from "node:path";
import { BaseGenerator, type GeneratorOptions } from "./base.js";

/**
 * Service generator
 */
export class ServiceGenerator extends BaseGenerator {
	protected templateDir = "service";

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
			"service.ts.ejs",
			join(path, `${fileName}.service.ts`),
			data,
		);
	}
}
