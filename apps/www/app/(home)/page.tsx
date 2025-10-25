import { Hero } from "@/components/blocks/hero";
import { Features } from "@/components/blocks/features";
import { Comparison } from "@/components/blocks/comparison";
import { CodePreview } from "@/components/ui/code-preview";
import { Icons } from "@/components/ui/icons";
import { dwexFeatures } from "@/lib/data/features";
import { frameworkMetrics } from "@/lib/data/comparison";

export default function Page() {
	return (
		<div>
			<Hero
				pill={{
					text: "Powered by Bun",
					href: "/docs",
					icon: <Icons.zap className="h-4 w-4" />,
					variant: "default",
					size: "md",
				}}
				content={{
					title: "Build APIs",
					titleHighlight: "blazingly fast",
					description:
						"A modern TypeScript framework for building server-side applications with Bun. Leverage decorators, dependency injection, and modular architecture for a superior developer experience.",
					primaryAction: {
						href: "/docs/getting-started",
						text: "Get Started",
						icon: <Icons.zap className="h-4 w-4" />,
					},
					secondaryAction: {
						href: "/docs",
						text: "View Documentation",
						icon: <Icons.book className="h-4 w-4" />,
					},
				}}
				preview={<CodePreview command="bun create dwex" />}
			/>
			<Features
				id="features"
				features={dwexFeatures}
				heading={{
					title: "Everything you need to",
					titleHighlight: "build fast",
					description:
						"Dwex provides a complete toolkit for building modern server-side applications with TypeScript and Bun.",
				}}
			/>
			<Comparison
				metrics={frameworkMetrics}
				heading={{
					title: "Built for",
					titleHighlight: "performance",
					description:
						"See how Dwex compares to other popular Node.js frameworks. Performance benchmarks measured on identical hardware.",
				}}
			/>
		</div>
	);
}
