"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";

const ease = [0.16, 1, 0.3, 1] as const;

interface NavItem {
	label: string;
	href: string;
}

const navItems: NavItem[] = [
	{ label: "Features", href: "#features" },
	{ label: "Docs", href: "/docs" },
	{ label: "Examples", href: "/docs/examples" },
];

export function Header() {
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

	return (
		<>
			<motion.header
				className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
				initial={{ y: -100 }}
				animate={{ y: 0 }}
				transition={{ duration: 0.6, ease }}
			>
				<div className="container flex h-16 items-center justify-between px-4 md:px-8 lg:px-12">
					{/* Logo */}
					<Link href="/" className="flex items-center gap-3 group">
						<div className="relative h-8 w-8 overflow-hidden rounded-lg ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all">
							<Image
								src="/dwex.png"
								alt="Dwex Logo"
								width={32}
								height={32}
								className="object-cover"
							/>
						</div>
					</Link>

					{/* Desktop Navigation */}
					<nav className="hidden md:flex items-center gap-6">
						{navItems.map((item) => (
							<Link
								key={item.href}
								href={item.href}
								className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
							>
								{item.label}
							</Link>
						))}
					</nav>

					{/* Desktop Actions */}
					<div className="hidden md:flex items-center gap-4">
						<Link
							href="https://github.com/dwexjs/dwex"
							target="_blank"
							rel="noopener noreferrer"
							className={cn(
								buttonVariants({ variant: "ghost", size: "icon" }),
								"h-9 w-9",
							)}
							aria-label="GitHub"
						>
							<Icons.github className="h-5 w-5" />
						</Link>
						<Link
							href="/docs/getting-started"
							className={cn(buttonVariants({ size: "sm" }), "gap-2")}
						>
							<Icons.zap className="h-4 w-4" />
							Get Started
						</Link>
					</div>

					{/* Mobile Menu Button */}
					<button
						type="button"
						className="md:hidden p-2 hover:bg-muted rounded-md transition-colors"
						onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
						aria-label="Toggle menu"
					>
						{mobileMenuOpen ? (
							<X className="h-6 w-6" />
						) : (
							<Menu className="h-6 w-6" />
						)}
					</button>
				</div>
			</motion.header>

			{/* Mobile Menu */}
			{mobileMenuOpen && (
				<motion.div
					className="fixed inset-0 top-16 z-40 md:hidden bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: -20 }}
					transition={{ duration: 0.3, ease }}
				>
					<nav className="container flex flex-col gap-4 px-4 py-6">
						{navItems.map((item, index) => (
							<motion.div
								key={item.href}
								initial={{ opacity: 0, x: -20 }}
								animate={{ opacity: 1, x: 0 }}
								transition={{ delay: index * 0.1, duration: 0.3, ease }}
							>
								<Link
									href={item.href}
									className="block py-2 text-lg font-medium text-muted-foreground hover:text-foreground transition-colors"
									onClick={() => setMobileMenuOpen(false)}
								>
									{item.label}
								</Link>
							</motion.div>
						))}
						<div className="flex flex-col gap-3 pt-4 border-t border-border">
							<Link
								href="https://github.com/dwexjs/dwex"
								target="_blank"
								rel="noopener noreferrer"
								className={cn(
									buttonVariants({ variant: "outline" }),
									"gap-2 justify-center",
								)}
								onClick={() => setMobileMenuOpen(false)}
							>
								<Icons.github className="h-5 w-5" />
								GitHub
							</Link>
							<Link
								href="/docs/getting-started"
								className={cn(buttonVariants(), "gap-2 justify-center")}
								onClick={() => setMobileMenuOpen(false)}
							>
								<Icons.zap className="h-4 w-4" />
								Get Started
							</Link>
						</div>
					</nav>
				</motion.div>
			)}
		</>
	);
}
