import type { Job } from "bullmq";

/**
 * Abstract base class for queue processors
 * 
 * All processor classes decorated with @Processor must extend this class
 * and implement the process() method.
 *
 * @example
 * ```typescript
 * @Processor('emails')
 * export class EmailProcessor extends WorkerHost {
 *   async process(job: Job<EmailData, EmailResult, string>) {
 *     const { to, subject, body } = job.data;
 *     
 *     // Send email logic here
 *     await sendEmail(to, subject, body);
 *     
 *     return { sent: true, messageId: 'xxx' };
 *   }
 *
 *   @OnWorkerEvent('completed')
 *   onCompleted(job: Job, result: EmailResult) {
 *     console.log(`Email sent successfully: ${result.messageId}`);
 *   }
 *
 *   @OnWorkerEvent('failed')
 *   onFailed(job: Job, error: Error) {
 *     console.error(`Failed to send email: ${error.message}`);
 *   }
 * }
 * ```
 */
export abstract class WorkerHost<
	DataType = any,
	ResultType = any,
	NameType extends string = string,
> {
	/**
	 * Process a job from the queue
	 * 
	 * This method must be implemented by all processor classes.
	 * It will be called automatically when a job is received from the queue.
	 *
	 * @param job - The job to process
	 * @returns A promise that resolves with the job result
	 */
	abstract process(
		job: Job<DataType, ResultType, NameType>,
	): Promise<ResultType>;
}
