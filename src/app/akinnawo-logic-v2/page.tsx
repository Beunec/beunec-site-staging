"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen, FileText, Lock, Scale, ShieldCheck } from "lucide-react";
import { Header } from "@/sections/Header";
import { Footer } from "@/sections/Footer";
import { ParticleBackground } from "@/sections/governance/ParticleBackground";
import { AKINNAWO_LOGIC_SALE } from "@/lib/akinnawo-logic-sale";

function formatUsd(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

function TrackDiagram() {
  return (
    <svg
      viewBox="0 0 920 280"
      className="w-full h-auto"
      role="img"
      aria-label="Traditional closed AI track versus Beunec open agentic infrastructure track"
    >
      <rect x="0" y="0" width="920" height="280" fill="transparent" />
      <text
        x="24"
        y="36"
        className="fill-[var(--text-primary)]"
        style={{ fontSize: 13, fontFamily: "ui-monospace, monospace", letterSpacing: "0.12em" }}
      >
        TWO TRACKS
      </text>

      <rect x="24" y="56" width="872" height="88" rx="16" fill="var(--bg-container)" stroke="var(--border)" />
      <text x="44" y="84" className="fill-[var(--accent-slate)]" style={{ fontSize: 12, fontFamily: "ui-sans-serif, system-ui" }}>
        Traditional AI track
      </text>
      <text x="44" y="114" className="fill-[var(--text-primary)]" style={{ fontSize: 15, fontFamily: "ui-sans-serif, system-ui" }}>
        Closed source  →  chasing AGI / ASI  →  unaccountable human risk
      </text>

      <rect
        x="24"
        y="164"
        width="872"
        height="88"
        rx="16"
        fill="color-mix(in srgb, var(--accent-sage) 16%, var(--bg-container))"
        stroke="var(--accent-sage)"
      />
      <text x="44" y="192" className="fill-[var(--accent-sage)]" style={{ fontSize: 12, fontFamily: "ui-sans-serif, system-ui" }}>
        Beunec track
      </text>
      <text x="44" y="222" className="fill-[var(--text-primary)]" style={{ fontSize: 15, fontFamily: "ui-sans-serif, system-ui" }}>
        Licensed research today  →  revenue-funded open-source API  →  Agentic-as-an-Infrastructure
      </text>
    </svg>
  );
}

export default function AkinnawoLogicPage() {
  const [agreed, setAgreed] = useState(false);
  const { goalUsd, raisedUsd, stripeCheckoutUrl, title, shortName } = AKINNAWO_LOGIC_SALE;
  const pct = Math.min(100, Math.round((raisedUsd / goalUsd) * 1000) / 10);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="baap-page min-h-screen">
      <Header />
      <main className="pt-20">
        <section className="relative py-16 md:py-24 overflow-hidden">
          <ParticleBackground />
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent-slate mb-5">
              Company · Independent research
            </p>
            <p className="text-sm font-medium text-accent-sage mb-4">Agentic Infrastructure, Unshackled.</p>
            <h1 className="text-4xl sm:text-5xl lg:text-[3.25rem] leading-[1.08] tracking-tight text-foreground font-extrabold max-w-4xl">
              Funding the future of open infrastructure through independent research.
            </h1>
            <p
              className="mt-6 text-lg md:text-xl leading-relaxed text-muted-foreground max-w-3xl"
              style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
            >
              Purchase our core technical framework blueprint to directly fund the open-sourcing of
              the Beunec Runtime. We are anti-VC, anti-AGI, and committed to building
              Agentic-as-an-Infrastructure. This page is a commercial storefront for a digital
              research document, not a donation drive, charity, token sale, or securities offering.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#purchase"
                className="btn-ink"
              >
                Purchase research
                <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="#terms"
                className="inline-flex items-center gap-2 text-sm font-medium text-accent-sage hover:text-foreground transition-colors"
              >
                Terms of Sale
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </section>

        <section className="py-8 md:py-12 bg-container border-y border-border">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <TrackDiagram />
          </div>
        </section>

        <section className="py-20 md:py-24">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent-slate mb-5">
                What you are buying
              </p>
              <h2 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight leading-[1.1] mb-5">
                {shortName}
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                {title}. Authored by Olu Akinnawo, CVO and Founder of Beunec Technologies, Inc.,
                and signed by Tejaswini Abburi, CEO and Co-founder. The work formalizes
                Akinnawo-Logic-V2 as reverse engineering of analysis (REA), reverse engineering of
                implementation (REI), and their composition as REAI, instantiated in Rivine as the
                Cocoon Analysis runtime: a staged, gated, capability-accreting process, not a bare
                reasoning loop and not a generic execution graph.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              {[
                {
                  icon: FileText,
                  title: "Deliverable (today)",
                  body: "Immediate licensed access to the research documentation as a digital file after Stripe confirms payment. You are buying present intellectual property, not a promise of future software as the consideration for this sale.",
                },
                {
                  icon: BookOpen,
                  title: "What the document covers",
                  body: "The orchestration and runtime logic Beunec designed and owns: how Rivine decides, gates, delegates, validates, and escalates work. It does not disclose third-party model identities, architectures, or weights.",
                },
                {
                  icon: Lock,
                  title: "License, not a dump",
                  body: "The purchase grants a single-user, non-transferable license. Unauthorized copying, posting, or distribution violates Beunec intellectual property rights. Rivine engines remain closed-source until Beunec open-sources what it has publicly committed to fund from these sales.",
                },
                {
                  icon: Scale,
                  title: "Not an investment",
                  body: "You receive the research. You do not receive equity, voting rights, tokens, dividends, royalties, or any financial interest in Beunec or in a future open-source API.",
                },
              ].map((item) => (
                <div key={item.title} className="rounded-2xl border border-border bg-container p-6">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-global mb-4">
                    <item.icon className="w-5 h-5 text-accent-sage" />
                  </span>
                  <h3 className="text-base font-semibold text-foreground mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 md:py-24 bg-container">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent-slate mb-5">
              Use of proceeds
            </p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight leading-[1.1] mb-5">
              Revenue funds the open-source roadmap
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-8 max-w-3xl">
              Beunec is not raising venture capital or conducting a securities offering through this
              checkout. Gross receipts are ordinary commercial revenue of Beunec Technologies, Inc.
              (a New Jersey corporation), subject to corporate income tax and, where applicable,
              sales tax or VAT collected at checkout. Beunec states that proceeds from this product
              are intended to fund open-sourcing of the Beunec Runtime / API. The legal consideration
              you pay for is the research document delivered now. If that open-source commitment is
              not kept after the {formatUsd(goalUsd)} milestone is reached, that is a marketing and
              contract-trust issue Beunec accepts responsibility for; it still does not convert this
              purchase into equity.
            </p>

            <div className="rounded-2xl border border-border bg-global p-6 md:p-8">
              <div className="flex flex-wrap items-end justify-between gap-4 mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">Open-source funding milestone</p>
                  <p className="text-2xl font-bold text-foreground mt-1">
                    {formatUsd(raisedUsd)} of {formatUsd(goalUsd)}
                  </p>
                </div>
                <p className="font-mono text-sm text-accent-slate">{pct}% recorded</p>
              </div>
              <div className="h-3 rounded-full bg-container overflow-hidden border border-border">
                <div
                  className="h-full rounded-full bg-accent-sage"
                  style={{ width: `${Math.max(pct, raisedUsd > 0 ? 2 : 0)}%` }}
                />
              </div>
              <p className="mt-4 text-xs text-muted-foreground leading-relaxed">
                Tracker figures are updated from reconciled commercial sales, not from pledges.
                They are not a securities filing and not a crowdfunding portal.
              </p>
            </div>
          </div>
        </section>

        <section id="purchase" className="py-20 md:py-28 scroll-mt-28">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="rounded-3xl border border-border overflow-hidden relative">
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(107,122,110,0.14), rgba(122,139,153,0.08))",
                }}
              />
              <div className="relative px-6 py-14 md:px-14 md:py-16">
                <div className="inline-flex items-center gap-2 rounded-full border border-border bg-global/80 px-4 py-1.5 mb-6">
                  <ShieldCheck className="w-3.5 h-3.5 text-accent-sage" />
                  <span className="text-xs font-medium text-foreground">Commercial digital sale</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight leading-[1.1] mb-4">
                  Purchase research
                </h2>
                <p className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-6 max-w-2xl">
                  Checkout is hosted by Stripe. The button below is enabled only after you accept the
                  Terms of Sale. This purchase is a final, non-refundable commercial sale of
                  intellectual property (research documentation), except where a non-waivable
                  consumer statute requires otherwise. It does not grant equity, voting rights,
                  tokens, or any financial interest in Beunec.
                </p>

                <label className="flex items-start gap-3 rounded-2xl border border-border bg-global p-4 mb-6 cursor-pointer">
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4 accent-[var(--accent-sage)]"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                  />
                  <span className="text-sm text-foreground leading-relaxed">
                    I agree to the Single-User Non-Disclosure License and Terms of Sale. I acknowledge
                    this is a digital product purchase, not an equity investment, donation, or
                    crowdfunding contribution. I will not redistribute {shortName}.
                  </span>
                </label>

                {agreed ? (
                  <a
                    href={stripeCheckoutUrl}
                    className="btn-ink"
                  >
                    Purchase Research &amp; Fund Open Source
                    <ArrowRight className="w-4 h-4" />
                  </a>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="inline-flex items-center gap-2 rounded-full border border-border bg-container text-muted-foreground text-sm font-medium px-5 py-2.5 cursor-not-allowed"
                  >
                    Purchase Research &amp; Fund Open Source
                  </button>
                )}
                <p className="mt-4 text-xs text-muted-foreground max-w-2xl leading-relaxed">
                  Taxes may be added by Stripe Tax based on your location, including New Jersey
                  sales tax on specified digital products where applicable. Enablement of Stripe Tax
                  and post-payment file delivery is configured in Stripe Checkout, not on this page.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="terms" className="py-20 md:py-24 bg-container scroll-mt-28">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent-slate mb-5">
              Terms of Sale
            </p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight leading-[1.1] mb-8">
              Click-wrap terms for this digital good
            </h2>
            <div className="space-y-6 text-sm sm:text-base text-muted-foreground leading-relaxed">
              <p>
                <strong className="text-foreground">Parties.</strong> These Terms of Sale are between
                you and Beunec Technologies, Inc., 971 US Highway 202N Ste N, Branchburg, NJ 08876
                (“Beunec”). They supplement the sitewide{" "}
                <Link href="/terms-of-use" className="text-accent-sage underline underline-offset-4">
                  Terms of Use
                </Link>{" "}
                and{" "}
                <Link href="/privacy-policy" className="text-accent-sage underline underline-offset-4">
                  Privacy Policy
                </Link>
                . For this product only, if there is a direct conflict, these Terms of Sale control.
              </p>
              <p>
                <strong className="text-foreground">Deliverable.</strong> The goods sold are digital
                access to “{title}” (the “Work”): research documentation transferred electronically
                after successful payment. Delivery is fulfilled immediately upon payment through
                Stripe’s post-payment fulfillment (file link or equivalent). The Work is a specified
                digital product / downloaded research document with limited rights, not a
                subscription and not physical goods.
              </p>
              <p>
                <strong className="text-foreground">License.</strong> Beunec grants you a personal,
                single-user, non-exclusive, non-transferable, non-sublicensable license to download
                and read the Work for your own professional or organizational evaluation. You may not
                publish, resell, share, scrape, or train public models on the Work, or disclose it to
                unauthorized persons. Unauthorized distribution is copyright infringement and a
                breach of this license.
              </p>
              <p>
                <strong className="text-foreground">No securities; no donation.</strong> This
                transaction is a commercial sale of intellectual property. It is not a gift, charity
                contribution, or 501(c)(3) donation. It is not an investment contract: you have no
                expectation of profit from the efforts of Beunec or others; you are not purchasing
                equity, debt, tokens, royalties, or a share of future API revenue. Statements about
                a {formatUsd(goalUsd)} open-source funding milestone describe Beunec’s intended use
                of revenue, not consideration owed to you beyond the Work.
              </p>
              <p>
                <strong className="text-foreground">No crowdfunding of unfinished goods as the product.</strong>{" "}
                You are not pre-ordering an unbuilt API. You are buying research that exists today.
                Future open-source release, if and when funded, is a separate corporate roadmap
                decision funded by sales revenue.
              </p>
              <p>
                <strong className="text-foreground">Refunds.</strong> Except where a non-waivable
                consumer-protection statute requires otherwise, all sales are final after the Work is
                made available to you, because the goods are downloadable intellectual property.
              </p>
              <p>
                <strong className="text-foreground">Taxes.</strong> Prices may exclude sales tax, VAT,
                or similar. Stripe may calculate and collect tax based on your billing address,
                including New Jersey sales tax on specified digital products sold to New Jersey
                customers. You are responsible for taxes Stripe does not collect.
              </p>
              <p>
                <strong className="text-foreground">Warranties and liability.</strong> The Work is
                provided “as is.” It describes Beunec’s orchestration logic as applied to Rivine; it
                is not a warranty of product performance, legal advice, or a complete implementation
                guide for third-party models. Liability is limited as stated in the Terms of Use,
                including the aggregate cap therein, to the maximum extent permitted by law.
              </p>
              <p>
                <strong className="text-foreground">Governing law.</strong> These Terms of Sale are
                governed by the laws of the State of New Jersey, without regard to conflict-of-law
                rules. Dispute resolution follows the Terms of Use (informal resolution, mediation,
                then individual arbitration in New Jersey, with the opt-out described there), except
                for intellectual-property injunctions.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
