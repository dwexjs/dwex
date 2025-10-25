export type IconName =
	| "zap"
	| "code"
	| "package"
	| "layers"
	| "shield"
	| "sparkles"
	| "type"
	| "gauge"
	| "check"
	| "x";

export interface Feature {
	icon: IconName;
	title: string;
	description: string;
}

export const dwexFeatures: Feature[] = [
	{
		icon: "zap",
		title: "Bun-Native Performance",
		description:
			"Built specifically for Bun runtime, leveraging its blazing-fast performance and modern JavaScript features for optimal speed.",
	},
	{
		icon: "code",
		title: "Decorator-Based Routing",
		description:
			"Intuitive decorator API (@Get, @Post, @Put, @Delete) for defining routes with clean, maintainable syntax.",
	},
	{
		icon: "package",
		title: "Dependency Injection",
		description:
			"Built-in DI container with support for singleton, request, and transient scopes. Write testable, modular code.",
	},
	{
		icon: "layers",
		title: "Modular Architecture",
		description:
			"Organize your application into reusable modules with @Module decorator for better code organization and scalability.",
	},
	{
		icon: "shield",
		title: "Guards & Middleware",
		description:
			"Powerful route protection and request/response processing with guards and middleware for authorization and validation.",
	},
	{
		icon: "sparkles",
		title: "Built-in Utilities",
		description:
			"Comprehensive utilities including body parser, cookie parser, CORS, and more - batteries included.",
	},
	{
		icon: "type",
		title: "TypeScript-First",
		description:
			"Designed from the ground up with TypeScript, providing excellent type safety and developer experience.",
	},
	{
		icon: "gauge",
		title: "Modern Developer Experience",
		description:
			"Enjoy fast builds, hot reloading, and intuitive APIs that make building server applications a joy.",
	},
];
