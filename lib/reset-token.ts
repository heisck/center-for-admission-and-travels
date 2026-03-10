import crypto from 'crypto'

export function hashResetToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex')
}

export function createResetTokenPair(): { token: string; tokenHash: string } {
  const token = crypto.randomBytes(32).toString('hex')
  return {
    token,
    tokenHash: hashResetToken(token),
  }
}
