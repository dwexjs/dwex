/**
 * Server-Sent Events (SSE) interfaces and types
 */

/**
 * Represents a Server-Sent Event message.
 */
export interface SseEvent {
	/**
	 * The data payload to send. Can be a string, object, or any JSON-serializable value.
	 * Objects will be automatically serialized to JSON.
	 */
	data: string | object | number | boolean | null;

	/**
	 * Optional event type. Clients can listen for specific event types.
	 * If not specified, the client will trigger the 'message' event.
	 *
	 * @example
	 * ```typescript
	 * { event: 'notification', data: { message: 'New message' } }
	 * ```
	 */
	event?: string;

	/**
	 * Optional event ID. Used by the client for reconnection.
	 * The browser will send this as the Last-Event-ID header when reconnecting.
	 */
	id?: string;

	/**
	 * Optional retry time in milliseconds.
	 * Tells the browser how long to wait before attempting to reconnect.
	 */
	retry?: number;

	/**
	 * Optional comment to send. Comments are ignored by clients but can be useful
	 * for keeping connections alive or debugging.
	 */
	comment?: string;
}

/**
 * Options for configuring SSE responses.
 */
export interface SseOptions {
	/**
	 * Custom headers to include in the SSE response.
	 * Note: Content-Type, Cache-Control, and Connection headers are set automatically.
	 */
	headers?: Record<string, string>;

	/**
	 * Whether to enable CORS for SSE endpoint.
	 * @default false
	 */
	cors?: boolean;
}

/**
 * Type guard to check if a value is an SSE event.
 */
export function isSseEvent(value: unknown): value is SseEvent {
	return (
		typeof value === "object" &&
		value !== null &&
		"data" in value &&
		(value.data !== undefined || value.data !== null)
	);
}
