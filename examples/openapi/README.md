# Dwex OpenAPI Example

This example demonstrates how to integrate OpenAPI/OpenAPI documentation into a Dwex application using the `@dwex/openapi` package.

## Features

- **Automatic API Documentation**: Routes are automatically documented from decorators
- **Scalar UI**: Beautiful, modern API documentation interface
- **Type-Safe DTOs**: Full TypeScript support with decorators
- **Multiple Decorators**: Demonstrates various OpenAPI decorators

## Running the Example

```bash
# From the root of the monorepo
bun install

# Run the example
cd examples/openapi
bun dev
```

The application will start on http://localhost:9929

## Accessing Documentation

- **OpenAPI UI**: http://localhost:9929/docs
- **OpenAPI JSON**: http://localhost:9929/docs/json

## API Endpoints

### General Endpoints
- `GET /` - API information
- `GET /health` - Health check

### User Endpoints
- `GET /users` - List all users (with pagination)
- `GET /users/:id` - Get user by ID
- `POST /users` - Create a new user
- `PATCH /users/:id` - Update a user
- `DELETE /users/:id` - Delete a user

## Example Usage

### Creating a User

```bash
curl -X POST http://localhost:9929/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "email": "john@example.com",
    "age": 25,
    "role": "user"
  }'
```

### Getting All Users

```bash
curl http://localhost:9929/users?page=1&limit=10
```

## Code Highlights

### Using OpenAPI Decorators

```typescript
@Controller('users')
@ApiTags('users')
@ApiBearerAuth()
export class UsersController {
  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiOkResponse({ description: 'User found', type: UserDto })
  @ApiNotFoundResponse({ description: 'User not found' })
  findOne(@Param('id') id: string) {
    // ...
  }
}
```

### Defining DTOs with Properties

```typescript
export class CreateUserDto {
  @ApiProperty({
    description: 'Username',
    example: 'john_doe',
    minLength: 3,
    maxLength: 20,
  })
  username: string;

  @ApiProperty({
    description: 'Email address',
    format: 'email',
  })
  email: string;
}
```

### Setting Up OpenAPI

```typescript
const config = new DocumentBuilder()
  .setTitle('My API')
  .setDescription('API documentation')
  .setVersion('1.0')
  .addServer('http://localhost:9929')
  .addBearerAuth()
  .build();

const document = OpenAPIModule.createDocument(app, config);
OpenAPIModule.setup('/docs', app, document);
```

## Learn More

- [Dwex Documentation](https://github.com/dwexjs/dwex)
- [OpenAPI Specification](https://openapi.io/specification/)
- [Scalar Documentation](https://github.com/scalar/scalar)
