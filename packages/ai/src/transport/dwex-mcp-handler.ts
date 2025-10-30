import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

/**
 * Custom JSON-RPC handler for Dwex that works with the MCP server
 * This bypasses the StreamableHTTPServerTransport and works directly with Dwex's response model
 */
export class DwexMcpHandler {
	constructor(private readonly mcpServer: McpServer) {}

	/**
	 * Handle a JSON-RPC request and return the response
	 */
	async handleRequest(request: any): Promise<any> {
		try {
			const { jsonrpc, method, params, id } = request;

			// Validate JSON-RPC version
			if (jsonrpc !== "2.0") {
				return this.createErrorResponse(id, -32600, "Invalid Request: jsonrpc must be 2.0");
			}

			// Route to appropriate handler based on method
			switch (method) {
				case "initialize":
					return this.handleInitialize(id, params);

				case "tools/list":
					return this.handleToolsList(id);

				case "tools/call":
					return this.handleToolsCall(id, params);

				case "resources/list":
					return this.handleResourcesList(id);

				case "resources/read":
					return this.handleResourcesRead(id, params);

				case "prompts/list":
					return this.handlePromptsList(id);

				case "prompts/get":
					return this.handlePromptsGet(id, params);

				case "ping":
					return this.createSuccessResponse(id, {});

				default:
					return this.createErrorResponse(id, -32601, `Method not found: ${method}`);
			}
		} catch (error) {
			console.error("Error handling MCP request:", error);
			return this.createErrorResponse(
				request?.id || null,
				-32603,
				`Internal error: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
	}

	/**
	 * Handle initialize request
	 */
	private async handleInitialize(id: any, _params: any): Promise<any> {
		return this.createSuccessResponse(id, {
			protocolVersion: "2024-11-05",
			capabilities: {
				tools: {},
				resources: {},
				prompts: {},
			},
			serverInfo: {
				name: "dwex-mcp-server",
				version: "1.0.0",
			},
		});
	}

	/**
	 * Handle tools/list request
	 */
	private async handleToolsList(id: any): Promise<any> {
		const registeredTools = (this.mcpServer as any)._registeredTools || {};
		const tools = Object.entries(registeredTools).map(([name, tool]: [string, any]) => ({
			name: name, // Use the registered key as the name
			description: tool.description || tool.title || "",
			inputSchema: this.convertZodToJsonSchema(tool.inputSchema),
		}));

		return this.createSuccessResponse(id, { tools });
	}

	/**
	 * Handle tools/call request
	 */
	private async handleToolsCall(id: any, params: any): Promise<any> {
		const { name, arguments: args } = params;

		const registeredTools = (this.mcpServer as any)._registeredTools || {};
		const tool = registeredTools[name];
		if (!tool) {
			return this.createErrorResponse(id, -32602, `Tool not found: ${name}`);
		}

		try {
			const toolHandler = (tool as any).callback;
			const result = await toolHandler(args || {});
			return this.createSuccessResponse(id, result);
		} catch (error) {
			return this.createErrorResponse(
				id,
				-32603,
				`Tool execution failed: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
	}

	/**
	 * Handle resources/list request
	 */
	private async handleResourcesList(id: any): Promise<any> {
		const resourceTemplates = (this.mcpServer as any)._registeredResourceTemplates || {};
		const resources = Object.values(resourceTemplates).map((resource: any) => {
			const uriTemplate = resource.resourceTemplate?._uriTemplate?.template ||
			                   resource.resourceTemplate?.uriTemplate ||
			                   "";
			return {
				uri: uriTemplate,
				name: resource.title || resource.metadata?.title || "Unknown",
				description: resource.metadata?.description || "",
				mimeType: "application/json",
			};
		});

		return this.createSuccessResponse(id, { resources });
	}

	/**
	 * Handle resources/read request
	 */
	private async handleResourcesRead(id: any, params: any): Promise<any> {
		const { uri } = params;

		// Find resource by URI
		const resourceTemplates = (this.mcpServer as any)._registeredResourceTemplates || {};
		const resource = Object.values(resourceTemplates).find(
			(r: any) => r.resourceTemplate?._uriTemplate?.template === uri,
		);

		if (!resource) {
			return this.createErrorResponse(id, -32602, `Resource not found: ${uri}`);
		}

		try {
			const resourceHandler = (resource as any).readCallback;
			const result = await resourceHandler(new URL(uri), {});
			return this.createSuccessResponse(id, result);
		} catch (error) {
			return this.createErrorResponse(
				id,
				-32603,
				`Resource read failed: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
	}

	/**
	 * Handle prompts/list request
	 */
	private async handlePromptsList(id: any): Promise<any> {
		const registeredPrompts = (this.mcpServer as any)._registeredPrompts || {};
		const prompts = Object.values(registeredPrompts).map((prompt: any) => ({
			name: prompt.name || "Unknown",
			description: prompt.description || "",
			arguments: prompt.arguments || [],
		}));

		return this.createSuccessResponse(id, { prompts });
	}

	/**
	 * Handle prompts/get request
	 */
	private async handlePromptsGet(id: any, params: any): Promise<any> {
		const { name, arguments: args } = params;

		const registeredPrompts = (this.mcpServer as any)._registeredPrompts || {};
		const prompt = registeredPrompts[name];
		if (!prompt) {
			return this.createErrorResponse(id, -32602, `Prompt not found: ${name}`);
		}

		try {
			const promptHandler = (prompt as any).callback;
			const result = await promptHandler(args || {});
			return this.createSuccessResponse(id, result);
		} catch (error) {
			return this.createErrorResponse(
				id,
				-32603,
				`Prompt execution failed: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
	}

	/**
	 * Create a JSON-RPC success response
	 */
	private createSuccessResponse(id: any, result: any): any {
		return {
			jsonrpc: "2.0",
			result,
			id,
		};
	}

	/**
	 * Create a JSON-RPC error response
	 */
	private createErrorResponse(id: any, code: number, message: string): any {
		return {
			jsonrpc: "2.0",
			error: {
				code,
				message,
			},
			id,
		};
	}

	/**
	 * Convert Zod schema to JSON Schema (simplified)
	 */
	private convertZodToJsonSchema(zodSchema: any): any {
		if (!zodSchema) {
			return { type: "object", properties: {} };
		}

		// For Zod objects, use the shape property to get actual fields
		const shape = zodSchema.shape || zodSchema._def?.shape?.() || {};
		const properties: any = {};
		const required: string[] = [];

		// Extract properties from Zod schema shape
		for (const [key, value] of Object.entries(shape)) {
			if (value && typeof value === "object") {
				const schema: any = value;
				const fieldType = this.getZodType(schema);

				properties[key] = {
					type: fieldType,
					description: schema._def?.description || schema.description || undefined,
				};

				// Check if optional - if it's not optional, it's required
				const isOptional = schema._def?.typeName === "ZodOptional" ||
				                   schema.isOptional?.() ||
				                   false;

				if (!isOptional) {
					required.push(key);
				}
			}
		}

		return {
			type: "object",
			properties,
			required: required.length > 0 ? required : undefined,
		};
	}

	/**
	 * Get JSON Schema type from Zod type
	 */
	private getZodType(schema: any): string {
		const typeName = schema._def?.typeName;
		if (!typeName) return "string";

		if (typeName.includes("String")) return "string";
		if (typeName.includes("Number")) return "number";
		if (typeName.includes("Boolean")) return "boolean";
		if (typeName.includes("Array")) return "array";
		if (typeName.includes("Object")) return "object";

		return "string";
	}
}
