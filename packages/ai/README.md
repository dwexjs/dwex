# @dwex/ai

Model Context Protocol (MCP) integration for Dwex framework. This package enables AI assistants to introspect and interact with your Dwex application through a standardized HTTP interface.

## Features

- 🔍 **Route Introspection** - List and inspect all registered routes with metadata
- 🔧 **Service Discovery** - Explore the DI container and service dependencies
- 🎯 **Middleware Inspection** - View all middlewares (global and controller-scoped)
- 📊 **Dependency Graph** - Visualize the complete dependency tree
- 📝 **Log Buffering** - Access recent application logs
- 🔒 **Optional Authentication** - Secure your MCP endpoint with API keys

## Installation

```bash
bun add @dwex/ai
```

## Quick Start

```typescript
import { DwexFactory } from '@dwex/core';
import { AiModule } from '@dwex/ai';
import { AppModule } from './app.module';

async function bootstrap() {
  // Create and initialize your Dwex application
  const app = await DwexFactory.create(AppModule);
  await app.init();

  // Setup MCP server
  AiModule.setup(app, {
    path: '/mcp',              // MCP endpoint path (default: '/mcp')
    enableAuth: false,         // Enable API key authentication (default: false)
    logBufferSize: 1000,       // Max log entries to buffer (default: 1000)
    enabled: true              // Enable/disable MCP server (default: true)
  });

  // Start your application
  await app.listen(3000);
  console.log('MCP server available at: http://localhost:3000/mcp');
}

bootstrap();
```

## Configuration

### AiModuleConfig

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `path` | `string` | `'/mcp'` | Path for the MCP endpoint |
| `enableAuth` | `boolean` | `false` | Enable API key authentication |
| `apiKey` | `string` | `undefined` | API key for authentication (required if `enableAuth` is true) |
| `logBufferSize` | `number` | `1000` | Maximum number of log entries to keep in buffer |
| `enabled` | `boolean` | `true` | Enable or disable the MCP server |

### Production Configuration

For production environments, always enable authentication:

```typescript
AiModule.setup(app, {
  enableAuth: true,
  apiKey: process.env.MCP_API_KEY || 'your-secure-api-key',
  logBufferSize: 500
});
```

## MCP Tools

The MCP server exposes the following tools that AI assistants can use:

### 1. list-routes
List all registered routes in the application.

**Output:**
```json
{
  "routes": [
    {
      "path": "/users",
      "method": "GET",
      "controller": "UserController",
      "handler": "findAll"
    }
  ],
  "count": 1
}
```

### 2. get-route-details
Get detailed information about a specific route.

**Input:**
- `method`: HTTP method (GET, POST, PUT, DELETE, etc.)
- `path`: Route path

**Output:** Detailed route information including guards, interceptors, parameters, and metadata.

### 3. list-services
List all services registered in the DI container.

**Output:**
```json
{
  "services": [
    {
      "token": "UserService",
      "name": "UserService",
      "scope": "SINGLETON",
      "isGlobal": false
    }
  ],
  "count": 1
}
```

### 4. get-service-details
Get detailed information about a specific service.

**Input:**
- `token`: Service token or name

**Output:** Service details including dependencies and metadata.

### 5. list-middlewares
List all middlewares (global and controller-scoped).

**Output:** Array of middlewares with their type and associated controllers.

### 6. get-dependency-graph
Get the complete dependency graph of all services.

**Output:** Dependency tree showing relationships between services.

### 7. get-logs
Get recent logs from the application buffer.

**Input (optional):**
- `level`: Filter by log level (trace, debug, info, warn, error, fatal)
- `limit`: Maximum number of logs to return
- `since`: ISO timestamp to filter logs from

**Output:** Array of log entries.

## MCP Resources

The MCP server also provides resources that can be accessed:

- `dwex://routes` - All routes collection
- `dwex://services` - All services collection
- `dwex://logs` - Recent logs collection
- `dwex://health` - Application health status

## Authentication

When authentication is enabled, clients must provide an API key in one of two ways:

1. **X-API-Key header:**
```http
POST /mcp HTTP/1.1
Host: localhost:3000
X-API-Key: your-api-key
Content-Type: application/json
```

2. **Authorization Bearer token:**
```http
POST /mcp HTTP/1.1
Host: localhost:3000
Authorization: Bearer your-api-key
Content-Type: application/json
```

## Example: Using with Claude Desktop

Add this to your Claude Desktop MCP configuration:

```json
{
  "mcpServers": {
    "dwex-app": {
      "url": "http://localhost:3000/mcp",
      "headers": {
        "X-API-Key": "your-api-key"
      }
    }
  }
}
```

## Development

Build the package:
```bash
bun nx build @dwex/ai
```

Run tests:
```bash
bun nx test @dwex/ai
```

## License

MIT
