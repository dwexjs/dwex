# <%= projectName %>

A Dwex application created with `create-dwex`.

## Getting Started

Install dependencies:

```bash
bun install
```

Run the development server:

```bash
bun run dev
```

The server will start on `http://localhost:<%= port %>`.

## Available Scripts

- `bun run dev` - Start development server with hot reload
- `bun run build` - Build for production
- `bun run start` - Start production server
- `bun run format` - Format code with Biome
- `bun run lint` - Lint code with Biome
- `bun run check` - Check and fix code with Biome

## Project Structure

```
src/
├── modules/         # Feature modules
│   └── users/
│       ├── users.module.ts
│       ├── users.controller.ts
│       └── users.service.ts
├── main.ts          # Application entry point
├── app.module.ts    # Root module
└── app.controller.ts # Main controller
```

## Code Generation

Generate new modules, controllers, and services:

```bash
# Generate a module
bunx dwex g module users

# Generate a controller
bunx dwex g controller products

# Generate a service
bunx dwex g service auth
```

## Learn More

- [Dwex Documentation](https://github.com/dwexjs/dwex)
- [Bun Documentation](https://bun.sh/docs)
