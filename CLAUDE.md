# Dwex Framework - Project Guidelines

## Tech Stack

- **Runtime**: Bun
- **Language**: TypeScript 5.9+
- **Build Tool**: Nx 22 (monorepo)
- **Module System**: ESM (type: "module")
- **Bundler**: tsc
- **Testing**: Vitest
- **Formatter/Linter**: Biome

## Monorepo Structure

- Nx workspace with packages under `packages/*`
- Main packages: `@dwex/core`, `@dwex/common`, `@dwex/jwt`, `@dwex/logger`
- Examples located in `examples/*`

## Code Style

### Formatting (Biome)

- **Indentation**: Tabs (not spaces)
- **Quotes**: Double quotes for strings
- **Format command**: `bunx nx format` or `bunx biome format --write packages`
- Auto-organize imports enabled

### TypeScript

- **Strict mode**: Enabled with all strict flags
- **Target**: ES2022
- **Module**: NodeNext with module resolution "nodenext"
- **Compiler options**: `composite: true`, `declarationMap: true`, `emitDeclarationOnly: true`
- Enable unused locals checking and implicit return checking

### Architecture Patterns

- **Decorator-based**: Uses TypeScript decorators extensively (`@Controller`, `@Injectable`, `@Get`, etc.)
- **Dependency Injection**: reflect-metadata based DI system
- **Scoped instances**: Support for singleton, request, and transient scopes
- **Modular**: Module-based architecture with hierarchical dependency injection

## Development Guidelines

### Running Tasks

- Always use `bun nx` commands for tasks: `bun nx run`, `bun nx run-many`, `bun nx affected`
- Build: `bun nx run-many -t build` or `bun nx run <project>:build`
- Test: `bun nx run <project>:test`
- Typecheck: `bun nx run <project>:typecheck`

### Bun Runtime APIs

- **Always prefer Bun APIs over Node.js modules** for file system operations, networking, and other runtime features
- **File I/O**: Use `Bun.file()`, `Bun.write()`, and the `BunFile` API instead of Node.js `fs` module
  - Reading: `await Bun.file("path").text()`, `await Bun.file("path").json()`
  - Writing: `await Bun.write("path", data)`
  - See: https://bun.sh/docs/api/file-io
- **Environment Variables**: Use `Bun.env` instead of `process.env`
- **Shell Commands**: Use `Bun.$` for shell scripting instead of `child_process`
- **HTTP Server**: Use `Bun.serve()` for HTTP servers
- **Path Operations**: Use `import.meta` for current file paths instead of `__dirname` and `__filename`
- Only use Node.js built-in modules when Bun doesn't provide an equivalent API

### File Structure

- Source files in `src/`
- Tests colocated with source: `*.test.ts` files next to implementation
- Index files for clean exports: `index.ts` in each directory
- Build output in `dist/` (gitignored)

### Dependencies

- Use workspace protocol (`*`) for internal package dependencies
- Core dependencies: `reflect-metadata`, `cookie`, `tslib`
- Dev dependencies managed at root level

### Documentation

- Use JSDoc comments for public APIs
- Include `@example` blocks in decorator documentation
- Document function parameters with `@param` and return types with `@returns`

## Package Publishing

- ESM only (no CommonJS)
- Export both types and source via package.json `exports` field
- Include `@dwex/source` custom condition for monorepo development
- Files: Only include `dist/` directory, exclude `.tsbuildinfo` files
