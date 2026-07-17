/**
 * Shared Sentry filters for noise that is not caused by our app.
 * MetaMask / wallet extensions inject into every page and throw when
 * they fight over window.ethereum or frozen EventEmitter methods.
 */

const EXTENSION_ERROR_PATTERNS: RegExp[] = [
  /metamask/i,
  /failed to connect to metamask/i,
  /cannot assign to read only property ['"]send['"]/i,
  /reading ['"]addListener['"]/i,
  /reading ['"]emit['"]/i,
  /reading ['"]removeListener['"]/i,
  /ethereum\.request/i,
  /walletconnect/i,
  /inpage\.js/i,
  /chrome-extension:\/\//i,
  /moz-extension:\/\//i,
  /safari-extension:\/\//i,
  /ResizeObserver loop/i,
  /Non-Error promise rejection captured/i,
  /Loading chunk [\d]+ failed/i,
  /ChunkLoadError/i,
]

const EXTENSION_STACK_HINTS = [
  'chrome-extension://',
  'moz-extension://',
  'safari-extension://',
  'inpage.js',
  'nkbihfbeogaeaoehlefnkodbefgpgknn', // MetaMask extension id
]

export function isBrowserExtensionNoise(error: unknown, event?: { exception?: { values?: Array<{ value?: string; type?: string; stacktrace?: { frames?: Array<{ filename?: string }> } }> } }): boolean {
  const message =
    (error instanceof Error ? error.message : typeof error === 'string' ? error : '') ||
    event?.exception?.values?.map((v) => v.value || '').join(' ') ||
    ''

  if (message && EXTENSION_ERROR_PATTERNS.some((re) => re.test(message))) {
    return true
  }

  const frames =
    event?.exception?.values?.flatMap((v) => v.stacktrace?.frames || []) || []
  const filenames = frames.map((f) => f.filename || '').join(' ')
  if (EXTENSION_STACK_HINTS.some((hint) => filenames.includes(hint))) {
    return true
  }

  return false
}

export const SENTRY_IGNORE_ERRORS = [
  'Failed to connect to MetaMask',
  "Cannot assign to read only property 'send'",
  "Cannot read properties of undefined (reading 'addListener')",
  "Cannot read properties of undefined (reading 'emit')",
  "Cannot read properties of undefined (reading 'removeListener')",
  'ResizeObserver loop limit exceeded',
  'ResizeObserver loop completed with undelivered notifications',
  /Non-Error promise rejection captured/i,
  /Loading chunk [\d]+ failed/i,
  /ChunkLoadError/i,
]
