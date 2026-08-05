# Beunec

Website for **Beunec Technologies, Inc.**: a research and deployment organization building Agentic Infrastructure, and the **Aselius** platform, powered by the **Rivine** agentic engines.

Built with Next.js (App Router) and Tailwind CSS, shipped as a fully static site.

## Development

```bash
npm install
npm run dev
```

The dev server runs at `http://localhost:3000`.

## Build

```bash
npm run build
```

`next.config.js` uses `output: "export"`, so the build emits a fully static site to `out/`.

## Deploy: Cloudflare Pages

- **Build command:** `npm run build`
- **Build output directory:** `out`
- **Framework preset:** Next.js (Static HTML Export)

Security and caching headers are defined in `public/_headers`; crawler and indexing
rules live in `public/robots.txt` and `public/sitemap.xml`.
