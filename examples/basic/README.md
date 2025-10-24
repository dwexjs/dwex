# Dwex Basic Example

A simple Hello World application built with Dwex framework.

## Features

- Basic HTTP routing with decorators
- Module-based architecture
- Auto-JSON serialization
- Bun runtime optimized

## Routes

- `GET /` - Hello World message
- `GET /ping` - Health check endpoint

## Getting Started

### Install dependencies

```bash
bun install
```

### Run the application

```bash
bun run dev
```

The server will start on `http://localhost:3000`

### Try it out

```bash
# Root endpoint
curl http://localhost:3000

# Ping endpoint
curl http://localhost:3000/ping
```

## Project Structure

```
src/
├── app.controller.ts  # Controller with route handlers
├── app.module.ts      # Root module
└── main.ts           # Application entry point
```
