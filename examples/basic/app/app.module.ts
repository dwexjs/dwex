import { Module } from "@dwexjs/core";
import { AppController } from "./app.controller";

/**
 * Root application module
 */
@Module({
	imports: [],
	controllers: [AppController],
})
export class AppModule {}
