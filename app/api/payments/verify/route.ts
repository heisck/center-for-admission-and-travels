import { NextResponse } from 'next/server'

export async function POST() {
  return NextResponse.json(
    {
      success: false,
      error: 'Deprecated endpoint. Use /api/payment/verify instead.',
    },
    { status: 410 }
  )
}
