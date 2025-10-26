import { Injectable } from "@dwex/core";
import { findUserById, findUserByUsername, type User } from "./users.db";

/**
 * Users service for user management
 */
@Injectable()
export class UsersService {
	/**
	 * Find user by username
	 */
	findByUsername(username: string): User | undefined {
		return findUserByUsername(username);
	}

	/**
	 * Find user by ID
	 */
	findById(id: number): User | undefined {
		return findUserById(id);
	}
}
