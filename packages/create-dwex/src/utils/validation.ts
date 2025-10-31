import type { Validator } from "../types.js";

/**
 * Validates project name
 */
export const validateProjectName: Validator<string> = (value: string) => {
	if (!value) {
		return "Project name is required";
	}
	if (!/^[a-z0-9-]+$/.test(value)) {
		return "Project name must contain only lowercase letters, numbers, and hyphens";
	}
	return undefined;
};

/**
 * Validates port number
 */
export const validatePort: Validator<string> = (value: string) => {
	const num = Number.parseInt(value, 10);
	if (Number.isNaN(num) || num < 1 || num > 65535) {
		return "Port must be a number between 1 and 65535";
	}
	return undefined;
};

/**
 * Validates that a value is not empty
 */
export const validateRequired: Validator<string> = (value: string) => {
	if (!value || value.trim().length === 0) {
		return "This field is required";
	}
	return undefined;
};

/**
 * Checks if a feature ID is valid against available features
 */
export function validateFeatureIds(
	featureIds: string[],
	availableFeatureIds: Set<string>,
): { valid: boolean; invalidIds: string[] } {
	const invalidIds = featureIds.filter((id) => !availableFeatureIds.has(id));
	return {
		valid: invalidIds.length === 0,
		invalidIds,
	};
}

/**
 * Validates AI assistant names
 */
export function validateAiAssistants(assistants: string[]): {
	valid: boolean;
	invalidAssistants: string[];
} {
	const validAssistants = ["claude", "cursor", "copilot"];
	const invalidAssistants = assistants.filter(
		(a) => !validAssistants.includes(a),
	);
	return {
		valid: invalidAssistants.length === 0,
		invalidAssistants,
	};
}
