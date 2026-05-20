---
title: "Resource Limits and Production Checklist"
order: 2
objectives:
  - "Set memory and CPU limits with `--memory` and `--cpus` (and the Compose equivalents)."
  - "Understand OOMKilled and how Linux decides what to kill."
  - "Pin log drivers and rotate logs to avoid disk-full incidents."
  - "Apply a production readiness checklist to every image and container."
  - "Plan for capacity, not just correctness."
tryIt: "Run `docker run --memory=64m --memory-swap=64m python:3 python -c 'a=[0]*10**8'`. The process gets OOMKilled within seconds; `docker inspect` shows `OOMKilled: true`. Memory limits are not suggestions."
takeaways:
  - "**Always** set both `--memory` and `--cpus`. Unlimited containers eventually starve the host."
  - "`OOMKilled` is the kernel saving the host — fix the leak or raise the limit, don't disable OOM."
  - "Default log driver writes JSON forever. Configure `max-size`/`max-file` or ship logs elsewhere."
  - "Production checklist: non-root user, read-only fs, dropped caps, resource limits, healthcheck, log rotation."
  - "Capacity planning means leaving headroom: target ~70% utilisation, not 100%."
quiz:
  - text: "Why does the lesson insist on setting both --memory and --cpus for production containers?"
    options:
      - "Because unlimited containers eventually compete with and starve the host"
      - "Because Docker refuses to start without both flags"
      - "Because those flags automatically enable health checks"
      - "Because it is required for multi-stage builds"
    correctAnswer: 0
    explanation: "The takeaways say unlimited containers eventually starve the host. Resource limits turn a correct image into a safer production workload with defined boundaries."
  - text: "What does OOMKilled mean in the context of this lesson?"
    options:
      - "The container exited cleanly after freeing memory"
      - "The kernel killed the container to protect the host from memory exhaustion"
      - "Docker removed old images to make room on disk"
      - "The log driver rotated the container output"
    correctAnswer: 1
    explanation: "The lesson frames OOMKilled as the kernel saving the host under memory pressure. The fix is to reduce memory usage or raise the limit, not disable OOM killing."
  - text: "What is the main risk of leaving the default json-file log driver unbounded?"
    options:
      - "It makes containers run as root"
      - "It can silently fill the disk unless you set max-size and max-file or ship logs elsewhere"
      - "It prevents docker stats from working"
      - "It disables restart policies"
    correctAnswer: 1
    explanation: "The logging section warns that unbounded json-file logs can cause disk-full incidents. The recommended mitigation is rotation settings or a managed log driver."
  - text: "Which statement best matches the lesson's production readiness checklist?"
    options:
      - "A correct image is enough if the app passes tests"
      - "Production readiness includes non-root, read-only fs where practical, limits, health checks, and log handling"
      - "Only CPU limits matter if memory leaks are rare"
      - "Labels and observability are optional nice-to-haves"
    correctAnswer: 1
    explanation: "The lesson presents both a Dockerfile checklist and a runtime checklist. It emphasizes security defaults, resource controls, observability, and recovery settings together."
---

Production containers need more than a correct image; they need sane runtime boundaries. Without resource limits, logging controls, labels, and security defaults, one noisy service can destabilize an entire host. The mindset is simple: containers should be immutable, ephemeral, observable, and constrained.

Memory limits:
--memory is a hard limit. --memory-reservation is a softer signal used under contention. --memory-swap controls memory plus swap behavior. You should almost never use --oom-kill-disable because a container that cannot be killed can take the host down instead.

Memory-constrained runtime:
  docker run -d \
    --name api \
    --memory=512m \
    --memory-reservation=256m \
    --memory-swap=512m \
    --cpus=1.0 \
    --pids-limit=256 \
    --ulimit nofile=65535:65535 \
    --restart=unless-stopped \
    my-api:latest

CPU limits:
--cpus is the easiest way to cap CPU usage. --cpu-shares is a relative weight, not a hard ceiling. --cpuset-cpus pins a workload to specific cores, which can help performance-sensitive or NUMA-aware systems but should be used intentionally.

CPU examples:
  docker run --cpus=0.5 my-worker:latest
  docker run --cpu-shares=2048 my-batch:latest
  docker run --cpuset-cpus=0,1 my-latency-sensitive:latest

PID limits and ulimits:
PID limits prevent fork bombs and accidental process explosions. ulimits control file descriptors, processes, and more. High-connection servers such as nginx and Node.js often need a nofile increase.

Compose resources:
  services:
    api:
      image: my-api:latest
      deploy:
        resources:
          limits:
            cpus: '1.00'
            memory: 512M
          reservations:
            memory: 256M
      logging:
        driver: json-file
        options:
          max-size: '10m'
          max-file: '5'

cgroup v2 and OOM:
Modern Linux systems increasingly use cgroup v2. That changes some accounting details and is worth verifying with docker info. When a container is OOMKilled, inspect whether the limit is wrong, the workload leaked memory, or the runtime footprint was underestimated. Linux chooses OOM victims using heuristics including oom_score_adj and overall memory pressure.

Logging configuration:
Unbounded json-file logs can fill disks silently. Set max-size and max-file, or use a remote log driver when appropriate. Containers should write to stdout and stderr; avoid writing logs into the container filesystem unless you have a deliberate collection pattern.

Dockerfile checklist template:
  FROM node:20-bookworm-slim
  WORKDIR /app
  COPY package.json package-lock.json ./
  RUN npm ci --omit=dev
  COPY . .
  RUN useradd --system --uid 10001 appuser && chown -R appuser:appuser /app
  USER 10001
  LABEL org.opencontainers.image.source="https://github.com/example/api"
  LABEL org.opencontainers.image.description="Production API"
  EXPOSE 3000
  HEALTHCHECK CMD node -e "fetch('http://127.0.0.1:3000/health').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"
  CMD ["node", "server.js"]

Runtime checklist:
- Non-root user configured and verified.
- Read-only root filesystem where practical.
- Memory, CPU, PID, and file descriptor limits set.
- Health check and restart policy defined.
- Ports published only where required.
- Secrets injected at runtime, not baked into the image.
- Logs flowing to stdout or a managed driver.
- Labels present for service, owner, repo, revision, and environment.

Verification script:
  #!/usr/bin/env bash
  set -euo pipefail
  container="$1"
  docker inspect "$container" | jq '.[0] | {
    user: .Config.User,
    restart: .HostConfig.RestartPolicy,
    readonly: .HostConfig.ReadonlyRootfs,
    memory: .HostConfig.Memory,
    cpus: .HostConfig.NanoCpus,
    pids: .HostConfig.PidsLimit,
    log: .HostConfig.LogConfig,
    health: .State.Health
  }'

Monitoring:
Use docker stats for a quick local view, but production systems need longer-term metrics from cAdvisor, Prometheus, Datadog, New Relic, or similar tools. Resource limits are only useful if you also observe how close workloads run to them.

Common pitfalls:
- Setting no limits because the host is "big enough."
- Disabling OOM kills instead of fixing leaks.
- Letting logs grow without rotation.
- Using Compose deploy.resources locally and assuming the same semantics everywhere.

Pro tips:
- Start with conservative limits and measure.
- Keep environment tags out of image content and in labels or deployment metadata.
- Review OOMKilled events like real incidents.
- Turn the checklist into automated policy, not tribal knowledge.

A production container is not just a running process. It is a constrained, observable, recoverable unit of delivery.