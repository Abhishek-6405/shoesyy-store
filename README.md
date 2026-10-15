# SHOESY | Full-stack sneaker store

A portfolio migration of a PHP/MySQL footwear store to Next.js App Router,
TypeScript and PostgreSQL on Neon. Browse a seeded sneaker catalog, save a
wishlist, check out with COD or Razorpay **test mode**, and manage the store through
a role-protected admin dashboard.

**Live demo:** _Add your deployed Vercel URL here._

This is a shared portfolio demo, not a real retailer. Do not enter real personal
information or use live payment keys. Public demo admins can change shared
inventory and orders; use a dedicated demo database, never a production database.

## Demo credentials

| Role | Email | Password |
| --- | --- | --- |
| Customer | `user@shoesy.demo` | `user123` |
| Admin | `admin@shoesy.demo` | `admin123` |

The login page has autofill buttons for both accounts. Demo accounts cannot be
deleted, demoted or have their passwords changed through the application.
These intentionally public credentials are not deployment secrets.

## Features

### Storefront

- 26 seeded shoes, categories, brands, sizes, colorways and 2-5 reviews per shoe.
- Server-rendered shop with shareable search, filters, sorting and pagination.
- Product galleries, stock indicators, reviews and saved wishlists.
- Persisted Zustand cart storing IDs and variants, not trusted prices.
- Authenticated checkout, COD, Razorpay test payments, receipts and order history.
- INR pricing, mobile layouts, light/dark themes and reduced-motion support.
- Framer Motion hero, product-card interactions, cart drawer and page transitions.
- Product metadata, Open Graph cards, JSON-LD, sitemap and crawler rules.

### Admin

- Revenue, order, customer and inventory statistics; lazy-loaded Recharts charts.
- Product creation/editing, image URL previews, deactivation and reactivation.
- Category management, searchable/paginated tables and low-stock alerts.
- Forward-only fulfillment status updates; cancellation restores inventory once.
- Customer roles and protected demo accounts.

### Security and reliability

- Bcrypt password hashing, NextAuth credentials/JWT sessions and USER/ADMIN roles.
- Middleware plus independent server authorization checks on admin pages/APIs.
- Prisma queries and Zod validation; prices are computed server-side.
- Transactional stock changes; inactive products cannot be ordered.
- Razorpay signature, amount and replay checks; secrets remain server-side.
- Auth attempt limits, explicit errors and security response headers.
- Keyboard focus traps, Escape-to-close overlays, visible focus and a skip link.
- Public catalog caching and indexes were completed before the final polish.

**Limits:** auth rate limits are in-memory (10 login attempts or 5 registration
attempts per IP per 15 minutes, per process). Instances do not share counters and
restarts reset them; they are not a distributed serverless abuse-prevention
guarantee. The proxy IP header must be trusted at your hosting boundary. The CSP
allows inline scripts/styles for the pre-hydration theme script, Next.js and
Razorpay. This is less strict than a nonce/hash CSP. Development additionally
allows eval and WebSockets; production does not. Robots rules are not access control.
Client Zod validation uses its non-JIT mode so it does not need production eval.
Razorpay's checkout, API, CDN scripts and frames are explicitly allowed.

**Public launch is pending a dependency upgrade.** The current dependency audit
reports advisories, including critical Next.js advisories. Framework/tooling
upgrades are intentionally deferred from the scoped polish phase. See
[UPGRADE_NOTES.md](UPGRADE_NOTES.md) for versions, advisory applicability and
production/dev distinctions. Independent admin role checks do not protect public
image processing, rendering or request handling from framework vulnerabilities.

## Tech stack

| Area | Technology |
| --- | --- |
| App | Next.js 14 App Router, React 18, TypeScript |
| Database | Neon PostgreSQL, Prisma 5 |
| Auth | NextAuth.js v4 (Auth.js), bcryptjs |
| UI | Tailwind CSS, shadcn-style components, Lucide |
| Motion/charts | Framer Motion, Recharts |
| State/forms | Zustand, React Hook Form, Zod |
| Payments/hosting | Razorpay test mode, Vercel |

## What I migrated and why

The original procedural PHP app mixed HTML, sessions, SQL and filesystem uploads.
The Next.js version separates typed UI, validated APIs and database access, runs
on Vercel without runtime filesystem writes, and uses Neon's pooled Postgres
connection for serverless requests.

