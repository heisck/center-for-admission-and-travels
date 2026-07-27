import type { SupportContact } from '@/lib/support-contact'

const BRAND = 'Center for Admission & Travels'
const BRAND_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://catravels.com'

function layout(title: string, body: string, contact?: Partial<SupportContact>) {
  const supportEmail = contact?.email?.trim() || ''
  const phone = contact?.phone?.trim() || ''
  const contactFooter = [phone, supportEmail]
    .filter(Boolean)
    .map((item) => `<p>${item}</p>`)
    .join('')

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f8fafc;">
  <div style="max-width:560px;margin:0 auto;padding:32px 16px;">
    <div style="text-align:center;margin-bottom:24px;">
      <a href="${BRAND_URL}" style="font-size:20px;font-weight:bold;color:#ea580c;text-decoration:none;">${BRAND}</a>
    </div>
    <div style="background:#fff;border-radius:12px;padding:32px;border:1px solid #e2e8f0;">
      <h1 style="font-size:22px;color:#0f172a;margin:0 0 16px;">${title}</h1>
      ${body}
    </div>
    <div style="text-align:center;margin-top:24px;font-size:12px;color:#94a3b8;">
      <p>${BRAND}</p>
      ${contactFooter}
    </div>
  </div>
</body>
</html>`
}

export function welcomeEmail(name: string, contact?: Partial<SupportContact>) {
  return {
    subject: `Welcome to ${BRAND}!`,
    html: layout('Welcome!', `
      <p style="color:#475569;line-height:1.6;">Hi ${name},</p>
      <p style="color:#475569;line-height:1.6;">Thank you for creating an account with us. You now have access to:</p>
      <ul style="color:#475569;line-height:1.8;">
        <li>Book travel packages and study/work abroad programmes</li>
        <li>Track your payment history and status</li>
        <li>Get direct support from our team</li>
      </ul>
      <div style="text-align:center;margin:24px 0;">
        <a href="${BRAND_URL}/packages" style="display:inline-block;padding:12px 28px;background:linear-gradient(135deg,#f97316,#dc2626);color:#fff;border-radius:8px;text-decoration:none;font-weight:600;">Browse Packages</a>
      </div>
      <p style="color:#475569;line-height:1.6;">If you have any questions, don't hesitate to reach out to us on WhatsApp or email.</p>
    `, contact),
  }
}

export function emailVerificationEmail(name: string, verificationUrl: string, contact?: Partial<SupportContact>) {
  return {
    subject: `Verify your ${BRAND} email`,
    html: layout('Verify Your Email', `
      <p style="color:#475569;line-height:1.6;">Hi ${name},</p>
      <p style="color:#475569;line-height:1.6;">Please verify your email address before signing in. This protects your account and keeps bookings tied to the right person.</p>
      <div style="text-align:center;margin:24px 0;">
        <a href="${verificationUrl}" style="display:inline-block;padding:12px 28px;background:linear-gradient(135deg,#f97316,#dc2626);color:#fff;border-radius:8px;text-decoration:none;font-weight:600;">Verify Email</a>
      </div>
      <p style="color:#475569;line-height:1.6;">This link will expire in 24 hours. If you didn't create this account, you can safely ignore this email.</p>
      <p style="color:#94a3b8;font-size:12px;margin-top:24px;">If the button doesn't work, copy and paste this URL into your browser: ${verificationUrl}</p>
    `, contact),
  }
}

export function adminPasswordResetEmail(username: string, resetUrl: string, contact?: Partial<SupportContact>) {
  return {
    subject: `Reset your ${BRAND} Admin password`,
    html: layout('Admin Password Reset', `
      <p style="color:#475569;line-height:1.6;">Hi ${username},</p>
      <p style="color:#475569;line-height:1.6;">We received a request to reset your admin password. Click the button below to set a new password:</p>
      <div style="text-align:center;margin:24px 0;">
        <a href="${resetUrl}" style="display:inline-block;padding:12px 28px;background:linear-gradient(135deg,#f97316,#dc2626);color:#fff;border-radius:8px;text-decoration:none;font-weight:600;">Reset Admin Password</a>
      </div>
      <p style="color:#475569;line-height:1.6;">This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.</p>
      <p style="color:#94a3b8;font-size:12px;margin-top:24px;">If the button doesn't work, copy and paste this URL into your browser: ${resetUrl}</p>
    `, contact),
  }
}

export function passwordResetEmail(name: string, resetUrl: string, contact?: Partial<SupportContact>) {
  return {
    subject: `Reset your ${BRAND} password`,
    html: layout('Password Reset', `
      <p style="color:#475569;line-height:1.6;">Hi ${name},</p>
      <p style="color:#475569;line-height:1.6;">We received a request to reset your password. Click the button below to set a new password:</p>
      <div style="text-align:center;margin:24px 0;">
        <a href="${resetUrl}" style="display:inline-block;padding:12px 28px;background:linear-gradient(135deg,#f97316,#dc2626);color:#fff;border-radius:8px;text-decoration:none;font-weight:600;">Reset Password</a>
      </div>
      <p style="color:#475569;line-height:1.6;">This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.</p>
      <p style="color:#94a3b8;font-size:12px;margin-top:24px;">If the button doesn't work, copy and paste this URL into your browser: ${resetUrl}</p>
    `, contact),
  }
}

export function paymentConfirmationEmail(data: {
  name: string
  reference: string
  amount: number
  currency: string
  itemName: string
}, contact?: Partial<SupportContact>) {
  return {
    subject: `Payment Confirmed - ${data.reference}`,
    html: layout('Payment Confirmed', `
      <p style="color:#475569;line-height:1.6;">Hi ${data.name},</p>
      <p style="color:#475569;line-height:1.6;">Your payment has been successfully processed. Here are the details:</p>
      <div style="background:#f8fafc;border-radius:8px;padding:16px;margin:16px 0;">
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <tr><td style="padding:6px 0;color:#64748b;">Booking</td><td style="padding:6px 0;color:#0f172a;font-weight:600;text-align:right;">${data.itemName}</td></tr>
          <tr><td style="padding:6px 0;color:#64748b;">Amount</td><td style="padding:6px 0;color:#0f172a;font-weight:600;text-align:right;">${data.currency} ${data.amount.toLocaleString()}</td></tr>
          <tr><td style="padding:6px 0;color:#64748b;">Reference</td><td style="padding:6px 0;color:#0f172a;font-family:monospace;text-align:right;">${data.reference}</td></tr>
        </table>
      </div>
      <div style="text-align:center;margin:24px 0;">
        <a href="${BRAND_URL}/my-payments" style="display:inline-block;padding:12px 28px;background:linear-gradient(135deg,#f97316,#dc2626);color:#fff;border-radius:8px;text-decoration:none;font-weight:600;">View My Payments</a>
      </div>
      <p style="color:#475569;line-height:1.6;">Our team will review your booking and get in touch with next steps. You can also follow up with us on WhatsApp.</p>
    `, contact),
  }
}

export function contactNotificationEmail(data: {
  name: string
  email: string
  phone?: string
  subject: string
  message: string
}, contact?: Partial<SupportContact>) {
  return {
    subject: `New Contact: ${data.subject}`,
    html: layout('New Contact Message', `
      <div style="background:#f8fafc;border-radius:8px;padding:16px;margin:16px 0;">
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <tr><td style="padding:6px 0;color:#64748b;vertical-align:top;">Name</td><td style="padding:6px 0;color:#0f172a;">${data.name}</td></tr>
          <tr><td style="padding:6px 0;color:#64748b;vertical-align:top;">Email</td><td style="padding:6px 0;color:#0f172a;">${data.email}</td></tr>
          ${data.phone ? `<tr><td style="padding:6px 0;color:#64748b;vertical-align:top;">Phone</td><td style="padding:6px 0;color:#0f172a;">${data.phone}</td></tr>` : ''}
          <tr><td style="padding:6px 0;color:#64748b;vertical-align:top;">Subject</td><td style="padding:6px 0;color:#0f172a;">${data.subject}</td></tr>
        </table>
      </div>
      <div style="background:#f0fdf4;border-radius:8px;padding:16px;margin:16px 0;border:1px solid #bbf7d0;">
        <p style="color:#0f172a;line-height:1.6;margin:0;white-space:pre-wrap;">${data.message}</p>
      </div>
      <p style="color:#475569;font-size:13px;">Reply directly to this email or contact the sender at ${data.email}</p>
    `, contact),
  }
}
