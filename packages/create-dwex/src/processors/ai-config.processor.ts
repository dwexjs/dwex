import { join } from "node:path";
import ejs from "ejs";
import type { IProcessor, ProcessorContext } from "../types.js";
import { getTemplatePath, createDirectory } from "../utils/fs.js";

/**
 * Processor for generating AI agent configuration files
 * Always generates all AI config files by default
 */
export class AiConfigProcessor implements IProcessor {
	async process(context: ProcessorContext): Promise<void> {
		// Always generate all AI config files
		await this.generateClaudeConfig(context);
		await this.generateCursorConfig(context);
		await this.generateCopilotConfig(context);
	}

	/**
	 * Generates Claude configuration files
	 */
	private async generateClaudeConfig(context: ProcessorContext): Promise<void> {
		// Generate CLAUDE.md
		const claudeMdPath = getTemplatePath("base", "CLAUDE.md.ejs");
		const content = await Bun.file(claudeMdPath).text();
		const rendered = ejs.render(content, context.config);
		await Bun.write(join(context.projectPath, "CLAUDE.md"), rendered);

		// Generate .mcp.json for local MCP server connection
		const mcpJsonPath = getTemplatePath("base", ".mcp.json.ejs");
		const mcpContent = await Bun.file(mcpJsonPath).text();
		const mcpRendered = ejs.render(mcpContent, context.config);
		await Bun.write(join(context.projectPath, ".mcp.json"), mcpRendered);
	}

	/**
	 * Generates Cursor configuration files
	 */
	private async generateCursorConfig(context: ProcessorContext): Promise<void> {
		// Generate .cursorrules
		const cursorRulesPath = getTemplatePath("base", ".cursorrules.ejs");
		const content = await Bun.file(cursorRulesPath).text();
		const rendered = ejs.render(content, context.config);
		await Bun.write(join(context.projectPath, ".cursorrules"), rendered);

		// Generate .cursor/mcp.json for Cursor IDE MCP server connection
		const cursorMcpPath = getTemplatePath("base", ".cursor", "mcp.json.ejs");
		const mcpContent = await Bun.file(cursorMcpPath).text();
		const mcpRendered = ejs.render(mcpContent, context.config);

		// Create .cursor directory if it doesn't exist
		await createDirectory(join(context.projectPath, ".cursor"));
		await Bun.write(
			join(context.projectPath, ".cursor", "mcp.json"),
			mcpRendered,
		);
	}

	/**
	 * Generates GitHub Copilot configuration files
	 */
	private async generateCopilotConfig(
		context: ProcessorContext,
	): Promise<void> {
		const copilotPath = getTemplatePath(
			"base",
			".github",
			"copilot-instructions.md.ejs",
		);
		const content = await Bun.file(copilotPath).text();
		const rendered = ejs.render(content, context.config);

		// Create .github directory if it doesn't exist
		await createDirectory(join(context.projectPath, ".github"));
		await Bun.write(
			join(context.projectPath, ".github", "copilot-instructions.md"),
			rendered,
		);
	}
}
