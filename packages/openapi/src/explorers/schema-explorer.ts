import "reflect-metadata";
import { API_PROPERTY } from "@dwex/common";
import type { SchemaObject } from "openapi3-ts/oas31";
import type { ApiPropertyMetadata } from "../interfaces/index.js";

/**
 * Explores classes and generates OpenAPI schema objects.
 */
export class SchemaExplorer {
	private readonly schemas = new Map<any, SchemaObject>();
	private readonly schemaNames = new Map<any, string>();

	/**
	 * Gets or creates a schema for a type.
	 *
	 * @param type - The type to create a schema for
	 * @param isArray - Whether the type is an array
	 * @returns The schema object
	 */
	getOrCreateSchema(type: any, isArray = false): SchemaObject {
		if (!type) {
			return { type: "object" };
		}

		// Handle primitive types
		const primitiveSchema = this.getPrimitiveSchema(type);
		if (primitiveSchema) {
			if (isArray) {
				return {
					type: "array",
					items: primitiveSchema,
				};
			}
			return primitiveSchema;
		}

		// Handle arrays
		if (Array.isArray(type)) {
			const itemType = type[0];
			return {
				type: "array",
				items: this.getOrCreateSchema(itemType, false),
			};
		}

		// Handle complex types (classes/DTOs)
		if (typeof type === "function") {
			const schema = this.createSchemaFromClass(type);

			if (isArray) {
				return {
					type: "array",
					items: schema,
				};
			}

			return schema;
		}

		return { type: "object" };
	}

	/**
	 * Gets the primitive schema for basic types.
	 *
	 * @param type - The type to check
	 * @returns The schema object or null
	 */
	private getPrimitiveSchema(type: any): SchemaObject | null {
		switch (type) {
			case String:
				return { type: "string" };
			case Number:
				return { type: "number" };
			case Boolean:
				return { type: "boolean" };
			case Date:
				return { type: "string", format: "date-time" };
			case Object:
				return { type: "object" };
			default:
				// Check for primitive type names
				if (typeof type === "string") {
					switch (type.toLowerCase()) {
						case "string":
							return { type: "string" };
						case "number":
						case "integer":
							return { type: "number" };
						case "boolean":
							return { type: "boolean" };
						case "object":
							return { type: "object" };
						case "array":
							return { type: "array" };
					}
				}
				return null;
		}
	}

	/**
	 * Creates a schema from a class using @ApiProperty metadata.
	 *
	 * @param classType - The class to create a schema for
	 * @returns The schema object
	 */
	private createSchemaFromClass(classType: any): SchemaObject {
		// Check if we already have a schema for this class
		if (this.schemas.has(classType)) {
			const schemaName = this.schemaNames.get(classType);
			return { $ref: `#/components/schemas/${schemaName}` };
		}

		// Get property metadata
		const propertyMetadata: Record<string | symbol, ApiPropertyMetadata> =
			Reflect.getMetadata(API_PROPERTY, classType) || {};

		// If no metadata, try to infer from TypeScript metadata
		if (Object.keys(propertyMetadata).length === 0) {
			return this.createSchemaFromTypeScript(classType);
		}

		const properties: Record<string, SchemaObject> = {};
		const required: string[] = [];

		for (const [propertyKey, metadata] of Object.entries(propertyMetadata)) {
			const propertySchema: SchemaObject = {};

			// Determine type
			if (metadata.type) {
				const typeSchema = this.getOrCreateSchema(
					metadata.type,
					metadata.isArray,
				);
				Object.assign(propertySchema, typeSchema);
			} else {
				// Try to get design:type metadata
				const designType = Reflect.getMetadata(
					"design:type",
					classType.prototype,
					propertyKey,
				);
				if (designType) {
					const typeSchema = this.getOrCreateSchema(
						designType,
						metadata.isArray,
					);
					Object.assign(propertySchema, typeSchema);
				} else {
					propertySchema.type = "string"; // Default fallback
				}
			}

			// Add metadata fields
			if (metadata.description)
				propertySchema.description = metadata.description;
			if (metadata.example !== undefined)
				propertySchema.example = metadata.example;
			if (metadata.enum) propertySchema.enum = metadata.enum;
			if (metadata.minimum !== undefined)
				propertySchema.minimum = metadata.minimum;
			if (metadata.maximum !== undefined)
				propertySchema.maximum = metadata.maximum;
			if (metadata.minLength !== undefined)
				propertySchema.minLength = metadata.minLength;
			if (metadata.maxLength !== undefined)
				propertySchema.maxLength = metadata.maxLength;
			if (metadata.pattern) propertySchema.pattern = metadata.pattern;
			if (metadata.format) propertySchema.format = metadata.format;
			if (metadata.default !== undefined)
				propertySchema.default = metadata.default;

			properties[propertyKey as string] = propertySchema;

			if (metadata.required) {
				required.push(propertyKey as string);
			}
		}

		const schema: SchemaObject = {
			type: "object",
			properties,
		};

		if (required.length > 0) {
			schema.required = required;
		}

		// Store schema with class name
		const schemaName = classType.name || "UnnamedSchema";
		this.schemas.set(classType, schema);
		this.schemaNames.set(classType, schemaName);

		return schema;
	}

	/**
	 * Creates a schema from TypeScript reflection metadata.
	 *
	 * @param classType - The class to create a schema for
	 * @returns The schema object
	 */
	private createSchemaFromTypeScript(classType: any): SchemaObject {
		const instance = new classType();
		const properties: Record<string, SchemaObject> = {};

		// Get all properties from the instance
		for (const key of Object.keys(instance)) {
			const designType = Reflect.getMetadata(
				"design:type",
				classType.prototype,
				key,
			);

			if (designType) {
				const typeSchema = this.getPrimitiveSchema(designType);
				properties[key] = typeSchema || { type: "string" };
			} else {
				properties[key] = { type: "string" };
			}
		}

		return {
			type: "object",
			properties: Object.keys(properties).length > 0 ? properties : undefined,
		};
	}

	/**
	 * Gets all generated schemas.
	 *
	 * @returns Map of schema names to schema objects
	 */
	getAllSchemas(): Record<string, SchemaObject> {
		const result: Record<string, SchemaObject> = {};

		for (const [classType, schema] of this.schemas.entries()) {
			const name = this.schemaNames.get(classType);
			if (name) {
				result[name] = schema;
			}
		}

		return result;
	}
}
