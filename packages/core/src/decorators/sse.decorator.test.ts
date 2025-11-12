import {
	HTTP_METHOD,
	RequestMethod,
	ROUTE_PATH,
	SSE_METADATA,
} from "@dwex/common";
import { describe, expect, it } from "vitest";
import { Sse } from "./sse.decorator.js";
import "reflect-metadata";

describe("@Sse()", () => {
	it("should set route path metadata", () => {
		const decorator = Sse("events");
		const mockMethod = () => {};
		const descriptor = { value: mockMethod };

		decorator({}, "streamEvents", descriptor);

		const path = Reflect.getMetadata(ROUTE_PATH, mockMethod);
		expect(path).toBe("events");
	});

	it("should set HTTP method to GET", () => {
		const decorator = Sse("stream");
		const mockMethod = () => {};
		const descriptor = { value: mockMethod };

		decorator({}, "streamData", descriptor);

		const method = Reflect.getMetadata(HTTP_METHOD, mockMethod);
		expect(method).toBe(RequestMethod.GET);
	});

	it("should set SSE metadata", () => {
		const decorator = Sse("notifications");
		const mockMethod = () => {};
		const descriptor = { value: mockMethod };

		decorator({}, "streamNotifications", descriptor);

		const metadata = Reflect.getMetadata(SSE_METADATA, mockMethod);
		expect(metadata).toBeDefined();
		expect(metadata).toEqual({});
	});

	it("should set SSE metadata with options", () => {
		const options = { cors: true };
		const decorator = Sse("updates", options);
		const mockMethod = () => {};
		const descriptor = { value: mockMethod };

		decorator({}, "streamUpdates", descriptor);

		const metadata = Reflect.getMetadata(SSE_METADATA, mockMethod);
		expect(metadata).toEqual(options);
	});

	it("should default to empty path", () => {
		const decorator = Sse();
		const mockMethod = () => {};
		const descriptor = { value: mockMethod };

		decorator({}, "stream", descriptor);

		const path = Reflect.getMetadata(ROUTE_PATH, mockMethod);
		expect(path).toBe("");
	});

	it("should work with async generator methods", () => {
		const decorator = Sse("generator");
		const mockMethod = async function* () {
			yield { data: "test" };
		};
		const descriptor = { value: mockMethod };

		decorator({}, "streamGenerator", descriptor);

		const method = Reflect.getMetadata(HTTP_METHOD, mockMethod);
		expect(method).toBe(RequestMethod.GET);
	});
});
