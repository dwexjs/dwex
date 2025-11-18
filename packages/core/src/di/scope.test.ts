import { Scope } from "@dwex/common";
import { describe, expect, it, beforeEach } from "vitest";
import { Injectable } from "./injectable.decorator.js";
import { Container } from "./container.js";
import "reflect-metadata";

describe("Scope Behavior", () => {
	let container: Container;

	beforeEach(() => {
		container = new Container();
	});

	it("should return same instance for singleton scope", () => {
		@Injectable()
		class SingletonService {
			id = Math.random();
		}

		container.addProvider(SingletonService);

		const instance1 = container.get(SingletonService);
		const instance2 = container.get(SingletonService);

		expect(instance1).toBe(instance2);
		expect(instance1.id).toBe(instance2.id);
	});

	it("should return different instances for transient scope", () => {
		@Injectable({ scope: Scope.TRANSIENT })
		class TransientService {
			id = Math.random();
		}

		container.addProvider(TransientService);

		const instance1 = container.get(TransientService);
		const instance2 = container.get(TransientService);

		expect(instance1).not.toBe(instance2);
		expect(instance1.id).not.toBe(instance2.id);
	});

	it("should handle transient scope with dependencies", () => {
		@Injectable()
		class SingletonDep {
			id = Math.random();
		}

		@Injectable({ scope: Scope.TRANSIENT })
		class TransientService {
			id = Math.random();
			constructor(public dep: SingletonDep) {}
		}

		container.addProvider(SingletonDep);
		container.addProvider(TransientService);

		const instance1 = container.get(TransientService);
		const instance2 = container.get(TransientService);

		expect(instance1).not.toBe(instance2);
		expect(instance1.id).not.toBe(instance2.id);
		// Singleton dependency should be the same
		expect(instance1.dep).toBe(instance2.dep);
	});
});
