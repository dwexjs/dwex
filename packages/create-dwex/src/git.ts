/**
 * Runs a git command using Bun.spawn
 */
async function runGitCommand(cwd: string, args: string[]): Promise<void> {
	const proc = Bun.spawn(["git", ...args], {
		cwd,
		stdout: "inherit",
		stderr: "inherit",
	});

	const exitCode = await proc.exited;

	if (exitCode !== 0) {
		throw new Error(`Git command failed with exit code ${exitCode}`);
	}
}

/**
 * Initializes a git repository and creates initial commit
 */
export async function initializeGit(projectPath: string): Promise<void> {
	// Initialize git
	await runGitCommand(projectPath, ["init"]);

	// Add all files
	await runGitCommand(projectPath, ["add", "."]);

	// Create initial commit
	await runGitCommand(projectPath, ["commit", "-m", "chore: init project"]);
}
