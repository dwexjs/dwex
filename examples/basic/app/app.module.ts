import { Module } from "@dwexjs/core";
import { LoggerModule } from "@dwexjs/logger";
import { JwtModule } from "@dwexjs/jwt";
import { AppController } from "./app.controller";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { AuthGuard } from "./auth.guard";

/**
 * Root application module
 */
@Module({
	imports: [
		LoggerModule,
		JwtModule.register({
			global: true,
			secret: "super-secret-key-change-in-production",
			signOptions: { expiresIn: "1h" },
			issuer: "dwex-app",
		}),
	],
	controllers: [AppController, AuthController],
	providers: [AuthService, AuthGuard],
})
export class AppModule {}
