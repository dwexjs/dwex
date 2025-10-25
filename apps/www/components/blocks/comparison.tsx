"use client";

import { motion } from "framer-motion";
import { Icons } from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import { type ComparisonMetric } from "@/lib/data/comparison";

const ease = [0.16, 1, 0.3, 1] as const;

interface ComparisonProps {
	metrics: ComparisonMetric[];
	heading?: {
		title: string;
		titleHighlight?: string;
		description: string;
	};
	disclaimer?: string;
}

function getBestValue(
	metric: ComparisonMetric,
): "dwex" | "nestjs" | "express" | null {
	if (metric.type === "boolean") {
		return null;
	}

	if (metric.type === "text") {
		return null;
	}

	const values = {
		dwex: Number(metric.dwex),
		nestjs: Number(metric.nestjs),
		express: Number(metric.express),
	};

	if (metric.higherIsBetter) {
		const max = Math.max(values.dwex, values.nestjs, values.express);
		if (values.dwex === max) return "dwex";
		if (values.nestjs === max) return "nestjs";
		return "express";
	}

	const min = Math.min(values.dwex, values.nestjs, values.express);
	if (values.dwex === min) return "dwex";
	if (values.nestjs === min) return "nestjs";
	return "express";
}

function formatValue(value: string | number | boolean, type: string): string {
	if (type === "boolean") {
		return value ? "✓" : "—";
	}
	if (typeof value === "number" && value >= 1000) {
		return value.toLocaleString();
	}
	return String(value);
}

function PerformanceBar({
	value,
	max,
	isBest,
}: {
	value: number;
	max: number;
	isBest: boolean;
}) {
	const percentage = (value / max) * 100;

	return (
		<div className="mt-2 w-full">
			<div className="h-2 w-full rounded-full bg-muted overflow-hidden">
				<motion.div
					className={cn(
						"h-full rounded-full",
						isBest ? "bg-primary" : "bg-muted-foreground/30",
					)}
					initial={{ width: 0 }}
					whileInView={{ width: `${percentage}%` }}
					viewport={{ once: true }}
					transition={{ duration: 1, delay: 0.2 }}
				/>
			</div>
		</div>
	);
}

