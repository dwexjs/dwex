import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";

export function baseOptions(): BaseLayoutProps {
	return {
		nav: {
			title: "Dwex",
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
