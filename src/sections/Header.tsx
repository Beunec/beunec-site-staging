"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { usePathname } from "next/navigation";
import { ParticleBackground } from "@/sections/governance/ParticleBackground";
import { HomeParticleBackground } from "@/sections/home/HomeParticleBackground";

const navItems = [
  { label: "Cloud Platform", href: "/cloud-platform" },
  { label: "BCP Pricing", href: "/bcp-plans-pricing" },
  { label: "BCP Documentation", href: "/bcp-documentation" },
  { label: "Company", href: "/company" },
  { label: "Governance", href: "/governance" },
  { label: "Resources", href: "/resources" },
];

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const rawPath = usePathname() ?? "";
  const pathname = rawPath.replace(/\/+$/, "") || "/";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${(() => {
        const transparentPages = [
          "/",
          "/cloud-platform",
          "/bcp-plans-pricing",
          "/company",
          "/governance",
          "/beunec-cloud-pro-for-college-students",
          "/cloud-platform-for-solo-founder-grants-program",
          "/resources",
          "/privacy-policy",
          "/terms-of-use",
          "/data-readiness-policy",
        ];
        const forceTransparent = transparentPages.includes(pathname);
        if (forceTransparent) return "bg-transparent";
        return isScrolled
          ? "bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl shadow-sm"
          : "bg-transparent";
      })()}`}
    >
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Particle effect matching the page hero */}
        {pathname === "/" ? (
          <HomeParticleBackground />
        ) : (
          <ParticleBackground />
        )}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-beunec-blue/5 rounded-full blur-3xl" />
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <motion.a
            href="/"
            className="flex items-center gap-2 group"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
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
          </motion.a>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item, index) => (
              <motion.a
                key={item.label}
                href={item.href}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200 rounded-lg hover:bg-muted/50"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                {item.label}
              </motion.a>
            ))}
          </nav>

          {/* Right Side Actions */}
          <motion.div
            className="flex items-center gap-2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <ThemeToggle />

            <div className="hidden sm:flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-sm font-medium hover:bg-muted/50"
                asChild
              >
                <a href="https://cloud.beunec.com/auth/login?returnTo=/">Login to BCP</a>
              </Button>
              <Button
                size="sm"
                className="bg-beunec-blue hover:bg-beunec-blue-dark text-white text-sm font-medium px-4"
                asChild
              >
                <a href="https://cloud.beunec.com/auth/login?screen_hint=signup&returnTo=/">Signup for BCP</a>
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border-t border-border"
          >
            <nav className="flex flex-col p-4 space-y-1">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </a>
              ))}
              <div className="pt-4 mt-4 border-t border-border flex flex-col gap-2">
                <Button
                  variant="outline"
                  className="w-full justify-center"
                  asChild
                >
                  <a href="https://cloud.beunec.com/auth/login?returnTo=/">Login to BCP</a>
                </Button>
                <Button
                  className="w-full justify-center bg-beunec-blue hover:bg-beunec-blue-dark text-white"
                  asChild
                >
                  <a href="https://cloud.beunec.com/auth/login?screen_hint=signup&returnTo=/">Signup for BCP</a>
                </Button>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
