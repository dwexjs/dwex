import { INJECTABLE, SCOPE, Scope } from "@dwex/common";
import { describe, expect, it } from "vitest";
import { Injectable } from "./injectable.decorator";
import "reflect-metadata";

describe("Injectable Decorator", () => {
	it("should mark class as injectable", () => {
		@Injectable()
		class TestService {}

		const isInjectable = Reflect.getMetadata(INJECTABLE, TestService);
		expect(isInjectable).toBe(true);
	});

	it("should set singleton scope by default", () => {
		@Injectable()
		class TestService {}

		const scope = Reflect.getMetadata(SCOPE, TestService);
		expect(scope).toBeUndefined(); // Default is singleton, no explicit metadata
	});

	it("should set request scope when specified", () => {
		@Injectable({ scope: Scope.REQUEST })
		class RequestService {}

		const scope = Reflect.getMetadata(SCOPE, RequestService);
		expect(scope).toBe(Scope.REQUEST);
	});

	it("should set transient scope when specified", () => {
		@Injectable({ scope: Scope.TRANSIENT })
		class TransientService {}

		const scope = Reflect.getMetadata(SCOPE, TransientService);
		expect(scope).toBe(Scope.TRANSIENT);
	});
});
