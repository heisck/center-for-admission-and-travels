import http from 'k6/http'
import { check, sleep } from 'k6'

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000'
const PEAK_VUS = Number(__ENV.PEAK_VUS || 5000)
const WARM_TARGET = Math.max(100, Math.floor(PEAK_VUS * 0.1))
const MID_TARGET = Math.max(500, Math.floor(PEAK_VUS * 0.4))

export const options = {
  scenarios: {
    peak_users: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: __ENV.WARMUP_DURATION || '2m', target: WARM_TARGET },
        { duration: __ENV.RAMP_ONE_DURATION || '3m', target: MID_TARGET },
        { duration: __ENV.RAMP_TWO_DURATION || '4m', target: PEAK_VUS },
        { duration: __ENV.HOLD_DURATION || '6m', target: PEAK_VUS },
        { duration: __ENV.COOLDOWN_DURATION || '3m', target: 0 },
      ],
      gracefulRampDown: '30s',
    },
  },
  thresholds: {
    checks: ['rate>0.98'],
    http_req_duration: ['p(95)<1800', 'p(99)<3500'],
    http_req_failed: ['rate<0.03'],
  },
}

function weightedPathSelector() {
  const roll = Math.random()
  if (roll < 0.55) return '/api/content'
  if (roll < 0.75) return '/packages'
  if (roll < 0.85) return '/travel-tours'
  if (roll < 0.95) return '/api/health/ready'
  return '/api/health/live'
}

function peakScenario() {
  const path = weightedPathSelector()
  const response = http.get(`${BASE_URL}${path}`, {
    tags: { endpoint: path, scenario: 'peak-5k' },
    timeout: __ENV.REQUEST_TIMEOUT || '25s',
  })

  check(response, {
    'status is 200': (r) => r.status === 200,
  })

  sleep(Math.random() * 0.4 + 0.1)
}

export default peakScenario
