import "reflect-metadata";
import { SELF_DECLARED_DEPS } from "@dwex/common";
import { getFlowProducerToken } from "../bullmq.constants.js";

/**
 * Parameter decorator to inject a BullMQ FlowProducer instance
 *
 * @param flowName - Name of the flow producer to inject
 *
 * @example
 * ```typescript
 * @Injectable()
 * export class WorkflowService {
 *   constructor(
 *     @InjectFlowProducer('workflows') private flowProducer: FlowProducer
 *   ) {}
 *
 *   async createWorkflow(data: WorkflowData) {
 *     await this.flowProducer.add({
 *       name: 'workflow',
 *       queueName: 'workflows',
 *       data,
 *       children: [...]
 *     });
 *   }
 * }
 * ```
 */
export function InjectFlowProducer(flowName: string): ParameterDecorator {
	return (target: Object, propertyKey: string | symbol | undefined, parameterIndex: number) => {
		const token = getFlowProducerToken(flowName);
		
		// Get existing dependencies or initialize empty array
		const existingDeps: any[] =
			Reflect.getMetadata(SELF_DECLARED_DEPS, target) || [];

		// Set the dependency at the correct parameter index
		existingDeps[parameterIndex] = token;

		// Store updated dependencies
		Reflect.defineMetadata(SELF_DECLARED_DEPS, existingDeps, target);
	};
}
