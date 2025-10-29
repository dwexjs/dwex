# create-dwex

Scaffolding tool for creating new Dwex applications with features and best practices built-in.

## Usage

### Interactive Mode

Simply run the command and follow the prompts:

```bash
bunx create-dwex
```

### Non-Interactive Mode (CLI Options)

Perfect for automation and LLM-generated commands:

```bash
bunx create-dwex <project-name> [options]
```

#### Options

- `-p, --port <number>` - Port number for the server (default: 9929)
- `-f, --features <list>` - Comma-separated list of features to include
- `-g, --git` - Initialize git repository
- `--no-git` - Skip git initialization (default)
- `-h, --help` - Show help message

#### Examples

```bash
# Create project with default settings (interactive prompts)
bunx create-dwex

# Create project with name only
bunx create-dwex my-app

# Create project with all options
bunx create-dwex my-app --port 3000 --features auth-jwt,openapi --git

# Create project without git initialization
bunx create-dwex my-app --no-git
```

## Available Features

- `auth-jwt` - JWT authentication with guards and decorators
- `openapi` - OpenAPI/Swagger documentation

## Development

### Building

Run `nx build create-dwex` to build the library.

### Running unit tests

Run `nx test create-dwex` to execute the unit tests via [Vitest](https://vitest.dev/).
