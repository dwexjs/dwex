<p align="center">
  <a href="https://github.com/dwexjs/dwex">
    <img src="./dwex.svg" width="80px" alt="Dwex Logo" />
  </a>
</p>

<h3 align="center">
  Lightweight. Typed. Lightning-fast Web Framework.
</h3>
<p align="center">
  A progressive TypeScript framework for building efficient and scalable server-side applications on Bun runtime.
</p>

<p align="center"><a href="https://github.com/dwexjs/dwex/discussions">Discussions</a> · <a href="https://dwex.dev/docs">Documentation</a> · <a href="https://discord.gg/3Jrma3xnTy">Discord</a></p>

## Philosophy

Dwex is built on the principle that building server-side applications should be enjoyable, productive, and maintainable. Inspired by modern frameworks like NestJS and Express, Dwex leverages the power of TypeScript decorators and dependency injection to create a clean, modular architecture that scales with your application.

**Key Principles:**

- **TypeScript-First**: Built from the ground up with TypeScript, providing excellent type safety and developer experience
- **Bun-Native**: Harnesses the full power of Bun's performance and modern JavaScript features
- **Modular Architecture**: Organize your code into reusable, maintainable modules
- **Decorator-Driven**: Intuitive decorator-based API for defining routes, dependencies, and middleware
- **Dependency Injection**: Built-in DI container for managing dependencies and promoting testable code

## Features

- Decorator-based routing (`@Get`, `@Post`, `@Put`, `@Delete`, etc.)
- Powerful dependency injection system
- Modular architecture with `@Module` decorator
- Guards for route protection and authorization
- Middleware support for request/response processing
- Built-in utilities (body parser, cookie parser, CORS)
- First-class TypeScript support
- Fast and efficient with Bun runtime

## Installation

```bash
# Using bun (recommended)
bun create dwex my-app
cd my-app
bun install

# Or manually
bun add @dwexjs/core @dwexjs/common reflect-metadata
```

## Support

Need help or have questions? We're here to support you!

- **[Documentation](https://dwex.dev/docs)** - Comprehensive guides, tutorials, and API references
- **[Discord](https://discord.gg/3Jrma3xnTy)** - Join our community for real-time discussions and support
- **[GitHub Discussions](https://github.com/dwexjs/dwex/discussions)** - Ask questions, share ideas, and connect with other developers
- **[Issues](https://github.com/dwexjs/dwex/issues)** - Report bugs or request new features

## Contributing

Dwex is an open-source project and we welcome contributions from the community! Whether you're fixing bugs, adding new features, improving documentation, or suggesting enhancements, your help is appreciated.

We believe in making contributing as easy as possible. If you're interested in contributing, please read our [CONTRIBUTING.md](CONTRIBUTING.md) file for detailed guidelines on how to get started, our code style preferences, development workflow, and how to submit your changes.

Found a bug or have a feature request? Feel free to open an issue on GitHub. We're excited to see what you'll build with Dwex!

## License

MIT License
