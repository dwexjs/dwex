import * as clack from "@clack/prompts";
import { BasePrompt } from "./base.js";

export class DatabasePrompt extends BasePrompt<string | null> {
	async execute(cliValue?: string): Promise<string | null> {
		// If CLI value provided, validate and use it
		if (cliValue !== undefined) {
			const validOptions = ["drizzle", "prisma", "none"];
			if (!validOptions.includes(cliValue.toLowerCase())) {
				throw new Error(
					`Invalid database option: ${cliValue}\nValid options: ${validOptions.join(", ")}`,
				);
			}
			return cliValue.toLowerCase() === "none" ? null : cliValue.toLowerCase();
		}

		// Interactive prompt
		const database = await clack.select({
			message: "Which database ORM would you like to use? (optional)",
			options: [
				{
					value: null,
					label: "None",
					hint: "Skip database setup (you can add it later)",
				},
				{
					value: "drizzle",
					label: "Drizzle ORM",
					hint: "TypeScript ORM with SQL-like syntax and excellent type safety",
				},
				{
					value: "prisma",
					label: "Prisma",
					hint: "Next-generation ORM with great DX and migrations",
				},
			],
		});

		return this.handleCancel(database) as string | null;
	}
}
