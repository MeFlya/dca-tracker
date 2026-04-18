# DCA Tracker — Setup Guide

## Run locally

### Prerequisites
- Node.js 20+
- npm / yarn / pnpm

### Install

```bash
cd "DCA TRACKER"
npm install
```

### Configure environment

```bash
cp .env.example .env.local
```

Edit `.env.local`:

| Variable | Default | Description |
|---|---|---|
| `MARKET_DATA_PROVIDER` | `mock` | `mock` or `alpha_vantage` |
| `ALPHA_VANTAGE_API_KEY` | _(empty)_ | Free key at alphavantage.co |
| `MARKET_DATA_CACHE_TTL` | `300` | Cache duration in seconds |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` | Your public URL |

**To get a free Alpha Vantage key:**
1. Go to https://www.alphavantage.co/support/#api-key
2. Fill the form (free, no credit card)
3. Set `MARKET_DATA_PROVIDER=alpha_vantage` and paste your key

Without a key, the site runs in **demo mode** — all data is illustrative, clearly labeled.

### Start dev server

```bash
npm run dev
```

Open http://localhost:3000

---

## Deploy to Vercel

### One-click deploy
1. Push this repo to GitHub
2. Go to https://vercel.com/new
3. Import the repository
4. Add environment variables in the Vercel dashboard:
   - `MARKET_DATA_PROVIDER`
   - `ALPHA_VANTAGE_API_KEY`
   - `NEXT_PUBLIC_SITE_URL` → your Vercel domain

Vercel detects Next.js automatically. No additional config needed.

### Manual CLI deploy

```bash
npm install -g vercel
vercel login
vercel --prod
```

---

## Switching market data providers

The provider abstraction lives in `src/lib/market-data/`. To add a new provider:

1. Create `src/lib/market-data/my-provider.ts` implementing `IMarketDataProvider`
2. Add the new case in `src/lib/market-data/index.ts` factory function
3. Update `.env.example` with the new key name

---

## Project structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx            # Home
│   ├── simulateur/         # DCA Simulator
│   ├── comparer-etf/       # ETF Comparison
│   ├── donnees-marche/     # Market Data
│   ├── methodologie/       # About / Methodology
│   └── api/market-data/    # Server API route
├── components/
│   ├── layout/             # Header, Footer
│   ├── home/               # Hero, Features, Trust, FAQ
│   ├── simulator/          # Form, Results, Chart
│   ├── etf/                # ETF cards
│   ├── market/             # Market data cards
│   └── ui/                 # Shared primitives
└── lib/
    ├── market-data/        # Provider abstraction
    ├── simulator.ts        # DCA math
    ├── etf-config.ts       # ETF metadata
    └── utils.ts            # Formatters
```

---

## TODO — Premium features

Search the codebase for `TODO (premium)` to find all upgrade hooks:

- [ ] User accounts + saved simulations (Supabase / PlanetScale)
- [ ] Real-time or intraday market data (paid API plan)
- [ ] Portfolio tracker with actual holdings
- [ ] Email alerts for milestones
- [ ] PDF export of simulations
- [ ] Multi-language (i18n)
- [ ] Admin CMS for ETF metadata
- [ ] Redis/Upstash for persistent cross-instance caching
- [ ] A/B testing on CTA copy
