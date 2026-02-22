import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email'
import { contactNotificationEmail } from '@/lib/email-templates'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, phone, subject, message } = body

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Name, email, subject, and message are required' },
        { status: 400 }
      )
    }

    const contactMessage = await prisma.contactMessage.create({
      data: { name, email, phone: phone || null, subject, message },
    })

    const adminEmail = process.env.SMTP_FROM || 'info@catravels.com'
    const notification = contactNotificationEmail({ name, email, phone, subject, message })
    sendEmail({ to: adminEmail, ...notification }).catch((err) =>
      console.error('[Contact] Failed to send notification email:', err)
    )

    return NextResponse.json({ success: true, id: contactMessage.id })
  } catch (error) {
    console.error('[Contact] Error:', error)
    return NextResponse.json(
      { error: 'Failed to send message. Please try again.' },
      { status: 500 }
    )
  }
}
