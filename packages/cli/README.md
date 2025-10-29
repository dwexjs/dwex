# @dwex/cli

Official CLI tool for building and developing Dwex applications.

## Features

- **Build Command**: Bundle your application for production with Bun.build()
- **Dev Command**: Development server with hot reload, console clearing, and timing info
- **Generate Command**: Interactive code scaffolding for modules, controllers, services, guards, and middleware
- **Configuration**: Support for `dwex.config.ts` configuration file

## Installation

```bash
bun add -D @dwex/cli
```

## Usage

### Development Server

Start the development server with hot reload:

```bash
bunx dwex dev
```

Options:
- `-p, --port <port>`: Port to run the server on

### Build for Production

Bundle your application for production:

```bash
bunx dwex build
```

Options:
- `--no-minify`: Disable minification
- `--sourcemap <type>`: Sourcemap type (none, inline, external)
- `-o, --outdir <dir>`: Output directory

### Generate Code

Interactive code scaffolding:

```bash
bunx dwex generate
# or shorthand
bunx dwex g
```

With arguments:

```bash
bunx dwex g module users
bunx dwex g controller auth
bunx dwex g service products
bunx dwex g guard admin
bunx dwex g middleware logging
```

#### Supported Schematics

- **module**: Complete module with controller and service
- **controller**: REST API controller
- **service**: Business logic service
- **guard**: Route guard for authorization
- **middleware**: HTTP middleware

## Configuration

Create a `dwex.config.ts` file in your project root:

```typescript
export default {
  // Entry point file for the application
  entry: "index.ts",

  // Output directory for built files
  outdir: "dist",

  // Enable minification in production builds
  minify: true,

  // Generate sourcemaps
  sourcemap: "external",

  // External packages to exclude from bundle
  external: [],

  // Target runtime
  target: "bun",

  // Port for development server
  port: 9929,
};
```

## Project Structure

The CLI expects your project to follow this structure:

```
my-dwex-app/
├── modules/              # Generated modules go here
│   ├── users/
│   │   ├── users.module.ts
│   │   ├── users.controller.ts
│   │   └── users.service.ts
│   └── auth/
│       ├── auth.module.ts
│       ├── auth.controller.ts
│       └── auth.service.ts
├── root.module.ts        # Root application module
├── index.ts              # Entry point
├── dwex.config.ts        # Optional config
└── package.json
```

## Development

Build the CLI:

```bash
bun nx run cli:build
```

## License

MIT
