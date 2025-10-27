"use client";

import { motion } from "framer-motion";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import HeroBadge from "@/components/ui/hero-badge";

const ease = [0.16, 1, 0.3, 1] as const;

interface HeroContentProps {
	title: string;
	titleHighlight?: string;
	description: string;
	primaryAction?: {
		href: string;
		text: string;
		icon?: React.ReactNode;
	};
	secondaryAction?: {
		href: string;
		text: string;
		icon?: React.ReactNode;
	};
}

function HeroContent({
	title,
	titleHighlight,
	description,
	primaryAction,
	secondaryAction,
}: HeroContentProps) {
	return (
		<div className="flex flex-col items-center space-y-6">
			<motion.h1
				className="text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl xl:text-8xl bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-transparent"
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.8, ease }}
			>
				{title}{" "}
				{titleHighlight && (
					<span className="bg-gradient-to-r from-primary via-primary/90 to-primary/70 bg-clip-text text-transparent">
						{titleHighlight}
					</span>
				)}
			</motion.h1>
			<motion.p
				className="max-w-[46rem] text-lg leading-relaxed text-muted-foreground sm:text-xl sm:leading-8"
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.1, duration: 0.8, ease }}
			>
				{description}
			</motion.p>
			<motion.div
				className="flex flex-col sm:flex-row gap-4 pt-4"
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.2, duration: 0.8, ease }}
			>
				{primaryAction && (
					<Link
						href={primaryAction.href}
						className={cn(
							buttonVariants({ size: "lg" }),
							"gap-2 w-full sm:w-auto justify-center shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-shadow",
						)}
					>
						{primaryAction.icon}
						{primaryAction.text}
					</Link>
				)}
				{secondaryAction && (
					<Link
						href={secondaryAction.href}
						className={cn(
							buttonVariants({ variant: "outline", size: "lg" }),
							"gap-2 w-full sm:w-auto justify-center",
						)}
					>
						{secondaryAction.icon}
						{secondaryAction.text}
					</Link>
				)}
			</motion.div>
		</div>
	);
}

interface HeroProps {
	pill?: {
		href?: string;
		text: string;
		icon?: React.ReactNode;
		endIcon?: React.ReactNode;
		variant?: "default" | "outline" | "ghost";
		size?: "sm" | "md" | "lg";
		className?: string;
	};
	content: HeroContentProps;
	preview?: React.ReactNode;
}

const Hero = ({ pill, content, preview }: HeroProps) => {
	return (
		<div className="relative overflow-hidden">
			{/* Animated Grid Background */}
			<div className="absolute inset-0 -z-10">
				<div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
				<div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
			</div>

			{/* Gradient Orbs */}
			<div className="absolute top-0 left-1/4 -z-10 h-[400px] w-[400px] rounded-full bg-primary/10 blur-[120px]" />
			<div className="absolute top-20 right-1/4 -z-10 h-[300px] w-[300px] rounded-full bg-primary/5 blur-[100px]" />

			<div className="container relative">
				<div className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center py-16 px-4 md:px-8 lg:px-12">
					<div className="flex flex-col items-center text-center gap-8 w-full max-w-5xl">
						{pill && (
							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.5, ease }}
							>
								<HeroBadge {...pill} />
							</motion.div>
						)}
						<HeroContent {...content} />
						{preview && (
							<motion.div
								className="w-full max-w-3xl mt-8"
								initial={{ opacity: 0, y: 30 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.3, duration: 0.8, ease }}
							>
								{preview}
							</motion.div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export { Hero };
