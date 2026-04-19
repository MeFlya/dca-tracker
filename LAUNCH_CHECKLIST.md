# Launch Checklist — DCA Tracker

Pre-launch verification before opening traffic to real users.

## 🔐 Environment variables (Vercel production)

### Auth
- [ ] `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` — production key
- [ ] `CLERK_SECRET_KEY` — production key
- [ ] Clerk dashboard: production instance pointed to `dcatracker.fr`
- [ ] Google OAuth configured in Clerk (optional but recommended)

### Payments
- [ ] `STRIPE_SECRET_KEY` — **live** key (starts `sk_live_`)
- [ ] `STRIPE_WEBHOOK_SECRET` — from live webhook endpoint
- [ ] `STRIPE_PREMIUM_MONTHLY_PRICE_ID` — live price ID
- [ ] `STRIPE_PREMIUM_YEARLY_PRICE_ID` — live price ID
- [ ] Stripe live webhook endpoint set to `https://dcatracker.fr/api/webhooks/stripe`
- [ ] Webhook events subscribed: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`

### Emails
- [ ] `RESEND_API_KEY` — production key
- [ ] `RESEND_FROM_EMAIL=DCA Tracker <hello@dcatracker.fr>`
- [ ] Domain `dcatracker.fr` verified in Resend dashboard
- [ ] SPF + DKIM + DMARC DNS records set

### Cron protection
- [ ] `CRON_SECRET` — random 32+ char string
- [ ] Vercel cron jobs configured in `vercel.json` (already shipped)

### Analytics
- [ ] `NEXT_PUBLIC_ANALYTICS_PROVIDER=plausible` — enables `track()` to send events
- [ ] `NEXT_PUBLIC_PLAUSIBLE_SRC=https://plausible.io/js/pa-XXXXXX.js` — the per-site script URL from Plausible dashboard (Site Settings → Tracker setup → Script)
- [ ] Plausible account created at plausible.io
- [ ] Plausible domain added: `dcatracker.fr`
- [ ] Custom event goals created in Plausible for the key funnel events (signup, start_trial, complete_payment, log_month)
- [ ] Test event fires (visit_home) in Plausible dashboard within 30 seconds of deploy

### Canonical / SEO
- [ ] `NEXT_PUBLIC_SITE_URL=https://dcatracker.fr` (used by some sitemap code paths)
- [ ] Google Search Console: domain verified
- [ ] `/sitemap.xml` submitted in Search Console
- [ ] `/robots.txt` allows indexing

---

## 🧪 Smoke tests (manual QA before launch)

### Funnel
- [ ] Homepage loads, Hero CTAs work
- [ ] Simulator responds to slider changes (< 100ms update)
- [ ] URL updates when params change (`?monthly=X&years=Y&...`)
- [ ] Simulator deep-link via URL param loads correctly
- [ ] `Sauvegarder ma stratégie` → redirects non-signed-in to `/sign-in`
- [ ] Signup creates user → redirected to `/account`
- [ ] Onboarding checklist appears on first visit
- [ ] Onboarding email (D+0 Welcome) received

### Dashboard
- [ ] New user with no strategy → OnboardingChecklist shown
- [ ] User with strategy → StrategyTracker shown
- [ ] "Enregistrer ce mois" opens modal
- [ ] Modal submits → refetches → dashboard updates
- [ ] Edit existing month via MonthDetailModal works
- [ ] Delete month requires confirmation, cascades correctly

### Upgrade + Payment
- [ ] `/upgrade?feature=monte-carlo` renders correctly with query params
- [ ] Dynamic projection block shows realistic numbers (not placeholder)
- [ ] CTA → `/tarifs#premium` scrolls to Premium column
- [ ] Stripe checkout session opens (test card 4242 4242 4242 4242)
- [ ] After trial + first charge → `customer.subscription.updated` webhook fires
- [ ] Clerk user metadata updated to `plan: "premium"`

### CSV import (Premium gate)
- [ ] Non-premium user sees paywall message
- [ ] Premium user can upload valid CSV
- [ ] Preview stage shows detected months + amounts
- [ ] Missing portfolio values block submit with clear error
- [ ] Successful import → redirects to dashboard → data visible

