"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

const connectors = [
  {
    logo: "https://64.media.tumblr.com/cdc323ca590fdea5902a49d7864618fa/12dc67c9466e334e-22/s1280x1920/9dccc77285c369cf77822b95671037d2f547ae7f.jpg",
    name: "FatSecret",
    label: "Nutrition",
    description: "Retrieves precise food and nutritional profiles for healthcare and wellness orchestration.",
    url: "https://www.fatsecret.com/",
  },
  {
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/Google_Maps_Logo_2020.svg/330px-Google_Maps_Logo_2020.svg.png",
    name: "Google Maps",
    label: "Location",
    description: "Integrates comprehensive search, route optimization, and environmental data for location-based reasoning.",
    url: "https://mapsplatform.google.com/",
  },
  {
    logo: "https://www.sec.gov/themes/custom/uswds_sec/dist/img/logos/sec-logo-sec.gov-1x.png",
    name: "SEC EDGAR",
    label: "Financials",
    description: "Direct search access to SEC public company financial filings for high-fidelity financial auditing.",
    url: "https://www.sec.gov/edgar",

  },
  {
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fb/US-NLM-PubMed-Logo.svg/1280px-US-NLM-PubMed-Logo.svg.png",
    name: "NHS PubMed",
    label: "Health",
    description: "Access to drug data and clinical trials to ensure zero-hallucination medical research.",
    url: "https://pubmed.ncbi.nlm.nih.gov/",
  },
  {
    logo: "https://www.clipartmax.com/png/full/239-2397483_world-bank-group-logo.png",
    name: "World Bank",
    label: "Economics",
    description: "Real-time retrieval of global economic indicators and development data.",
    url: "https://data.worldbank.org/",
  },
  {
    logo: "https://www.electraprotocol.com/wp-content/uploads/2023/07/CoinLore-e1688919397836.png",
    name: "CoinLore",
    label: "Crypto",
    description: "Tracks real-time cryptocurrency prices, volumes, and market caps for decentralized finance analysis.",
    url: "https://www.coinlore.com/",
  },
  {
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Our_World_in_Data_logo.png/960px-Our_World_in_Data_logo.png",
    name: "Our World in Data (OWID)",
    label: "Research",
    description: "Direct search through comprehensive global data sets for academic and geopolitical research.",
    url: "https://ourworldindata.org/",
  },
  {
    logo: "https://upload.wikimedia.org/wikipedia/commons/d/d9/DOAJ_logo-colour.svg",
    name: "DOAJ",
    label: "Publications",
    description: "Surgical extraction of open-access research articles, journals, and peer-reviewed publications.",
    url: "https://doaj.org/",
  },
  {
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ee/UN_emblem_blue.svg/1280px-UN_emblem_blue.svg.png",
    name: "United Nations (UN Data)",
    label: "Statistics",
    description: "Real-time retrieval of global statistics and geopolitical indicators for crisis response and policy analysis.",
    url: "https://data.un.org/",
  },
];

export function ConnectorsSection() {
  return (
    <section className="py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
            Explore Aselius's{" "}
            <span className="text-beunec-blue">Open Source Data Sources</span>
          </h2>
        </motion.div>

        {/* Connectors Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {connectors.map((connector, index) => (
            <motion.a
              key={connector.name}
              href={connector.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative p-6 flex flex-col rounded-2xl bg-muted/50 border border-border hover:border-beunec-blue/30 hover:bg-muted transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 rounded-xl bg-white dark:bg-slate-800 border border-border flex items-center justify-center flex-shrink-0 overflow-hidden shadow-sm dark: invert(1)">
                  <img
                    src={connector.logo}
                    alt={`${connector.name} Logo`}
                    className="w-full h-full object-contain p-2 dark:brightness-200 dark:contrast-200 mix-blend-multiply dark:mix-blend-normal"
                  />
                </div>
                <span className="text-[10px] font-bold tracking-wider text-beunec-blue uppercase bg-beunec-blue/10 px-3 py-1.5 rounded-full shrink-0 dark:text-[#D3D3D3]">
                  {connector.label}
                </span>
              </div>

              <div className="flex-1 flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl font-semibold text-foreground">
                    {connector.name}
                  </h3>
                  <ArrowUpRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                </div>
                <p className="text-muted-foreground text-sm flex-1 leading-relaxed">
                  {connector.description}
                </p>
              </div>
            </motion.a>
          ))}
        </div>

        {/* Testimonial */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row items-center gap-8 md:gap-12"
        >
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div className="relative">
              <div className="w-36 h-42 rounded-2xl overflow-hidden shadow-lg border border-border">
                <img
                  src="/assets/Prajwal Srinivas Headshot.png"
                  alt="Prajwal Srinivas"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* Quote */}
          <div className="flex-1 text-center md:text-left">
            <blockquote className="text-md md:text-lg font-medium text-foreground leading-relaxed mb-4">
              "Aselius Workspace now empowers users to generate truly reliable, synthesised intelligence by connecting our agents to trusted global data sources from PubMed, Fatsecret, and SEC filings to UN datasets and real-time economic streams.
              This moves professionals beyond static web results or limited model training, into a live, verifiable knowledge environment built for precision work."
            </blockquote>
            <div className="font-semibold text-foreground">Prajwal Srinivas</div>
            <div className="text-sm text-muted-foreground">
              CTO & Co-Founder{" "}
              <span className="text-beunec-blue">Beunec Technologies, Inc.</span>
            </div>
            <a
              href="/bcp-documentation"
              className="inline-flex items-center gap-2 mt-4 text-sm font-medium text-foreground hover:text-beunec-blue transition-colors"
            >
              Read more
              <ArrowUpRight className="w-4 h-4" />
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
