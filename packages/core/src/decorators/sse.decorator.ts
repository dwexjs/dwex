import "reflect-metadata";
import {
	HTTP_METHOD,
	RequestMethod,
	ROUTE_PATH,
	SSE_METADATA,
	type SseOptions,
} from "@dwex/common";

/**
 * Declares a route handler for Server-Sent Events (SSE).
 * SSE endpoints use HTTP GET and stream events to connected clients.
 *
 * The decorator automatically sets the required SSE headers:
 * - Content-Type: text/event-stream
 * - Cache-Control: no-cache
 * - Connection: keep-alive
 *
 * @param path - The route path (optional)
 * @param options - SSE configuration options (optional)
 * @returns Method decorator
 *
 * @example
 * Using async generator (recommended):
 * ```typescript
 * @Controller('events')
 * class EventsController {
 *   @Sse('notifications')
 *   async *streamNotifications() {
 *     for (let i = 0; i < 10; i++) {
 *       yield {
 *         data: { count: i },
 *         event: 'update',
 *         id: String(i)
 *       };
 *       await new Promise(resolve => setTimeout(resolve, 1000));
 *     }
 *   }
 * }
 * ```
 *
 * @example
 * Using SseStream for imperative control:
 * ```typescript
 * @Controller('events')
 * class EventsController {
 *   @Sse('updates')
 *   streamUpdates() {
 *     const stream = new SseStream();
 *
 *     let count = 0;
 *     const interval = setInterval(() => {
 *       stream.send({
 *         data: { count: count++ },
 *         event: 'update'
 *       });
 *
 *       if (count >= 10) {
 *         clearInterval(interval);
 *         stream.close();
 *       }
 *     }, 1000);
 *
 *     stream.onClose(() => clearInterval(interval));
 *
 *     return stream;
 *   }
 * }
 * ```
 *
 * @example
 * With dependency injection:
 * ```typescript
 * @Controller('notifications')
 * class NotificationsController {
 *   constructor(private notificationService: NotificationService) {}
 *
 *   @Sse('stream')
 *   async *streamNotifications(@Query('userId') userId: string) {
 *     yield { data: { message: 'Connected' } };
 *
 *     for await (const notification of this.notificationService.subscribe(userId)) {
 *       yield {
 *         data: notification,
 *         event: 'notification',
 *         id: notification.id
 *       };
 *     }
 *   }
 * }
 * ```
 */
export function Sse(path = "", options?: SseOptions): MethodDecorator {
	return (
		target: object,
		propertyKey: string | symbol,
		descriptor: PropertyDescriptor,
	) => {
		// Set route path and HTTP method (SSE uses GET)
		Reflect.defineMetadata(ROUTE_PATH, path, descriptor.value);
		Reflect.defineMetadata(HTTP_METHOD, RequestMethod.GET, descriptor.value);

		// Mark this as an SSE endpoint and store options
		Reflect.defineMetadata(SSE_METADATA, options || {}, descriptor.value);

		return descriptor;
	};
}
