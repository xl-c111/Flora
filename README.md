# Flora – Modern Floral Marketplace

Flora is a full‑stack ecommerce experience dedicated to bouquets and floral subscriptions. The project pairs a React 19 TypeScript storefront with an Express/Prisma API, Stripe billing, Auth0 authentication, and Melbourne‑specific delivery validation.

---

## Table of Contents
- [Flora – Modern Floral Marketplace](#flora--modern-floral-marketplace)
  - [Table of Contents](#table-of-contents)
  - [Key Features](#key-features)
  - [Tech Stack](#tech-stack)
  - [Repository Layout](#repository-layout)
  - [Prerequisites](#prerequisites)
  - [Quick Start](#quick-start)
    - [Option A – pnpm (local runtimes)](#option-a--pnpm-local-runtimes)
    - [Option B – Docker Compose](#option-b--docker-compose)
  - [Environment Configuration](#environment-configuration)
  - [Demo Data \& Test Accounts](#demo-data--test-accounts)
  - [Core Scripts](#core-scripts)
  - [Testing \& Quality Gates](#testing--quality-gates)
  - [Troubleshooting](#troubleshooting)
  - [Documentation](#documentation)
  - [Future Development](#future-development)
  - [Maintainers \& License](#maintainers--license)

---

## Key Features
- **Bouquet commerce** – one‑time orders, scheduled subscriptions, and spontaneous surprise deliveries.
- **Discovery tools** – rich filtering (price, season, mood, occasion), search suggestions, and curated seasonal collections.
- **Secure checkout** – Auth0 login, persistent carts, Stripe payment intents, and branded order confirmation emails.
- **Delivery intelligence** – postcode validation for metropolitan Melbourne and shipping cost breakdowns per delivery date.
- **Customer hub** – profile dashboard, detailed order history, and subscription pause/resume/cancel.
- **AI gift messages** – Gemini‑powered copy suggestions with safe fallbacks.
- **Operational tooling** – Prisma migrations & seeding, sample accounts, targeted backend test suites, and CI integration.

---

## Tech Stack

**Frontend**
- React 19 + TypeScript, Vite, React Router
- Auth0 SDK, Stripe Elements, React Query, React Hook Form
- Custom component styling with vanilla CSS

**Backend**
- Node.js + Express (TypeScript)
- Prisma ORM + PostgreSQL
- Stripe, Nodemailer, Google Generative AI, Auth0 JWT validation
- Jest unit & integration testing

**Tooling**
- pnpm workspaces (monorepo)
- Docker Compose (dev/prod)
- GitHub Actions CI

---

## Repository Layout
```
.
├── apps
│   ├── frontend/            # React storefront (Vite + TS)
│   └── backend/             # Express API (Prisma + Stripe)
├── docs/                    # Supplemental guides (AI, subscriptions, testing, Stripe)
├── docker-compose*.yml      # Local & production orchestration
├── package.json             # Workspace scripts
└── README.md
```

---

## Prerequisites
- **Node.js** ≥ 18
- **pnpm** ≥ 8 (preferred package manager)
- **Docker & Docker Compose** (optional, recommended for parity)
- **PostgreSQL** instance (only needed if not using Docker)

---

## Quick Start

Clone the repository and install workspace dependencies:
```bash
git clone https://github.com/xl-c111/Flora.git
cd Flora
pnpm install
```

### Option A – pnpm (local runtimes)
Run backend and frontend in separate terminals:
```bash
# Backend
pnpm --filter backend db:setup   # applies migrations & seeds demo data (run once)
pnpm --filter backend dev

# Frontend
pnpm --filter frontend dev
```
- API health check: http://localhost:3001/api/health  
- Storefront: http://localhost:5173

### Option B – Docker Compose
```bash
pnpm docker:dev:build   # build/rebuild containers
pnpm docker:dev:bg      # start containers in background
pnpm docker:setup       # run migrations + seed inside backend container
```
Logs: `pnpm docker:logs --tail 20`

---

## Environment Configuration

Copy each example file, then fill in secrets specific to your environment.

| File | Purpose |
|------|---------|
| `apps/backend/.env.example` → `.env` | Database, Auth0, Stripe, email, Gemini, subscription toggles |
| `apps/frontend/.env.example` → `.env` | Auth0 SPA config, API base URL, Stripe publishable key |

**Backend essentials**
- `DATABASE_URL`, `PORT`, `FRONTEND_URL`
- `AUTH0_DOMAIN`, `AUTH0_CLIENT_ID`, `AUTH0_CLIENT_SECRET`, `AUTH0_AUDIENCE`
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEEKLY_PRICE_ID`, `STRIPE_MONTHLY_PRICE_ID`, `STRIPE_SPONTANEOUS_PRICE_ID`
- `ENABLE_SUBSCRIPTION_PAYMENTS` (`true` to enable Stripe subscription flow)
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `FROM_EMAIL`, `CONTACT_EMAIL`
- `GEMINI_API_KEY`

**Frontend essentials**
- `VITE_AUTH0_DOMAIN`, `VITE_AUTH0_CLIENT_ID`, `VITE_AUTH0_AUDIENCE`
- `VITE_API_URL` (default `http://localhost:3001/api`)
- `VITE_STRIPE_PUBLISHABLE_KEY`
- `VITE_APP_NAME`, `VITE_APP_URL`

---

## Demo Data & Test Accounts
Running the backend seed (`db:seed` or `db:setup`) loads:
- Sample floral products, categories, and collections
- Melbourne delivery zones and rate tables
- Auth0‑compatible user placeholders (`test@flora.com`, `demo@flora.com`)
- Subscription plans and Stripe price placeholders

Use these seeded users for local demos; map them to actual Auth0 profiles when integrating with a live tenant. See `docs/TESTING_GUIDE.md` for additional workflows.

---

## Core Scripts

| Script | Description |
|--------|-------------|
| `pnpm --filter backend dev` | Run API with live reload |
| `pnpm --filter backend db:setup` | Apply migrations and seed data |
| `pnpm --filter backend db:seed` | Reseed without recreating schema |
| `pnpm --filter frontend dev` | Run Vite dev server |
| `pnpm docker:dev:bg` | Start full stack via Docker |
| `pnpm docker:restart-backend` / `docker:restart-frontend` | Restart individual services |

---

## Testing & Quality Gates

| Target | Command | Notes |
|--------|---------|-------|
| Backend unit/integration | `pnpm --filter backend test` | Jest suites (payments, auth, subscriptions, AI, etc.) |
| Coverage report | `pnpm --filter backend test:coverage` | Generates coverage summary |
| Frontend lint | `pnpm --filter frontend lint` | ESLint with React & TypeScript rules |
| Frontend type check | `pnpm --filter frontend type-check` | Verifies TS configuration |

Stripe webhook and AI scenarios have dedicated guides in `docs/`.

---

## Troubleshooting
- **Dependency changes** – rerun `pnpm install` (local) or `pnpm docker:dev:build` (containers).
- **Database drift** – `pnpm --filter backend db:migrate` or `pnpm docker:setup`.
- **Old data** – reseed with `pnpm --filter backend db:seed`.
- **Auth/Stripe issues** – confirm `.env` secrets and webhook tunnels (ngrok) are configured.
- **CI failures** – review GitHub Actions logs; ensure tests and linting pass locally.

---

## Documentation
- `docs/TESTING_GUIDE.md` – End‑to‑end testing checklist
- `docs/SUBSCRIPTIONS.md` – Subscription flows and Stripe setup
- `docs/AI_Message_Guide.md` – Gemini integration notes
- `docs/Stripe-cli_Testing_Guide.md` – Webhook testing via Stripe CLI
- `docs/stripe_payment_webhook_flow.md` – Payment lifecycle reference

---

## Future Development
- **Personalised gifting** – richer recipient profiles, reminders, and custom packaging add-ons.
- **Design studio** – interactive bouquet builder and augmented-reality previews for arrangements.
- **Marketplace expansion** – florist partner onboarding, order routing, and supplier analytics.
- **Sustainability insights** – carbon-conscious delivery options and seasonal growing guidance.
- **Operations tooling** – staff dashboards for fulfillment, delivery scheduling, and customer support workflows.

---

## Maintainers & License

Created by **Anthony**, **Bevan**, **Xiaoling**, and **Lily** for the Holberton School final project.  
Released under the **MIT License**. Contributions and feedback are welcome.
