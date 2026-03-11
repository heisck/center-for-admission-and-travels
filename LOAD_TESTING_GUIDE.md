# Load Testing Guide (k6)

This project includes k6 scenarios for baseline verification, peak traffic simulation, and abuse-control validation.

## Prerequisites

- Install k6: [https://grafana.com/docs/k6/latest/set-up/install-k6/](https://grafana.com/docs/k6/latest/set-up/install-k6/)
- Use a staging environment that mirrors production (same DB tier, Redis, and deployment region).
- Seed realistic content before running tests.

## Available Scenarios

- `npm run loadtest:smoke`
  - Fast sanity check for key read paths.
- `npm run loadtest:peak`
  - Ramping read-heavy scenario that targets `5000` VUs by default.
- `npm run loadtest:writes`
  - Staging-only abuse/guardrail test for admin login and newsletter rate limits.
  - Requires `ALLOW_WRITE_LOAD=true`.

## PowerShell Examples

```powershell
# Smoke test against local app
$env:BASE_URL="http://localhost:3000"; npm run loadtest:smoke

# Peak test against staging (default peak 5000 VUs)
$env:BASE_URL="https://staging.example.com"; npm run loadtest:peak

# Peak test with custom target and hold time
$env:BASE_URL="https://staging.example.com"
$env:PEAK_VUS="3000"
$env:HOLD_DURATION="10m"
npm run loadtest:peak

# Write guardrail test (staging only)
$env:BASE_URL="https://staging.example.com"
$env:ALLOW_WRITE_LOAD="true"
npm run loadtest:writes
```

## Pass/Fail Criteria

- Smoke:
  - `checks > 99%`
  - `p95 < 1200ms`
  - `http_req_failed < 1%`
- Peak:
  - `checks > 98%`
  - `p95 < 1800ms`
  - `http_req_failed < 3%`
- Write guardrails:
  - `expected_status_rate > 99%`
  - `server_error_rate < 1%`
  - `rate_limit_hit_rate > 5%`

## Important Notes

- `5000` VUs may require distributed load generation. A single laptop can under-generate this load.
- Do not run write scenarios against production.
- If rate limits trip too aggressively in read tests, use distributed generators so traffic comes from multiple source IPs.

## Outputs to Capture

- k6 summary output (latency percentiles and failure rates)
- Deployment logs (app + database)
- DB CPU/memory/connections during peak stage
- Redis latency and error rate during peak stage

Store each run result with:
- commit SHA
- environment URL
- scenario name
- date/time (UTC)
