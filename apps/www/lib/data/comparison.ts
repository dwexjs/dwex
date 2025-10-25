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
		dwex: 82500,
		nestjs: 24300,
		express: 45600,
		type: "performance",
		higherIsBetter: true,
	},
	{
		name: "Cold Start",
		dwex: 12,
		nestjs: 180,
		express: 85,
		type: "performance",
		unit: "ms",
		higherIsBetter: false,
	},
	{
		name: "Memory Usage",
		dwex: 28,
		nestjs: 92,
		express: 45,
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