[MIGRATION_PLAN.md](MIGRATION_PLAN.md) contains the original route/database audit.
The migration addresses its findings:

| Legacy finding | Replacement in the deployed app |
| --- | --- |
| SQL interpolation/injection | Prisma queries and validated inputs; no raw SQL |
| Missing admin authorization | Role checks in middleware and each admin server surface |
| Hardcoded admin login/public admin signup | Seeded ADMIN role; normal registration creates USER only |
| Unrestricted uploads that could execute PHP | Static seed assets and admin image URLs; no upload execution or runtime disk writes |
| Unauthenticated GET deletion / IDOR | Authorized mutation APIs and ownership checks |
| Hardcoded database connection settings | Untracked environment configuration |
| HTML-string/localStorage XSS | React-escaped text; escaped JSON-LD; security headers |
| Plaintext dump passwords | New seed users with bcrypt hashes; old data is not imported |

Legacy customer signup already used PHP password hashing; the audit did not
identify it as plaintext hashing. The insecure admin bypass and dump passwords
were separate problems.

### Intentional changes and demo limitations

- The original source is preserved in [legacy-php/](legacy-php/), not deployed.
  Legacy hardcoded local DB settings and dump/example credentials still exist
  in that archive/history; preserving it does not make it safe to run publicly.
  Rotate any credential ever used outside this demo. No history rewrite is implied.
- Fragmented orders are unified into Order/OrderItem; no old MySQL records are imported.
- The orphaned server cart and `save_cart.php` are not ported; cart is client-side.
- No public admin signup or hardcoded admin authentication bypass.
- Hero imagery replaces the background video; the oversized legacy video was skipped.
- Broken legacy profile editing, standalone contact/FAQ pages and bank-account
  payment forms were not ported. The newsletter is presentation-only: no mail is sent.
- Product stock is pooled per product, not separate stock per size/color.
- Checkout/order statuses are a demo, not real shipping, returns or refunds.

## Screenshots

Capture the deployed app and place images in [docs/screenshots/](docs/screenshots/).
The following paths are placeholders until screenshots are added:

| View | Placeholder path |
| --- | --- |
| Home (desktop, dark mode) | `docs/screenshots/home-dark.png` |
| Shop filters (mobile) | `docs/screenshots/shop-mobile.png` |
| Product detail | `docs/screenshots/product.png` |
| Checkout and confirmation | `docs/screenshots/checkout.png` |
| Admin dashboard | `docs/screenshots/admin-dashboard.png` |

## Project structure

```text
README.md                  Single setup/deployment guide
MIGRATION_PLAN.md          Original audit and migration decisions
legacy-php/                Archived PHP/MySQL project (not deployed)
docs/screenshots/          Portfolio screenshots
web/
  app/                     Pages, metadata routes and API Route Handlers
  components/              Storefront, admin and shared UI
  lib/                     Auth, Prisma singleton, catalog, orders, hooks, stores
  prisma/
    schema.prisma          PostgreSQL schema
    migrations/            Versioned migrations
    seed.ts                Idempotent demo seed
  public/                  Reused local product/brand assets
  .env.example             Placeholders only
```

## Local setup

Use Node.js 20+ (an active LTS version is recommended), npm and a Neon database.

```powershell
git clone https://github.com/Abhishek-6405/shoesyy-store.git
cd shoesyy-store\web
npm ci
```

If you already have `web/.env`, keep it. Otherwise copy `.env.example` to `.env`
and fill it in **locally**, never in chat, source control or build logs.
Set both app URLs to your local origin for development. Generate a fresh secret
locally with a password manager or `openssl rand -base64 32`.

```powershell
# Apply checked-in migrations; do not create another init migration.
npm run db:deploy
npm run db:seed
npm run dev
```

Open http://localhost:3000. Use a separate Neon branch/database when experimenting
so local tests cannot alter the shared live demo.

## Environment variables

Add **every variable below** to `web/.env` locally and the Vercel dashboard for the
environments you intend to deploy. No actual secrets belong in this table.

