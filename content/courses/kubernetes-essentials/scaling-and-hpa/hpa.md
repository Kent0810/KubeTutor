---
title: "Manual Scaling and HPA"
order: 1
objectives:
  - "Scale a Deployment manually with `kubectl scale`."
  - "Configure a HorizontalPodAutoscaler driven by CPU and memory."
  - "Use custom and external metrics with the metrics adapter."
  - "Tune HPA stabilisation windows and scaling policies."
  - "Combine HPA with VPA and Cluster Autoscaler safely."
tryIt: "Apply `kubectl autoscale deploy web --min=2 --max=10 --cpu-percent=70`. Generate load with `kubectl run -it --rm load --image=busybox -- /bin/sh -c 'while true; do wget -qO- http://web; done'`. Watch `kubectl get hpa -w` — pod count rises, then settles."
takeaways:
  - "HPA needs **`resources.requests`** to compute utilisation — without it, HPA does nothing."
  - "`metrics-server` is the prerequisite. No metrics, no autoscaling."
  - "The default cool-down (`stabilizationWindowSeconds`) prevents flapping — don't set it to zero."
  - "Custom metrics (req/sec, queue depth) almost always scale better than CPU."
  - "**Never** combine HPA and VPA on the same metric (CPU) — they will fight."
quiz:
  - text: "What prerequisite does the lesson name for CPU and memory-based HPA to work?"
    options:
      - "CoreDNS"
      - "metrics-server"
      - "ingress-nginx"
      - "kube-state-metrics only"
    correctAnswer: 1
    explanation: "The lesson says HPA depends on metrics-server. Without it, kubectl top and CPU or memory autoscaling will fail."
  - text: "Why must containers have resources.requests set when using HPA on CPU utilization?"
    options:
      - "Requests are needed to compute utilization against current usage"
      - "Requests tell kube-proxy which Pod should receive traffic"
      - "Requests are required only for custom metrics, not CPU"
      - "Requests prevent ReplicaSets from being created"
    correctAnswer: 0
    explanation: "The lesson explains HPA calculates CPU utilization as current usage divided by requested CPU. No request means Kubernetes cannot compute the metric correctly."
  - text: "What is the purpose of a scaleDown stabilizationWindowSeconds value like 300 in the lesson's example?"
    options:
      - "To wait before removing Pods so traffic lulls do not cause flapping"
      - "To pause all scaling for five hours after startup"
      - "To force a rollout restart every five minutes"
      - "To make HPA ignore custom metrics permanently"
    correctAnswer: 0
    explanation: "The lesson says a longer scale-down window prevents HPA from shrinking too quickly during brief quiet periods. It helps the system avoid oscillating up and down."
  - text: "Why does the lesson warn against using HPA and VPA on CPU for the same workload?"
    options:
      - "They both require the same Service account name"
      - "They will fight each other over the same metric"
      - "VPA disables kubectl scale commands permanently"
      - "HPA cannot target Deployments when VPA exists"
    correctAnswer: 1
    explanation: "The lesson says HPA and VPA can work together only when they are not driving off the same signal. If both react to CPU, they can interfere with each other's decisions."
---

Kubernetes workloads need to handle traffic patterns that vary by orders of magnitude — a flash sale, a viral post, a nightly batch run. The HorizontalPodAutoscaler automates replica management by watching metrics and adjusting Pod count to match demand. Getting HPA right means understanding not just the API, but the metrics pipeline behind it.

Prerequisites — metrics-server:
HPA requires the Kubernetes metrics-server to be installed. Without it, kubectl top and HPA on CPU/memory both fail silently.
  kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
  kubectl top nodes
  kubectl top pods -n production

Manual scaling reference:
  kubectl scale deployment api --replicas=10 -n production
  kubectl scale deployment api --replicas=3 -n production

Production HPA using the v2 API:
  apiVersion: autoscaling/v2
  kind: HorizontalPodAutoscaler
  metadata:
    name: api-hpa
    namespace: production
  spec:
    scaleTargetRef:
      apiVersion: apps/v1
      kind: Deployment
      name: api
    minReplicas: 3
    maxReplicas: 50
    metrics:
      - type: Resource
        resource:
          name: cpu
          target:
            type: Utilization
            averageUtilization: 70
      - type: Resource
        resource:
          name: memory
          target:
            type: AverageValue
            averageValue: 400Mi
    behavior:
      scaleUp:
        stabilizationWindowSeconds: 30
        policies:
          - type: Percent
            value: 100
            periodSeconds: 60
      scaleDown:
        stabilizationWindowSeconds: 300
        policies:
          - type: Pods
            value: 2
            periodSeconds: 60

Scaling behavior explained:
The scaleUp stabilizationWindowSeconds: 30 means HPA waits 30 seconds of sustained high load before adding replicas, avoiding flapping from transient spikes. scaleDown stabilizationWindowSeconds: 300 means it waits 5 minutes before removing Pods, preventing scale-down during a lull in a still-active traffic pattern.

Custom metrics HPA (queue depth example):
KEDA (Kubernetes Event-Driven Autoscaling) extends HPA to scale on any metric — SQS queue length, Kafka lag, Prometheus query results, cron schedule.
  apiVersion: keda.sh/v1alpha1
  kind: ScaledObject
  metadata:
    name: worker-scaledobject
    namespace: production
  spec:
    scaleTargetRef:
      name: worker
    minReplicaCount: 0
    maxReplicaCount: 100
    triggers:
      - type: aws-sqs-queue
        metadata:
          queueURL: https://sqs.us-east-1.amazonaws.com/123/my-queue
          queueLength: "10"
          awsRegion: us-east-1

KEDA can scale to zero, making it ideal for batch workers that should not run at all when the queue is empty.

Vertical Pod Autoscaler (VPA):
VPA adjusts resource requests/limits automatically. It should not be used with HPA on CPU/memory simultaneously, but works well with HPA on custom metrics.
  apiVersion: autoscaling.k8s.io/v1
  kind: VerticalPodAutoscaler
  metadata:
    name: api-vpa
  spec:
    targetRef:
      apiVersion: apps/v1
      kind: Deployment
      name: api
    updatePolicy:
      updateMode: "Auto"

Observing HPA in action:
  kubectl get hpa -n production
  kubectl describe hpa api-hpa -n production
  # Shows current metrics, desired replicas, last scale event, and conditions.
  kubectl get events -n production --sort-by=.metadata.creationTimestamp | grep HPA

Common pitfall — missing resource requests:
HPA calculates CPU utilization as (current CPU usage) / (requested CPU). If a container has no CPU request, Kubernetes cannot compute utilization and HPA will refuse to scale. Always set resource requests on every container in a Deployment that uses HPA.