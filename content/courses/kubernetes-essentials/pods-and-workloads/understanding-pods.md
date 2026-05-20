---
title: "Understanding Pods"
order: 1
objectives:
  - "Describe the shared network and storage model of a Pod."
  - "Explain the role of **init containers** and **sidecars**."
  - "Tune `requests` and `limits` so the scheduler and kernel cooperate."
  - "Choose between **readiness**, **liveness**, and **startup** probes."
  - "Explain why production workloads almost always use a controller (Deployment, StatefulSet, DaemonSet) instead of raw Pods."
tryIt: "Run `kubectl explain pod.spec` and `kubectl explain pod.spec.containers.resources` to explore the live API. Then `kubectl run demo --image=nginx --dry-run=client -o yaml` and read the generated spec — every default the API server filled in for you is worth knowing."
takeaways:
  - "All containers in a Pod share **network** and **IPC** namespaces — they talk over `localhost`."
  - "**Requests** drive scheduling; **limits** are enforced by the kernel cgroup at runtime."
  - "A **readiness** failure removes a Pod from a Service; a **liveness** failure restarts the container."
  - "Use **init containers** for one-shot pre-start work (migrations, secret fetches, waiting on deps)."
  - "Production = controllers, not raw Pods. Pods are the *unit of work*; controllers are the *unit of operation*."
quiz:
  - text: "How do containers inside the same Pod communicate with each other according to the lesson?"
    options:
      - "Through an external LoadBalancer only"
      - "Over localhost because they share the Pod's network namespace and IP"
      - "Only through separate Services"
      - "They cannot talk directly unless hostNetwork is enabled"
    correctAnswer: 1
    explanation: "The lesson explains that all containers in a Pod share the same network namespace. That means they see the same loopback interface and Pod IP, so localhost works between them."
  - text: "What is an init container meant to do?"
    options:
      - "Handle traffic after the main app shuts down"
      - "Run one-shot setup work before application containers start"
      - "Replace readiness probes for slow boots"
      - "Expose the Pod to the cluster network"
    correctAnswer: 1
    explanation: "Init containers run to completion before the main containers start. The lesson lists migrations, waiting on dependencies, cache warm-up, and secret fetching as common examples."
  - text: "Which statement correctly matches requests and limits in Kubernetes?"
    options:
      - "Requests are ignored by the scheduler, and limits control Service routing"
      - "Requests drive scheduling, while limits are enforced at runtime by cgroups"
      - "Requests restart crashed containers, while limits remove Pods from Services"
      - "Requests and limits are only metadata for kubectl describe"
    correctAnswer: 1
    explanation: "The takeaways say requests guide scheduling and limits are enforced by the kernel at runtime. The lesson adds that memory overages trigger OOM kills while CPU overages are throttled."
  - text: "Why does the lesson say production workloads usually use controllers instead of raw Pods?"
    options:
      - "Controllers make Pods cheaper to run"
      - "Raw Pods are not rescheduled if their node fails"
      - "Controllers are required for readiness probes to work"
      - "Pods cannot mount volumes without a Deployment"
    correctAnswer: 1
    explanation: "The final section says raw Pods are rarely used directly in production because they are not rescheduled on node failure. Controllers like Deployments and StatefulSets provide operational reliability."
---

The Pod is the atom of Kubernetes. Everything else — Deployments, StatefulSets, DaemonSets — is machinery built on top of it. Understanding Pods deeply is the single most important foundation for operating Kubernetes confidently, because every failure, every resource contention, and every networking mystery ultimately traces back to what happens inside one.

What a Pod actually is:
A Pod is a group of one or more containers that share a network namespace, a UTS namespace (hostname), and optionally a set of Volumes. Sharing a network namespace means every container in the Pod sees the same loopback interface and the same IP address. Container A on port 8080 and Container B on port 9090 are both reachable at the same Pod IP. They talk to each other over localhost. This co-location model enables tightly coupled patterns like a log shipper reading from the same filesystem as the application, or an Envoy sidecar intercepting the application's traffic.

Full production Pod spec:
  apiVersion: v1
  kind: Pod
  metadata:
    name: api-server
    namespace: production
    labels:
      app: api
      version: v2.1.0
    annotations:
      prometheus.io/scrape: "true"
      prometheus.io/port: "9090"
  spec:
    serviceAccountName: api-sa
    securityContext:
      runAsNonRoot: true
      runAsUser: 1000
      fsGroup: 2000
    initContainers:
      - name: db-migration
        image: myrepo/api:v2.1.0
        command: ["npx", "prisma", "migrate", "deploy"]
        envFrom:
          - secretRef:
              name: db-credentials
    containers:
      - name: api
        image: myrepo/api:v2.1.0
        ports:
          - containerPort: 3000
            name: http
          - containerPort: 9090
            name: metrics
        envFrom:
          - configMapRef:
              name: api-config
          - secretRef:
              name: db-credentials
        resources:
          requests:
            cpu: "250m"
            memory: "256Mi"
          limits:
            cpu: "1000m"
            memory: "512Mi"
        readinessProbe:
          httpGet:
            path: /health/ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 10
          failureThreshold: 3
        livenessProbe:
          httpGet:
            path: /health/live
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 30
        lifecycle:
          preStop:
            exec:
              command: ["/bin/sh", "-c", "sleep 5"]

The init container pattern:
Init containers run to completion before any application container starts. They share the same volumes but have their own image. Common uses: run database migrations, pre-populate caches, wait for dependencies to be ready, fetch secrets from Vault. If an init container fails, Kubernetes restarts the whole Pod, never starting the main containers.

Probes explained:
Kubernetes uses three probe types. Readiness probes control whether a Pod receives traffic — a Pod failing its readiness check is removed from Service endpoints but stays running. Liveness probes restart the container if it becomes unresponsive or deadlocked. Startup probes protect slow-starting applications from being killed by liveness probes before they finish initializing.

Resource requests vs limits:
Requests are what the scheduler uses to find a node with enough capacity. Limits are enforced at runtime by the kernel cgroup. If a container exceeds its memory limit it is OOM-killed immediately. If it exceeds its CPU limit it is throttled, not killed. Setting requests without limits is dangerous in shared clusters — one runaway process can starve neighbours.

Essential kubectl commands:
  kubectl apply -f pod.yaml
  kubectl get pods -n production -o wide
  kubectl describe pod api-server -n production
  kubectl logs api-server -c api --follow
  kubectl exec -it api-server -c api -- /bin/sh
  kubectl top pod api-server
  kubectl delete pod api-server --grace-period=0

Pod lifecycle phases:
Pending means the scheduler has not placed it yet, or init containers are running. Running means all containers started. Succeeded means all containers exited with code 0 (batch jobs). Failed means at least one container exited with non-zero. Unknown usually means the node stopped reporting.

Why you rarely create raw Pods in production:
Raw Pods are not rescheduled if their node fails. You always wrap them in a controller: Deployment for stateless apps, StatefulSet for ordered stateful apps, DaemonSet for node-level agents, Job for batch tasks, CronJob for scheduled tasks.