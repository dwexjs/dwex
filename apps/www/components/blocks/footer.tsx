"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Icons } from "@/components/ui/icons";

const ease = [0.16, 1, 0.3, 1] as const;

interface FooterLink {
	label: string;
	href: string;
}

interface FooterSection {
	title: string;
	links: FooterLink[];
}

const footerSections: FooterSection[] = [
	{
		title: "Framework",
		links: [
			{ label: "Getting Started", href: "/docs/getting-started" },
			{ label: "Documentation", href: "/docs" },
			{ label: "Examples", href: "/docs/examples" },
			{ label: "API Reference", href: "/docs/api" },
		],
	},
	{
		title: "Resources",
		links: [
			{ label: "Blog", href: "/blog" },
			{ label: "Changelog", href: "/changelog" },
			{ label: "Contributing", href: "/contributing" },
			{ label: "License", href: "/license" },
		],
	},
	{
		title: "Community",
		links: [
			{ label: "GitHub", href: "https://github.com/dwexjs/dwex" },
			{ label: "Discord", href: "#" },
			{ label: "Twitter", href: "#" },
			{ label: "Stack Overflow", href: "#" },
		],
	},
];

const socialLinks = [
	{
		name: "GitHub",
		href: "https://github.com/dwexjs/dwex",
		icon: Icons.github,
	},
	{
		name: "Twitter",
		href: "#",
		icon: Icons.twitter,
	},
];

export function Footer() {
	return (
		<footer className="border-t border-border bg-muted/30">
			<div className="container px-4 md:px-8 lg:px-12">
				{/* Main Footer Content */}
				<div className="pt-16 md:pt-20">
					<div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:gap-12">
						{/* Brand Column */}
						<div className="col-span-2 md:col-span-1">
							<Link href="/" className="flex items-center gap-3 group mb-4">
								<div className="relative h-10 w-10 overflow-hidden rounded-xl ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all">
									<Image
										src="/dwex.png"
										alt="Dwex Logo"
										width={40}
										height={40}
										className="object-cover"
									/>
								</div>
								<span className="text-2xl font-bold">Dwex</span>
							</Link>
							<p className="text-sm text-muted-foreground mb-6 max-w-xs">
								A modern TypeScript framework for building blazingly fast
								server-side applications with Bun.
							</p>
							<div className="flex gap-4">
								{socialLinks.map((social) => (
									<Link
										key={social.name}
										href={social.href}
										target="_blank"
										rel="noopener noreferrer"
										className="text-muted-foreground hover:text-primary transition-colors"
										aria-label={social.name}
									>
										<social.icon className="h-5 w-5" />
									</Link>
								))}
							</div>
						</div>

						{/* Link Columns */}
						{footerSections.map((section, index) => (
							<motion.div
								key={section.title}
								initial={{ opacity: 0, y: 20 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true }}
								transition={{ delay: index * 0.1, duration: 0.6, ease }}
							>
								<h3 className="font-semibold mb-4">{section.title}</h3>
								<ul className="space-y-3">
									{section.links.map((link) => (
										<li key={link.href}>
											<Link
												href={link.href}
												className="text-sm text-muted-foreground hover:text-foreground transition-colors"
											>
												{link.label}
											</Link>
										</li>
									))}
								</ul>
							</motion.div>
						))}
					</div>
				</div>
			</div>

			{/* Big DWEX Text */}
			<div className="relative pt-12 overflow-hidden">
				<motion.div
					className="text-center select-none -mb-10 lg:-mb-28"
					initial={{ opacity: 0 }}
					whileInView={{ opacity: 1 }}
					viewport={{ once: true }}
					transition={{ duration: 1 }}
				>
					<h2 className="text-[8rem] sm:text-[12rem] md:text-[16rem] lg:text-[18rem] font-black leading-none tracking-tighter text-foreground/5 dark:text-foreground/5">
						DWEX
					</h2>
				</motion.div>
			</div>
		</footer>
	);
}
