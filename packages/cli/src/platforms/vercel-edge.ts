import { writeFile } from "node:fs/promises";
import { join } from "node:path";

/**
 * Generate Vercel Edge Function configuration and wrapper
 */
export async function generateVercelEdgeConfig(outdir: string): Promise<void> {
	// Generate vercel.json
	const vercelConfig = {
		functions: {
			"api/**/*.js": {
				runtime: "edge",
			},
		},
	};

	await writeFile(
		join(outdir, "vercel.json"),
		JSON.stringify(vercelConfig, null, 2),
	);

	// Generate deployment instructions
	const readme = `# Vercel Edge Functions Deployment

## Setup

1. Install Vercel CLI:
\`\`\`bash
npm i -g vercel
\`\`\`

2. Deploy:
\`\`\`bash
vercel --prod
\`\`\`

## Configuration

The \`vercel.json\` file configures all files in the \`api\` directory to run as Edge Functions.

## Entry Point

Make sure your entry file exports a default handler:

\`\`\`typescript
import { DwexFactory } from '@dwex/core';
import { VercelEdgeAdapter } from '@dwex/platform-adapters';
import { AppModule } from './app.module';

const app = await DwexFactory.create(AppModule, new VercelEdgeAdapter());
export default app.getHandler();
\`\`\`

## Learn More

- [Vercel Edge Functions Documentation](https://vercel.com/docs/functions/edge-functions)
- [Dwex Documentation](https://dwexjs.dev)
`;

	await writeFile(join(outdir, "DEPLOY_VERCEL.md"), readme);
}