| Name | Purpose | Where to get it |
| --- | --- | --- |
| `DATABASE_URL` | Pooled Postgres connection for Prisma runtime | Neon Connect dialog, pooling enabled |
| `DIRECT_URL` | Direct Postgres connection for Prisma migrations | Neon Connect dialog, pooling disabled |
| `NEXTAUTH_SECRET` | Sign/encrypt auth session JWTs | Generate a new high-entropy secret locally |
| `NEXTAUTH_URL` | Auth callback origin | Local origin or deployed canonical HTTPS origin |
| `NEXT_PUBLIC_APP_URL` | Canonical metadata, sitemap and OG base URL | Same public origin as the deployed site |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Public Razorpay checkout key ID | Razorpay dashboard, **Test Mode**, API Keys |
| `RAZORPAY_KEY_SECRET` | Server-only Razorpay signing/API secret | Same Razorpay test key pair |

The current implementation uses `NEXT_PUBLIC_RAZORPAY_KEY_ID`, not
`RAZORPAY_KEY_ID`. The public key ID and public app URL may appear in browser
bundles; the DB URLs, auth secret and Razorpay secret must not. Do not prefix
server secrets with `NEXT_PUBLIC_`. If Razorpay keys are absent, COD still works
and the online payment option is disabled. Auth requires a real `NEXTAUTH_SECRET`
in deployment; there is no hardcoded fallback.

## Database and validation commands

Run inside `web`:

| Command | Purpose |
| --- | --- |
| `npm run db:deploy` | Apply existing migrations (`prisma migrate deploy`) |
| `npm run db:migrate -- --name descriptive_change` | Create/apply a migration on a development DB only |
| `npm run db:seed` | Run the idempotent Prisma seed |
| `npm run db:studio` | Inspect data locally in Prisma Studio |
| `npx prisma generate` | Regenerate the Prisma client (also runs on postinstall) |
| `npx tsc --noEmit` | Type-check |
| `npm run lint` | Lint |
| `npm run build` | Production build |
| `npm run start` | Serve a completed build locally |

### Reset demo data

Run `npm run db:seed` against the intended demo database to reapply seeded
products, accounts and reviews and add missing demo orders. It is safe to run
twice, but **it is not a full database wipe**: existing demo order changes and
user-created orders/products remain. Stock/password/review seed values may be
reset. For a completely pristine demo, use a fresh Neon database/branch, then
run `db:deploy` and `db:seed`; do not reset a database containing real data.

## Vercel + Neon deployment (free tiers)

1. **Prepare Neon.** Keep the existing Postgres project or create a dedicated
   demo branch on the free plan. Retrieve the pooled and direct URLs in the Neon
   dashboard. The schema already uses both. Never commit either connection string.
2. **Prepare Razorpay.** Use Test Mode to generate a matched key ID/secret pair.
   Never use live keys for this public demo. No money is charged in test mode.
3. **Apply migrations and seed against the target Neon database.** In a local
   terminal inside `web`, configure its untracked `.env` for the target database:
   ```powershell
   npm ci
   npx prisma migrate deploy
   npm run db:seed
   ```
   This is a deliberate pre-deploy step. Vercel's normal build does not automatically
   migrate or reseed your database; `postinstall` only generates Prisma Client.
4. **Import the GitHub repository in Vercel.** Choose Next.js and set
   **Root Directory = `web`**. Use the default install/build/output settings
   (`npm run build`, `.next`). The PHP archive stays outside the deployed app.
5. **Add environment variables.** Add every entry in the table above under
   Project Settings -> Environment Variables. Set `NEXTAUTH_URL` and
   `NEXT_PUBLIC_APP_URL` to your canonical live HTTPS URL (without a route path).
   Generate a **fresh** `NEXTAUTH_SECRET` for deployment. Use a separate database
   for Preview if preview users should not change production demo data.
6. **Choose the function region near Neon.** This project's Neon database is in
   AWS **us-east-2 (Ohio)**. Select Vercel `cle1` (Cleveland), if available on your
   free plan, or `iad1` (Washington, D.C.). Check Project Settings -> Functions.
   If configuring in source instead, create `web/vercel.json` with a single
   region (`"regions": ["iad1"]`). Do not choose multiple regions on a plan that
   does not support them. Region/plan availability may change.
7. **Deploy.** Ensure the build succeeds. If the final assigned URL differs from
   the configured URL, update both URL variables and redeploy before testing.
   Public variables are embedded at build time; env edits require redeployment.
8. **Smoke-test the live URL.** Run the pre-deploy checklist below. Replace the
   live-demo placeholder at the top of this README and add screenshots.
