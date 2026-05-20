---
title: "Deployments and ReplicaSets"
order: 2
objectives:
  - "Create a Deployment and explain the Deployment → ReplicaSet → Pod chain."
  - "Roll out a new version safely and roll it back with `kubectl rollout undo`."
  - "Configure `maxSurge` and `maxUnavailable` for the rollout speed you want."
  - "Use labels and selectors correctly (and avoid the 'orphaned ReplicaSet' trap)."
  - "Decide when a Deployment is the wrong choice (use StatefulSet or DaemonSet instead)."
tryIt: "Create a Deployment of `nginx:1.25`. Run `kubectl set image deploy/nginx nginx=nginx:1.26 && kubectl rollout status deploy/nginx`. Now `kubectl rollout history` and `kubectl rollout undo` — you've shipped and reverted in 30 seconds."
takeaways:
  - "A Deployment owns ReplicaSets; the ReplicaSet owns Pods. Three controllers, one story."
  - "Each rollout creates a **new** ReplicaSet — that's how rollback is instant."
  - "`maxSurge: 25%, maxUnavailable: 0` is the safe production default for stateless apps."
  - "Never edit a ReplicaSet directly; change the Deployment and let it cascade."
  - "Stateful or ordered? Use **StatefulSet**. One-per-node agent? Use **DaemonSet**."
quiz:
  - text: "According to the lesson, which ownership chain is correct for a Deployment-managed app?"
    options:
      - "Pod → ReplicaSet → Deployment"
      - "Deployment → ReplicaSet → Pod"
      - "Service → Deployment → Pod"
      - "Deployment → Pod → ReplicaSet"
    correctAnswer: 1
    explanation: "A Deployment manages ReplicaSets over time, and the active ReplicaSet owns the Pods. The lesson calls this the Deployment → ReplicaSet → Pod chain."
  - text: "What change causes Kubernetes to create a brand-new ReplicaSet during a rollout?"
    options:
      - "Changing the Pod template, such as the image or environment variables"
      - "Running kubectl rollout history"
      - "Scaling the Deployment from 3 replicas to 10"
      - "Pausing and resuming the Deployment without any spec changes"
    correctAnswer: 0
    explanation: "The lesson says a new ReplicaSet is created when the Pod template changes. That's what makes versioned rollouts and rollbacks possible."
  - text: "In the lesson's zero-downtime rollout example, what does maxUnavailable: 0 mean?"
    options:
      - "The rollout can never create extra Pods"
      - "No old Pod is removed until a new Pod passes readiness"
      - "Kubernetes skips readiness probes during updates"
      - "Only one Pod may exist during the rollout"
    correctAnswer: 1
    explanation: "The lesson explains that maxUnavailable: 0 keeps existing capacity until replacement Pods are Ready. Combined with surge capacity, that enables zero-downtime updates."
  - text: "If a rollout stalls because new Pods fail readiness probes, what does the lesson recommend as the fastest recovery?"
    options:
      - "Edit the ReplicaSet directly"
      - "Delete all Pods by hand"
      - "Run kubectl rollout undo"
      - "Change the Service selector"
    correctAnswer: 2
    explanation: "The lesson explicitly says kubectl rollout undo gets you back immediately while you investigate. It also warns not to manage ReplicaSets directly."
---

A Deployment is the standard way to run stateless applications in production Kubernetes. It manages a ReplicaSet, which manages Pods, and it handles the entire lifecycle: initial creation, rolling updates, pause and resume, and rollbacks. Understanding how the Deployment controller works underneath saves hours of debugging when rollouts stall.

How the controller loop works:
The Deployment controller watches the desired state you declare and continually reconciles the actual state toward it. When you change the Pod template — image, environment variables, resource limits — the controller creates a new ReplicaSet with the updated template and begins draining the old one according to the update strategy. The old ReplicaSet is kept at zero replicas for rollback purposes until you prune history.

Production-ready Deployment manifest:
  apiVersion: apps/v1
  kind: Deployment
  metadata:
    name: api
    namespace: production
    labels:
      app: api
      team: backend
  spec:
    replicas: 3
    revisionHistoryLimit: 5
    selector:
      matchLabels:
        app: api
    strategy:
      type: RollingUpdate
      rollingUpdate:
        maxSurge: 1
        maxUnavailable: 0
    template:
      metadata:
        labels:
          app: api
          version: "2.1.0"
      spec:
        terminationGracePeriodSeconds: 60
        containers:
          - name: api
            image: myrepo/api:2.1.0
            ports:
              - containerPort: 3000
            resources:
              requests:
                cpu: "250m"
                memory: "256Mi"
              limits:
                cpu: "1"
                memory: "512Mi"
            readinessProbe:
              httpGet:
                path: /health/ready
                port: 3000
              initialDelaySeconds: 5
              periodSeconds: 10
            livenessProbe:
              httpGet:
                path: /health/live
                port: 3000
              periodSeconds: 30

maxSurge and maxUnavailable explained:
maxSurge: 1 allows one extra Pod beyond the desired count during an update — so with replicas: 3 you temporarily have 4. maxUnavailable: 0 means no Pod is taken down until a new one passes its readiness probe. Together these settings give zero-downtime rolling updates. The trade-off is slightly longer rollout time and brief resource overhead. For speed over safety, set maxUnavailable: 1 and maxSurge: 0.

Rollout operations:
  kubectl rollout status deployment/api -n production
  kubectl rollout history deployment/api -n production
  kubectl rollout history deployment/api --revision=3
  kubectl rollout undo deployment/api
  kubectl rollout undo deployment/api --to-revision=2
  kubectl rollout pause deployment/api
  kubectl rollout resume deployment/api

Scaling:
  kubectl scale deployment/api --replicas=10 -n production
  kubectl autoscale deployment/api --cpu-percent=70 --min=3 --max=20

Triggering a rollout without changing the image:
  kubectl rollout restart deployment/api -n production

Deployment vs ReplicaSet vs Pod hierarchy:
Deployment owns multiple ReplicaSets over time (one per unique template). Current ReplicaSet owns Pods. The selector on the Deployment must match the template labels exactly — Kubernetes enforces this to prevent orphaned Pods. Never manage ReplicaSets directly; let the Deployment controller own them.

Common pitfalls:
A readiness probe that is too aggressive (short initialDelaySeconds) kills new Pods before the app finishes booting, causing the rollout to stall. Always set initialDelaySeconds conservatively and watch kubectl describe pod to see probe failures. If a rollout stalls, kubectl rollout undo gets you back immediately while you investigate.

terminationGracePeriodSeconds:
When Kubernetes terminates a Pod it sends SIGTERM. After the grace period it sends SIGKILL. Your application must catch SIGTERM and finish in-flight requests within the grace period. For HTTP servers, combine a preStop: sleep 5 lifecycle hook (to give the load balancer time to remove the endpoint) with a graceful shutdown handler in your code.