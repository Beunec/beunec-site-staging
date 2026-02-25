"use client";

import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Do I have to pay for sharing my Aselius Workspace, documents via Beunec Docs, messages, and files?",
    answer: "No. Sharing and viewing content across Beunec Docs, Messages, Files, and the Aselius Workspace is always free. Our CloudHandle identifiers are also provided free of charge to ensure seamless collaboration.",
  },
  {
    question: "Is my data private, and can Beunec see my content?",
    answer: "No. Beunec is built on a 'Zero-Knowledge' architecture. Your data is encrypted at the source, meaning we do not have the keys to view your documents, messages, or files. Your intellectual property remains mathematically isolated from us and our infrastructure providers.",
  },
  {
    question: "Do I need to enter my credit card details to sign up?",
    answer: "No. You can sign up and utilize the Base plan completely free without entering payment information. A payment method is only required when upgrading to Pro or Essential tiers.",
  },
  {
    question: "Do you have a free trial for paid plans?",
    answer: "No. We do not offer free trials for Pro or Essential tiers. We recommend that users start with our 'Base' plan, which is free forever. This allows you to experience our core multi-agent orchestration and high-authority connectivity without being charged.",
  },
  {
    question: "Is the quality of the Base plan lower than the paid plans?",
    answer: "Not at all. We have equalized the quality of our core features across all tiers. Whether you are on the Base plan or a paid tier, you receive the same high-precision reasoning, secure infrastructure, and agentic performance. Paid plans simply unlock higher usage limits and specialized professional tools.",
  },
  {
    question: "What third-party apps can I connect to my workspace?",
    answer: "The Beunec Cloud Platform supports native integration with major enterprise tools including Microsoft 365, Google Workspace, Stripes, Firebase, and Supabase, as well as high-authority data sources like PubMed and the World Bank API.",
  },
  {
    question: "Can I change my plan later?",
    answer: "Absolutely. You can upgrade or downgrade your plan at any time. Upgrades take effect immediately to grant you instant access to advanced agents, while downgrades take effect at the start of your next billing cycle.",
  },
  {
    question: "Do you offer promotional offers or grant programs?",
    answer: "Yes. We offer promotional pricing exclusively for college students and manage a dedicated grant program for solo founders and stealth teams. We are also looking forward to offering grants for startup companies and non-profit organizations in the future.",
  },
  {
    question: "Who counts as a 'User' in Beunec?",
    answer: "A user is a seated account holder with permission to create, edit, or manage content in a workspace. Public readers and external collaborators with view-only access do not count toward your seat limit.",
  },
  {
    question: "Is there a storage limit on the Base plan?",
    answer: "Yes. The Base plan includes a generous storage allotment for documents and files. As your needs grow, upgrading to Pro or Essential tiers provides significantly expanded storage capacities and higher file-size upload limits.",
  },
  {
    question: "Do you offer self-hosting?",
    answer: "Currently, Beunec Cloud is a SaaS-only platform. However, our architecture is designed for high-security environments, and we are evaluating on-premise/self-hosted deployments for Enterprise-tier customers on our 2027 roadmap.",
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards and PayPal via our secure payment gateway. For Essential and Enterprise plans, we also support invoicing and bank transfers.",
  },
  {
    question: "What is your refund policy?",
    answer: "Because BCP incurs immediate, high-intensity computational costs for multi-agent orchestration and real-time API verification at the start of each task, we do not offer refunds once a billing cycle has processed. We encourage all users to thoroughly evaluate the platform using the Base plan before committing to a paid subscription.",
  },
];

export function PricingFAQ() {
  return (
    <section className="py-16 lg:py-24 bg-muted/30">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            FAQs
          </h2>
        </motion.div>

        {/* FAQ Accordion */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="border border-border rounded-xl px-6 bg-card data-[state=open]:border-beunec-blue/30 transition-colors"
              >
                <AccordionTrigger className="text-left font-medium text-foreground hover:no-underline py-4">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>

        {/* Still have questions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-center mt-10"
        >
          <p className="text-muted-foreground">
            Still have questions?{" "}
            <a href="mailto:support@beunec.com" className="text-beunec-blue hover:underline font-medium">
              Contact our support team
            </a>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
