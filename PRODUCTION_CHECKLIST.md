# Production Readiness Checklist

Use this checklist before deploying to production.

## Environment Variables

- [ ] Copy `.env.example` to `.env` and fill all values
- [ ] Set `NEXT_PUBLIC_BASE_URL` to your production URL (e.g. `https://yourdomain.com`)
- [ ] Use **production** Paystack keys (replace `pk_test_` / `sk_test_` with `pk_live_` / `sk_live_`)
- [ ] Configure SMTP (Gmail App Password or transactional email service) for:
  - User forgot password
  - Admin forgot password
  - Welcome emails
  - Payment confirmations

## Database

- [ ] Run migrations: `npx prisma migrate deploy`
- [ ] Run seed (if fresh DB): `npm run db:seed`
- [ ] Change default admin password (seed uses `admin` / `password123`)
- [ ] Ensure admin user has a valid `email` for forgot-password to work

## Security

- [ ] Admin login: `/admin-login` — ensure strong admin password
- [ ] Admin forgot password: `/admin-forgot-password` — requires SMTP
- [ ] User forgot password: `/forgot-password` — requires SMTP
- [ ] `robots.txt` disallows `/admin`, `/admin-login`, `/api/`
- [ ] Security headers enabled in `next.config.mjs`

## Payments

- [ ] Switch Paystack to live keys
- [ ] Set `PAYMENT_CURRENCY` (e.g. `GHS`, `NGN`, `USD`)
- [ ] Test checkout flow end-to-end

## Content

- [ ] Edit legal pages (Admin → Legal): Privacy, Terms, Refund Policy
- [ ] Update contact info (Admin → Contact)
- [ ] Verify all images and links

## Build & Deploy

- [ ] `npm run build` succeeds
- [ ] `npm test` succeeds
- [ ] `npm run start` runs correctly
- [ ] Set `NODE_ENV=production` in deployment
- [ ] Run smoke load test in staging: `npm run loadtest:smoke`
- [ ] Run peak test in staging: `npm run loadtest:peak`

## Post-Deploy

- [ ] Test user signup, signin, forgot password
- [ ] Test admin login, forgot password
- [ ] Test payment flow (use small amount with live key)
- [ ] Verify emails are delivered
- [ ] Configure uptime checks:
  - `/api/health/live` (liveness)
  - `/api/health/ready` (readiness)
  - `/api/health` (detailed status)
- [ ] Configure alerts using `ALERTING_RUNBOOK.md`
