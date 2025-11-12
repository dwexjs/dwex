import { Module } from "@dwex/core";
import { EmailService } from "./email.service";

/**
 * Email module - simplified without BullMQ
 */
@Module({
	providers: [EmailService],
	exports: [EmailService],
})
export class EmailModule {}
