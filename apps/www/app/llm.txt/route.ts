import { source } from "@/lib/source";
// cached forever
export const revalidate = false;
export async function GET() {
	const scanned = source.getPages().map(page => `# ${page.data.title}\n\nhttps://dwex.dev/llm.mdx${page.url.replace("/docs", "")}`);
	return new Response(scanned.join("\n\n"));
}