### Delete account flow
- [ ] Confirmation modal requires exact email match
- [ ] Active Stripe sub cancels **before** Clerk user is deleted
- [ ] If Stripe cancel fails → user is **NOT** deleted + error shown
- [ ] Successful delete → signs out → redirects home
- [ ] Email notification received (cancellation)

### Emails (verify in real inbox)
- [ ] `sendOnboardingWelcome` — immediate
- [ ] `sendOnboardingDay3` — scheduled 3 days out
- [ ] `sendSubscriptionConfirmed` — after Stripe checkout
- [ ] `sendMonthlyUpdate` (cron) — 1st of next month at 9am
- [ ] `sendMissedMonth` (cron) — 10th of next month if no log
- [ ] Links in emails point to `dcatracker.fr` (not vercel preview URL)

### Cron verification
- [ ] `/api/cron/monthly-update` callable with `Authorization: Bearer $CRON_SECRET`
- [ ] `/api/cron/missed-month` callable
- [ ] `/api/cron/annual-push` callable
- [ ] All 3 schedules visible in Vercel dashboard → Crons tab

### Performance
- [ ] Lighthouse homepage ≥ 90 (mobile)
- [ ] Lighthouse simulator ≥ 80 (mobile)
- [ ] No console errors in production build
- [ ] Font loading: no layout shift

### Legal / trust
- [ ] Footer legal disclaimer visible on every page
- [ ] `éducatif / pédagogique` mentions preserved in legal contexts
- [ ] Cookie banner **not needed** for Plausible (cookie-free)
- [ ] CGU/CGV pages if running paid subscriptions (recommended)
- [ ] Privacy policy covers Clerk + Stripe + Resend data processing

---

## 🚀 Launch day

### Day 0 (go live)
1. Deploy latest `main` to production
2. Verify all env vars set
3. Run each smoke test above
4. Submit sitemap to Google Search Console
5. Post to relevant French subreddits / forums (r/vosfinances, r/france, DCA Discord)

### Day 1
- [ ] Check Plausible dashboard — visitor count, bounce rate
- [ ] Check Vercel logs — no errors in first 24h
- [ ] Check Stripe dashboard — test charges appear correctly
- [ ] Check Resend dashboard — delivery rate ≥ 95%

### Day 7 (first cron cycles)
- [ ] Verify monthly-update cron ran on the 1st
- [ ] Verify missed-month cron ran on the 10th
- [ ] Check actual emails received by test users

### Week 2
- [ ] Plausible: funnel from `visit_home` → `start_trial` → `log_month`
- [ ] Identify biggest drop-off step
- [ ] Prioritize fixes based on data, not intuition

---

## 📊 Analytics funnel — key events

```
visit_home
  ↓ (bounce ~40-60%)
start_simulation (user interacts with form)
  ↓
complete_simulation (debounced)
  ↓
click_save_strategy    [biggest monetization event]
  ↓
signup + login
  ↓
enter_dashboard
  ↓
log_month              [activation moment]
  ↓
open_upgrade → start_trial → complete_payment
  ↓
cancel_subscription (ideally never)
```

Additional engagement events:
- `import_csv` — retention unlock
- `export_data` — user satisfaction signal
- `conversion_block_click` — which emotional block works best
- `homepage_cta_click` — top-of-funnel routing

All events auto-include:
- `plan` (free / premium)
- `device` (mobile / desktop)

---

## 🐛 Known bugs to fix post-launch (P1)

1. **Double emails at signup+trial** — if user signs up and subscribes same day, they get 3 onboarding emails in 24h. Need to skip day-1 onboarding email if user subscribed within 12h of signup.
2. **Simulator params lost through signup flow** — user on `/simulateur?monthly=300` clicks Save → goes to `/sign-in` → loses params. Preserve via `redirect_url`.
3. **Dashboard log_month duplicate warning** — no client-side check that current month is already logged before opening modal.
4. **Stripe customer reuse** — legacy Pro subscribers might create duplicate Stripe customers when subscribing to Premium.

---

## 🔄 Monitoring

- **Vercel logs**: real-time errors, cron execution
- **Stripe dashboard**: subscriptions, churned, MRR
- **Resend dashboard**: email delivery, bounces
- **Plausible dashboard**: traffic, funnels, retention
- **Clerk dashboard**: user count, auth success rate

Set up one weekly review: open all 5 dashboards, cross-reference numbers.
