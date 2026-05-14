# Nexus Estate Dashboard

Dark-mode dashboard for the **Nexus Estate** real-estate wholesaling backend
(n8n workflow `NxQ3UG5IzjRaar5z`).

**Stack:** Vite 5 · React 18 · Tailwind v4 · React Router 6 · `@supabase/supabase-js` · `react-leaflet`
**Deploys to:** GitHub Pages via Actions on push to `main`.

## Mode: self-use (private)

The site is currently scoped to one operator (you, `elixira86@gmail.com`).
Three things exist on it:

- **`/app/*`** — your private dashboard (KPIs, sellers/buyers/deals/contracts, map). Login required.
- **`/get-listed`**, **`/find-deals`** — public intake forms. Anyone with the link can submit a property or buy box without an account; submissions flow into your Nexus tables via the existing n8n webhooks.
- **`/login`** — sign-in. Visiting `/` redirects here (or to `/app` if signed in).

There is no public marketing page, no pricing, no signup, no checkout. The
customer-facing scaffolding (Landing, Pricing, Signup, Checkout) was deleted
on 2026-05-14 and lives in git history; restore it when you're ready to sell
access. Migration `0008_nexus_subscriptions.sql` is dormant — don't apply
until the Stripe path is brought back.

---

## 1. Local dev

```powershell
# PowerShell, in this folder
npm install
Copy-Item .env.example .env.local
# edit .env.local and paste your real Supabase anon key
npm run dev   # http://localhost:5173
```

If npm refuses to run, you need to relax the PowerShell execution policy once:

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

## 2. One-time backend setup

These three things must be done in this order. None of them is automated yet.

### 2a. Apply the migration

In the Supabase dashboard → SQL editor, run the contents of
`../../OneDrive/Elixira/supabase/migrations/0007_nexus_dashboard.sql`. It:

- Creates the `profiles` allowlist table.
- Enables RLS + SELECT policies on the 5 Nexus tables (read-only for
  approved users; writes still flow through n8n with the service-role key).
- Adds nullable `lat` / `lng` columns to `seller_leads` so the map can plot pins.

### 2b. Create your user and approve yourself

In Supabase dashboard → Authentication → Users → **Add user**, with:

- Email: `elixira86@gmail.com`
- Password: anything you'll remember
- Auto Confirm User: **on**

The trigger from the migration creates a row in `profiles` with
`is_approved = false`. Approve yourself:

```sql
update public.profiles
set is_approved = true
where id = (select id from auth.users where email = 'elixira86@gmail.com');
```

### 2c. Add CORS headers to the 5 n8n webhooks

Browser fetches from GitHub Pages will fail until the Nexus webhooks send the
right CORS headers. On the workflow `NxQ3UG5IzjRaar5z`, for each of the 5
webhook trigger nodes (`seller-intake`, `buyer-intake`, `analyze-deal`,
`outreach`, `contract`):

