"use client";

import { motion } from "framer-motion";
import { type Feature } from "@/lib/data/features";
import { cn } from "@/lib/utils";
import { Icons } from "@/components/ui/icons";

const ease = [0.16, 1, 0.3, 1] as const;

interface FeaturesProps {
	features: Feature[];
	heading?: {
		title: string;
		titleHighlight?: string;
		description: string;
	};
	className?: string;
	id?: string;
}

const containerVariants = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: {
			staggerChildren: 0.1,
		},
	},
};

const itemVariants = {
	hidden: { opacity: 0, y: 20 },
	visible: {
		opacity: 1,
		y: 0,
		transition: {
			duration: 0.8,
			ease,
		},
	},
};

export function Features({
	features,
	heading,
	className,
	id,
}: FeaturesProps) {
	return (
		<section
			id={id}
			className={cn("container py-16 md:py-24 lg:py-32", className)}
		>
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

				<motion.div
					className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
					variants={containerVariants}
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true, margin: "-100px" }}
				>
					{features.map((feature, index) => {
						const IconComponent = Icons[feature.icon];
						return (
							<motion.div
								key={index}
								variants={itemVariants}
								className="group relative rounded-lg border border-border bg-card p-6 transition-colors hover:bg-muted/50"
							>
								<div className="mb-4 inline-flex rounded-md bg-primary/10 p-3 text-primary ring-1 ring-primary/20">
									<IconComponent className="h-6 w-6" />
								</div>
								<h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
								<p className="text-sm text-muted-foreground">
									{feature.description}
								</p>
							</motion.div>
						);
					})}
				</motion.div>
			</div>
		</section>
	);
}
