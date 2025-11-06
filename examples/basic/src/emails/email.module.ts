import { Module } from "@dwex/core";
import { BullMQModule } from "@dwex/bullmq";
import { EmailService } from "./email.service";

/**
 * Email module with BullMQ queue integration
 *
 * Note: Worker/Processor functionality is available but requires additional setup.
 * This example demonstrates queue operations (adding jobs, checking stats).
 * For full worker implementation, see the BullMQ documentation.
 */
@Module({
	imports: [
		// Register the email queue
		BullMQModule.registerQueue({ name: "emails" }),
	],
	providers: [EmailService],
	exports: [EmailService],
})
export class EmailModule {}
