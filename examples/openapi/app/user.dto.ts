import { ApiProperty, ApiPropertyOptional } from "@dwex/openapi";

/**
 * DTO for creating a new user
 */
export class CreateUserDto {
	@ApiProperty({
		description: "Username",
		example: "john_doe",
		minLength: 3,
		maxLength: 20,
	})
	username: string;

	@ApiProperty({
		description: "Email address",
		example: "john@example.com",
		format: "email",
	})
	email: string;

	@ApiProperty({
		description: "User age",
		example: 25,
		minimum: 18,
		maximum: 100,
	})
	age: number;

	@ApiPropertyOptional({
		description: "User role",
		enum: ["admin", "user", "guest"],
		default: "user",
		example: "user",
	})
	role?: string;
}

/**
 * DTO for updating a user
 */
export class UpdateUserDto {
	@ApiPropertyOptional({
		description: "Username",
		example: "john_doe_updated",
	})
	username?: string;

	@ApiPropertyOptional({
		description: "Email address",
		example: "john.updated@example.com",
	})
	email?: string;

	@ApiPropertyOptional({
		description: "User age",
		example: 26,
	})
	age?: number;
}

/**
 * User response DTO
 */
export class UserDto {
	@ApiProperty({
		description: "User ID",
		example: "123",
	})
	id: string;

	@ApiProperty({
		description: "Username",
		example: "john_doe",
	})
	username: string;

	@ApiProperty({
		description: "Email address",
		example: "john@example.com",
	})
	email: string;

	@ApiProperty({
		description: "User age",
		example: 25,
	})
	age: number;

	@ApiProperty({
		description: "User role",
		example: "user",
	})
	role: string;

	@ApiProperty({
		description: "Creation timestamp",
		example: "2024-01-01T00:00:00Z",
		format: "date-time",
	})
	createdAt: string;
}
