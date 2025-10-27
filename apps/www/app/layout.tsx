import { RootProvider } from "fumadocs-ui/provider/next";
import type { Metadata } from "next";
import "./global.css";
import { Inter } from "next/font/google";
import Script from "next/script";

const inter = Inter({
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "Dwex - Lightweight. Typed. Lightning-fast Web Framework.",
	metadataBase: new URL("https://dwex.dev"),
};

export default function Layout({ children }: LayoutProps<"/">) {
	return (
		<html lang="en" className={inter.className} suppressHydrationWarning>
			<Script
				defer
				src="https://analytics.monawwar.io/script.js"
				data-website-id="5599c2d7-3249-40a2-accd-65ba865f986d"
			/>
			<body className="flex flex-col min-h-screen">
				<RootProvider>{children}</RootProvider>
			</body>
		</html>
	);
}
