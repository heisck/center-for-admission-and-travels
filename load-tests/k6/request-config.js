function buildHeaders(extraHeaders = {}) {
  const headers = { ...extraHeaders }

  if (__ENV.VERCEL_PROTECTION_BYPASS) {
    headers['x-vercel-protection-bypass'] = __ENV.VERCEL_PROTECTION_BYPASS
    headers['x-vercel-set-bypass-cookie'] =
      __ENV.VERCEL_SET_BYPASS_COOKIE || 'true'
  }

  if (__ENV.VERCEL_BYPASS_COOKIE) {
    headers.Cookie = `_vercel_jwt=${__ENV.VERCEL_BYPASS_COOKIE}`
  }

  if (__ENV.HOST_HEADER) {
    headers.Host = __ENV.HOST_HEADER
  }

  return headers
}

export function buildRequestParams(params = {}) {
  return {
    ...params,
    headers: buildHeaders(params.headers),
  }
}
