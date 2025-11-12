import { beforeEach, describe, expect, it } from "vitest";
import { SseStream, formatSseEvent } from "./sse.util.js";

describe("formatSseEvent", () => {
	it("should format a simple data event", () => {
		const result = formatSseEvent({ data: "Hello, World!" });
		expect(result).toBe("data: Hello, World!\n\n");
	});

	it("should format an event with event type", () => {
		const result = formatSseEvent({
			data: "Test message",
			event: "notification",
		});
		expect(result).toBe("event: notification\ndata: Test message\n\n");
	});

	it("should format an event with ID", () => {
		const result = formatSseEvent({
			data: "Test",
			id: "123",
		});
		expect(result).toBe("id: 123\ndata: Test\n\n");
	});

	it("should format an event with retry", () => {
		const result = formatSseEvent({
			data: "Test",
			retry: 3000,
		});
		expect(result).toBe("retry: 3000\ndata: Test\n\n");
	});

	it("should format an event with comment", () => {
		const result = formatSseEvent({
			data: "Test",
			comment: "Keep-alive ping",
		});
		expect(result).toBe(": Keep-alive ping\ndata: Test\n\n");
	});

	it("should serialize object data to JSON", () => {
		const result = formatSseEvent({
			data: { message: "Hello", count: 42 },
		});
		expect(result).toBe('data: {"message":"Hello","count":42}\n\n');
	});

	it("should format complete event with all fields", () => {
		const result = formatSseEvent({
			event: "update",
			id: "456",
			retry: 5000,
			data: { status: "ok" },
			comment: "Status update",
		});
		expect(result).toContain("event: update");
		expect(result).toContain("id: 456");
		expect(result).toContain("retry: 5000");
		expect(result).toContain('data: {"status":"ok"}');
		expect(result).toContain(": Status update");
		expect(result.endsWith("\n\n")).toBe(true);
	});

	it("should handle multi-line data", () => {
		const result = formatSseEvent({
			data: "Line 1\nLine 2\nLine 3",
		});
		expect(result).toBe("data: Line 1\ndata: Line 2\ndata: Line 3\n\n");
	});
});

describe("SseStream", () => {
	let stream: SseStream;

	beforeEach(() => {
		stream = new SseStream();
	});

	it("should create a stream instance", () => {
		expect(stream).toBeInstanceOf(SseStream);
		expect(stream.isClosed()).toBe(false);
	});

	it("should send an SSE event", async () => {
		const reader = stream.getStream().getReader();

		stream.send({ data: "Test message" });
		stream.close();

		const { value } = await reader.read();

		expect(value).toBe("data: Test message\n\n");
	});

	it("should send multiple events", async () => {
		const reader = stream.getStream().getReader();

		stream.send({ data: "First" });
		stream.send({ data: "Second" });
		stream.close();

		const chunks: string[] = [];
		let result = await reader.read();
		while (!result.done) {
			chunks.push(result.value as string);
			result = await reader.read();
		}

		expect(chunks.join("")).toContain("data: First\n\n");
		expect(chunks.join("")).toContain("data: Second\n\n");
	});

	it("should send data with sendData helper", async () => {
		const reader = stream.getStream().getReader();

		stream.sendData({ count: 42 });
		stream.close();

		const { value } = await reader.read();

		expect(value).toBe('data: {"count":42}\n\n');
	});

	it("should send comments with sendComment", async () => {
		const reader = stream.getStream().getReader();

		stream.sendComment("keep-alive");
		stream.close();

		const { value } = await reader.read();

		expect(value).toBe(": keep-alive\n\n");
	});

	it("should throw error when sending on closed stream", () => {
		stream.close();
		expect(() => stream.send({ data: "Test" })).toThrow(
			"Cannot send event on a closed SSE stream",
		);
	});

	it("should call onClose callback when stream is closed", () => {
		let called = false;
		stream.onClose(() => {
			called = true;
		});

		stream.close();

		expect(called).toBe(true);
		expect(stream.isClosed()).toBe(true);
	});

	it("should call multiple onClose callbacks", () => {
		let count = 0;
		stream.onClose(() => count++);
		stream.onClose(() => count++);
		stream.onClose(() => count++);

		stream.close();

		expect(count).toBe(3);
	});

	it("should mark stream as closed", () => {
		expect(stream.isClosed()).toBe(false);
		stream.close();
		expect(stream.isClosed()).toBe(true);
	});

	it("should not error when closing an already closed stream", () => {
		stream.close();
		expect(() => stream.close()).not.toThrow();
	});
});
