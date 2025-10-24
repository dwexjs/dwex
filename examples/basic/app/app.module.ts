import { Module } from "@dwexjs/core";
import { AppController } from "./app.controller";

/**
 * Root application module
 */
@Module({
	controllers: [AppController],
})
export class AppModule {}
