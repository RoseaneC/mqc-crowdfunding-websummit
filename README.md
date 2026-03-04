# MQC Platform

A modern fundraising platform built for **Mulheres Que Codam**, combining:

- a public crowdfunding experience,
- an authenticated admin workspace,
- Stellar-based donation and wallet integrations,
- auditable API workflows for projects, reports, and transfers.

The project is structured as a **Next.js application deployable on Vercel**, with API endpoints served under `/api` and integrated with PostgreSQL.

## High-Level Architecture

- **Frontend**: Next.js (App Router) + React + TypeScript + Tailwind CSS
- **API**: Next.js Route Handlers (`/api/*`) backed by the platform service layer
- **Data**: PostgreSQL schema in `packages/api/sql/schema.sql`
- **Blockchain**: Stellar SDK + generated contract clients in `src/contracts`
- **Deployment target**: Vercel (web + API), managed database provider (Neon/Supabase/Vercel Postgres, etc.)

## Core Domains

- **Crowdfunding**: project browsing, contribution flow, success/receipt UX
- **Admin**: authentication, project governance, MROSC workflows, reports, tax transfer controls
- **Transparency**: summary and recent impact metrics
- **Debug tooling**: contract/debugger views for integration diagnostics

## Repository Structure

```text
.
├── src/
│   ├── app/                # Next.js routes (pages + /api handlers)
│   ├── views/              # Existing UI screens consumed by app routes
│   ├── components/         # Shared UI components
│   ├── providers/          # App state/providers (auth, wallet, donations, notifications)
│   ├── util/               # API client, wallet helpers, shared utilities
│   ├── debug/              # Contract/debug tooling
│   └── contracts/          # Generated Stellar contract clients + env helpers
├── packages/
│   └── api/                # API workspace assets (schema, source, scripts)
├── contracts/              # Rust smart contracts
├── scripts/                # Local bootstrap and operational scripts
└── environments.toml       # Stellar scaffold environment config
```

## Prerequisites

- **Node.js 22+**
- **npm 10+**
- **Rust + Cargo** (for contract workflows)
- **Stellar CLI** and scaffold plugin (for on-chain workflows)
- **PostgreSQL** (local or remote)

## Quick Start

1. Install dependencies

```bash
npm install
```

2. Configure environment

```bash
cp .env.example .env
```

3. Start development

```bash
npm run dev
```

This starts Next.js plus contract client watch tooling.

## Full Local Stack (API + DB bootstrap)

```bash
npm run dev:full
```

`dev:full` runs local bootstrap (`init:local`) and starts:

- API workspace in watch mode,
- contract watch/build-clients,
- Next.js dev server.

## Environment Variables

Use `.env.example` as the source of truth. Main groups:

- **Public client config** (`NEXT_PUBLIC_*`)
  - Stellar network/passphrase/RPC/Horizon
  - optional API URL override (`NEXT_PUBLIC_API_URL`)
- **Server config**
  - `DATABASE_URL`
  - auth/session parameters
  - payout and platform fee parameters

For Vercel, configure these in Project Settings -> Environment Variables.

## Available Scripts

- `npm run dev`: Next.js + contract watcher
- `npm run dev:full`: local full stack
- `npm run build`: production build
- `npm run start`: production server
- `npm run lint`: ESLint
- `npm run format`: Prettier
- `npm run init:local`: local infra/bootstrap helpers
- `npm run sync:onchain`: sync on-chain project data script

## Deployment (Vercel)

1. Import repository into Vercel
2. Set all required env vars from `.env.example`
3. Ensure a production PostgreSQL `DATABASE_URL` is configured
4. Deploy using default Next.js build settings

The app and API routes are served from the same deployment.

## Database

Schema and seed baseline live in:

- `packages/api/sql/schema.sql`

Apply this schema to your target database before first production use.

## Quality and CI Expectations

- `npm run build` must pass
- `npm run lint` should pass (warnings may exist while migration cleanup continues)
- Keep API shape backwards-compatible for current frontend DTO contracts in `src/util/crowdfundingApi.ts`

## Security Notes

- Never commit secrets into `.env`
- Treat payout keys as production secrets (server-only)
- Restrict admin and transfer-related credentials by environment

## Contributing

1. Create a branch from `main`
2. Implement and validate with `npm run build`
3. Open PR with clear scope and migration/ops notes (if env or schema changed)
