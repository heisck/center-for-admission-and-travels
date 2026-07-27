const REQUIRED_KEYS = [
  'DATABASE_URL',
  'NEXT_PUBLIC_BASE_URL',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
  'NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY',
  'PAYSTACK_SECRET_KEY',
  'SMTP_HOST',
  'SMTP_PORT',
  'SMTP_USER',
  'SMTP_PASS',
  'SMTP_FROM',
  'UPSTASH_REDIS_REST_URL',
  'UPSTASH_REDIS_REST_TOKEN',
  'CRON_SECRET',
  'SENTRY_DSN',
]

const presence = Object.fromEntries(
  REQUIRED_KEYS.map((key) => [key, Boolean(process.env[key]?.trim())])
)

console.log(JSON.stringify(presence, null, 2))
