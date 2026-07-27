import { describe, expect, it } from 'vitest'

import { MAX_PASSWORD_BYTES, validatePassword } from '@/lib/password-policy'

describe('password policy', () => {
  it('preserves intentional leading and trailing whitespace', () => {
    const value = '  password  '
    expect(validatePassword(value)).toEqual({ password: value })
  })

  it('rejects values beyond bcrypt UTF-8 byte capacity', () => {
    const value = 'é'.repeat(MAX_PASSWORD_BYTES)
    expect(validatePassword(value).error).toMatch(/72 UTF-8 bytes/i)
  })

  it('accepts exactly 72 ASCII bytes', () => {
    const value = 'a'.repeat(MAX_PASSWORD_BYTES)
    expect(validatePassword(value)).toEqual({ password: value })
  })
})
