import "reflect-metadata";
import { DwexFactory } from "@dwexjs/core";
import { AppModule } from "./app.module";

/**
 * Bootstrap the application
 */
async function bootstrap() {
	const app = await DwexFactory.create(AppModule);

	const port = 3001;
	await app.listen(port);
}

bootstrap();
