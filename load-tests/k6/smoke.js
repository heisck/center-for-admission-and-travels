import http from 'k6/http'
import { check, sleep } from 'k6'

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000'

export const options = {
  vus: Number(__ENV.VUS || 25),
  duration: __ENV.DURATION || '2m',
  thresholds: {
    checks: ['rate>0.99'],
    http_req_duration: ['p(95)<1200', 'p(99)<2500'],
    http_req_failed: ['rate<0.01'],
  },
}

const trafficMix = [
  '/api/health/live',
  '/api/health/ready',
  '/api/content',
  '/packages',
  '/',
]

function pickPath() {
  return trafficMix[Math.floor(Math.random() * trafficMix.length)]
}

function smokeScenario() {
  const path = pickPath()
  const response = http.get(`${BASE_URL}${path}`, {
    tags: { endpoint: path, scenario: 'smoke' },
    timeout: __ENV.REQUEST_TIMEOUT || '20s',
  })

  check(response, {
    'status is 200': (r) => r.status === 200,
    'response under 2s': (r) => r.timings.duration < 2000,
  })

  sleep(Math.random() * 0.8 + 0.2)
}

export default smokeScenario
