import { Module } from "@dwex/core";
import { JwtModule } from "@dwex/jwt";
import { LoggerModule } from "@dwex/logger";
import { AppController } from "./app.controller";
import { AuthController } from "./auth.controller";
import { AuthGuard } from "./auth.guard";
import { AuthService } from "./auth.service";

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
