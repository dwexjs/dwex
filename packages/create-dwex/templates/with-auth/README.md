# <%= projectName %>

A Dwex application with JWT authentication, created with `create-dwex`.

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

## Authentication

This template includes JWT-based authentication with the following features:

- Login endpoint: `POST /auth/login`
- Protected routes using `@UseGuards(AuthGuard)`
- JWT token generation and validation

### Testing Authentication

1. Login to get a token:
```bash
curl -X POST http://localhost:<%= port %>/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "password123"}'
```

2. Use the token to access protected routes:
```bash
curl http://localhost:<%= port %>/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Default User

- Username: `admin`
- Password: `password123`

**Important:** Change the JWT secret in `src/auth.service.ts` before deploying to production!

## Available Scripts

- `bun run dev` - Start development server with hot reload
- `bun run start` - Start production server

## Project Structure

```
src/
├── main.ts           # Application entry point
├── app.module.ts     # Root module
├── app.controller.ts # Main controller
├── auth.controller.ts # Authentication controller
├── auth.service.ts   # Authentication service
├── auth.guard.ts     # JWT authentication guard
└── users.db.ts       # In-memory user database
```

## Learn More

- [Dwex Documentation](https://github.com/dwexjs/dwex)
- [Dwex JWT Package](https://github.com/dwexjs/dwex/tree/main/packages/jwt)
- [Bun Documentation](https://bun.sh/docs)
