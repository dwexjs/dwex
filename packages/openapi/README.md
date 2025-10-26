# @dwex/openapi

OpenAPI/OpenAPI documentation support for Dwex framework with beautiful Scalar UI.

## Features

- 🚀 **Auto-generation**: Automatically generates OpenAPI specs from your decorators
- 🎨 **Scalar UI**: Beautiful, modern API documentation interface
- 📝 **Type-Safe**: Full TypeScript support with decorators
- 🔧 **Customizable**: Optional decorators for detailed control
- 🎯 **NestJS-like**: Familiar API for developers coming from NestJS

## Installation

```bash
bun add @dwex/openapi
```

## Quick Start

```typescript
import { DwexFactory } from '@dwex/core';
import { DocumentBuilder, OpenApiModule } from '@dwex/openapi';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await DwexFactory.create(AppModule);

  // Create OpenAPI configuration
  const config = new DocumentBuilder()
    .setTitle('My API')
    .setDescription('API documentation')
    .setVersion('1.0')
    .addServer('http://localhost:3000')
    .addBearerAuth()
    .build();

  // Generate OpenAPI document
  const document = OpenApiModule.createDocument(app, config);

  // Setup OpenAPI UI at /docs
  OpenApiModule.setup('/docs', app, document);

  await app.listen(3000);
}

bootstrap();
```

Visit `http://localhost:3000/docs` to see your API documentation!

## Usage

### Basic Controller Documentation

```typescript
import { Controller, Get, Post, Body, Param } from '@dwex/core';
import { ApiTags, ApiOperation, ApiResponse } from '@dwex/openapi';

@Controller('users')
@ApiTags('users')
export class UsersController {
  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'List of users' })
  findAll() {
    return [];
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User found' })
  @ApiResponse({ status: 404, description: 'User not found' })
  findOne(@Param('id') id: string) {
    return { id };
  }
}
```

### DTO Documentation

```typescript
import { ApiProperty, ApiPropertyOptional } from '@dwex/openapi';

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
    example: 'john@example.com',
    format: 'email',
  })
  email: string;

  @ApiPropertyOptional({
    description: 'User role',
    enum: ['admin', 'user', 'guest'],
    default: 'user',
  })
  role?: string;
}
```

### Request Body Documentation

```typescript
@Post()
@ApiOperation({ summary: 'Create a new user' })
@ApiBody({ description: 'User data', type: CreateUserDto })
@ApiCreatedResponse({ description: 'User created', type: UserDto })
create(@Body() dto: CreateUserDto) {
  return dto;
}
```

### Query Parameters

```typescript
@Get()
@ApiQuery({ name: 'page', required: false, type: Number })
@ApiQuery({ name: 'limit', required: false, type: Number })
findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
  return { page, limit };
}
```

### Security/Authentication

```typescript
// In your bootstrap
const config = new DocumentBuilder()
  .addBearerAuth()
  .build();

// On controllers or routes
@Controller('users')
@ApiBearerAuth()
export class UsersController {
  // All routes in this controller require authentication
}
```

## Available Decorators

### Class-Level Decorators

- `@ApiTags(...tags)` - Group endpoints by tags
- `@ApiBearerAuth()` - Require Bearer authentication
- `@ApiBasicAuth()` - Require Basic authentication
- `@ApiSecurity(name, scopes)` - Custom security requirements

### Method-Level Decorators

- `@ApiOperation({ summary, description })` - Endpoint description
- `@ApiResponse({ status, description, type })` - Response documentation
- `@ApiOkResponse()` - 200 response shorthand
- `@ApiCreatedResponse()` - 201 response shorthand
- `@ApiNoContentResponse()` - 204 response shorthand
- `@ApiBadRequestResponse()` - 400 response shorthand
- `@ApiUnauthorizedResponse()` - 401 response shorthand
- `@ApiForbiddenResponse()` - 403 response shorthand
- `@ApiNotFoundResponse()` - 404 response shorthand
- `@ApiParam({ name, description, type })` - Path parameter details
- `@ApiQuery({ name, description, required, type })` - Query parameter details
- `@ApiBody({ type, description })` - Request body details

### Property-Level Decorators (for DTOs)

- `@ApiProperty({ description, example, type, ... })` - Property documentation
- `@ApiPropertyOptional({ ... })` - Optional property shorthand

### Property Options

```typescript
@ApiProperty({
  description: 'Property description',
  example: 'example value',
  type: String,  // or Number, Boolean, etc.
  required: true,
  enum: ['option1', 'option2'],
  minimum: 0,
  maximum: 100,
  minLength: 3,
  maxLength: 20,
  pattern: '^[a-z]+$',
  format: 'email',  // or 'date-time', 'uri', etc.
  default: 'default value'
})
propertyName: string;
```

## DocumentBuilder Methods

```typescript
const config = new DocumentBuilder()
  .setTitle('API Title')
  .setDescription('API Description')
  .setVersion('1.0')
  .setTermsOfService('https://example.com/terms')
  .setContact('Support', 'https://example.com', 'support@example.com')
  .setLicense('MIT', 'https://opensource.org/licenses/MIT')
  .addServer('http://localhost:3000', 'Local server')
  .addTag('users', 'User management')
  .addBearerAuth()
  .addBasicAuth()
  .addApiKey({ name: 'api-key', in: 'header', paramName: 'X-API-KEY' })
  .addSecurity('bearer', [])
  .build();
```

## OpenApiModule Options

```typescript
OpenApiModule.setup('/docs', app, document, {
  customSiteTitle: 'My API Documentation',
  darkMode: true,
  customCss: 'body { background: #000; }',
  customfavIcon: 'https://example.com/favicon.ico',
});
```

## Auto-Generation

Even without explicit decorators, @dwex/openapi will automatically generate basic documentation from your existing Dwex decorators:

- Route paths from `@Get()`, `@Post()`, etc.
- Parameters from `@Param()`, `@Query()`, `@Body()`
- Controller paths from `@Controller()`
- Authentication requirements from guards

## OpenAPI JSON Endpoint

The OpenAPI JSON specification is automatically available at `/docs/json` (or `{your-path}/json`).

```bash
curl http://localhost:3000/docs/json
```

## Example

See the [complete example](../../examples/openapi) in the repository.

## License

MIT

## Learn More

- [Dwex Documentation](https://github.com/dwexjs/dwex)
- [OpenAPI Specification](https://swagger.io/specification/)
- [Scalar Documentation](https://github.com/scalar/scalar)
