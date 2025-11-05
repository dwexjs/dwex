import { CONTROLLER_PATH } from "@dwex/common";
import { describe, expect, it } from "vitest";
import { Controller } from "./controller.decorator";
import "reflect-metadata";

describe("Controller Decorator", () => {
	it("should set controller path metadata", () => {
		@Controller("/users")
		class UserController {}

		const path = Reflect.getMetadata(CONTROLLER_PATH, UserController);
		expect(path).toBe("/users");
	});

	it("should handle empty path", () => {
		@Controller()
		class AppController {}

		const path = Reflect.getMetadata(CONTROLLER_PATH, AppController);
		expect(path).toBe("");
	});

	it("should handle nested paths", () => {
		@Controller("/api/v1/users")
		class ApiUserController {}

		const path = Reflect.getMetadata(CONTROLLER_PATH, ApiUserController);
		expect(path).toBe("/api/v1/users");
	});
});
