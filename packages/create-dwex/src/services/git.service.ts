import type { IService } from "../types.js";

/**
 * Service for handling Git operations
 */
export class GitService implements IService {
	/**
	 * Runs a git command using Bun.spawn
	 */
	private async runGitCommand(cwd: string, args: string[]): Promise<void> {
		const proc = Bun.spawn(["git", ...args], {
			cwd,
			stdout: "pipe",
			stderr: "pipe",
		});

		const exitCode = await proc.exited;

		if (exitCode !== 0) {
			throw new Error(`Git command failed with exit code ${exitCode}`);
		}
	}

	/**
	 * Initializes a git repository
	 */
	async init(projectPath: string): Promise<void> {
		await this.runGitCommand(projectPath, ["init"]);
	}

	/**
	 * Adds all files to git staging
	 */
	async addAll(projectPath: string): Promise<void> {
		await this.runGitCommand(projectPath, ["add", "."]);
	}

	/**
	 * Creates a commit
	 */
	async commit(projectPath: string, message: string): Promise<void> {
		await this.runGitCommand(projectPath, ["commit", "-m", message]);
	}

	/**
	 * Initializes a git repository and creates initial commit
	 */
	async initializeRepository(projectPath: string): Promise<void> {
		await this.init(projectPath);
		await this.addAll(projectPath);
		await this.commit(projectPath, "chore: init project");
	}
}
