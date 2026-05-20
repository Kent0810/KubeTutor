---
title: "ConfigMaps in Depth"
order: 1
objectives:
  - "Create ConfigMaps from literals, files, and directories."
  - "Mount a ConfigMap as files or inject it as environment variables."
  - "Understand the propagation delay when a mounted ConfigMap changes."
  - "Version ConfigMaps to force rollouts when configuration changes."
  - "Avoid the most common ConfigMap anti-patterns."
tryIt: "Mount a ConfigMap as a volume and `kubectl edit cm` to change a value. Watch `kubectl exec <pod> -- cat /etc/config/foo` — the file updates within ~60s. Now mount it as `env:` — the env var **never** updates without a Pod restart."
takeaways:
  - "Mounted ConfigMap files **update in place** (~60s lag); env-var injections do **not** update until restart."
  - "Don't store secrets in a ConfigMap. Use a Secret. They're the same shape; the difference is intent and RBAC."
  - "Append a hash of the data to the ConfigMap name (or annotation) to force a rollout on change."
  - "ConfigMaps have a **1 MiB** size limit — split big configs or use a Volume."
  - "Use `immutable: true` for ConfigMaps that should never change; it improves API server performance too."
quiz:
  - text: "Which ConfigMap consumption pattern updates inside a running Pod after the ConfigMap is edited?"
    options:
      - "configMapKeyRef environment variables"
      - "envFrom environment variables"
      - "A ConfigMap mounted as a volume"
      - "None of them update until the Pod restarts"
    correctAnswer: 2
    explanation: "The lesson says mounted ConfigMap files update in place after roughly the kubelet sync period. Environment-variable injections do not refresh without a Pod restart."
  - text: "Why does the lesson recommend appending a hash to the ConfigMap name or annotation?"
    options:
      - "To bypass the 1 MiB size limit"
      - "To force a rollout when configuration changes"
      - "To convert the ConfigMap into a Secret"
      - "To make envFrom update live"
    correctAnswer: 1
    explanation: "A hashed name or annotation changes the Pod template reference, which forces Kubernetes to roll new Pods. This is the lesson's recommended way to ensure config changes are deployed cleanly."
  - text: "What does immutable: true do on a ConfigMap?"
    options:
      - "Encrypts the ConfigMap at rest"
      - "Prevents all Pods from mounting it read-write"
      - "Prevents data changes, requiring a new ConfigMap name for updates"
      - "Makes env vars refresh instantly"
    correctAnswer: 2
    explanation: "The lesson explains that immutable ConfigMaps cannot be modified in place. To update them, you create a new ConfigMap and point workloads at the new name."
  - text: "What is the size limit called out in the lesson for a single ConfigMap?"
    options:
      - "64 KiB"
      - "256 KiB"
      - "1 MiB"
      - "10 MiB"
    correctAnswer: 2
    explanation: "The lesson warns that ConfigMaps have a 1 MiB size limit. Large configuration should be split up or handled with a different storage mechanism."
---

ConfigMaps are the primary mechanism for injecting non-sensitive configuration into Kubernetes workloads. They decouple configuration from the container image, enabling the same image to run across development, staging, and production with nothing changing except the ConfigMap. Understanding the difference between the three consumption patterns — environment variables, envFrom, and volume mounts — determines whether your config updates require a Pod restart or take effect live.

Why decoupling configuration matters:
Without ConfigMaps, teams bake environment-specific values into their images, requiring a rebuild for every config change. ConfigMaps let you build once and configure per environment. They also make the configuration auditable in Git when combined with tools like Flux or ArgoCD.

Creating ConfigMaps:
  # From literal values
  kubectl create configmap app-config \
    --from-literal=APP_ENV=production \
    --from-literal=LOG_LEVEL=info \
    --from-literal=PORT=3000

  # From a file
  kubectl create configmap nginx-conf --from-file=nginx.conf

  # From a directory (all files become keys)
  kubectl create configmap app-configs --from-file=./config/

Declarative ConfigMap with multi-value data:
  apiVersion: v1
  kind: ConfigMap
  metadata:
    name: app-config
    namespace: production
  data:
    APP_ENV: production
    LOG_LEVEL: info
    FEATURE_FLAGS: "new-checkout,dark-mode"
    app.properties: |
      server.port=3000
      server.compression=true
      db.pool.min=2
      db.pool.max=20
    nginx.conf: |
      server {
        listen 80;
        location /health { return 200 "ok"; }
        location / { proxy_pass http://localhost:3000; }
      }

Consuming as environment variables (single keys):
  env:
    - name: APP_ENV
      valueFrom:
        configMapKeyRef:
          name: app-config
          key: APP_ENV
    - name: LOG_LEVEL
      valueFrom:
        configMapKeyRef:
          name: app-config
          key: LOG_LEVEL

Consuming with envFrom (all keys at once):
  envFrom:
    - configMapRef:
        name: app-config
  This injects every key as an environment variable. Simpler but less explicit.

Consuming as a volume mount (enables live updates):
  volumes:
    - name: config-vol
      configMap:
        name: app-config
        items:
          - key: nginx.conf
            path: nginx.conf
  containers:
    - name: nginx
      volumeMounts:
        - name: config-vol
          mountPath: /etc/nginx/conf.d
          readOnly: true

Update behavior — the critical distinction:
When you update a ConfigMap, Pods that consume it as environment variables (env or envFrom) do NOT see the change until the Pod is restarted. Pods that consume it as a volume mount see the updated file within approximately 60 seconds (the kubelet sync period). For immediate updates, combine volume mounts with an application that watches for file changes using inotify or a polling loop.

Immutable ConfigMaps:
  immutable: true
Setting this on a ConfigMap prevents any changes to its data. The only way to update is to create a new ConfigMap with a new name and update the Pods to reference it. This pattern eliminates an entire class of accidental mutations in production and improves API server performance in large clusters by reducing watch events.

Practical management commands:
  kubectl get configmap app-config -n production -o yaml
  kubectl edit configmap app-config -n production
  kubectl describe configmap app-config -n production
  kubectl delete configmap app-config -n production
  kubectl diff -f app-config.yaml   See changes before applying

GitOps best practice:
Store ConfigMaps in Git alongside your application manifests. Use Kustomize overlays or Helm values files to parameterize per-environment values. This gives you full audit history, review processes, and rollback for configuration changes — not just code changes.