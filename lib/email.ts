import nodemailer from 'nodemailer'

const SMTP_HOST = process.env.SMTP_HOST
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587')
const SMTP_USER = process.env.SMTP_USER
const SMTP_PASS = process.env.SMTP_PASS
const SMTP_FROM = process.env.SMTP_FROM || 'info@catravels.com'

const isConfigured = SMTP_HOST && SMTP_USER && SMTP_PASS

let transporter: nodemailer.Transporter | null = null

function getTransporter() {
  if (!isConfigured) return null
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    })
  }
  return transporter
}

interface EmailOptions {
  to: string
  replyTo?: string
  subject: string
  html: string
}

export async function sendEmail({ to, replyTo, subject, html }: EmailOptions): Promise<boolean> {
  const transport = getTransporter()

  if (!transport) {
    console.log(`[Email] SMTP not configured. Would have sent to ${to}:`)
    console.log(`[Email] Subject: ${subject}`)
    console.log(`[Email] Body preview: ${html.slice(0, 200)}...`)
    return false
  }

  try {
    await transport.sendMail({
      from: `"Center for Admission & Travels" <${SMTP_FROM}>`,
      to,
      replyTo,
      subject,
      html,
    })
    console.log(`[Email] Sent to ${to}: ${subject}`)
    return true
  } catch (error) {
    console.error(`[Email] Failed to send to ${to}:`, error)
    return false
  }
}

export async function sendEmailOrThrow(options: EmailOptions): Promise<void> {
  const sent = await sendEmail(options)
  if (!sent) {
    throw new Error(`Email delivery failed: ${options.subject} -> ${options.to}`)
  }
}
