# Database migration baseline

The canonical database baseline is:

`prisma/migrations/0_init/migration.sql`

On February 22, 2026, the original January/February migrations were squashed
into `0_init`. On May 17, 2026, four of the replaced migrations were
accidentally restored alongside the squash. That made a fresh
`prisma migrate deploy` attempt to create the same tables twice.

The restored duplicates have been removed. Do not restore these directories:

- `20260130154924_init`
- `20260204075042_auth_fix`
- `20260204090444_the_study_abroad_page_fix`
- `20260206130757_add_travel_tours_benefits_and_gallery`

## Fresh database

Run:

```powershell
npm run db:setup
```

Prisma will apply `0_init`, followed by the additive migrations dated
February 22, 2026 and later.

## Existing database

Before the next production deployment, inspect the migration ledger:

```sql
SELECT migration_name, finished_at, rolled_back_at
FROM "_prisma_migrations"
ORDER BY started_at;
```

If `0_init` is already recorded as successfully applied, no baseline action is
required. It is normal for the production `_prisma_migrations` table to retain
the names of the pre-squash migrations even though those files are no longer in
the repository. Prisma's production-squash workflow preserves the old database
ledger while new checkouts use only the squashed baseline.

Because of that retained history, `prisma migrate status` can report that the
four old database migrations are not present locally. Use schema drift output
and the pending-migration list together when auditing this database. Do not
restore the duplicate SQL files merely to make `migrate status` quiet; replaying
them after `0_init` breaks fresh database creation.

If the database was created from the removed pre-squash migrations and
`0_init` is not recorded, first verify that the live schema matches the current
Prisma schema using a staging clone. Then mark the squash as applied without
executing it:

```powershell
npx prisma migrate resolve --applied 0_init
```

Do not run `migrate resolve` against production until the staging-clone schema
comparison succeeds. `migrate resolve` changes migration history; it does not
create or repair tables.

## Current checkout-id migration

`20260727130000_add_payment_checkout_id` is additive. Before deploying it:

1. Back up or snapshot the target database.
2. Run the migration in staging with `npx prisma migrate deploy`.
3. Verify that `payments.checkoutId` exists and has a unique index.
4. Exercise duplicate checkout initialization and payment verification.
5. Deploy through the normal CI/release step.

Do not use `prisma db push` for this release. The migration includes a legacy
metadata backfill that is not represented by the Prisma schema alone.
