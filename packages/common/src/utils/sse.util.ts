import type { SseEvent } from "../interfaces/sse.interface.js";

/**
 * Formats an SSE event according to the SSE protocol specification.
 *
 * @param event - The SSE event to format
 * @returns The formatted SSE event string
 *
 * @example
 * ```typescript
 * const formatted = formatSseEvent({
 *   data: { message: 'Hello' },
 *   event: 'greeting',
 *   id: '1'
 * });
 * // Returns: "event: greeting\nid: 1\ndata: {\"message\":\"Hello\"}\n\n"
 * ```
 */
export function formatSseEvent(event: SseEvent): string {
	const lines: string[] = [];

	// Add comment if present
	if (event.comment) {
		lines.push(`: ${event.comment}`);
	}

	// Add event type if present
	if (event.event) {
		lines.push(`event: ${event.event}`);
	}

	// Add event ID if present
	if (event.id) {
		lines.push(`id: ${event.id}`);
	}

	// Add retry if present
	if (event.retry !== undefined) {
		lines.push(`retry: ${event.retry}`);
	}

	// Add data (required)
	const data =
		typeof event.data === "string"
			? event.data
			: JSON.stringify(event.data);

	// Handle multi-line data by prefixing each line with "data: "
	const dataLines = data.split("\n");
	for (const line of dataLines) {
		lines.push(`data: ${line}`);
	}

	// SSE protocol requires double newline at the end
	return `${lines.join("\n")}\n\n`;
}

/**
 * Helper class for creating Server-Sent Events (SSE) streams.
 * Provides an imperative API for sending events to connected clients.
 *
 * @example
 * ```typescript
 * @Controller('events')
 * class EventsController {
 *   @Sse('notifications')
 *   streamNotifications() {
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
 */
export class SseStream {
	private controller: ReadableStreamDefaultController<string> | null = null;
	private stream: ReadableStream<string>;
	private closeCallbacks: Array<() => void> = [];
	private closed = false;

	constructor() {
		this.stream = new ReadableStream<string>({
			start: (controller) => {
				this.controller = controller;
			},
			cancel: () => {
				this.handleClose();
			},
		});
	}

	/**
	 * Send an SSE event to the client.
	 *
	 * @param event - The event to send
	 * @throws Error if the stream is closed
	 *
	 * @example
	 * ```typescript
	 * stream.send({
	 *   data: { message: 'Hello' },
	 *   event: 'greeting',
	 *   id: '1'
	 * });
	 * ```
	 */
	send(event: SseEvent): void {
		if (this.closed) {
			throw new Error("Cannot send event on a closed SSE stream");
		}

		if (!this.controller) {
			throw new Error("Stream controller not initialized");
		}

		const formatted = formatSseEvent(event);
		this.controller.enqueue(formatted);
	}

	/**
	 * Send a simple data message without additional SSE fields.
	 *
	 * @param data - The data to send
	 *
	 * @example
	 * ```typescript
	 * stream.sendData({ status: 'ok' });
	 * ```
	 */
	sendData(data: string | object | number | boolean | null): void {
		this.send({ data });
	}

	/**
	 * Send a comment (keep-alive ping).
	 *
	 * @param comment - The comment text
	 *
	 * @example
	 * ```typescript
	 * stream.sendComment('keep-alive');
	 * ```
	 */
	sendComment(comment: string): void {
		if (this.closed || !this.controller) {
			return;
		}

		this.controller.enqueue(`: ${comment}\n\n`);
	}

	/**
	 * Close the SSE stream.
	 * Triggers all registered close callbacks.
	 */
	close(): void {
		if (this.closed) {
			return;
		}

		this.closed = true;

		if (this.controller) {
			this.controller.close();
		}

		this.handleClose();
	}

	/**
	 * Register a callback to be called when the stream is closed.
	 *
	 * @param callback - Function to call on close
	 *
	 * @example
	 * ```typescript
	 * const interval = setInterval(() => stream.send({ data: 'ping' }), 1000);
	 * stream.onClose(() => clearInterval(interval));
	 * ```
	 */
	onClose(callback: () => void): void {
		this.closeCallbacks.push(callback);
	}

	/**
	 * Get the underlying ReadableStream.
	 * Used internally by the framework to create the Response.
	 *
	 * @internal
	 */
	getStream(): ReadableStream<string> {
		return this.stream;
	}

	/**
	 * Check if the stream is closed.
	 */
	isClosed(): boolean {
		return this.closed;
	}

	private handleClose(): void {
		for (const callback of this.closeCallbacks) {
			try {
				callback();
			} catch (error) {
				console.error("Error in SSE close callback:", error);
			}
		}
		this.closeCallbacks = [];
	}
}

/**
 * Creates an SSE ReadableStream from an async iterable.
 *
 * @param iterable - Async iterable that yields SSE events
 * @returns ReadableStream for SSE
 *
 * @internal
 */
export async function* asyncIterableToSseEvents(
	iterable: AsyncIterable<SseEvent | string | object>,
): AsyncGenerator<string> {
	for await (const item of iterable) {
		// If it's already a properly formatted SSE event
		if (
			typeof item === "object" &&
			item !== null &&
			"data" in item &&
			item.data !== undefined
		) {
			yield formatSseEvent(item as SseEvent);
		} else {
			// Wrap simple values in an SSE event
			yield formatSseEvent({ data: item });
		}
	}
}
