import { Comparison } from "@/components/blocks/comparison";
import { Features } from "@/components/blocks/features";
import { Hero } from "@/components/blocks/hero";
import { CodePreview } from "@/components/ui/code-preview";
import { Icons } from "@/components/ui/icons";
import { frameworkMetrics } from "@/lib/data/comparison";
import { dwexFeatures } from "@/lib/data/features";

export default function Page() {
	return (
		<div>
			<Hero
				pill={{
					text: "Powered by Bun Runtime",
					href: "/docs",
					icon: <Icons.zap className="h-4 w-4" />,
					variant: "default",
					size: "md",
				}}
				content={{
					title: "Build Modern APIs",
					titleHighlight: "blazingly fast",
					description:
						"The TypeScript framework for building high-performance server applications with Bun. Experience the power of decorators, dependency injection, and enterprise-grade architecture with unmatched developer experience.",
					primaryAction: {
						href: "/docs",
						text: "Get Started",
						icon: <Icons.zap className="h-4 w-4" />,
					},
					secondaryAction: {
						href: "https://github.com/dwexjs/dwex",
						text: "Source Code",
						icon: <Icons.github className="h-4 w-4" />,
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
