import { Module } from "@dwexjs/core";
import { LoggerModule } from "@dwexjs/logger";
import { AppController } from "./app.controller";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { AuthGuard } from "./auth.guard";

/**
 * Root application module
 */
@Module({
	imports: [LoggerModule],
	controllers: [AppController, AuthController],
	providers: [AuthService, AuthGuard],
})
export class AppModule {}
