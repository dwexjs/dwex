import "reflect-metadata";
import { SELF_DECLARED_DEPS } from "@dwex/common";
import { getQueueToken } from "../bullmq.constants.js";

/**
 * Parameter decorator to inject a BullMQ Queue instance
 *
 * @param queueName - Name of the queue to inject
 *
 * @example
 * ```typescript
 * @Injectable()
 * export class EmailService {
 *   constructor(
 *     @InjectQueue('emails') private emailQueue: Queue
 *   ) {}
 *
 *   async sendEmail(data: EmailData) {
 *     await this.emailQueue.add('send-email', data);
 *   }
 * }
 * ```
 */
export function InjectQueue(queueName: string): ParameterDecorator {
	return (target: Object, propertyKey: string | symbol | undefined, parameterIndex: number) => {
		const token = getQueueToken(queueName);
		
		// Get existing dependencies or initialize empty array
		const existingDeps: any[] =
			Reflect.getMetadata(SELF_DECLARED_DEPS, target) || [];

		// Set the dependency at the correct parameter index
		existingDeps[parameterIndex] = token;

		// Store updated dependencies
		Reflect.defineMetadata(SELF_DECLARED_DEPS, existingDeps, target);
	};
}
