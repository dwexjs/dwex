import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import Image from "next/image";

export function baseOptions(): BaseLayoutProps {
	return {
		nav: {
			title: (
				<Image
					src="/dwex.png"
					alt="Dwex Logo"
					width={32}
					height={32}
					className="rounded-lg"
				/>
			),
			transparentMode: "top",
		},
		links: [
			{
				text: "Documentation",
				url: "/docs",
			},
		],
		githubUrl: "https://github.com/dwexjs/dwex",
	};
}