9. **Redeploy changes.** Push to the connected production branch (`main`) or use
   Vercel -> Deployments -> Redeploy. When a schema change is committed, run
   `prisma migrate deploy` against the target DB before code that requires it.
   Reseed only when deliberately refreshing demo content, not on every build.

Keep within current Neon/Vercel free-tier quotas. Idle Neon computes may sleep;
the first request can be slower. A deployment needs outbound database connectivity
even during the build because public product pages are pre-rendered.

## Troubleshooting

| Symptom | Check |
| --- | --- |
| Prisma cannot connect / P1001 | Neon compute is available; correct project/branch; pooled runtime URL and direct migration URL; TLS enabled; network/firewall |
| Missing tables / migration errors | Run `prisma migrate deploy` against the same DB Vercel uses; do not run `migrate dev` on production |
| Login fails or JWT errors | Both auth env vars are configured; URL matches the live origin; fresh secret is present; clear old cookies after rotating it |
| Razorpay disabled | Both test keys are configured and matched; public key uses the documented variable name; redeploy |
| Checkout blocked by CSP | Inspect browser console and Network for blocked Razorpay origins; do not remove CSP wholesale or use real payment data |
| Image URL fails | Use local assets or `images.unsplash.com`; another host requires a reviewed `remotePatterns` change |
| Slow first request | Neon wake-up/region latency; production is faster than dev on-demand compilation |
| Changes appear late | Catalog revalidates every 60 seconds; admin catalog mutations invalidate its cache |
| Login/registration throttled | Wait 15 minutes; counters are per IP/process, including shared network users |
| Seed doesn't erase old orders | Expected: seed is idempotent, not destructive; use a fresh demo database for a full reset |

## Test the Razorpay path locally

1. Add the matching **test-mode** public key ID and server secret locally using
   the variable names above. Restart the dev server after changing env, or
   rebuild/restart production; do not print or share the values.
2. Run `npm run dev`, log in with the demo customer, select an in-stock shoe and
   size, and add it to your bag. Navigate to `/checkout`.
3. Fill the address form with fictional details. Select **Razorpay (Test Mode)**.
   If disabled, `/api/payments/razorpay/config` should report `enabled: false`;
   check configuration and restart/redeploy. The client now reads `enabled`,
   matching the existing endpoint contract.
4. Open DevTools -> Network and Console, then click the payment/checkout button.
   `/api/payments/razorpay/create-order` should succeed and the Razorpay modal
   should open without CSP errors.
5. Use a supported instrument from the
   [official Razorpay test-payment instructions](https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/integration-steps/).
   Complete the **test** success flow; never use live card/account details.
   `/api/payments/razorpay/verify` should succeed, your cart should clear, and the
   app should open the receipt. Confirm the order appears in `/orders`.
6. Repeat separately and close the modal before payment. Check for the cancel
   message and that no completed order was created. Also exercise Razorpay's test
   failure flow and confirm the error is visible and you can retry.
7. Toggle the theme before and after checkout and reload: the preference should
   persist, with no CSP violation from the inline theme initialization.

Only the checkout page consumes the config endpoint in application source; no
other consumers with the old `isConfigured` field were found. Without configured
test keys, a live Razorpay transaction cannot be verified; COD remains available.

## Pre-deploy checklist

- [ ] `npx tsc --noEmit`, `npm run lint` and `npm run build` pass.
- [ ] Complete the planned dependency upgrade and reassess [UPGRADE_NOTES.md](UPGRADE_NOTES.md) before public launch.
- [ ] Neither `.env` nor secrets are staged; the only committed env file is `.env.example`.
- [ ] Root Directory is `web`; all seven environment variables are configured.
- [ ] URLs match the canonical live HTTPS origin; auth secret is fresh; Razorpay keys are test keys.
- [ ] Target Neon migrations and seed ran successfully; function region is nearby.
- [ ] Customer/admin demo login works; a customer cannot access admin pages/APIs.
- [ ] Browse/filter, add to cart, COD checkout and order history work.
- [ ] Razorpay test success/cancel/failure flows work without CSP violations.
- [ ] Theme persists without a flash; mobile drawers trap focus, close on Escape and restore focus.
- [ ] Light/dark text and focus states are readable; reduced motion is respected.
- [ ] `/sitemap.xml`, `/robots.txt`, favicon, OG image and product JSON-LD render.
- [ ] Browser console has no hydration errors or unexpected security-policy violations.
- [ ] Live demo link and portfolio screenshots are added.
