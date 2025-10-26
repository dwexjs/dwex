# Contributing to Dwex

Thanks for contributing! Here's what you need to know.

## Quick Start

```bash
# Install dependencies
bun install

# Build all packages
bun nx run-many -t build

# Run tests
bun nx run-many -t test

# Typecheck
bun nx run-many -t typecheck
```

## Development Workflow

1. **Fork & clone** the repository
2. **Create a branch** from `main` (e.g., `feat/my-feature` or `fix/bug-name`)
3. **Make your changes** following our code style
4. **Test thoroughly** - add tests for new features
5. **Format code** - `bunx nx format` (auto-formats with Biome)
6. **Submit a PR** with a clear description

## Code Style

We use **Biome** for formatting and linting:

- **Indentation**: Tabs (not spaces)
- **Quotes**: Double quotes
- **TypeScript**: Strict mode enabled
- **Imports**: Auto-organized on format

Run `bunx nx format` before committing.

## Best Practices

### Bun-First Development

Always prefer Bun APIs over Node.js modules:

```typescript
// ✅ Good - Bun API
const data = await Bun.file("file.json").json();
await Bun.write("output.txt", content);

// ❌ Avoid - Node.js API
import fs from "fs/promises";
const data = await fs.readFile("file.json", "utf-8");
```

### Architecture

- Use **decorators** (`@Controller`, `@Injectable`, `@Get`, etc.)
- Follow the **dependency injection** pattern
- Keep modules **focused and cohesive**
- Add **JSDoc** comments for public APIs

### Testing

- Colocate tests with source: `*.test.ts`
- Run specific package tests: `bun nx run <package>:test`
- Ensure all tests pass before submitting PR

### TypeScript

- Enable all strict flags
- Avoid `any` - use proper types
- Export types alongside implementation

## Project Structure

```
packages/
├── core/          # Framework core
├── common/        # Shared utilities
├── jwt/           # JWT module
├── logger/        # Logger module
└── create-dwex/   # CLI scaffolding tool

examples/          # Example applications
```

## Running Tasks

Use `bun nx` for all tasks:

```bash
# Build specific package
bun nx run @dwexjs/core:build

# Run affected tests
bun nx affected -t test

# Run multiple targets
bun nx run-many -t build,test
```

## Commit Messages

Keep them clear and descriptive:

- `feat: add new middleware support`
- `fix: resolve circular dependency issue`
- `docs: update installation guide`
- `chore: update dependencies`

## Need Help?

- Check existing issues and discussions
- Open an issue for bugs or feature requests
- Ask questions in discussions

Happy coding! 🚀
