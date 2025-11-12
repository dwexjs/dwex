import { Module } from "@dwex/core";
import { JwtModule } from "@dwex/jwt";
import { LoggerModule } from "@dwex/logger";
import { AppController } from "./app.controller";
import { UsersModule } from "./users/users.module";
import { EmailModule } from "./emails/email.module";
import { ProductsModule } from "./products/products.module";

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
		UsersModule,
		EmailModule,
		ProductsModule,
	],
	controllers: [AppController],
	providers: [],
})
export class AppModule {}
