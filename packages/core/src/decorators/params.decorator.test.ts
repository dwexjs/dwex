import { describe, it, expect } from "vitest";
import {
	Body,
	Query,
	Param,
	Headers,
	Cookies,
	Req,
	Res,
	Next,
	Session,
	Ip,
	Host,
} from "./params.decorator";
import { ParamType } from "./params.decorator";
import { ROUTE_PARAMS } from "@dwexjs/common";
import "reflect-metadata";

describe("Parameter Decorators", () => {
	it("should store Body metadata", () => {
		const mockMethod = function () {};
		const decorator = Body();

		decorator(
			{ constructor: { prototype: { create: mockMethod } } },
			"create",
			0,
		);

		const params = Reflect.getMetadata(ROUTE_PARAMS, mockMethod);
		expect(params).toHaveLength(1);
		expect(params[0].type).toBe(ParamType.BODY);
		expect(params[0].index).toBe(0);
	});

	it("should store Body metadata with property name", () => {
		const mockMethod = function () {};
		const decorator = Body("name");

		decorator(
			{ constructor: { prototype: { create: mockMethod } } },
			"create",
			0,
		);

		const params = Reflect.getMetadata(ROUTE_PARAMS, mockMethod);
		expect(params[0].data).toBe("name");
	});

	it("should store Query metadata", () => {
		const mockMethod = function () {};
		const decorator = Query("page");

		decorator(
			{ constructor: { prototype: { findAll: mockMethod } } },
			"findAll",
			0,
		);

		const params = Reflect.getMetadata(ROUTE_PARAMS, mockMethod);
		expect(params[0].type).toBe(ParamType.QUERY);
		expect(params[0].data).toBe("page");
	});

	it("should store Param metadata", () => {
		const mockMethod = function () {};
		const decorator = Param("id");

		decorator(
			{ constructor: { prototype: { findOne: mockMethod } } },
			"findOne",
			0,
		);

		const params = Reflect.getMetadata(ROUTE_PARAMS, mockMethod);
		expect(params[0].type).toBe(ParamType.PARAM);
		expect(params[0].data).toBe("id");
	});

	it("should store Headers metadata", () => {
		const mockMethod = function () {};
		const decorator = Headers("authorization");

		decorator(
			{ constructor: { prototype: { getHeaders: mockMethod } } },
			"getHeaders",
			0,
		);

		const params = Reflect.getMetadata(ROUTE_PARAMS, mockMethod);
		expect(params[0].type).toBe(ParamType.HEADERS);
	});

	it("should store multiple parameter decorators", () => {
		const mockMethod = function () {};
		const paramDecorator = Param("id");
		const bodyDecorator = Body();
		const queryDecorator = Query("force");

		const target = { constructor: { prototype: { update: mockMethod } } };
		paramDecorator(target, "update", 0);
		bodyDecorator(target, "update", 1);
		queryDecorator(target, "update", 2);

		const params = Reflect.getMetadata(ROUTE_PARAMS, mockMethod);
		expect(params).toHaveLength(3);
		expect(params[0].index).toBe(0);
		expect(params[1].index).toBe(1);
		expect(params[2].index).toBe(2);
	});

	it("should store Req metadata", () => {
		const mockMethod = function () {};
		const decorator = Req();

		decorator(
			{ constructor: { prototype: { handler: mockMethod } } },
			"handler",
			0,
		);

		const params = Reflect.getMetadata(ROUTE_PARAMS, mockMethod);
		expect(params[0].type).toBe(ParamType.REQUEST);
	});

	it("should store Res metadata", () => {
		const mockMethod = function () {};
		const decorator = Res();

		decorator(
			{ constructor: { prototype: { handler: mockMethod } } },
			"handler",
			0,
		);

		const params = Reflect.getMetadata(ROUTE_PARAMS, mockMethod);
		expect(params[0].type).toBe(ParamType.RESPONSE);
	});
});
