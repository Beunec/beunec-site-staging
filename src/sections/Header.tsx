"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import Link from "next/link";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ASELIUS_APP = "https://aselius.beunec.com";

const researchLinks = [
	{ label: "Rivine", href: "/rivine-experimental-project" },
	{ label: "Brolostack", href: "/brolostack-project" },
];

const companyLinks = [
	{ label: "About", href: "/company" },
	{ label: "Research Philosophy", href: "/research-philosophy" },
	{ label: "Agentic Infrastructure", href: "/agentic-infrastructure" },
	{ label: "Akinnawo Logic V2", href: "/akinnawo-logic-v2" },
];

const navDropdownTriggerClass =
	"px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200 rounded-lg hover:bg-secondary inline-flex items-center gap-1 outline-none data-[state=open]:text-foreground data-[state=open]:bg-secondary";

function HoverNavDropdown({
	label,
	links,
	contentClassName,
}: {
	label: string;
	links: { label: string; href: string }[];
	contentClassName?: string;
}) {
	const [open, setOpen] = useState(false);
	// ponytail: Radix useId diverges SSR↔client; mount-only avoids id mismatch
	const [mounted, setMounted] = useState(false);
	const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

	const clearClose = () => {
		if (closeTimer.current) {
			clearTimeout(closeTimer.current);
			closeTimer.current = null;
		}
	};

	const openMenu = () => {
		clearClose();
		setOpen(true);
	};

	const scheduleClose = () => {
		clearClose();
		// short delay so cursor can travel from trigger → menu without flicker
		closeTimer.current = setTimeout(() => setOpen(false), 140);
	};

	useEffect(() => {
		setMounted(true);
		return () => clearClose();
	}, []);

	if (!mounted) {
		return (
			<button type="button" className={navDropdownTriggerClass} aria-haspopup="menu" aria-expanded={false}>
				{label}
				<ChevronDown className="w-3.5 h-3.5 opacity-60" />
			</button>
		);
	}

	return (
		<DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
			<DropdownMenuTrigger
				className={navDropdownTriggerClass}
				onMouseEnter={openMenu}
				onMouseLeave={scheduleClose}
				onPointerDown={(e) => e.preventDefault()}
			>
				{label}
				<ChevronDown
					className={`w-3.5 h-3.5 opacity-60 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
				/>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				align="start"
				sideOffset={6}
				className={contentClassName}
				onMouseEnter={openMenu}
				onMouseLeave={scheduleClose}
			>
				{links.map((l) => (
					<DropdownMenuItem key={l.href} asChild>
						<Link href={l.href}>{l.label}</Link>
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

export function Header() {
	const [isScrolled, setIsScrolled] = useState(false);
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const [mobileResearchOpen, setMobileResearchOpen] = useState(false);
	const [mobileCompanyOpen, setMobileCompanyOpen] = useState(false);

	useEffect(() => {
		const handleScroll = () => setIsScrolled(window.scrollY > 20);
		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	return (
		<>
			<header
				className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
					isScrolled
						? "bg-background/80 backdrop-blur-lg border-b border-border/40"
						: "bg-transparent"
				}`}
			>
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex items-center justify-between h-16 lg:h-20">
						<Link href="/" className="flex items-center gap-2 group">
							<img
								src="/assets/beunec-logo-transparent-blacktext.png"
								alt="Beunec"
								className="h-8 w-auto transition-transform duration-300 group-hover:scale-105 dark:hidden"
							/>
							<img
								src="/assets/beunec-logo-transparent-whitetext.png"
								alt="Beunec"
								className="h-8 w-auto transition-transform duration-300 group-hover:scale-105 hidden dark:block"
							/>
						</Link>

						<nav className="hidden lg:flex items-center gap-1">
							<HoverNavDropdown
								label="Research"
								links={researchLinks}
								contentClassName="min-w-[12rem]"
							/>

							<Link
								href="/aselius-platform"
								className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200 rounded-lg hover:bg-secondary"
							>
								Aselius Platform
							</Link>

							<Link
								href="/principles"
								className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200 rounded-lg hover:bg-secondary"
							>
								Principles
							</Link>

							<HoverNavDropdown
								label="Company"
								links={companyLinks}
								contentClassName="min-w-[16rem]"
							/>

							<Link
								href="/resources"
								className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200 rounded-lg hover:bg-secondary"
							>
								Resources
							</Link>
						</nav>

						<div className="flex items-center gap-2">
							<ThemeToggle />
							<Button
								size="sm"
								className="hidden sm:inline-flex bg-beunec-sage hover:opacity-90 text-primary-foreground text-sm font-medium px-4 transition-colors duration-200"
								asChild
							>
								<a href={ASELIUS_APP}>Try Aselius</a>
							</Button>
							<Button
								variant="ghost"
								size="icon"
								className="lg:hidden"
								onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
								aria-label="Toggle menu"
							>
								{isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
							</Button>
						</div>
					</div>
				</div>

				<AnimatePresence>
					{isMobileMenuOpen && (
						<motion.div
							initial={{ opacity: 0, height: 0 }}
							animate={{ opacity: 1, height: "auto" }}
							exit={{ opacity: 0, height: 0 }}
							transition={{ duration: 0.3 }}
							className="lg:hidden bg-container/95 backdrop-blur-xl border-t border-border overflow-hidden"
						>
							<nav className="flex flex-col p-4 space-y-1">
								<button
									type="button"
									className="flex items-center justify-between px-4 py-3 text-sm font-medium text-muted-foreground"
									onClick={() => setMobileResearchOpen(!mobileResearchOpen)}
								>
									Research
									<ChevronDown className={`w-4 h-4 transition-transform ${mobileResearchOpen ? "rotate-180" : ""}`} />
								</button>
								{mobileResearchOpen &&
									researchLinks.map((l) => (
										<Link
											key={l.href}
											href={l.href}
											className="px-8 py-2 text-sm text-muted-foreground hover:text-foreground"
											onClick={() => setIsMobileMenuOpen(false)}
										>
											{l.label}
										</Link>
									))}

								<Link
									href="/aselius-platform"
									className="px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground"
									onClick={() => setIsMobileMenuOpen(false)}
								>
									Aselius Platform
								</Link>
								<Link
									href="/principles"
									className="px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground"
									onClick={() => setIsMobileMenuOpen(false)}
								>
									Principles
								</Link>

								<button
									type="button"
									className="flex items-center justify-between px-4 py-3 text-sm font-medium text-muted-foreground"
									onClick={() => setMobileCompanyOpen(!mobileCompanyOpen)}
								>
									Company
									<ChevronDown className={`w-4 h-4 transition-transform ${mobileCompanyOpen ? "rotate-180" : ""}`} />
								</button>
								{mobileCompanyOpen &&
									companyLinks.map((l) => (
										<Link
											key={l.href}
											href={l.href}
											className="px-8 py-2 text-sm text-muted-foreground hover:text-foreground"
											onClick={() => setIsMobileMenuOpen(false)}
										>
											{l.label}
										</Link>
									))}

								<Link
									href="/resources"
									className="px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground"
									onClick={() => setIsMobileMenuOpen(false)}
								>
									Resources
								</Link>

								<div className="pt-4 mt-2 border-t border-border">
									<Button
										className="w-full justify-center bg-beunec-sage hover:opacity-90 text-primary-foreground"
										asChild
									>
										<a href={ASELIUS_APP} onClick={() => setIsMobileMenuOpen(false)}>
											Try Aselius
										</a>
									</Button>
								</div>
							</nav>
						</motion.div>
					)}
				</AnimatePresence>
			</header>
		</>
	);
}
