import { Module } from "@dwexjs/core";
import { LoggerModule } from "@dwexjs/logger";
import { AppController } from "./app.controller";

/**
 * Root application module
 */
@Module({
	imports: [
		LoggerModule.forRoot({
			isGlobal: true,
		}),
	],
	controllers: [AppController],
})
export class AppModule {}
