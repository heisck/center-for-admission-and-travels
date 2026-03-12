import http from 'k6/http'
import { check, sleep } from 'k6'
import { Rate } from 'k6/metrics'
import { buildRequestParams } from './request-config.js'

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000'

const expectedStatusRate = new Rate('expected_status_rate')
const serverErrorRate = new Rate('server_error_rate')
const rateLimitHitRate = new Rate('rate_limit_hit_rate')

export const options = {
  scenarios: {
    admin_login_abuse: {
      executor: 'constant-arrival-rate',
      exec: 'loginAbuse',
      rate: Number(__ENV.LOGIN_RATE || 15),
      timeUnit: '1s',
      duration: __ENV.DURATION || '2m',
      preAllocatedVUs: 40,
      maxVUs: 120,
    },
    newsletter_abuse: {
      executor: 'constant-arrival-rate',
      exec: 'newsletterAbuse',
      rate: Number(__ENV.NEWSLETTER_RATE || 20),
      timeUnit: '1s',
      duration: __ENV.DURATION || '2m',
      preAllocatedVUs: 40,
      maxVUs: 120,
    },
  },
  thresholds: {
    expected_status_rate: ['rate>0.99'],
    server_error_rate: ['rate<0.01'],
    rate_limit_hit_rate: ['rate>0.05'],
  },
}

export function setup() {
  if (__ENV.ALLOW_WRITE_LOAD !== 'true') {
    throw new Error(
      'Refusing to run write guardrail test. Set ALLOW_WRITE_LOAD=true explicitly for staging only.'
    )
  }
}

function trackResponseMetrics(response, expectedStatuses) {
  const expected = expectedStatuses.includes(response.status)
  expectedStatusRate.add(expected)
  serverErrorRate.add(response.status >= 500)
  rateLimitHitRate.add(response.status === 429)

  check(response, {
    [`status in ${expectedStatuses.join(',')}`]: () => expected,
  })
}

export function loginAbuse() {
  const response = http.post(
    `${BASE_URL}/api/admin/auth/login`,
    JSON.stringify({
      email: 'invalid-admin@example.com',
      password: 'definitely-wrong-password',
    }),
    buildRequestParams({
      headers: { 'Content-Type': 'application/json' },
      tags: { endpoint: '/api/admin/auth/login', scenario: 'auth-abuse' },
      timeout: __ENV.REQUEST_TIMEOUT || '20s',
    })
  )

  trackResponseMetrics(response, [401, 429])
  sleep(Math.random() * 0.5 + 0.2)
}

export function newsletterAbuse() {
  const response = http.post(
    `${BASE_URL}/api/newsletter`,
    JSON.stringify({
      email: `load-test-${__VU}-${__ITER % 100}@example.com`,
      website: '',
    }),
    buildRequestParams({
      headers: { 'Content-Type': 'application/json' },
      tags: { endpoint: '/api/newsletter', scenario: 'newsletter-abuse' },
      timeout: __ENV.REQUEST_TIMEOUT || '20s',
    })
  )

  trackResponseMetrics(response, [200, 429])
  sleep(Math.random() * 0.5 + 0.2)
}
