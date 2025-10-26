import { Module } from "@dwex/core";
import { LoggerModule } from "@dwex/logger";
import { AppController } from "./app.controller";

/**
 * Root application module
 */
@Module({
  imports: [LoggerModule],
  controllers: [AppController],
})
export class AppModule {}
