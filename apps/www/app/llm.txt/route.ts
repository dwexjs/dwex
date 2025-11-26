import { source } from "@/lib/source";
// cached forever
export const revalidate = false;
export async function GET() {
	const scanned = source.getPages().map(page => `${page.data.title}: https://dwex.dev${page.url}.mdx`);
	return new Response(scanned.join("\n"));
}
