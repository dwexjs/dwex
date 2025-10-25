import { join } from "node:path";

/**
 * Gets the version from create-dwex package.json
 */
export async function getCreateDwexVersion(): Promise<string> {
	const packageJsonPath = join(import.meta.dirname, "..", "package.json");
	const packageJson = await Bun.file(packageJsonPath).json();
	return packageJson.version || "0.0.1";
}
