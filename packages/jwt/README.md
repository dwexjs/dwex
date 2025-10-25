# @dwexjs/jwt

JWT utilities for Dwex applications using the secure [jose](https://github.com/panva/jose) library.

## Installation

```bash
bun add @dwexjs/jwt
```

## Features

- 🔐 Secure JWT signing and verification using jose
- 🎯 Support for multiple algorithms (HS256, HS384, HS512, RS256, RS384, RS512, ES256, ES384, ES512)
- ⚙️ Configurable expiration, issuer, and audience
- 🏭 DI-ready with JwtModule
- 📝 Full TypeScript support

## Usage

### Quick Start

```typescript
import { JwtService } from '@dwexjs/jwt';

const jwtService = new JwtService({
  secret: process.env.JWT_SECRET,
  expiresIn: '1h'
});

// Sign a token
const token = await jwtService.sign({ userId: 123, role: 'admin' });

// Verify a token
const result = await jwtService.verify(token);
if (result.valid) {
  console.log('User ID:', result.payload.userId);
}
```

### With Dependency Injection

```typescript
import { Module } from '@dwexjs/core';
import { JwtModule } from '@dwexjs/jwt';

@Module({
  imports: [
    JwtModule.forRoot({
      isGlobal: true,
      options: {
        secret: process.env.JWT_SECRET,
        expiresIn: '1h',
        issuer: 'my-app',
        algorithm: 'HS256'
      }
    })
  ]
})
export class AppModule {}
```

### Building an Auth Service

```typescript
import { Injectable } from '@dwexjs/core';
import { JwtService } from '@dwexjs/jwt';

@Injectable()
export class AuthService {
  private readonly jwtService = new JwtService({
    secret: process.env.JWT_SECRET,
    expiresIn: '7d'
  });

  async login(username: string, password: string) {
    // Your authentication logic here
    const user = await this.validateUser(username, password);

    if (!user) {
      throw new Error('Invalid credentials');
    }

    const payload = {
      sub: user.id,
      username: user.username,
      email: user.email
    };

    return {
      access_token: await this.jwtService.sign(payload)
    };
  }

  async validateToken(token: string) {
    const result = await this.jwtService.verify(token);
    return result.valid ? result.payload : null;
  }
}
```

### Creating an Auth Guard

```typescript
import { Injectable, CanActivate, ExecutionContext } from '@dwexjs/core';
import { JwtService } from '@dwexjs/jwt';

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly jwtService = new JwtService({
    secret: process.env.JWT_SECRET
  });

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return false;
    }

    const token = authHeader.substring(7);
    const result = await this.jwtService.verify(token);

    if (!result.valid) {
      return false;
    }

    // Attach user to request
    request.user = result.payload;
    return true;
  }
}
```

### Using the Auth Guard

```typescript
import { Controller, Get, UseGuards } from '@dwexjs/core';
import { AuthGuard } from './auth.guard';

@Controller('users')
@UseGuards(AuthGuard)
export class UserController {
  @Get('profile')
  getProfile() {
    return { message: 'This route is protected' };
  }

  @Get('admin')
  @UseGuards(AdminGuard)
  adminOnly() {
    return { message: 'This requires admin role' };
  }
}
```

## API

### JwtService

#### `sign(payload, options?)`

Signs a payload and returns a JWT token.

```typescript
const token = await jwtService.sign(
  { userId: 123 },
  { expiresIn: '7d', issuer: 'my-app' }
);
```

#### `verify(token, options?)`

Verifies a JWT token and returns the decoded payload.

```typescript
const result = await jwtService.verify(token);
if (result.valid) {
  console.log(result.payload);
} else {
  console.error(result.error);
}
```

#### `decode(token)`

Decodes a JWT token without verifying its signature.

**⚠️ WARNING:** This does not validate the token! Use `verify()` for secure validation.

```typescript
const payload = jwtService.decode(token);
```

### Configuration Options

```typescript
interface JwtModuleOptions {
  secret?: string;           // Secret for HS* algorithms
  publicKey?: string;        // Public key for RS*/ES* algorithms
  privateKey?: string;       // Private key for RS*/ES* algorithms
  algorithm?: string;        // Default: 'HS256'
  expiresIn?: string;        // Default: '1h'
  issuer?: string;           // Token issuer
  audience?: string | string[]; // Token audience
}
```

### Supported Algorithms

- **HS256, HS384, HS512** - HMAC using SHA-256/384/512 (requires `secret`)
- **RS256, RS384, RS512** - RSA using SHA-256/384/512 (requires `publicKey` and `privateKey`)
- **ES256, ES384, ES512** - ECDSA using P-256/384/521 and SHA-256/384/512 (requires `publicKey` and `privateKey`)

## License

MIT
