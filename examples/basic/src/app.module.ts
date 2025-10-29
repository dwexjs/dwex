import { Module } from "@dwex/core";
import { JwtModule } from "@dwex/jwt";
import { LoggerModule } from "@dwex/logger";
import { AppController } from "./app.controller";

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
	controllers: [AppController],
	providers: [],
})
export class AppModule {}
