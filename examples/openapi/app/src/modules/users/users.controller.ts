import {
	Body,
	Controller,
	Delete,
	Get,
	Injectable,
	Param,
	Patch,
	Post,
	Query,
} from "@dwex/core";
import {
	ApiBadRequestResponse,
	ApiBearerAuth,
	ApiBody,
	ApiCreatedResponse,
	ApiNoContentResponse,
	ApiNotFoundResponse,
	ApiOkResponse,
	ApiOperation,
	ApiParam,
	ApiQuery,
	ApiTags,
} from "@dwex/openapi";
import { CreateUserDto, UpdateUserDto, UserDto } from "./user.dto.js";

/**
 * User management controller
 */
@Injectable()
@Controller("users")
@ApiTags("users")
@ApiBearerAuth()
export class UsersController {
	private users: UserDto[] = [
		{
			id: "1",
			username: "admin",
			email: "admin@example.com",
			age: 30,
			role: "admin",
			createdAt: new Date().toISOString(),
		},
		{
			id: "2",
			username: "user",
			email: "user@example.com",
			age: 25,
			role: "user",
			createdAt: new Date().toISOString(),
		},
	];

	/**
	 * Get all users
	 */
	@Get()
	@ApiOperation({
		summary: "Get all users",
		description: "Returns a list of all users with optional pagination",
	})
	@ApiQuery({
		name: "page",
		description: "Page number",
		required: false,
		type: Number,
		example: 1,
	})
	@ApiQuery({
		name: "limit",
		description: "Items per page",
		required: false,
		type: Number,
		example: 10,
	})
	@ApiOkResponse({
		description: "List of users",
		type: [UserDto],
		isArray: true,
	})
	findAll(@Query("page") page?: string, @Query("limit") limit?: string) {
		const pageNum = page ? Number.parseInt(page, 10) : 1;
		const limitNum = limit ? Number.parseInt(limit, 10) : 10;

		const start = (pageNum - 1) * limitNum;
		const end = start + limitNum;

		return {
			data: this.users.slice(start, end),
			total: this.users.length,
			page: pageNum,
			limit: limitNum,
		};
	}

	/**
	 * Get user by ID
	 */
	@Get(":id")
	@ApiOperation({
		summary: "Get user by ID",
		description: "Returns a single user by their unique identifier",
	})
	@ApiParam({
		name: "id",
		description: "User ID",
		type: String,
		example: "1",
	})
	@ApiOkResponse({
		description: "User found",
		type: UserDto,
	})
	@ApiNotFoundResponse({
		description: "User not found",
	})
	findOne(@Param("id") id: string) {
		const user = this.users.find((u) => u.id === id);

		if (!user) {
			return {
				statusCode: 404,
				message: `User with ID ${id} not found`,
			};
		}

		return user;
	}

	/**
	 * Create a new user
	 */
	@Post()
	@ApiOperation({
		summary: "Create a new user",
		description: "Creates a new user with the provided information",
	})
	@ApiBody({
		description: "User creation data",
		type: CreateUserDto,
	})
	@ApiCreatedResponse({
		description: "User created successfully",
		type: UserDto,
	})
	@ApiBadRequestResponse({
		description: "Invalid user data",
	})
	create(@Body() createUserDto: CreateUserDto) {
		const newUser: UserDto = {
			id: String(this.users.length + 1),
			...createUserDto,
			role: createUserDto.role || "user",
			createdAt: new Date().toISOString(),
		};

		this.users.push(newUser);

		return newUser;
	}

	/**
	 * Update a user
	 */
	@Patch(":id")
	@ApiOperation({
		summary: "Update user",
		description: "Updates an existing user's information",
	})
	@ApiParam({
		name: "id",
		description: "User ID",
		type: String,
	})
	@ApiBody({
		description: "User update data",
		type: UpdateUserDto,
	})
	@ApiOkResponse({
		description: "User updated successfully",
		type: UserDto,
	})
	@ApiNotFoundResponse({
		description: "User not found",
	})
	update(@Param("id") id: string, @Body() updateUserDto: UpdateUserDto) {
		const userIndex = this.users.findIndex((u) => u.id === id);

		if (userIndex === -1) {
			return {
				statusCode: 404,
				message: `User with ID ${id} not found`,
			};
		}

		this.users[userIndex] = {
			...this.users[userIndex],
			...updateUserDto,
		};

		return this.users[userIndex];
	}

	/**
	 * Delete a user
	 */
	@Delete(":id")
	@ApiOperation({
		summary: "Delete user",
		description: "Deletes a user by their ID",
	})
	@ApiParam({
		name: "id",
		description: "User ID",
		type: String,
	})
	@ApiNoContentResponse({
		description: "User deleted successfully",
	})
	@ApiNotFoundResponse({
		description: "User not found",
	})
	remove(@Param("id") id: string) {
		const userIndex = this.users.findIndex((u) => u.id === id);

		if (userIndex === -1) {
			return {
				statusCode: 404,
				message: `User with ID ${id} not found`,
			};
		}

		this.users.splice(userIndex, 1);

		return { message: "User deleted successfully" };
	}
}
