import { Module } from "@dwex/core";
import { JwtModule } from "@dwex/jwt";
import { LoggerModule } from "@dwex/logger";
import { BullMQModule } from "@dwex/bullmq";
import { AppController } from "./app.controller";
import { UsersModule } from "./users/users.module";
import { EmailModule } from "./emails/email.module";

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
		// BullMQ global configuration
		BullMQModule.forRoot({
			connection: {
				host: "localhost",
				port: 6379,
			},
		}),
		UsersModule,
		EmailModule,
	],
	controllers: [AppController],
	providers: [],
})
export class AppModule {}
