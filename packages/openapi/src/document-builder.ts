import type {
	InfoObject,
	OpenAPIObject,
	SecuritySchemeObject,
	ServerObject,
	TagObject,
} from "openapi3-ts/oas31";

/**
 * Builder for creating OpenAPI document configuration.
 *
 * @example
 * ```typescript
 * const config = new DocumentBuilder()
 *   .setTitle('My API')
 *   .setDescription('API documentation')
 *   .setVersion('1.0')
 *   .addServer('http://localhost:9929', 'Local server')
 *   .addTag('users', 'User management endpoints')
 *   .addBearerAuth()
 *   .build();
 * ```
 */
export class DocumentBuilder {
	private readonly document: Partial<OpenAPIObject> = {
		openapi: "3.0.0",
		info: {
			title: "",
			version: "1.0.0",
		},
		paths: {},
		components: {
			schemas: {},
			securitySchemes: {},
		},
		tags: [],
		servers: [],
	};

	/**
	 * Sets the title of the API.
	 *
	 * @param title - API title
	 * @returns This builder instance
	 */
	setTitle(title: string): this {
		(this.document.info as InfoObject).title = title;
		return this;
	}

	/**
	 * Sets the description of the API.
	 *
	 * @param description - API description
	 * @returns This builder instance
	 */
	setDescription(description: string): this {
		(this.document.info as InfoObject).description = description;
		return this;
	}

	/**
	 * Sets the version of the API.
	 *
	 * @param version - API version
	 * @returns This builder instance
	 */
	setVersion(version: string): this {
		(this.document.info as InfoObject).version = version;
		return this;
	}

	/**
	 * Sets the terms of service URL.
	 *
	 * @param termsOfService - Terms of service URL
	 * @returns This builder instance
	 */
	setTermsOfService(termsOfService: string): this {
		(this.document.info as InfoObject).termsOfService = termsOfService;
		return this;
	}

	/**
	 * Sets the contact information.
	 *
	 * @param name - Contact name
	 * @param url - Contact URL
	 * @param email - Contact email
	 * @returns This builder instance
	 */
	setContact(name: string, url?: string, email?: string): this {
		(this.document.info as InfoObject).contact = { name, url, email };
		return this;
	}

	/**
	 * Sets the license information.
	 *
	 * @param name - License name
	 * @param url - License URL
	 * @returns This builder instance
	 */
	setLicense(name: string, url?: string): this {
		(this.document.info as InfoObject).license = { name, url };
		return this;
	}

	/**
	 * Adds a server to the API.
	 *
	 * @param url - Server URL
	 * @param description - Server description
	 * @returns This builder instance
	 */
	addServer(url: string, description?: string): this {
		const server: ServerObject = { url };
		if (description) {
			server.description = description;
		}
		this.document.servers?.push(server);
		return this;
	}

	/**
	 * Adds a tag for grouping operations.
	 *
	 * @param name - Tag name
	 * @param description - Tag description
	 * @returns This builder instance
	 */
	addTag(name: string, description?: string): this {
		const tag: TagObject = { name };
		if (description) {
			tag.description = description;
		}
		this.document.tags?.push(tag);
		return this;
	}

	/**
	 * Adds Bearer authentication security scheme.
	 *
	 * @param options - Bearer auth options
	 * @returns This builder instance
	 *
	 * @example
	 * ```typescript
	 * builder.addBearerAuth({
	 *   name: 'JWT',
	 *   description: 'JWT Authorization',
	 *   bearerFormat: 'JWT'
	 * });
	 * ```
	 */
	addBearerAuth(
		options: {
			name?: string;
			description?: string;
			bearerFormat?: string;
		} = {},
	): this {
		const {
			name = "bearer",
			description = "JWT Authorization",
			bearerFormat = "JWT",
		} = options;

		const scheme: SecuritySchemeObject = {
			type: "http",
			scheme: "bearer",
			bearerFormat,
			description,
		};

		if (!this.document.components) {
			this.document.components = {};
		}
		if (!this.document.components.securitySchemes) {
			this.document.components.securitySchemes = {};
		}

		this.document.components.securitySchemes[name] = scheme;
		return this;
	}

	/**
	 * Adds Basic authentication security scheme.
	 *
	 * @param options - Basic auth options
	 * @returns This builder instance
	 */
	addBasicAuth(options: { name?: string; description?: string } = {}): this {
		const { name = "basic", description = "Basic HTTP Authentication" } =
			options;

		const scheme: SecuritySchemeObject = {
			type: "http",
			scheme: "basic",
			description,
		};

		if (!this.document.components) {
			this.document.components = {};
		}
		if (!this.document.components.securitySchemes) {
			this.document.components.securitySchemes = {};
		}

		this.document.components.securitySchemes[name] = scheme;
		return this;
	}

	/**
	 * Adds API Key authentication security scheme.
	 *
	 * @param options - API key auth options
	 * @returns This builder instance
	 *
	 * @example
	 * ```typescript
	 * builder.addApiKey({
	 *   name: 'api-key',
	 *   description: 'API Key Authentication',
	 *   in: 'header',
	 *   paramName: 'X-API-KEY'
	 * });
	 * ```
	 */
	addApiKey(options: {
		name?: string;
		description?: string;
		in?: "header" | "query" | "cookie";
		paramName?: string;
	}): this {
		const {
			name = "api-key",
			description = "API Key Authentication",
			in: inLocation = "header",
			paramName = "X-API-KEY",
		} = options;

		const scheme: SecuritySchemeObject = {
			type: "apiKey",
			in: inLocation,
			name: paramName,
			description,
		};

		if (!this.document.components) {
			this.document.components = {};
		}
		if (!this.document.components.securitySchemes) {
			this.document.components.securitySchemes = {};
		}

		this.document.components.securitySchemes[name] = scheme;
		return this;
	}

	/**
	 * Adds OAuth2 authentication security scheme.
	 *
	 * @param options - OAuth2 options
	 * @returns This builder instance
	 */
	addOAuth2(options: {
		name?: string;
		description?: string;
		flows: Record<string, any>;
	}): this {
		const {
			name = "oauth2",
			description = "OAuth2 Authentication",
			flows,
		} = options;

		const scheme: SecuritySchemeObject = {
			type: "oauth2",
			flows,
			description,
		};

		if (!this.document.components) {
			this.document.components = {};
		}
		if (!this.document.components.securitySchemes) {
			this.document.components.securitySchemes = {};
		}

		this.document.components.securitySchemes[name] = scheme;
		return this;
	}

	/**
	 * Adds a global security requirement.
	 *
	 * @param name - Security scheme name
	 * @param scopes - Optional scopes
	 * @returns This builder instance
	 */
	addSecurity(name: string, scopes: string[] = []): this {
		if (!this.document.security) {
			this.document.security = [];
		}
		this.document.security.push({ [name]: scopes });
		return this;
	}

	/**
	 * Builds the OpenAPI document configuration.
	 *
	 * @returns The OpenAPI document configuration
	 */
	build(): Omit<OpenAPIObject, "paths"> {
		return this.document as Omit<OpenAPIObject, "paths">;
	}
}
