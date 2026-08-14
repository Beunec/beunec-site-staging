/**
 * Commercial sale of Akinnawo-Logic-V2 research documentation.
 * This is a digital-goods checkout, not a donation, investment, or crowdfunding pledge.
 *
 * Operator checklist (Stripe Dashboard, not this repo):
 * - Product type: Digital goods / downloadable content
 * - Stripe Tax enabled; suggested tax code txcd_10302001 (digital books, downloaded, limited rights)
 * - Post-payment fulfillment: deliver the licensed file immediately (Drive or equivalent)
 * - Receipt copy: commercial purchase of Akinnawo-Logic-V2; funds the open-source API roadmap
 * - Button / product name: "Purchase Research" language only (no Donate / Support / Back us)
 *
 * Update `raisedUsd` after reconciled Stripe sales so the public tracker stays honest.
 */
export const AKINNAWO_LOGIC_SALE = {
  title:
    "Akinnawo-Logic-V2: Reverse Engineering of Analysis & Implementation (REAI) and the Cocoon Analysis Runtime Model",
  shortName: "Akinnawo-Logic-V2",
  stripeCheckoutUrl: "https://buy.stripe.com/8x2aEY74T5qRfRr8Xdew803",
  goalUsd: 100_000,
  raisedUsd: 0,
  taxCodeHint: "txcd_10302001",
} as const;
