import { Module } from "@dwex/core";
import { AppController } from "./app.controller.js";
import { UsersController } from "./users.controller.js";

@Module({
	controllers: [AppController, UsersController],
	providers: [],
	imports: [],
})
export class AppModule {}
