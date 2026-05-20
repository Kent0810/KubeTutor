---
title: "Rolling Deployments and Canary Releases"
order: 1
objectives:
  - "Configure rolling updates with `maxSurge` and `maxUnavailable`."
  - "Implement a canary release manually or with Argo Rollouts / Flagger."
  - "Pair canaries with metric-based promotion gates."
  - "Roll back fast with `kubectl rollout undo` and Argo Rollouts."
  - "Distinguish blue-green, canary, and progressive delivery patterns."
tryIt: "Install Argo Rollouts. Convert one Deployment to a `Rollout` with `steps: [setWeight: 20, pause: {duration: 30s}, setWeight: 50, pause: {}]`. Trigger a rollout — promotion pauses until you `kubectl argo rollouts promote`. That's controlled blast radius."
takeaways:
  - "Plain Deployments do **rolling updates** — fine for low-risk changes."
  - "**Canary** = same Service, weighted traffic to new version. **Blue-green** = swap Services."
  - "Auto-promote canaries based on **metrics**, not time — Flagger and Argo Rollouts do this."
  - "Always test rollback before you need it. `kubectl rollout undo` should be muscle memory."
  - "Progressive delivery = canary + feature flags + metric gates. The modern production default."
quiz:
  - text: "In the rollout example with replicas: 5, `maxSurge: 1`, and `maxUnavailable: 0`, what happens first?"
    options:
      - "Kubernetes deletes an old Pod before creating a new one."
      - "Kubernetes creates one new Pod and waits for readiness before removing any old Pod."
      - "Kubernetes immediately shifts all Service traffic to the new ReplicaSet."
      - "Kubernetes pauses the rollout until you run `kubectl rollout resume`."
    correctAnswer: 1
    explanation: "The lesson walks through the step-by-step mechanics: first add one new Pod, then wait for readiness, then remove an old Pod. `maxUnavailable: 0` is what prevents dropping capacity first."
  - text: "Why does the lesson set `minReadySeconds: 10` on the Deployment?"
    options:
      - "To delay image pulls until 10 seconds after scheduling"
      - "To force every Pod to restart after 10 seconds"
      - "To require a Pod to stay ready for 10 continuous seconds before it counts as available"
      - "To make `kubectl rollout undo` wait exactly 10 seconds"
    correctAnswer: 2
    explanation: "The lesson explains that `minReadySeconds` protects against Pods that pass an initial check and then fail quickly under real load. Availability is only counted after 10 continuous healthy seconds."
  - text: "In the manual blue-green example, what action actually flips live traffic to green?"
    options:
      - "Deleting the blue Deployment"
      - "Patching the Service selector to point at `version: green`"
      - "Running `kubectl rollout undo` on the blue Deployment"
      - "Changing `maxSurge` from 2 to 0"
    correctAnswer: 1
    explanation: "The lesson's blue-green sequence keeps green running alongside blue, then switches the Service selector. That selector change is what moves traffic instantly."
  - text: "What does the lesson describe as the modern production default for progressive delivery?"
    options:
      - "Rolling updates with no readiness probes"
      - "Blue-green only, without metric checks"
      - "Canary plus feature flags plus metric gates"
      - "Manual `kubectl apply` followed by a smoke test"
    correctAnswer: 2
    explanation: "One takeaway explicitly defines progressive delivery as canary plus feature flags plus metric gates. The lesson presents that combination as the modern default in production."
---

Shipping software to production without downtime is a solved problem in Kubernetes — but only if you configure your Deployment correctly and understand the mechanics. This lesson covers the full spectrum: zero-downtime rolling updates, instant rollbacks, blue-green switching, and canary releases that gradually shift traffic with real safety signals.

Rolling update mechanics deep dive:
Kubernetes computes the rollout as a series of steps. With replicas: 5, maxSurge: 1, maxUnavailable: 0:
  Step 1: Create 1 new Pod (now 6 total, 5 old + 1 new). Wait for readiness.
  Step 2: Terminate 1 old Pod (back to 5 total: 4 old + 1 new).
  Step 3: Repeat until all 5 are new generation.
If any new Pod fails its readiness probe, the rollout pauses. No more old Pods are removed until the new Pod becomes healthy or you intervene.

Complete Deployment with production rolling update settings:
  apiVersion: apps/v1
  kind: Deployment
  metadata:
    name: api
    namespace: production
    annotations:
      deployment.kubernetes.io/change-cause: "v2.1.0: Add payment provider retry logic"
  spec:
    replicas: 5
    revisionHistoryLimit: 10
    strategy:
      type: RollingUpdate
      rollingUpdate:
        maxSurge: 2
        maxUnavailable: 0
    minReadySeconds: 10
    template:
      spec:
        terminationGracePeriodSeconds: 60
        containers:
          - name: api
            image: myrepo/api:2.1.0
            readinessProbe:
              httpGet:
                path: /health/ready
                port: 3000
              initialDelaySeconds: 5
              periodSeconds: 5
              successThreshold: 2
              failureThreshold: 3
            lifecycle:
              preStop:
                exec:
                  command: ["/bin/sh", "-c", "sleep 10"]

minReadySeconds: 10 means a Pod must pass readiness for 10 continuous seconds before Kubernetes considers it available for the next step. This catches applications that pass the initial health check but fail under real load.

Rollout commands:
  kubectl rollout status deployment/api -n production --timeout=10m
  kubectl rollout history deployment/api -n production
  kubectl rollout history deployment/api --revision=5 -n production
  kubectl rollout undo deployment/api -n production
  kubectl rollout undo deployment/api --to-revision=3 -n production
  kubectl rollout pause deployment/api -n production
  kubectl rollout resume deployment/api -n production

Blue-green deployment (manual):
  # Blue is live. Deploy green alongside:
  kubectl apply -f deployment-green.yaml   # name: api-green, same labels except version: green
  kubectl rollout status deployment/api-green -n production
  # Switch the Service selector to green:
  kubectl patch service api-svc -n production \
    -p '{"spec":{"selector":{"app":"api","version":"green"}}}'
  # Instant traffic switch. Keep blue running for quick rollback.
  # After validation, delete blue:
  kubectl delete deployment api-blue -n production

Canary deployment with Argo Rollouts:
Argo Rollouts extends the Deployment API with weight-based canary and blue-green rollout strategies, integration with Prometheus for automated analysis, and a kubectl plugin for management.
  apiVersion: argoproj.io/v1alpha1
  kind: Rollout
  metadata:
    name: api
    namespace: production
  spec:
    replicas: 10
    strategy:
      canary:
        steps:
          - setWeight: 10    # 10% of traffic to canary
          - pause: { duration: 5m }
          - analysis:
              templates:
                - templateName: error-rate-check
          - setWeight: 50
          - pause: { duration: 10m }
          - setWeight: 100
        canaryMetadata:
          labels:
            version: canary
        stableMetadata:
          labels:
            version: stable

Feature flags as an alternative:
For truly risk-free releases, use feature flags (LaunchDarkly, Unleash, Flagsmith) to decouple code deployment from feature activation. Ship the code to all Pods, then gradually enable the feature for a percentage of users in your flag dashboard — with instant kill-switch, no kubectl required.