import "reflect-metadata";
import { Injectable, Inject } from "@dwex/core";
import type { McpLogEntry } from "../types/mcp-types.js";
import {
	AI_MODULE_CONFIG,
	type AiModuleConfig,
} from "../config/ai-config.interface.js";

/**
 * Service for buffering recent log entries
 * Uses a circular buffer to store the most recent N log entries
 */
@Injectable()
export class LogBufferService {
	private buffer: McpLogEntry[] = [];
	private maxSize: number;
	private currentIndex = 0;

	constructor(@Inject(AI_MODULE_CONFIG) config: AiModuleConfig) {
		this.maxSize = config.logBufferSize ?? 1000;
	}

	/**
	 * Add a log entry to the buffer
	 */
	addLog(entry: McpLogEntry): void {
		if (this.buffer.length < this.maxSize) {
			this.buffer.push(entry);
		} else {
			// Circular buffer: overwrite oldest entry
			this.buffer[this.currentIndex] = entry;
			this.currentIndex = (this.currentIndex + 1) % this.maxSize;
		}
	}

	/**
	 * Get recent logs, optionally filtered by level or limit
	 */
	getLogs(options?: {
		level?: McpLogEntry["level"];
		limit?: number;
		since?: Date;
	}): McpLogEntry[] {
		let logs = [...this.buffer];

		// Sort by timestamp (newest first)
		logs.sort(
			(a, b) =>
				new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
		);

		// Filter by level
		if (options?.level) {
			logs = logs.filter((log) => log.level === options.level);
		}

		// Filter by time
		if (options?.since) {
			const sinceTime = options.since.getTime();
			logs = logs.filter(
				(log) => new Date(log.timestamp).getTime() >= sinceTime,
			);
		}

		// Limit results
		if (options?.limit) {
			logs = logs.slice(0, options.limit);
		}

		return logs;
	}

	/**
	 * Get total number of logs in buffer
	 */
	getCount(): number {
		return this.buffer.length;
	}

	/**
	 * Clear all logs from buffer
	 */
	clear(): void {
		this.buffer = [];
		this.currentIndex = 0;
	}
}
