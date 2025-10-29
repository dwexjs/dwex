"use client";

import { useCopyButton } from "fumadocs-ui/utils/use-copy-button";
import { Check, Copy, Sparkles } from "lucide-react";
import { cn } from "../lib/cn";
import { buttonVariants } from "./ui/button";

const AI_PROMPT = `I want to create a new Dwex project.

Dwex is a TypeScript framework for building high-performance backend applications on Bun runtime. It uses decorators, dependency injection, and a modular architecture similar to NestJS but optimized for Bun.

Before starting, read the documentation:
1. First, fetch https://dwex.dev/llm.txt to see the list of available documentation pages
2. Read the key pages you need from the list (they're in MDX format)
3. Alternatively, if you need comprehensive context, fetch https://dwex.dev/llm-full.txt for the complete documentation

Once familiar with Dwex, create a new project using this single command:

bunx create-dwex my-app --port 9929 --no-git

Then navigate to the project and start the development server:

cd my-app
bun run src/main.ts

The project uses:
- Bun as the JavaScript runtime
- TypeScript with decorators (@Controller, @Injectable, @Get, etc.)
- reflect-metadata for dependency injection
- ESM modules exclusively

Please execute these commands and confirm the setup is complete.`;

export function AIQuickStart() {
	const [checked, onClick] = useCopyButton(() =>
		navigator.clipboard.writeText(AI_PROMPT),
	);

	return (
		<div className="border rounded-lg p-4 bg-gradient-to-br from-fd-primary/5 to-fd-accent/5 dark:from-fd-primary/10 dark:to-fd-accent/10">
			<h1 className="font-semibold text-lg">AI Quick Start</h1>

			<p className="text-sm text-fd-muted-foreground">
				Let your AI assistant (Claude, ChatGPT, etc.) set up a complete Dwex
				project for you. The copied prompt includes instructions to read the
				documentation and execute the setup commands using Bun.
			</p>

			<button
				type="button"
				className={cn(
					buttonVariants({
						size: "sm",
						className: "gap-2 [&_svg]:size-3.5",
					}),
				)}
				onClick={onClick}
			>
				{checked ? <Check /> : <Copy />}
				Copy Prompt
			</button>
		</div>
	);
}
