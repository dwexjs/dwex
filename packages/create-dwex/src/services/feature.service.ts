import { join } from "node:path";
import type { Feature, IService, ProjectConfig } from "../types.js";
import {
	getTemplatePath,
	listDirectories,
	readJsonWithEjs,
} from "../utils/fs.js";

/**
 * Service for handling feature discovery and loading
 */
export class FeatureService implements IService {
	/**
	 * Discovers available features by reading the features directory
	 */
	async discoverFeatures(): Promise<Feature[]> {
		const featuresDir = getTemplatePath("features");
		const featureDirs = await listDirectories(featuresDir);

		const features: Feature[] = [];

		for (const dirName of featureDirs) {
			const featurePath = join(featuresDir, dirName, "feature.json");
			try {
				// Read feature.json without EJS rendering for discovery
				const featureConfig = await Bun.file(featurePath).json();
				features.push(featureConfig);
			} catch (error) {
				console.warn(`Failed to load feature ${dirName}:`, error);
			}
		}

		return features;
	}

	/**
	 * Loads a feature configuration with EJS rendering
	 */
	async loadFeature(
		featureId: string,
		config: ProjectConfig,
	): Promise<Feature> {
		const featurePath = join(
			getTemplatePath("features", featureId),
			"feature.json",
		);
		return readJsonWithEjs<Feature>(featurePath, config);
	}

	/**
	 * Loads multiple features
	 */
	async loadFeatures(
		featureIds: string[],
		config: ProjectConfig,
	): Promise<Feature[]> {
		const features: Feature[] = [];
		for (const featureId of featureIds) {
			const feature = await this.loadFeature(featureId, config);
			features.push(feature);
		}
		return features;
	}

	/**
	 * Checks for feature conflicts
	 */
	checkConflicts(selectedFeatures: Feature[]): string[] {
		const conflicts: string[] = [];
		const selectedIds = new Set(selectedFeatures.map((f) => f.id));

		for (const feature of selectedFeatures) {
			if (feature.conflicts) {
				for (const conflictId of feature.conflicts) {
					if (selectedIds.has(conflictId)) {
						conflicts.push(
							`Feature '${feature.id}' conflicts with '${conflictId}'`,
						);
					}
				}
			}
		}

		return conflicts;
	}
}
