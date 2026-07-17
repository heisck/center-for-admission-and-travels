import * as Sentry from '@sentry/nextjs'
import { isBrowserExtensionNoise, SENTRY_IGNORE_ERRORS } from '@/lib/sentry-filters'

if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE || 0.05),
    environment: process.env.VERCEL_ENV || process.env.NODE_ENV,
    ignoreErrors: SENTRY_IGNORE_ERRORS,
    beforeSend(event, hint) {
      if (isBrowserExtensionNoise(hint?.originalException, event as any)) {
        return null
      }
      return event
    },
  })
}
