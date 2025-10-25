/**
 * In-memory user database for demo purposes
 */

export interface User {
	id: number;
	username: string;
	email: string;
	password: string; // In production, this would be hashed!
	role: string;
}

/**
 * In-memory users database
 * Password: "password123" for demo user
 */
export const users: User[] = [
	{
		id: 1,
		username: "admin",
		email: "admin@dwex.dev",
		password: "password123", // In production, use bcrypt/argon2!
		role: "admin",
	},
];

/**
 * Find user by username
 */
export function findUserByUsername(username: string): User | undefined {
	return users.find((user) => user.username === username);
}

/**
 * Find user by ID
 */
export function findUserById(id: number): User | undefined {
	return users.find((user) => user.id === id);
}
