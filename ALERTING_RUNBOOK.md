# Alerting Runbook

This runbook defines minimum monitoring and response for production incidents.

## 1. Uptime Monitors (External)

Configure checks from at least 2 regions.

- `GET /api/health/live` every `30s`
  - Alert if 2 consecutive failures.
- `GET /api/health/ready` every `60s`
  - Alert if 2 consecutive `503` responses.
- `GET /api/health` every `60s`
  - Alert if status is `error`.
  - Warning if status is `degraded`.

Recommended tools: Better Stack, UptimeRobot, Pingdom, Datadog Synthetics.

## 2. Error and Latency Alerts

Set alerts on deployment/runtime platform and app logs:

- API 5xx rate:
  - Warning: `> 1%` for `5m`
  - Critical: `> 3%` for `5m`
- p95 latency for critical endpoints (`/api/content`, `/api/payment/initialize`, `/api/payment/verify`):
  - Warning: `> 1500ms` for `10m`
  - Critical: `> 2500ms` for `10m`
- Readiness failures:
  - Critical if `/api/health/ready` reports `not_ready` for `2m`.

## 3. Payment Flow Alerts

- Webhook failure rate:
  - Critical if `/api/payment/webhook` 5xx occurs `>= 3` times in `5m`.
- Payment mismatch/failure:
  - Warning on repeated `Amount mismatch` or verification failures in logs.
- Success drop:
  - Warning if successful payments fall below expected baseline window-over-window.

## 4. Security and Abuse Alerts

- Admin login abuse:
  - Alert on sustained spikes of `401` + `429` at `/api/admin/auth/login`.
- Unexpected privilege actions:
  - Alert on unusual frequency of admin audit actions (`system.seed`, payment settings updates, bulk content edits).
- Rate limiter backend degradation:
  - Alert when Redis health is `error` for `> 2m`.

## 5. Incident Response Flow

1. Triage:
   - Confirm health endpoint states and current deployment SHA.
2. Contain:
   - If active attack, tighten WAF/rate limits and block abusive IP ranges.
3. Recover:
   - Roll back to last known good deployment if regression-related.
   - Restart affected services only after identifying root signal.
4. Verify:
   - Health endpoints all green.
   - Critical business flow test: sign-in, payment initialize, payment verify.
5. Postmortem:
   - Document timeline, root cause, blast radius, and preventive actions.

## 6. Logging Correlation

- All API responses include `X-Request-Id`.
- During incidents, use request ID to trace request path across:
  - edge/runtime logs
  - application logs
  - payment/webhook logs

## 7. Weekly Operational Checklist

- Run smoke load test (`npm run loadtest:smoke`) on staging.
- Validate monitor notifications to on-call channel.
- Review admin audit log trends for anomalies.
- Review payment failure reasons and rate-limit hit rates.
