import { writeFile } from "node:fs/promises";
import { join } from "node:path";

/**
 * Generate Cloudflare Workers configuration and wrapper
 */
export async function generateCloudflareWorkersConfig(
	outdir: string,
): Promise<void> {
	// Generate wrangler.toml
	const wranglerConfig = `name = "dwex-app"
main = "index.js"
compatibility_date = "2024-01-01"

# Uncomment to add custom domains
# routes = [
#   { pattern = "example.com/*", zone_name = "example.com" }
# ]
`;

	await writeFile(join(outdir, "wrangler.toml"), wranglerConfig);

	// Generate deployment instructions
	const readme = `# Cloudflare Workers Deployment

## Setup

1. Install Wrangler CLI:
\`\`\`bash
npm i -g wrangler
\`\`\`

2. Login to Cloudflare:
\`\`\`bash
wrangler login
\`\`\`

3. Deploy:
\`\`\`bash
wrangler deploy
\`\`\`

## Configuration

The \`wrangler.toml\` file configures your Cloudflare Worker deployment.

## Entry Point

Make sure your entry file exports a fetch handler:

\`\`\`typescript
import { DwexFactory } from '@dwex/core';
import { CloudflareWorkersAdapter } from '@dwex/platform-adapters';
import { AppModule } from './app.module';

const app = await DwexFactory.create(AppModule, new CloudflareWorkersAdapter());

export default {
  fetch: app.getHandler()
};
\`\`\`

## Learn More

- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Dwex Documentation](https://dwexjs.dev)
`;

	await writeFile(join(outdir, "DEPLOY_CLOUDFLARE.md"), readme);
}
