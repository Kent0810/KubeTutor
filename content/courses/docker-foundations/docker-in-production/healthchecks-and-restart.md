---
title: "Health Checks and Restart Policies"
order: 1
objectives:
  - "Write a `HEALTHCHECK` instruction with sensible interval, timeout, retries, and start period."
  - "Use restart policies (`no`, `on-failure`, `always`, `unless-stopped`) appropriately."
  - "Pair healthchecks with orchestrator readiness probes."
  - "Distinguish **liveness** (am I alive?) from **readiness** (am I ready for traffic?)."
  - "Avoid the crash-loop death-spiral patterns."
tryIt: "Add `HEALTHCHECK --interval=5s --timeout=2s --start-period=20s --retries=3 CMD curl -fsS http://localhost/health` to your Dockerfile. Run the container and watch `docker ps` — the STATUS column shows `(healthy)` once probes pass."
takeaways:
  - "A healthcheck that's too aggressive (`--interval=1s --retries=1`) will restart healthy containers under load."
  - "Use `--start-period` to give slow-starting apps (JVMs, Rails) time to warm up before probes count."
  - "**Liveness** failures restart the container; **readiness** failures only drop it from load balancing."
  - "Health endpoints should check **dependencies you need**, not just `return 200`."
  - "`restart: unless-stopped` is the right default for production single-host Docker."
quiz:
  - text: "What problem does --start-period solve in a Docker health check?"
    options:
      - "It compresses health-check logs"
      - "It gives slow-starting applications time to warm up before failures count"
      - "It makes restart policies exponential"
      - "It disables readiness probes"
    correctAnswer: 1
    explanation: "The lesson says slow starters like JVM or Rails apps need a warm-up window. start-period prevents early probe failures from marking a healthy startup as unhealthy."
  - text: "How does the lesson distinguish readiness from liveness?"
    options:
      - "Readiness restarts the container; liveness only removes it from traffic"
      - "Readiness affects load balancing, while liveness failures trigger restarts"
      - "They are synonyms in Docker and Compose"
      - "Readiness is only for databases, liveness is only for web servers"
    correctAnswer: 1
    explanation: "The takeaways say readiness failures remove a service from load balancing, while liveness failures restart the container. The text emphasizes these are different operational signals."
  - text: "Which restart policy does the lesson call the practical default for long-running single-host services?"
    options:
      - "no"
      - "on-failure"
      - "always"
      - "unless-stopped"
    correctAnswer: 3
    explanation: "Both the takeaways and restart policy section recommend unless-stopped for simple production services on a single host. It survives daemon restarts but still respects manual stops."
  - text: "Why are restart policies alone not enough for a crashing application?"
    options:
      - "Because Docker ignores them when a health check exists"
      - "Because crash loops can still thrash CPU, flood logs, and hammer dependencies"
      - "Because restart policies only work in Kubernetes"
      - "Because they disable graceful shutdown"
    correctAnswer: 1
    explanation: "The lesson warns that restart policies are useful but not a substitute for fixing the root cause. A fast crash loop can still create operational damage even if the container keeps restarting."
---

Health checks and restart policies are the difference between a container that merely starts and a container that behaves well in production. Without them, zombie processes can sit there serving nothing, apps can start before dependencies are ready, and failed containers can churn forever without a clear signal to operators.

Why health checks matter:
A process existing is not the same as a service being usable. Your web server may have bound a port but not connected to the database, warmed caches, or loaded migrations. Health checks let the runtime distinguish between starting, healthy, and unhealthy states.

Dockerfile HEALTHCHECK:
HEALTHCHECK runs a command inside the container on a schedule. Exit code 0 means healthy, 1 means unhealthy, and 2 is reserved in some contexts for starting or unknown behavior but is best avoided in custom scripts unless you fully control the logic.

HTTP, TCP, and script examples:
  HEALTHCHECK --interval=30s --timeout=3s --start-period=20s --retries=3 CMD curl -fsS http://127.0.0.1:3000/health || exit 1
  HEALTHCHECK --interval=10s --timeout=2s --retries=5 CMD nc -z 127.0.0.1 5432 || exit 1
  HEALTHCHECK CMD ["/app/healthcheck.sh"]

Database-specific examples:
  HEALTHCHECK CMD pg_isready -U app -d app || exit 1
  HEALTHCHECK CMD redis-cli ping | grep PONG || exit 1

Health states:
A container begins in starting when a health check exists. After enough successful checks it becomes healthy. After enough failures it becomes unhealthy. Docker itself does not automatically replace unhealthy containers unless combined with orchestrator behavior or explicit restart logic.

Restart policies:
The major policies are no, on-failure, always, and unless-stopped. no is the default. on-failure is appropriate for batch jobs that should retry on errors. always restarts even after clean exit. unless-stopped is a practical default for long-running services on single hosts because it survives daemon restarts but respects manual stops.

Restart examples:
  docker run -d --restart=unless-stopped my-api:latest
  docker run --rm --restart=on-failure:5 my-batch:latest

Pitfalls of restart loops:
Docker does not give you Kubernetes-style exponential backoff semantics for every case. A crashing process can still thrash CPU, flood logs, and hammer dependencies. Restart policies are useful, but they are not a substitute for fixing the root cause or adding sensible startup guards.

Compose health and dependency wiring:
Compose supports full health-check syntax and service_healthy dependency conditions. This is the correct way to wait for slow-starting systems such as Postgres or JVM apps.

Compose example:
  services:
    db:
      image: postgres:16
      healthcheck:
        test: ["CMD-SHELL", "pg_isready -U app -d app"]
        interval: 5s
        timeout: 3s
        retries: 10
        start_period: 10s

    app:
      build: .
      depends_on:
        db:
          condition: service_healthy
      restart: unless-stopped
      healthcheck:
        test: ["CMD-SHELL", "curl -fsS http://127.0.0.1:3000/health || exit 1"]
        interval: 10s
        timeout: 3s
        retries: 5
        start_period: 20s

Graceful shutdown:
When Docker stops a container, it sends SIGTERM, waits, then sends SIGKILL. Your app should trap SIGTERM and shut down cleanly. Tiny init systems such as tini or dumb-init help with signal forwarding and zombie reaping.

Signal handling example:
  process.on('SIGTERM', async () => {
    await server.close()
    process.exit(0)
  })

Tini usage:
  docker run --init -d my-api:latest

Common pitfalls:
- Checking health too early and flapping healthy services into unhealthy.
- Using restart: always for short-lived jobs that should exit once.
- Forgetting signal handling in PID 1 processes.
- Assuming unhealthy automatically means replaced everywhere.

Pro tips:
- Make health endpoints cheap and dependency-aware.
- Use start_period for slow boots.
- Prefer unless-stopped for simple single-host services.
- Add tini or another init wrapper when your app runtime handles signals poorly.

Health checks and restart policies are small features with outsized operational payoff.