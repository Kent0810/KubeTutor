---
title: "Logging with Loki and Alerting"
order: 2
objectives:
  - "Install Loki and Promtail for log aggregation."
  - "Query logs with LogQL — labels for filtering, line matchers for content."
  - "Configure Alertmanager routes, receivers, and inhibitions."
  - "Avoid label cardinality explosions in Loki and Prometheus."
  - "Build a basic SLO and burn-rate alert."
tryIt: "In Grafana, switch the data source to Loki and run `{namespace=\"default\"} |= \"error\"`. You now see every error log across the namespace — without grepping individual Pods."
takeaways:
  - "Loki indexes **labels**, not log content. Keep label cardinality low (no user IDs, no request IDs)."
  - "LogQL looks like PromQL: `{app=\"web\"} |= \"500\" | rate [5m]` gives you the error rate from logs."
  - "Alertmanager **groups**, **inhibits**, and **silences**. Configure all three or you'll wake people up needlessly."
  - "Page on **SLO burn rates**, not raw error rates — the math is well-defined and noise-resistant."
  - "Send alerts to a chat channel first; only escalate to phone for SLO-breaking incidents."
quiz:
  - text: "What makes Loki cheaper than Elasticsearch at similar retention, according to the lesson?"
    options:
      - "It stores logs only in memory instead of object storage."
      - "It indexes labels rather than the full log content."
      - "It samples logs before ingestion by default."
      - "It compresses logs by converting them into Prometheus metrics."
    correctAnswer: 1
    explanation: "The lesson says Loki indexes only metadata labels, not full log content. That reduced indexing cost is presented as a major reason it is cheaper to operate."
  - text: "Which LogQL query from the lesson counts the recent error rate for the `api` app?"
    options:
      - '`sum(http_requests_total{app="api"}[5m])`'
      - '`{app="api"} | json | level="error"`'
      - '`rate({app="api"} |= "ERROR" [5m])`'
      - '`count_over_time({namespace="production"}[1h])`'
    correctAnswer: 2
    explanation: 'The lesson gives `rate({app="api"} |= "ERROR" [5m])` as the example for counting error log rate over time. It combines label selection with a line matcher and a rate window.'
  - text: "How does the sample Alertmanager routing send alerts by severity?"
    options:
      - "Critical goes to Slack and warning goes to PagerDuty."
      - "Everything goes to the default Slack channel only."
      - "Critical goes to PagerDuty and warning goes to Slack."
      - "Warnings are dropped, and only critical alerts are delivered."
    correctAnswer: 2
    explanation: "The route tree in the lesson matches `severity: critical` to the `pagerduty` receiver and `severity: warning` to the `slack` receiver. This is part of reducing noisy escalations."
  - text: "What alerting strategy does the lesson recommend for paging humans?"
    options:
      - "Page on any raw error-rate spike over one minute."
      - "Page on CPU saturation because it is easiest to measure."
      - "Page on log volume because it correlates with incidents."
      - "Page on SLO burn rates instead of raw error rates."
    correctAnswer: 3
    explanation: "The takeaways explicitly say to page on SLO burn rates, not raw error rates. The lesson frames burn-rate alerts as more noise-resistant and operationally meaningful."
---

Metrics tell you what is happening numerically. Logs tell you why. A complete observability stack needs both. Loki is purpose-built for Kubernetes log aggregation: it indexes only metadata labels rather than the full log content, making storage 10–100x cheaper than Elasticsearch at the same retention. Combined with Alertmanager, you get a complete feedback loop from raw log lines to a PagerDuty page.

Loki architecture:
  Promtail       DaemonSet running on every node, tailing /var/log/pods/* and shipping to Loki.
  Loki           Receives logs, indexes labels, stores compressed chunks in object storage (S3, GCS).
  Grafana        Queries Loki using LogQL and renders log panels alongside metrics dashboards.

Install Loki stack via Helm:
  helm repo add grafana https://grafana.github.io/helm-charts
  helm repo update
  helm install loki grafana/loki-stack \
    --namespace monitoring \
    --set loki.persistence.enabled=true \
    --set loki.persistence.size=20Gi \
    --set loki.persistence.storageClassName=gp3-encrypted \
    --set promtail.enabled=true \
    --set grafana.enabled=false

Verify Promtail is running on all nodes:
  kubectl get daemonset loki-promtail -n monitoring
  kubectl logs -n monitoring daemonset/loki-promtail --tail=20

LogQL — querying logs in Grafana:
  # All logs from a namespace
  {namespace="production"}

  # All error logs from a specific app
  {namespace="production", app="api"} |= "ERROR"

  # Parse JSON logs and filter by level
  {app="api"} | json | level="error"

  # Count error log rate over time
  rate({app="api"} |= "ERROR" [5m])

  # Find slow requests (>500ms) with regex
  {app="api"} | logfmt | duration > 500ms

  # Aggregate by status code
  sum by (status) (rate({app="api"} | json [5m]))

Structured logging best practice:
Log in JSON for Loki to parse efficiently. Every log line should include at minimum:
  { "level": "error", "msg": "DB query failed", "duration_ms": 523, "error": "connection timeout", "trace_id": "abc123" }

Alertmanager configuration:
  global:
    smtp_smarthost: smtp.example.com:587
    smtp_from: alerts@example.com

  route:
    group_by: ["alertname", "namespace", "severity"]
    group_wait: 30s
    group_interval: 5m
    repeat_interval: 4h
    receiver: default
    routes:
      - match:
          severity: critical
        receiver: pagerduty
      - match:
          severity: warning
        receiver: slack

  receivers:
    - name: default
      slack_configs:
        - api_url: https://hooks.slack.com/services/YOUR/WEBHOOK/URL
          channel: "#k8s-alerts"
          title: "[{{ .Status | toUpper }}] {{ .CommonLabels.alertname }}"
          text: "{{ range .Alerts }}{{ .Annotations.description }}
{{ end }}"

    - name: pagerduty
      pagerduty_configs:
        - service_key: YOUR_PAGERDUTY_KEY

    - name: slack
      slack_configs:
        - api_url: https://hooks.slack.com/services/YOUR/WEBHOOK/URL
          channel: "#k8s-warnings"

PrometheusRule for critical alerts:
  apiVersion: monitoring.coreos.com/v1
  kind: PrometheusRule
  metadata:
    name: production-alerts
    namespace: monitoring
    labels:
      release: monitoring
  spec:
    groups:
      - name: production
        rules:
          - alert: HighErrorRate
            expr: |
              rate(http_requests_total{status_code=~"5..",namespace="production"}[5m])
              / rate(http_requests_total{namespace="production"}[5m]) > 0.05
            for: 2m
            labels:
              severity: critical
            annotations:
              summary: "High error rate on {{ $labels.app }}"
              description: "Error rate is {{ humanizePercentage $value }} for {{ $labels.app }}"

          - alert: PodCrashLooping
            expr: rate(kube_pod_container_status_restarts_total[15m]) > 0.1
            for: 5m
            labels:
              severity: warning
            annotations:
              summary: "Pod {{ $labels.pod }} is crash-looping"

          - alert: PersistentVolumeFull
            expr: |
              kubelet_volume_stats_available_bytes
              / kubelet_volume_stats_capacity_bytes < 0.1
            for: 5m
            labels:
              severity: critical
            annotations:
              summary: "PV {{ $labels.persistentvolumeclaim }} is 90% full"