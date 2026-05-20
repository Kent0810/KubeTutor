---
title: "Introduction to Docker Compose"
order: 1
objectives:
  - "Write a `compose.yaml` file that runs multiple services together."
  - "Use Compose networks and volumes to wire services together cleanly."
  - "Use `depends_on` with `condition: service_healthy` for ordered startup."
  - "Override settings per environment with `compose.override.yaml`."
  - "Decide when Compose is the right tool — and when you should reach for Kubernetes."
tryIt: "Write a `compose.yaml` with a web service and a Postgres service. Add a healthcheck to Postgres and make web `depends_on` it with `condition: service_healthy`. Run `docker compose up` from a clean state — web should never start before Postgres is ready."
takeaways:
  - "Compose is for **local development and small single-host deployments** — use Kubernetes or ECS for multi-host production."
  - "Every service joins a default network named after the project. Service names resolve via DNS."
  - "Healthchecks are how Compose knows a dependency is *ready*, not just *started*."
  - "Use `profiles:` to keep optional services (like a debug UI) out of the default `up`."
  - "`compose.override.yaml` is auto-merged — perfect for per-developer tweaks."
quiz:
  - text: "What does the default Compose network give every service in a project?"
    options:
      - "A dedicated host port on `127.0.0.1`"
      - "Automatic DNS resolution by service name"
      - "A separate Docker daemon per service"
      - "A global overlay spanning multiple hosts"
    correctAnswer: 1
    explanation: "The lesson says every service joins a default network named after the project, and service names resolve via DNS there. That is one reason Compose is cleaner than a pile of manual `docker run` commands."
  - text: "Why is `depends_on` with `condition: service_healthy` better than plain `depends_on` for a database dependency?"
    options:
      - "It publishes the database port automatically"
      - "It waits for the database to be ready, not just started"
      - "It forces the database to restart on every web change"
      - "It converts the service into a stateful volume"
    correctAnswer: 1
    explanation: "The lesson warns that plain `depends_on` only controls start order. Adding a real healthcheck and `condition: service_healthy` lets the app wait until Postgres is actually accepting connections."
  - text: "What is a good use for Compose profiles according to the lesson?"
    options:
      - "To hide production secrets inside `compose.yaml`"
      - "To replace healthchecks with environment-specific logic"
      - "To keep optional services like Mailhog out of the default startup"
      - "To turn a single-host stack into a multi-host orchestrator"
    correctAnswer: 2
    explanation: "The lesson highlights profiles for optional services such as debug UIs or tracing tools. This keeps the default developer experience lean without removing helpful tooling."
  - text: "When should you move beyond Compose to something like Kubernetes or ECS?"
    options:
      - "Whenever you need more than one container locally"
      - "When you want to run multi-host production workloads"
      - "As soon as you add a healthcheck to Postgres"
      - "Whenever you need service-name DNS"
    correctAnswer: 1
    explanation: "A takeaway says Compose is best for local development and small single-host deployments. For multi-host production orchestration, the lesson recommends Kubernetes or ECS instead."
---

Compose matters because real systems are almost never a single container. A developer building a Next.js application usually needs a database, a cache, maybe an object store, and often a reverse proxy. Without Compose, every engineer invents their own startup script and the team drifts. Compose gives you one declarative topology that can be run locally, in CI, and in lightweight staging environments.

What problem Compose solves:
Compose turns a pile of long docker run commands into versioned infrastructure for an application stack. That makes onboarding faster, local debugging consistent, and service dependencies explicit.

Compose file anatomy:
A Compose file is organized around services, networks, volumes, configs, and secrets. Services define containers. Networks control communication. Volumes persist or share data. Configs and secrets provide structured configuration inputs.

Real application stack:
  services:
    web:
      build:
        context: .
        dockerfile: Dockerfile
        target: runtime
      environment:
        DATABASE_URL: postgres://app:app@db:5432/app
        REDIS_URL: redis://redis:6379
      depends_on:
        db:
          condition: service_healthy
        redis:
          condition: service_healthy
      networks: [frontend, backend]

    db:
      image: postgres:16
      environment:
        POSTGRES_USER: app
        POSTGRES_PASSWORD: app
        POSTGRES_DB: app
      volumes:
        - pgdata:/var/lib/postgresql/data
      healthcheck:
        test: ["CMD-SHELL", "pg_isready -U app -d app"]
        interval: 5s
        timeout: 3s
        retries: 10
      networks: [backend]

    redis:
      image: redis:7
      command: ["redis-server", "--appendonly", "yes"]
      healthcheck:
        test: ["CMD", "redis-cli", "ping"]
        interval: 5s
        timeout: 3s
        retries: 10
      networks: [backend]

    nginx:
      image: nginx:1.27
      ports:
        - "80:80"
      volumes:
        - ./ops/nginx.conf:/etc/nginx/conf.d/default.conf:ro
      depends_on:
        web:
          condition: service_started
      networks: [frontend]

  networks:
    frontend:
    backend:

  volumes:
    pgdata:

Service definition deep dive:
image uses a prebuilt image. build creates one from source. context controls what files are sent to the build. dockerfile selects the file. args pass build-time values. target lets you choose a specific multi-stage build stage such as dev, test, or runtime.

Health-based ordering:
depends_on without health conditions only controls start order, not readiness. The correct pattern is condition: service_healthy combined with real health checks on the dependency. Otherwise your app may start before Postgres accepts connections and fail in flakey ways.

Health check example:
  healthcheck:
    test: ["CMD-SHELL", "curl -fsS http://127.0.0.1:3000/health || exit 1"]
    interval: 10s
    timeout: 3s
    retries: 5
    start_period: 15s

Environment handling:
Compose supports inline environment, env_file, and variable substitution from a .env file. This is useful, but do not confuse a Compose .env file with a secure secret store.

Example .env file:
  APP_PORT=3000
  POSTGRES_PASSWORD=app
  REDIS_APPENDONLY=yes

Override file pattern:
Many teams keep docker-compose.yml as the shared base, docker-compose.override.yml for local development, and docker-compose.prod.yml for production-specific differences. This avoids one giant file full of conditional hacks.

Override example:
  services:
    web:
      volumes:
        - .:/app
        - /app/node_modules
      command: ["npm", "run", "dev"]
    nginx:
      profiles: ["prod"]

Profiles:
Profiles let you declare optional services such as Mailhog, Adminer, or a tracing stack. This keeps the default developer experience lean while still allowing deeper debugging when needed.

Profiles example:
  services:
    mailhog:
      image: mailhog/mailhog
      profiles: ["debug"]
      ports:
        - "8025:8025"

Useful commands:
  docker compose up -d
  docker compose logs -f web db redis
  docker compose exec db psql -U app -d app
  docker compose ps
  docker compose config
  docker compose down

Compose watch:
Compose watch can rebuild or sync files on changes. It is useful for front-end development, though bind mounts are still more common.

Compose watch example:
  develop:
    watch:
      - path: ./src
        action: sync
        target: /app/src
      - path: package.json
        action: rebuild

Common pitfalls:
- Publishing database ports to the world when only the app needs them.
- Using depends_on without health checks and calling it done.
- Stuffing production secrets into .env committed to Git.
- Mixing dev bind mounts into production manifests.

Pro tips:
- Use separate frontend and backend networks.
- Keep only your reverse proxy externally published.
- Treat Compose as source-controlled application topology.
- Use docker compose config in CI to validate merges before anyone runs them.