- **HTTP Method**: keep `POST`, but also enable `OPTIONS`.
- **Respond**: "Using 'Respond to Webhook' Node".
- In the `Respond to Webhook` node at the end of each flow, add response headers:
  - `Access-Control-Allow-Origin: https://<your-user>.github.io`
    (or `*` while you're testing locally)
  - `Access-Control-Allow-Headers: content-type`
  - `Access-Control-Allow-Methods: POST, OPTIONS`

For the `OPTIONS` preflight, add a branch off each webhook that goes straight
to a `Respond to Webhook` node returning `204` + the same CORS headers, before
the real flow runs.

> Archive the current workflow to
> `workflows/_archive/nexus-estate_v1-2026-05-13.json` before saving any
> breaking changes, per the repo rule.

## 3. Deploy to GitHub Pages

1. Create a GitHub repo named `nexus-estate-site`.
2. In repo settings → Secrets and variables → Actions, add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_N8N_BASE`
3. In repo settings → Pages, set Source = **GitHub Actions**.
4. Push to `main`. The workflow at `.github/workflows/deploy.yml` builds + deploys.
5. The site lives at `https://<your-user>.github.io/nexus-estate-site/`.

If you ever rename the repo, also update `BASE_URL` inside `deploy.yml`.

## 4. Routes

**Public (no auth):**

| Route | What it does |
|---|---|
| `/` | Redirects to `/app` (signed in) or `/login` (signed out) |
| `/get-listed` | Public seller intake — submits to `/webhook/nexus/seller-intake`, no account needed |
| `/find-deals` | Public buyer intake — submits to `/webhook/nexus/buyer-intake`, no account needed |
| `/login` | Sign in |

**Protected (`/app/*`, requires Supabase Auth + `profiles.is_approved=true`):**

| Route | What it does |
|---|---|
| `/app` | Dashboard: KPIs, recent activity, top deals, map, quick actions |
| `/app/sellers`, `/app/sellers/new`, `/app/sellers/:id` | Seller leads + "Draft outreach" |
| `/app/buyers`, `/app/buyers/new` | Buyer profiles |
| `/app/deals`, `/app/deals/new`, `/app/deals/:id` | Deal analyses |
| `/app/contracts`, `/app/contracts/new` | Generate + download contract DOCX |
| `/app/settings` | Account + env display |

## 5. Lockdown (current state)

The dashboard is locked to `elixira86@gmail.com`. The site has no signup
page, no pricing page, no checkout flow — those were deleted. Anyone with
the link can still submit to `/get-listed` or `/find-deals` (that's the
intent), but nobody can create a dashboard login.

**Belt-and-suspenders: turn off Supabase signups too.** Someone who knew the
Supabase URL could otherwise call `auth.signUp` directly via the REST API:

1. Supabase dashboard → Authentication → Providers → Email.
2. Turn **Enable signups** OFF.
3. Save.

Your existing user keeps working — the toggle only affects new signups.

### To reopen public signup later

1. Restore from git history: `Landing.jsx`, `Pricing.jsx`, `Signup.jsx`,
   `CheckoutSuccess.jsx`, `CheckoutCancel.jsx`, the matching `App.jsx`
   routes, the `PublicLayout.jsx` nav links, and the `createCheckout`
   wrapper in `nexus.js`.
2. Flip Supabase "Enable signups" back ON.
3. Apply migration `0008_nexus_subscriptions.sql` in the SQL editor.
4. Build the Stripe + n8n workflow per §5b below.

## 5b. Stripe setup (deferred)

Not used in self-use mode. When you bring the customer pages back from git
history, the frontend will call `nexus.createCheckout()` → `POST
/webhook/nexus/checkout`, which doesn't exist yet. Here's what to build then:

### 5a. In Stripe (dashboard.stripe.com)

1. Create two products (Starter and Pro) with **recurring** monthly prices.
2. Note the **price IDs** (`price_xxx`). Edit `src/pages/Pricing.jsx` and replace
   `price_REPLACE_ME_STARTER` / `price_REPLACE_ME_PRO` with the real IDs.
3. In Developers → Webhooks, add an endpoint
   `https://n8n.srv1609042.hstgr.cloud/webhook/nexus/stripe-webhook` and
   subscribe at minimum to: `checkout.session.completed`,
   `customer.subscription.updated`, `customer.subscription.deleted`.
4. Copy the webhook signing secret (`whsec_...`).

### 5b. Apply migration 0008

Run `supabase/migrations/0008_nexus_subscriptions.sql` in the SQL editor. It adds
Stripe columns to `profiles` and a `subscription_events` log table.

### 5c. New n8n workflow — "Nexus Stripe"

Two webhooks, both with the existing CORS headers + `OPTIONS` branch:

**`POST /webhook/nexus/checkout`** — frontend calls this. Receives
`{ price_id, plan_id, user_id, email, success_url, cancel_url }`. Steps:

1. HTTP Request → Stripe `POST https://api.stripe.com/v1/checkout/sessions`
   - Auth: bearer `sk_live_...` (Stripe credential)
   - Body: `mode=subscription`, `line_items[0][price]=<price_id>`,
     `line_items[0][quantity]=1`, `customer_email=<email>`,
     `client_reference_id=<user_id>`,
     `metadata[plan_id]=<plan_id>`, `metadata[user_id]=<user_id>`,
     `success_url=<success_url>`, `cancel_url=<cancel_url>`.
2. Respond to Webhook with `{ url: $json.url }`.

**`POST /webhook/nexus/stripe-webhook`** — Stripe calls this. Steps:

1. Verify the `stripe-signature` header against your `whsec_...` secret
   (use a Function node with the standard HMAC-SHA256 check).
2. Insert into `subscription_events` (idempotency: `stripe_event_id` is unique).
3. On `checkout.session.completed`:
   - Find user by `client_reference_id` (= profiles.id).
   - Upsert profiles: `is_approved = true`, `stripe_customer_id`,
     `stripe_subscription_id`, `subscription_status = 'active'`,
     `subscription_plan`, `subscription_price_id`, `current_period_end`.
4. On `customer.subscription.updated/deleted`: sync `subscription_status`
   and `current_period_end`. If status leaves `active`/`trialing`,
   set `is_approved = false`.
5. Respond `200`.

Use the **service-role key** in this workflow's Supabase node — RLS would
otherwise block the writes.

### 5d. Test the loop

1. Sign up on `/signup`, password `test1234`.
2. Click Subscribe on `/pricing` — should redirect to Stripe Checkout.
3. Use Stripe test card `4242 4242 4242 4242`, any future date, any CVC.
4. After success, the webhook fires → `profiles.is_approved` flips to `true`.
5. Open `/app` — the dashboard should let you in.

## 6. Mobile + native app (Capacitor)

The site is mobile-first already — sidebar collapses to a bottom tab bar
(`MobileNav`), inputs are 16px-min to prevent iOS zoom, safe-area insets are
respected, and the layout flexes from phone to desktop with no breakpoints
left behind.

To ship as a native iOS/Android app via Capacitor (same React code, no rewrite):

```powershell
npm install @capacitor/core @capacitor/cli
npm install @capacitor/ios @capacitor/android   # whichever you need

# Build the web bundle and add the native projects:
npm run build
npx cap add ios       # needs macOS + Xcode
npx cap add android   # needs Android Studio + JDK 17
npx cap copy
npx cap open ios      # or `cap open android`
```

`capacitor.config.json` is already in the repo (`appId: com.nexusestate.app`).

**Two things to handle inside the native build:**

1. **Base path.** GH Pages builds use `BASE_URL=/nexus-estate-site/`, but
   Capacitor serves from `capacitor://` at root. Either run a separate build
   without the env var (`npm run build` locally with no `BASE_URL`) or switch
   to `HashRouter` for the native build.
2. **n8n CORS.** Capacitor's WebView origin is `capacitor://localhost` on iOS
   and `https://localhost` on Android — add both to the n8n webhook
   `Access-Control-Allow-Origin` (or use `*`).

The whole UI was built with this wrap in mind: no Node APIs, no `window`
assumptions, only standard `fetch`, Supabase JS, and Leaflet — all of which
work inside a Capacitor WebView.

## 7. Multi-tenant data (deferred)

Right now an approved user sees ALL Nexus rows (single-tenant). When you want
each customer to see only their own:

1. Add `user_id uuid` columns to `seller_leads`, `buyer_profiles`,
   `deal_analyses`, `contracts`. Backfill with your own user_id.
2. Update n8n write nodes to set `user_id` on every insert.
3. Tighten RLS: change SELECT policies to `using (user_id = auth.uid())`.
4. Public intake at `/get-listed` and `/find-deals` keeps writing with
   `user_id = null` (visible only to admins) until you decide how to route
   public submissions to specific operators.

Nothing in the existing v1 code blocks any of this.

## 8. What v1 deliberately doesn't ship

These are deferred because they need backend pieces that don't exist yet:

- Real `notifications` table + realtime channel (v1 uses `event_log` as the feed).
- A `properties` table + per-user recommendation scoring (v1 shows top deals).
- A `market_heat` heatmap data layer (v1 plots seller pins as a stand-in).
- Nexus chat (would need a new n8n workflow + `messages` table).
- Geocoding pipeline for seller addresses (add as a node to the seller-intake
  flow once you have a free geocoder picked).
- The n8n side of the Stripe flow (see §5c — frontend is wired, backend is not).

## 9. Layout

```
src/
  main.jsx, App.jsx, index.css
  lib/
    supabase.js     supabase client (anon key)
    nexus.js        5 webhook wrappers
    auth.jsx        AuthProvider + useAuth hook
  components/
    Layout, Sidebar, Topbar, RequireAuth
    Card, KPICard, DataTable, PageHeader
    ActivityFeed, QuickActions, NexusMap
  pages/
    Login, Dashboard, Settings
    Sellers / SellerNew / SellerDetail
    Buyers  / BuyerNew
    Deals   / DealNew  / DealDetail
    Contracts / ContractNew
```
