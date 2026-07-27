import * as Sentry from '@sentry/nextjs'
import { isBrowserExtensionNoise, SENTRY_IGNORE_ERRORS } from '@/lib/sentry-filters'

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN

if (dsn) {
  Sentry.init({
    dsn,
    tracesSampleRate: Number(process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE || 0.02),
    environment: process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.NODE_ENV,
    ignoreErrors: SENTRY_IGNORE_ERRORS,
    denyUrls: [
      /extensions\//i,
      /^chrome:\/\//i,
      /^chrome-extension:\/\//i,
      /^moz-extension:\/\//i,
      /inpage\.js/i,
    ],
    beforeSend(event, hint) {
      const original = hint?.originalException
      if (isBrowserExtensionNoise(original, event as any)) {
        return null
      }
      return event
    },
  })
}
