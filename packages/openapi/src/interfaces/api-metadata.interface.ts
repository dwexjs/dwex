import type { SchemaObject } from "openapi3-ts/oas31";

/**
 * API operation metadata
 */
export interface ApiOperationMetadata {
	summary?: string;
	description?: string;
	operationId?: string;
	deprecated?: boolean;
	tags?: string[];
}

/**
 * API response metadata
 */
export interface ApiResponseMetadata {
	status: number | "default";
	description?: string;
	type?: any;
	isArray?: boolean;
	schema?: SchemaObject;
}

/**
 * API parameter metadata
 */
export interface ApiParamMetadata {
	name: string;
	description?: string;
	required?: boolean;
	type?: any;
	example?: any;
	schema?: SchemaObject;
}

/**
 * API query parameter metadata
 */
export interface ApiQueryMetadata {
	name: string;
	description?: string;
	required?: boolean;
	type?: any;
	example?: any;
	isArray?: boolean;
	schema?: SchemaObject;
}

/**
 * API request body metadata
 */
export interface ApiBodyMetadata {
	description?: string;
	required?: boolean;
	type?: any;
	isArray?: boolean;
	schema?: SchemaObject;
}

/**
 * API property metadata (for DTOs)
 */
export interface ApiPropertyMetadata {
	description?: string;
	required?: boolean;
	type?: any;
	example?: any;
	isArray?: boolean;
	enum?: any[];
	minimum?: number;
	maximum?: number;
	minLength?: number;
	maxLength?: number;
	pattern?: string;
	format?: string;
	default?: any;
}

/**
 * API security metadata
 */
export interface ApiSecurityMetadata {
	name: string;
	scopes?: string[];
}
