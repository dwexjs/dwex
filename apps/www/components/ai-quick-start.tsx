"use client";

import { useCopyButton } from "fumadocs-ui/utils/use-copy-button";
import { Check, Copy, Sparkles } from "lucide-react";
import { cn } from "../lib/cn";
import { buttonVariants } from "./ui/button";

const AI_PROMPT = `I want to create a new Dwex project.

First, please ask me for the project title and a brief description of what I want to build.

Once you have that, you can learn about Dwex to help you set it up. Dwex is a TypeScript framework for building high-performance backend applications on Bun runtime. It uses decorators, dependency injection, and a modular architecture similar to NestJS but optimized for Bun.

Before starting, you should familiarize yourself with the documentation:
1. First, fetch https://dwex.dev/llm.txt to see the list of available documentation pages.
2. Read the key pages you need from the list (they're in MDX format). This should give you enough context for most projects.
3. Only if you find it absolutely necessary for a complex project, you can fetch https://dwex.dev/llm-full.txt for the complete documentation, but try to avoid this to be faster.

Once you are familiar with Dwex, create a new project using the information I provided. The command should look something like this, but you should adjust it based on my project description (e.g., adding '--features openapi' if it seems like I'll need an API with OpenAPI spec):

bunx create-dwex <project-name> --port 9929 --no-git --features auth-jwt,openapi

Then navigate to the project and start the development server:

cd <project-name>
bun run src/main.ts

The project uses:
- Bun as the JavaScript runtime
- TypeScript with decorators (@Controller, @Injectable, @Get, etc.)
- reflect-metadata for dependency injection
- ESM modules exclusively

Please start by asking me for the project details. Then, execute the setup and confirm when it's complete.`;

export function AIQuickStart() {
	const [checked, onClick] = useCopyButton(() =>
		navigator.clipboard.writeText(AI_PROMPT),
	);

	return (
		<div className="border rounded-lg p-4 bg-gradient-to-br from-fd-primary/5 to-fd-accent/5 dark:from-fd-primary/10 dark:to-fd-accent/10">
			<Sparkles/>

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
