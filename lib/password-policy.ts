export const MIN_PASSWORD_LENGTH = 8
export const MAX_PASSWORD_BYTES = 72

export function validatePassword(value: unknown): { password?: string; error?: string } {
  if (typeof value !== 'string' || value.length < MIN_PASSWORD_LENGTH) {
    return { error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` }
  }

  const byteLength = Buffer.byteLength(value, 'utf8')
  if (byteLength > MAX_PASSWORD_BYTES) {
    return { error: `Password must be no more than ${MAX_PASSWORD_BYTES} UTF-8 bytes` }
  }

  return { password: value }
}