export function Comparison({
	metrics,
	heading = {
		title: "Built for",
		titleHighlight: "performance",
		description:
			"See how we compare to other popular frameworks. Benchmarks measured on identical hardware.",
	},
	disclaimer = "* Benchmarks are approximate and may vary based on specific use cases and configurations. Measured using standard HTTP benchmarking tools.",
}: ComparisonProps) {
	return (
		<section className="container py-16 md:py-24 lg:py-32 bg-muted/30">
			<div className="mx-auto max-w-7xl px-4 md:px-8 lg:px-12">
				{heading && (
					<motion.div
						className="mb-12 text-center"
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.8 }}
					>
						<h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
							{heading.title}{" "}
							{heading.titleHighlight && (
								<span className="text-primary">{heading.titleHighlight}</span>
							)}
						</h2>
						<p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
							{heading.description}
						</p>
					</motion.div>
				)}

				{/* Desktop Table View */}
				<motion.div
					className="hidden lg:block rounded-lg border border-border bg-card overflow-hidden"
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.8, delay: 0.1 }}
				>
					<div className="overflow-x-auto">
						<table className="w-full">
							<thead>
								<tr className="border-b border-border bg-muted/50">
									<th className="px-6 py-4 text-left text-sm font-semibold">
										Feature
									</th>
									<th className="px-6 py-4 text-center text-sm font-semibold">
										<div className="flex items-center justify-center gap-2">
											<Icons.logo className="h-5 w-5" />
											Dwex
										</div>
									</th>
									<th className="px-6 py-4 text-center text-sm font-semibold text-muted-foreground">
										NestJS
									</th>
									<th className="px-6 py-4 text-center text-sm font-semibold text-muted-foreground">
										Express
									</th>
								</tr>
							</thead>
							<tbody>
								{metrics.map((metric, index) => {
									const bestValue = getBestValue(metric);
									const maxValue =
										metric.type === "performance"
											? Math.max(
													Number(metric.dwex),
													Number(metric.nestjs),
													Number(metric.express),
												)
											: 0;

									return (
										<motion.tr
											key={metric.name}
											className="border-b border-border last:border-0"
											initial={{ opacity: 0, x: -20 }}
											whileInView={{ opacity: 1, x: 0 }}
											viewport={{ once: true }}
											transition={{ duration: 0.5, delay: index * 0.05 }}
										>
											<td className="px-6 py-4 text-sm font-medium">
												{metric.name}
											</td>
											<td className="px-6 py-4">
												<div className="text-center">
													<div
														className={cn(
															"text-sm font-semibold",
															bestValue === "dwex" && "text-primary",
														)}
													>
														{formatValue(metric.dwex, metric.type)}
														{metric.unit && ` ${metric.unit}`}
													</div>
													{metric.type === "performance" && (
														<PerformanceBar
															value={Number(metric.dwex)}
															max={maxValue}
															isBest={bestValue === "dwex"}
														/>
													)}
												</div>
											</td>
											<td className="px-6 py-4">
												<div className="text-center">
													<div
														className={cn(
															"text-sm",
															bestValue === "nestjs"
																? "font-semibold text-primary"
																: "text-muted-foreground",
														)}
													>
														{formatValue(metric.nestjs, metric.type)}
														{metric.unit && ` ${metric.unit}`}
													</div>
													{metric.type === "performance" && (
														<PerformanceBar
															value={Number(metric.nestjs)}
															max={maxValue}
															isBest={bestValue === "nestjs"}
														/>
													)}
												</div>
											</td>
											<td className="px-6 py-4">
												<div className="text-center">
													<div
														className={cn(
															"text-sm",
															bestValue === "express"
																? "font-semibold text-primary"
																: "text-muted-foreground",
														)}
													>
														{formatValue(metric.express, metric.type)}
														{metric.unit && ` ${metric.unit}`}
													</div>
													{metric.type === "performance" && (
														<PerformanceBar
															value={Number(metric.express)}
															max={maxValue}
															isBest={bestValue === "express"}
														/>
													)}
												</div>
											</td>
										</motion.tr>
									);
								})}
							</tbody>
						</table>
					</div>
				</motion.div>

				{/* Mobile Card View */}
				<div className="lg:hidden space-y-4">
					{metrics.map((metric, index) => {
						const bestValue = getBestValue(metric);
						return (
							<motion.div
								key={metric.name}
								className="rounded-lg border border-border bg-card p-4"
								initial={{ opacity: 0, y: 20 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true }}
								transition={{ duration: 0.5, delay: index * 0.05 }}
							>
								<h3 className="font-semibold mb-3">{metric.name}</h3>
								<div className="grid grid-cols-3 gap-4">
									<div className="text-center">
										<div className="text-xs text-muted-foreground mb-1">
											Dwex
										</div>
										<div
											className={cn(
												"text-sm font-semibold",
												bestValue === "dwex" && "text-primary",
											)}
										>
											{formatValue(metric.dwex, metric.type)}
											{metric.unit && ` ${metric.unit}`}
										</div>
									</div>
									<div className="text-center">
										<div className="text-xs text-muted-foreground mb-1">
											NestJS
										</div>
										<div
											className={cn(
												"text-sm",
												bestValue === "nestjs"
													? "font-semibold text-primary"
													: "text-muted-foreground",
											)}
										>
											{formatValue(metric.nestjs, metric.type)}
											{metric.unit && ` ${metric.unit}`}
										</div>
									</div>
									<div className="text-center">
										<div className="text-xs text-muted-foreground mb-1">
											Express
										</div>
										<div
											className={cn(
												"text-sm",
												bestValue === "express"
													? "font-semibold text-primary"
													: "text-muted-foreground",
											)}
										>
											{formatValue(metric.express, metric.type)}
											{metric.unit && ` ${metric.unit}`}
										</div>
									</div>
								</div>
							</motion.div>
						);
					})}
				</div>

				{disclaimer && (
					<motion.p
						className="mt-8 text-center text-sm text-muted-foreground"
						initial={{ opacity: 0 }}
						whileInView={{ opacity: 1 }}
						viewport={{ once: true }}
						transition={{ duration: 0.8, delay: 0.4 }}
					>
						{disclaimer}
					</motion.p>
				)}
			</div>
		</section>
	);
}
