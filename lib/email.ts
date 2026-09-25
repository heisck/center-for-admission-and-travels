import nodemailer from 'nodemailer'
import type { Transporter } from 'nodemailer'

const SMTP_HOST = process.env.SMTP_HOST
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587')
const SMTP_USER = process.env.SMTP_USER
const SMTP_PASS = process.env.SMTP_PASS
const SMTP_FROM = process.env.SMTP_FROM || 'info@catravels.com'

const isConfigured = SMTP_HOST && SMTP_USER && SMTP_PASS

let transporter: Transporter | null = null

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

  // Prevent SMTP header injection by stripping CR and LF from header fields
  const safeSubject = String(subject || '').replace(/[\r\n]+/g, ' ').trim()
  const safeTo = String(to || '').replace(/[\r\n]+/g, '').trim()
  const safeReplyTo = replyTo ? String(replyTo).replace(/[\r\n]+/g, '').trim() : undefined

  if (!transport) {
    console.log(`[Email] SMTP not configured. Would have sent to ${safeTo}:`)
    console.log(`[Email] Subject: ${safeSubject}`)
    console.log(`[Email] Body preview: ${html.slice(0, 200)}...`)
    return false
  }

  try {
    await transport.sendMail({
      from: `"Center for Admission & Travels" <${SMTP_FROM}>`,
      to: safeTo,
      replyTo: safeReplyTo,
      subject: safeSubject,
      html,
    })
    console.log(`[Email] Sent to ${safeTo}: ${safeSubject}`)
    return true
  } catch (error) {
    console.error(`[Email] Failed to send to ${safeTo}:`, error)
    return false
  }
}

export async function sendEmailOrThrow(options: EmailOptions): Promise<void> {
  const sent = await sendEmail(options)
  if (!sent) {
    throw new Error(`Email delivery failed: ${options.subject} -> ${options.to}`)
  }
}
