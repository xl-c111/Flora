# Flora – Modern Floral Marketplace

Flora is a full‑stack ecommerce experience dedicated to bouquets and floral subscriptions. The project pairs a React 19 TypeScript storefront with an Express/Prisma API, augmented by curated discovery filters, Stripe billing, Auth0 authentication, AI-powered gift message suggestions.

---

## Live Demo

Experience the production deployment on AWS (CloudFront + S3 + EC2):

- 🌐 **Frontend**: [Browse Flora on AWS](https://dzmu16crq41il.cloudfront.net)
- ✅ **API Health**: [Check API status](https://dzmu16crq41il.cloudfront.net/api/health)

Use the live site to browse the catalog, run through checkout, and validate deployments without spinning up local services.

<div align="center">
  <img src="./apps/frontend/src/assets/live-demo.png" alt="Flora Live Demo" width="900" />
</div>

---

## Key Features
- **Bouquet commerce** fuels one-time orders, scheduled subscriptions, and spontaneous surprise deliveries.
- **Discovery tools** surface rich filtering by price, season, mood, and occasion alongside search suggestions and curated seasonal collections.
- **Authentication & carting** provide Auth0 login, persistent carts, and guest-friendly checkout flows.
- **Payments** rely on Stripe payment intents that support both one-off charges and subscription billing.
- **Messaging** sends Nodemailer SMTP order confirmations after purchase and lets shoppers craft pre-purchase gift notes with Gemini-powered suggestions.
- **Delivery intelligence** enforces postcode validation for metropolitan Melbourne and details shipping cost breakdowns per delivery date.
- **Customer hub** offers a profile dashboard with detailed order history plus pause, resume, and cancel controls for subscriptions.
- **Operational tooling** covers Prisma migrations, seeding workflows, sample accounts, targeted backend test suites, and CI integration.

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

<details>
  <summary><strong>Click to expand full structure</strong></summary>

```
.
├── apps
│   ├── frontend/
│   │   ├── public/                    # static assets served by Vite (logos, images)
│   │   └── src/
│   │       ├── assets/                # shared imagery, icons, hero banners
│   │       ├── components/            # reusable React components (Header, Footer, etc.)
│   │       ├── contexts/              # React context providers (Auth, Cart)
│   │       ├── hooks/                 # custom hooks (checkout, delivery info)
│   │       ├── pages/                 # route-level pages (Landing, Products, Checkout)
│   │       ├── services/              # API helpers (orderService, deliveryService, Auth0)
│   │       ├── styles/                # global CSS
│   │       └── main.tsx               # Vite entry point + Auth0 provider
│   └── backend/
│       ├── prisma/                    # schema.prisma + migrations + seed
│       ├── src/
│       │   ├── config/                # database + env config
│       │   ├── controllers/           # Express controllers (products, orders, auth)
│       │   ├── middleware/            # auth, validation, error handling
│       │   ├── routes/                # Express routers
│       │   ├── services/              # domain logic (EmailService, ProductService, etc.)
│       │   ├── utils/                 # helpers (logging, formatters)
│       │   └── index.ts               # Express bootstrap + PM2 entry
│       └── scripts/                   # maintenance scripts (e.g., order cleanup)
├── docs/                              # runbooks (testing, subscriptions, deployment)
├── scripts/                           # deployment helpers (deploy-frontend.sh, deploy-backend.sh)
├── terraform/                         # infrastructure as code (VPC, EC2, RDS, S3, CloudFront)
├── docker-compose*.yml                # local/prod docker orchestration
├── package.json / pnpm-workspace.yaml # workspace scripts and project metadata
└── README.md
```

</details>

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

---



### Option B – Docker Compose
```bash
pnpm docker:dev:build   # build/rebuild containers
pnpm docker:dev:bg      # start containers in background
pnpm docker:setup       # run migrations + seed inside backend container
```
Logs: `pnpm docker:logs --tail 20`

> Need to ship changes to AWS? See `terraform/docs/DEPLOYMENT_REFERENCE.md` for the exact `deploy-frontend.sh` / `deploy-backend.sh` scripts and step-by-step redeploy instructions.

---

## Environment Configuration

Copy each example file and populate the values listed inside:

- `apps/backend/.env.example` → `apps/backend/.env`
- `apps/frontend/.env.example` → `apps/frontend/.env`

Each template contains inline comments describing the required secrets (database, Auth0, Stripe, SMTP, Gemini, etc.).  
You will need access to:
- an **Auth0** tenant (application + API audience)
- **Stripe** test keys (secret, publishable, price IDs, webhook secret)
- a **Gmail SMTP** account or equivalent transactional email provider

---

## Demo Data & Test Accounts
Running the backend seed (`db:seed` or `db:setup`) loads:
- Sample floral products, categories, and collections
- Melbourne delivery zones and rate tables
- Placeholder customer records (`test@flora.com`, `demo@flora.com`) that you can map to Auth0 users
- Subscription plans and Stripe price placeholders

If you prefer different demo accounts, update `prisma/seed.ts` or change the emails in your Auth0 tenant to match. See `docs/TESTING_GUIDE.md` for additional workflows.

---

## Core Scripts

| Script | Description |
|--------|-------------|
| `pnpm --filter backend dev` | Run API with live reload |
| `pnpm --filter backend db:setup` | Apply migrations and seed data |
| `pnpm --filter backend db:seed` | Reseed without recreating schema |
| `pnpm --filter backend db:restock` | Restock low-inventory products (default: stockCount < 10 → 100 units) |
| `pnpm --filter frontend dev` | Run Vite dev server |
| `pnpm docker:dev:bg` | Start full stack via Docker |
| `pnpm docker:restart-backend` / `docker:restart-frontend` | Restart individual services |
| `pnpm --filter backend test` | Run backend tests against real Prisma client (requires generated client & DB) |
| `pnpm --filter backend run test:mock` | Run backend tests with mocked Prisma client (no DB required; for sandbox use) |

> Use the mock variant only when Prisma engines cannot be generated (e.g., sandbox or no network access). For local development and CI, prefer the real client test command above.


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
