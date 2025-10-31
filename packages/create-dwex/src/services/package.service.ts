import { join } from "node:path";
import type { Feature, IService } from "../types.js";

/**
 * Service for handling package.json operations
 */
export class PackageService implements IService {
	/**
	 * Gets the version from create-dwex package.json
	 */
	async getVersion(): Promise<string> {
		const packageJsonPath = join(import.meta.dirname, "..", "..", "package.json");
		const packageJson = await Bun.file(packageJsonPath).json();
		return packageJson.version || "0.0.1";
	}

	/**
	 * Merges dependencies from features into the project's package.json
	 */
	async mergeDependencies(
		projectPath: string,
		features: Feature[],
	): Promise<void> {
		const packageJsonPath = join(projectPath, "package.json");
		const packageJson = JSON.parse(await Bun.file(packageJsonPath).text());

		// Merge dependencies from all features
		for (const feature of features) {
			if (feature.dependencies) {
				packageJson.dependencies = {
					...packageJson.dependencies,
					...feature.dependencies,
				};
			}
		}

		// Write back the merged package.json
		await Bun.write(
			packageJsonPath,
			JSON.stringify(packageJson, null, "\t") + "\n",
		);
	}

	/**
	 * Installs dependencies using Bun
	 */
	async installDependencies(projectPath: string): Promise<boolean> {
		const installProc = Bun.spawn(["bun", "install", "--no-cache"], {
			cwd: projectPath,
			stdout: "ignore",
			stderr: "ignore",
		});

		await installProc.exited;
		return installProc.exitCode === 0;
	}

	/**
	 * Formats the project using Biome
	 */
	async formatProject(projectPath: string): Promise<boolean> {
		try {
			const formatProc = Bun.spawn(
				["bunx", "biome", "check", "--write", "."],
				{
					cwd: projectPath,
					stdout: "ignore",
					stderr: "ignore",
				},
			);
			await formatProc.exited;
			return formatProc.exitCode === 0;
		} catch {
			return false;
		}
	}
}
