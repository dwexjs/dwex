"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

const ease = [0.16, 1, 0.3, 1] as const;

interface QuickStartProps {
	command: string;
	heading?: {
		title: string;
		description?: string;
	};
	className?: string;
}

export function QuickStart({
	command,
	heading,
	className,
}: QuickStartProps) {
	const [copied, setCopied] = useState(false);

	const handleCopy = async () => {
		await navigator.clipboard.writeText(command);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	return (
		<section className={cn("container py-12 md:py-16", className)}>
			<div className="mx-auto max-w-4xl px-4 md:px-8 lg:px-12">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.8, ease }}
				>
					{heading && (
						<div className="mb-6 text-center">
							<h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
								{heading.title}
							</h2>
							{heading.description && (
								<p className="mt-2 text-muted-foreground">
									{heading.description}
								</p>
							)}
						</div>
					)}

					<div className="relative group">
						<div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 rounded-lg blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
						<div className="relative rounded-lg border border-border bg-card overflow-hidden">
							<div className="flex items-center justify-between gap-4 px-6 py-4">
								<div className="flex items-center gap-3 flex-1 min-w-0">
									<span className="text-muted-foreground select-none text-sm sm:text-base">
										$
									</span>
									<code className="text-sm sm:text-base font-mono text-foreground truncate">
										{command}
									</code>
								</div>
								<button
									type="button"
									onClick={handleCopy}
									className={cn(
										"flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors flex-shrink-0",
										"bg-primary/10 text-primary hover:bg-primary/20 ring-1 ring-primary/20",
									)}
									aria-label="Copy command"
								>
									{copied ? (
										<>
											<Check className="h-4 w-4" />
											<span className="hidden sm:inline">Copied!</span>
										</>
									) : (
										<>
											<Copy className="h-4 w-4" />
											<span className="hidden sm:inline">Copy</span>
										</>
									)}
								</button>
							</div>
						</div>
					</div>
				</motion.div>
			</div>
		</section>
	);
}
