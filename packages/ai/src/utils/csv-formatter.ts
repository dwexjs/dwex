/**
 * Utility functions for converting data to CSV format
 * Used to reduce token usage in MCP tool responses
 */

/**
 * Escape a CSV value
 */
function escapeCSV(value: unknown): string {
	if (value === null || value === undefined) {
		return "";
	}

	const str = String(value);

	// If the value contains comma, quote, or newline, wrap in quotes and escape quotes
	if (str.includes(",") || str.includes('"') || str.includes("\n")) {
		return `"${str.replace(/"/g, '""')}"`;
	}

	return str;
}

/**
 * Flatten nested objects/arrays for CSV representation
 */
function flattenValue(value: unknown): string {
	if (value === null || value === undefined) {
		return "";
	}

	if (Array.isArray(value)) {
		// Join array elements with semicolon
		return value
			.map((v) => (typeof v === "object" ? JSON.stringify(v) : String(v)))
			.join(";");
	}

	if (typeof value === "object") {
		// Serialize objects as JSON
		return JSON.stringify(value);
	}

	return String(value);
}

/**
 * Convert an array of objects to CSV format
 * @param data - Array of objects to convert
 * @param columns - Optional array of column names. If not provided, uses keys from first object
 * @returns CSV string
 */
export function arrayToCSV<T extends Record<string, unknown>>(
	data: T[],
	columns?: string[],
): string {
	if (!data || data.length === 0) {
		return "";
	}

	// Determine columns from first object if not provided
	const cols = columns || Object.keys(data[0]);

	// Create header row
	const header = cols.map(escapeCSV).join(",");

	// Create data rows
	const rows = data.map((item) => {
		return cols
			.map((col) => {
				const value = item[col];
				return escapeCSV(flattenValue(value));
			})
			.join(",");
	});

	return [header, ...rows].join("\n");
}

/**
 * Convert a single object to key-value CSV format
 * @param obj - Object to convert
 * @returns CSV string with key,value columns
 */
export function objectToKeyValueCSV<T extends Record<string, unknown>>(
	obj: T,
): string {
	if (!obj || typeof obj !== "object") {
		return "";
	}

	const rows = Object.entries(obj).map(([key, value]) => {
		return `${escapeCSV(key)},${escapeCSV(flattenValue(value))}`;
	});

	return ["key,value", ...rows].join("\n");
}

/**
 * Add a summary line to CSV output
 * @param csv - CSV string
 * @param summary - Summary text
 * @returns CSV with summary
 */
export function addCSVSummary(csv: string, summary: string): string {
	return `# ${summary}\n${csv}`;
}
