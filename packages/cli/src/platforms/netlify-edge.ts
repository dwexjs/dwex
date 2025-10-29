import { writeFile } from "node:fs/promises";
import { join } from "node:path";

/**
 * Generate Netlify Edge Function configuration and wrapper
 */
export async function generateNetlifyEdgeConfig(outdir: string): Promise<void> {
	// Generate netlify.toml
	const netlifyConfig = `[[edge_functions]]
path = "/*"
function = "api"

[build]
publish = "dist"
`;

	await writeFile(join(outdir, "netlify.toml"), netlifyConfig);

	// Generate deployment instructions
	const readme = `# Netlify Edge Functions Deployment

## Setup

1. Install Netlify CLI:
\`\`\`bash
npm i -g netlify-cli
\`\`\`

2. Login to Netlify:
\`\`\`bash
netlify login
\`\`\`

3. Deploy:
\`\`\`bash
netlify deploy --prod
\`\`\`

## Configuration

The \`netlify.toml\` file configures your edge function to handle all routes.

## Entry Point

Make sure your entry file exports a default handler:

\`\`\`typescript
import { DwexFactory } from '@dwex/core';
import { NetlifyEdgeAdapter } from '@dwex/platform-adapters';
import { AppModule } from './app.module';

const app = await DwexFactory.create(AppModule, new NetlifyEdgeAdapter());
export default app.getHandler();
\`\`\`

## Learn More

- [Netlify Edge Functions Documentation](https://docs.netlify.com/edge-functions/overview/)
- [Dwex Documentation](https://dwexjs.dev)
`;

	await writeFile(join(outdir, "DEPLOY_NETLIFY.md"), readme);
}
