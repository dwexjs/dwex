import { HTTP_METHOD, RequestMethod, ROUTE_PATH } from "@dwex/common";
import { describe, expect, it } from "vitest";
import {
	All,
	Delete,
	Get,
	Head,
	Options,
	Patch,
	Post,
	Put,
} from "./http-methods.decorator";
import "reflect-metadata";

describe("HTTP Method Decorators", () => {
	it("should set metadata for GET decorator", () => {
		const decorator = Get("/users");
		const mockMethod = () => {};
		const descriptor = { value: mockMethod };

		decorator({}, "getUsers", descriptor);

		const metadata = Reflect.getMetadata(HTTP_METHOD, mockMethod);
		const path = Reflect.getMetadata(ROUTE_PATH, mockMethod);

		expect(metadata).toBe(RequestMethod.GET);
		expect(path).toBe("/users");
	});

	it("should set metadata for POST decorator", () => {
		const decorator = Post("/users");
		const mockMethod = () => {};
		const descriptor = { value: mockMethod };

		decorator({}, "createUser", descriptor);

		const metadata = Reflect.getMetadata(HTTP_METHOD, mockMethod);
		expect(metadata).toBe(RequestMethod.POST);
	});

	it("should set metadata for PUT decorator", () => {
		const decorator = Put("/users/:id");
		const mockMethod = () => {};
		const descriptor = { value: mockMethod };

		decorator({}, "updateUser", descriptor);

		const metadata = Reflect.getMetadata(HTTP_METHOD, mockMethod);
		expect(metadata).toBe(RequestMethod.PUT);
	});

	it("should set metadata for DELETE decorator", () => {
		const decorator = Delete("/users/:id");
		const mockMethod = () => {};
		const descriptor = { value: mockMethod };

		decorator({}, "deleteUser", descriptor);

		const metadata = Reflect.getMetadata(HTTP_METHOD, mockMethod);
		expect(metadata).toBe(RequestMethod.DELETE);
	});

	it("should set metadata for PATCH decorator", () => {
		const decorator = Patch("/users/:id");
		const mockMethod = () => {};
		const descriptor = { value: mockMethod };

		decorator({}, "patchUser", descriptor);

		const metadata = Reflect.getMetadata(HTTP_METHOD, mockMethod);
		expect(metadata).toBe(RequestMethod.PATCH);
	});

	it("should handle empty path", () => {
		const decorator = Get();
		const mockMethod = () => {};
		const descriptor = { value: mockMethod };

		decorator({}, "index", descriptor);

		const path = Reflect.getMetadata(ROUTE_PATH, mockMethod);
		expect(path).toBe("");
	});
});
