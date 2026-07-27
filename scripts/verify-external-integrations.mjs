import { PrismaClient } from '@prisma/client'
import { v2 as cloudinary } from 'cloudinary'
import nodemailer from 'nodemailer'

function result(name, ok, detail) {
  return { integration: name, ok, detail }
}

async function verifyDatabase() {
  const prisma = new PrismaClient()
  try {
    await prisma.$queryRaw`SELECT 1`
    return result('PostgreSQL', true, 'connection and read query succeeded')
  } catch {
    return result('PostgreSQL', false, 'connection or read query failed')
  } finally {
    await prisma.$disconnect().catch(() => undefined)
  }
}

async function verifyRedis() {
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim().replace(/\/+$/, '')
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim()
  if (!url || !token) return result('Upstash Redis', false, 'configuration missing')

  try {
    const response = await fetch(`${url}/ping`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(15_000),
    })
    const body = await response.json().catch(() => null)
    const ok = response.ok && body?.result === 'PONG'
    return result('Upstash Redis', ok, ok ? 'authenticated ping succeeded' : 'authenticated ping failed')
  } catch {
    return result('Upstash Redis', false, 'authenticated ping failed')
  }
}

async function verifySmtp() {
  const host = process.env.SMTP_HOST?.trim()
  const port = Number.parseInt(process.env.SMTP_PORT || '587', 10)
  const user = process.env.SMTP_USER?.trim()
  const pass = process.env.SMTP_PASS
  if (!host || !user || !pass || !Number.isFinite(port)) {
    return result('SMTP', false, 'configuration missing')
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
    connectionTimeout: 15_000,
    greetingTimeout: 15_000,
    socketTimeout: 20_000,
  })

  try {
    await transporter.verify()
    return result('SMTP', true, 'server connection and authentication succeeded')
  } catch {
    return result('SMTP', false, 'server connection or authentication failed')
  } finally {
    transporter.close()
  }
}

async function verifyCloudinary() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim()
  const apiKey = process.env.CLOUDINARY_API_KEY?.trim()
  const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim()
  if (!cloudName || !apiKey || !apiSecret) {
    return result('Cloudinary', false, 'configuration missing')
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  })

  try {
    await cloudinary.api.ping()
    return result('Cloudinary', true, 'authenticated API ping succeeded')
  } catch {
    return result('Cloudinary', false, 'authenticated API ping failed')
  }
}

async function verifyPaystack() {
  const secret = process.env.PAYSTACK_SECRET_KEY?.trim()
  if (!secret) return result('Paystack', false, 'configuration missing')

  const mode = secret.startsWith('sk_test_')
    ? 'test'
    : secret.startsWith('sk_live_')
      ? 'live'
      : 'unknown'

  try {
    const response = await fetch(
      'https://api.paystack.co/transaction/verify/CAT_CONFIGURATION_CHECK_DOES_NOT_EXIST',
      {
        headers: { Authorization: `Bearer ${secret}` },
        signal: AbortSignal.timeout(15_000),
      }
    )
    const authenticated = response.status !== 401 && response.status !== 403
    return result(
      'Paystack',
      authenticated,
      authenticated
        ? `credential accepted; key mode is ${mode}`
        : `credential rejected; key mode is ${mode}`
    )
  } catch {
    return result('Paystack', false, `credential check failed; key mode is ${mode}`)
  }
}

function verifyConfigurationOnly() {
  const googleConfigured = Boolean(
    process.env.GOOGLE_CLIENT_ID?.trim() && process.env.GOOGLE_CLIENT_SECRET?.trim()
  )
  const sentryConfigured = Boolean(process.env.SENTRY_DSN?.trim())
  const cronConfigured = Boolean(process.env.CRON_SECRET?.trim())

  return [
    result(
      'Google OAuth',
      googleConfigured,
      googleConfigured ? 'client configuration present' : 'configuration missing'
    ),
    result(
      'Sentry',
      sentryConfigured,
      sentryConfigured ? 'DSN configuration present' : 'configuration missing'
    ),
    result(
      'Cron authorization',
      cronConfigured,
      cronConfigured ? 'secret configuration present' : 'configuration missing'
    ),
  ]
}

const checks = await Promise.all([
  verifyDatabase(),
  verifyRedis(),
  verifySmtp(),
  verifyCloudinary(),
  verifyPaystack(),
])
checks.push(...verifyConfigurationOnly())

console.table(checks)

if (checks.some((check) => !check.ok)) {
  process.exitCode = 1
}
