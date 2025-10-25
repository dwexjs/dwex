"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

const ease = [0.16, 1, 0.3, 1] as const;

interface CodePreviewProps {
	command: string;
	className?: string;
}

export function CodePreview({ command, className }: CodePreviewProps) {
	const [copied, setCopied] = useState(false);

	const handleCopy = async () => {
		await navigator.clipboard.writeText(command);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	return (
		<motion.div
			className={cn("w-full", className)}
			initial={{ opacity: 0, scale: 0.95 }}
			animate={{ opacity: 1, scale: 1 }}
			transition={{ delay: 0.3, duration: 0.8, ease }}
		>
			<div className="relative group">
				<div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 rounded-lg blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-500" />
				<div className="relative rounded-lg border border-border bg-card overflow-hidden shadow-lg">
					<div className="bg-muted/50 border-b border-border px-4 py-2 flex items-center gap-2">
						<div className="flex gap-1.5">
							<div className="w-3 h-3 rounded-full bg-destructive/60" />
							<div className="w-3 h-3 rounded-full bg-chart-4/60" />
							<div className="w-3 h-3 rounded-full bg-chart-2/60" />
						</div>
						<span className="text-xs text-muted-foreground font-medium">
							Terminal
						</span>
					</div>
					<div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6 sm:py-5">
						<div className="flex items-center gap-3 flex-1 min-w-0">
							<span className="text-muted-foreground select-none">$</span>
							<code className="text-sm sm:text-base font-mono text-foreground">
								{command}
							</code>
						</div>
						<button
							type="button"
							onClick={handleCopy}
							className={cn(
								"flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-all flex-shrink-0",
								"bg-primary/10 text-primary hover:bg-primary/20 ring-1 ring-primary/20",
								"hover:scale-105 active:scale-95",
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
	);
}
