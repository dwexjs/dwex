import { Module } from "@dwex/core";
import { BullMQModule } from "@dwex/bullmq";
import { EmailService } from "./email.service";
import { EmailProcessor } from "./email.processor";

/**
 * Email module with BullMQ queue integration
 *
 * Demonstrates full BullMQ functionality:
 * - Queue registration
 * - Worker/Processor with automatic job processing
 * - Event handlers (completed, failed, progress)
 */
@Module({
	imports: [
		// Register the email queue
		BullMQModule.registerQueue({ name: "emails" }),
		// Register the email processor (worker)
		BullMQModule.registerProcessors(EmailProcessor),
	],
	providers: [EmailService],
	exports: [EmailService],
})
export class EmailModule {}
