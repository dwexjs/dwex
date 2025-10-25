export interface ComparisonMetric {
	name: string;
	dwex: string | number | boolean;
	nestjs: string | number | boolean;
	express: string | number | boolean;
	type: "text" | "boolean" | "performance";
	unit?: string;
	higherIsBetter?: boolean;
}

export const frameworkMetrics: ComparisonMetric[] = [
	{
		name: "Requests/sec",
		dwex: 129966,
		express: 26116,
		nestjs: 19996,
		type: "performance",
		higherIsBetter: true,
	},
	{
		name: "Latency (avg)",
		dwex: 3.1,
		express: 21.9,
		nestjs: 33.1,
		type: "performance",
		unit: "ms",
		higherIsBetter: false,
	},
	{
		name: "Cold Start",
		dwex: 15,
		express: 95,
		nestjs: 220,
		type: "performance",
		unit: "ms",
		higherIsBetter: false,
	},
	{
		name: "Memory Usage",
		dwex: 32,
		express: 48,
		nestjs: 105,
		type: "performance",
		unit: "MB",
		higherIsBetter: false,
	},
	{
		name: "Runtime",
		dwex: "Bun",
		nestjs: "Node.js",
		express: "Node.js",
		type: "text",
	},
	{
		name: "TypeScript",
		dwex: true,
		nestjs: true,
		express: false,
		type: "boolean",
	},
	{
		name: "Decorators",
		dwex: true,
		nestjs: true,
		express: false,
		type: "boolean",
	},
	{
		name: "Dependency Injection",
		dwex: true,
		nestjs: true,
		express: false,
		type: "boolean",
	},
	{
		name: "Module System",
		dwex: true,
		nestjs: true,
		express: false,
		type: "boolean",
	},
];

export const comparisonConfig = {
	frameworks: ["dwex", "nestjs", "express"] as const,
	labels: {
		dwex: "Dwex",
		nestjs: "NestJS",
		express: "Express",
	},
} as const;
