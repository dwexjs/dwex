# @dwex/platform-adapters

Platform adapters for deploying Dwex applications to various edge function providers and serverless platforms.

## Overview

This package provides platform-specific adapters to deploy Dwex applications to:

- **Bun** - Local development and production server (default)
- **Vercel Edge Functions** - Deploy to Vercel's edge network
- **Cloudflare Workers** - Deploy to Cloudflare's global network
- **Netlify Edge Functions** - Deploy to Netlify's edge platform

All adapters follow the Web API standard for Request/Response handling, making your Dwex applications portable across platforms.

## Usage

### Bun (Default)

```typescript
import { DwexFactory } from "@dwex/core";
import { AppModule } from "./app.module";

const app = await DwexFactory.create(AppModule);
await app.listen(3000); // Uses BunAdapter by default
```

### Vercel Edge Functions

```typescript
import { DwexFactory } from "@dwex/core";
import { VercelEdgeAdapter } from "@dwex/platform-adapters";
import { AppModule } from "./app.module";

const app = await DwexFactory.create(AppModule, new VercelEdgeAdapter());
export default app.getHandler();
```

### Cloudflare Workers

```typescript
import { DwexFactory } from "@dwex/core";
import { CloudflareWorkersAdapter } from "@dwex/platform-adapters";
import { AppModule } from "./app.module";

const app = await DwexFactory.create(AppModule, new CloudflareWorkersAdapter());
export default { fetch: app.getHandler() };
```

### Netlify Edge Functions

```typescript
import { DwexFactory } from "@dwex/core";
import { NetlifyEdgeAdapter } from "@dwex/platform-adapters";
import { AppModule } from "./app.module";

const app = await DwexFactory.create(AppModule, new NetlifyEdgeAdapter());
export default app.getHandler();
```

## Building for Different Platforms

Use the Dwex CLI to build for specific platforms:

```bash
# Build for Vercel Edge Functions
dwex build --target vercel-edge

# Build for Cloudflare Workers
dwex build --target cloudflare-workers

# Build for Netlify Edge Functions
dwex build --target netlify-edge
```

## API

See the [documentation](https://dwexjs.dev) for detailed API reference.
