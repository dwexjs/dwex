import { EventEmitter } from "node:events";

/**
 * Adapter to make Dwex response object compatible with Node.js HTTP response
 * that the MCP SDK expects
 */
export class ResponseAdapter extends EventEmitter {
	private dwexResponse: any;
	public headersSent = false;
	public statusCode = 200;
	public statusMessage = "";
	private chunks: any[] = [];

	constructor(dwexResponse: any) {
		super();
		this.dwexResponse = dwexResponse;
	}

	writeHead(statusCode: number, headers?: Record<string, string>): this {
		this.dwexResponse.status(statusCode);
		if (headers) {
			for (const [key, value] of Object.entries(headers)) {
				this.dwexResponse.setHeader(key, value);
			}
		}
		this.headersSent = true;
		return this;
	}

	setHeader(name: string, value: string): this {
		this.dwexResponse.setHeader(name, value);
		return this;
	}

	write(chunk: any): boolean {
		this.chunks.push(chunk);
		return true;
	}

	end(data?: any): this {
		if (data) {
			this.chunks.push(data);
		}

		// Combine all chunks
		const fullData = this.chunks.join("");

		// Try to parse as JSON if content-type is JSON
		const contentType = this.dwexResponse.headers.get("Content-Type");
		if (contentType?.includes("application/json")) {
			try {
				this.dwexResponse.json(JSON.parse(fullData));
			} catch {
				this.dwexResponse.send(fullData);
			}
		} else {
			this.dwexResponse.send(fullData);
		}

		this.headersSent = true;
		this.emit("finish");
		return this;
	}
}
