---
title: "Prometheus and Grafana"
order: 1
objectives:
  - "Install the kube-prometheus-stack Helm chart."
  - "Expose application metrics in Prometheus format."
  - "Write a PromQL query for rate, percentile, and aggregation."
  - "Build a Grafana dashboard for the RED method (Rate, Errors, Duration)."
  - "Configure recording rules and alert rules."
tryIt: "`helm install kps prometheus-community/kube-prometheus-stack`. Port-forward Grafana, log in (`admin`/`prom-operator`), open the 'Kubernetes / Compute Resources / Pod' dashboard. Your cluster is now observable in 5 commands."
takeaways:
  - "Prometheus is a **pull-based** TSDB — your app exposes `/metrics`; Prometheus scrapes it."
  - "The **RED** method (Rate, Errors, Duration) for services; **USE** (Utilisation, Saturation, Errors) for resources."
  - "PromQL `histogram_quantile(0.99, sum(rate(http_request_duration_seconds_bucket[5m])) by (le))` = p99 latency."
  - "Use **recording rules** for expensive queries so dashboards stay fast."
  - "Alerts should be **symptom-based** (users hurt) not **cause-based** (CPU > 80%)."
quiz:
  - text: "How does Prometheus collect metrics from applications in the model described by the lesson?"
    options:
      - "Applications push metrics directly into Prometheus over gRPC."
      - "Prometheus scrapes each app's `/metrics` endpoint on an interval."
      - "Grafana exports metrics to Prometheus after rendering dashboards."
      - "Kubernetes Events are automatically converted into Prometheus time series."
    correctAnswer: 1
    explanation: "The lesson emphasizes Prometheus as a pull-based TSDB. Applications expose `/metrics`, and Prometheus decides when to scrape them."
  - text: "What does the RED method stand for in this lesson's dashboard guidance?"
    options:
      - "Replication, Errors, Deployment"
      - "Rate, Errors, Duration"
      - "Requests, Events, Disk"
      - "Readiness, Efficiency, Downtime"
    correctAnswer: 1
    explanation: "The takeaways distinguish RED for services from USE for resources. RED is Rate, Errors, and Duration."
  - text: "Why does the lesson recommend recording rules for some PromQL queries?"
    options:
      - "They automatically create Grafana dashboards."
      - "They convert pull-based metrics into push-based metrics."
      - "They pre-compute expensive queries so dashboards stay fast."
      - "They replace Alertmanager for symptom-based alerts."
    correctAnswer: 2
    explanation: "The lesson says recording rules pre-compute expensive queries. That keeps dashboards responsive instead of recalculating costly expressions repeatedly."
  - text: "What Kubernetes resource does the lesson use to tell Prometheus how to scrape a service's metrics endpoint?"
    options:
      - "Ingress"
      - "PodDisruptionBudget"
      - "ServiceMonitor"
      - "ConfigMap"
    correctAnswer: 2
    explanation: "The example resource is a `ServiceMonitor` with a selector, port, path, and interval. It is the mechanism shown for wiring an app into Prometheus scraping."
---

You cannot improve what you cannot measure. Kubernetes clusters generate enormous amounts of operational data — CPU and memory per container, HTTP request rates and latencies, error counts, queue depths, disk IO, network throughput — but only if you instrument your applications and install the right collection infrastructure. Prometheus and Grafana have become the de-facto standard for Kubernetes observability because they integrate natively with the Kubernetes API, scale horizontally, and have a massive ecosystem of pre-built dashboards and exporters.

The Prometheus pull model:
Unlike push-based monitoring systems, Prometheus scrapes metrics by making HTTP GET requests to /metrics endpoints on your services. This means your application just needs to expose metrics; Prometheus decides when and how often to collect them. The scrape interval is typically 15–30 seconds.

Install kube-prometheus-stack (the complete observability bundle):
  helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
  helm repo update
  helm install monitoring prometheus-community/kube-prometheus-stack \
    --namespace monitoring \
    --create-namespace \
    --set prometheus.prometheusSpec.retention=30d \
    --set prometheus.prometheusSpec.storageSpec.volumeClaimTemplate.spec.storageClassName=gp3-encrypted \
    --set prometheus.prometheusSpec.storageSpec.volumeClaimTemplate.spec.resources.requests.storage=50Gi \
    --set grafana.persistence.enabled=true \
    --set grafana.persistence.size=10Gi

This installs: Prometheus, Alertmanager, Grafana, node-exporter (per-node hardware metrics), kube-state-metrics (cluster state), and a set of default recording rules and alerts.

Access Grafana:
  kubectl port-forward -n monitoring svc/monitoring-grafana 3000:80
  # Open http://localhost:3000 — credentials: admin / prom-operator
  # Change the password immediately in production.

Exposing custom application metrics (Node.js):
  npm install prom-client
  const client = require('prom-client');
  const collectDefaultMetrics = client.collectDefaultMetrics;
  collectDefaultMetrics();
  const httpRequestsTotal = new client.Counter({
    name: 'http_requests_total',
    help: 'Total HTTP requests',
    labelNames: ['method', 'route', 'status_code'],
  });
  const httpDuration = new client.Histogram({
    name: 'http_request_duration_seconds',
    help: 'HTTP request duration',
    labelNames: ['method', 'route'],
    buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 5],
  });

ServiceMonitor — tell Prometheus about your service:
  apiVersion: monitoring.coreos.com/v1
  kind: ServiceMonitor
  metadata:
    name: api-monitor
    namespace: production
    labels:
      release: monitoring
  spec:
    selector:
      matchLabels:
        app: api
    endpoints:
      - port: metrics
        path: /metrics
        interval: 15s

Essential PromQL queries:
  # HTTP request rate over last 5 minutes
  rate(http_requests_total{namespace="production"}[5m])

  # P99 latency
  histogram_quantile(0.99,
    rate(http_request_duration_seconds_bucket{app="api"}[5m])
  )

  # Error rate percentage
  rate(http_requests_total{status_code=~"5.."}[5m])
  / rate(http_requests_total[5m]) * 100

  # Memory usage per Pod
  container_memory_working_set_bytes{namespace="production"}

  # CPU throttling percentage
  rate(container_cpu_throttled_seconds_total[5m])
  / rate(container_cpu_usage_seconds_total[5m]) * 100

  # Pods not ready
  kube_deployment_status_replicas_unavailable{namespace="production"}

Pre-built dashboards:
Import from grafana.com by ID:
  315   Kubernetes cluster overview
  6417  Kubernetes Pod resources
  1860  Node exporter full
  13502 Kubernetes API server
  12611 Kubernetes Persistent Volumes

Recording rules (pre-compute expensive queries):
  apiVersion: monitoring.coreos.com/v1
  kind: PrometheusRule
  metadata:
    name: api-recording-rules
    namespace: monitoring
  spec:
    groups:
      - name: api.rules
        interval: 30s
        rules:
          - record: job:http_requests_total:rate5m
            expr: rate(http_requests_total[5m])