"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HomeParticleBackground } from "@/sections/home/HomeParticleBackground";
import {
  Linkedin,
  Instagram,
  Youtube,
  Twitter,
  ExternalLink,
  ArrowRight,
  Mail,
} from "lucide-react";

const footerLinks = {
  research: {
    title: "Research",
    links: [
      { label: "Rivine", href: "/rivine-experimental-project" },
      { label: "Brolostack", href: "/brolostack-project" },
      { label: "Resources Hub", href: "/resources" },
    ],
  },
  platform: {
    title: "Platform",
    links: [
      { label: "Aselius", href: "/aselius-platform" },
      { label: "Principles", href: "/principles" },
    ],
  },
  company: {
    title: "Company",
    links: [
      { label: "About", href: "/company" },
      { label: "Research Philosophy", href: "/research-philosophy" },
      { label: "Agentic Infrastructure", href: "/agentic-infrastructure" },
      { label: "Akinnawo Logic V2", href: "/akinnawo-logic-v2" },
    ],
  },
};

const socialLinks = [
  { icon: Linkedin, href: "https://linkedin.com/company/beunecofficial", label: "LinkedIn" },
  { icon: Instagram, href: "https://instagram.com/beunec_", label: "Instagram" },
  { icon: Youtube, href: "https://youtube.com/@beunec", label: "YouTube" },
  { icon: ExternalLink, href: "https://crunchbase.com/organization/beunec", label: "Crunchbase" },
  { icon: Twitter, href: "https://twitter.com/beunecofficial", label: "X (Twitter)" },
];

export function Footer() {
  return (
    <footer className="relative pt-20 pb-8 overflow-hidden border-t border-border">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <HomeParticleBackground />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-beunec-blue/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Newsletter Section */}
        <div data-reveal
          className="mb-16 p-8 lg:p-12 rounded-2xl baap-container">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl lg:text-3xl font-bold text-foreground mb-3">
                Stay in the loop
              </h3>
              <p className="text-muted-foreground">
                Get updates on our latest research, product releases, and insights
                on the future of work.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="pl-10 h-12 bg-media-blank border-border"
                />
              </div>
              <Button className="h-12 px-6 bg-beunec-sage hover:opacity-90 text-primary-foreground transition-colors duration-200">
                Subscribe
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 lg:gap-12 mb-16">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-3 lg:col-span-2">
            <a href="/" className="flex items-center gap-2 mb-6">
              <img
                src="/assets/beunec-logo-black.webp"
                width={349}
                height={96}
                loading="lazy"
                alt="Beunec"
                className="h-10 w-auto dark:hidden"
              />
              <img
                src="/assets/beunec-logo-white.webp"
                width={341}
                height={96}
                loading="lazy"
                alt="Beunec"
                className="h-10 w-auto hidden dark:block"
              />
            </a>
            <p className="text-muted-foreground mb-6 max-w-sm">
              Beunec Technologies Inc. is a research and deployment organization focused on
              understanding, developing, and actualizing Agentic Infrastructure.
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg bg-muted hover:bg-beunec-blue/10 flex items-center justify-center transition-colors duration-200 group"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5 text-muted-foreground group-hover:text-beunec-blue transition-colors duration-200" />
                </a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {Object.values(footerLinks).map((section) => (
            <div key={section.title}>
              <h4 className="font-semibold text-foreground mb-4">
                {section.title}
              </h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-beunec-blue transition-colors duration-200"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Legal Section */}
        <div className="pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground text-center md:text-left">
              &copy; 2026 Beunec and all related Marks are Trademarks of Beunec
              Technologies, Inc. or its affiliates. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <a
                href="/terms-of-use"
                className="text-sm text-muted-foreground hover:text-beunec-blue transition-colors duration-200"
              >
                Terms of Use
              </a>
              <a
                href="/privacy-policy"
                className="text-sm text-muted-foreground hover:text-beunec-blue transition-colors duration-200"
              >
                Privacy Policy
              </a>
              <a
                href="/data-readiness-policy"
                className="text-sm text-muted-foreground hover:text-beunec-blue transition-colors duration-200"
              >
                Data Readiness
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer >
  );
}
