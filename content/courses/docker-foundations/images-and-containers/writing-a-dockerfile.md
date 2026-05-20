---
title: "Writing a Dockerfile"
order: 1
objectives:
  - "Use the most important Dockerfile instructions correctly (`FROM`, `RUN`, `COPY`, `CMD`, `ENTRYPOINT`)."
  - "Explain the difference between `CMD` and `ENTRYPOINT`, and `ARG` vs `ENV`."
  - "Choose an appropriate base image for a given workload."
  - "Write a production-grade multi-stage Dockerfile for Node.js, Python, and Go."
  - "Apply security and caching best practices that real platform teams use."
tryIt: "Take any small app you have and write a Dockerfile that builds in under 10 seconds on a warm cache. Then change one line of source and rebuild — did your cached layers survive? If not, your `COPY` order is wrong."
takeaways:
  - "Order instructions from **least to most likely to change** — dependency files before source code — to maximise layer cache hits."
  - "Prefer the **exec form** (`[\"node\", \"server.js\"]`) over shell form for predictable signal handling."
  - "**Never** put secrets in `ARG` or `ENV`; use BuildKit secrets or runtime injection."
  - "Pin base images to a digest or specific tag and update them deliberately."
  - "Multi-stage builds with a small runtime base (`distroless`, `alpine`, `debian-slim`) keep your attack surface and image pull time tiny."
quiz:
  - text: "How should you order Dockerfile instructions for better cache reuse?"
    options:
      - "Put the most frequently changing source files first"
      - "Put dependency files before source code so stable layers cache well"
      - "Always put `EXPOSE` before `FROM`"
      - "Put `CMD` before `COPY` so the runtime command caches"
    correctAnswer: 1
    explanation: "The lesson says to order instructions from least likely to change to most likely to change. Copying dependency manifests before source code maximizes layer cache hits on rebuilds."
  - text: "When both `ENTRYPOINT` and `CMD` use exec form, what happens if you pass extra arguments to `docker run`?"
    options:
      - "They replace `ENTRYPOINT` and `CMD` together"
      - "They are ignored unless `EXPOSE` is set"
      - "They replace `CMD` but keep `ENTRYPOINT`"
      - "They append to image history instead of the command line"
    correctAnswer: 2
    explanation: "The lesson explains that `ENTRYPOINT` chooses the executable and `CMD` supplies default parameters. Passing arguments to `docker run` replaces `CMD` but does not replace `ENTRYPOINT`."
  - text: "Why are `ARG` and `ENV` both poor places for secrets?"
    options:
      - "Because Docker strips them out before the build finishes"
      - "Because they only work in Alpine-based images"
      - "Because `ARG` is runtime-only and `ENV` is build-time-only"
      - "Because `ARG` can leak in history or logs and `ENV` is visible in inspect"
    correctAnswer: 3
    explanation: "The lesson warns that `ARG` values can appear in image history or build logs, while `ENV` values are visible in `docker inspect`. Sensitive values should use BuildKit secrets or runtime injection instead."
  - text: "What does `EXPOSE` do in a Dockerfile?"
    options:
      - "It publishes the port automatically on the host"
      - "It documents the intended container port but does not publish it"
      - "It opens the port only for Compose projects"
      - "It changes the container to host networking mode"
    correctAnswer: 1
    explanation: "The lesson explicitly says `EXPOSE` documents intended ports only. Publishing still requires runtime options like `-p` or Compose port mappings."
---

A Dockerfile is not just build syntax; it is a contract describing how your software is assembled, which assumptions it makes, and what exactly operators will run in production. Weak Dockerfiles create slow builds, bloated images, leaked secrets, and fragile startup behavior. Strong Dockerfiles produce reproducible artifacts that behave predictably in CI and under pressure.

Dockerfile instructions:
- FROM: selects the base image and can appear multiple times in multi-stage builds.
- RUN: executes commands during build and creates a new layer.
- COPY: copies files from the build context into the image.
- ADD: like COPY plus tar auto-extract and URL support; most teams prefer COPY for clarity.
- WORKDIR: sets the working directory for subsequent instructions.
- ENV: defines runtime environment defaults baked into image metadata.
- ARG: defines build-time variables available only during build unless copied into ENV or files.
- EXPOSE: documents intended container ports; it does not publish them.
- CMD: supplies default arguments or default command for the container process.
- ENTRYPOINT: defines the executable that always runs unless overridden with --entrypoint.
- LABEL: attaches metadata such as maintainer, source repo, and commit SHA.
- USER: switches away from root for runtime safety.
- VOLUME: declares mount points, but many teams prefer runtime or Compose-managed volumes.
- HEALTHCHECK: defines how the runtime can test application health.
- STOPSIGNAL: chooses the signal sent on graceful stop.
- ONBUILD: sets a trigger for downstream builds; useful in specialized base images, dangerous in general use.
- SHELL: changes the shell used for shell-form RUN, CMD, and ENTRYPOINT.

CMD vs ENTRYPOINT:
This is the most misunderstood part of Dockerfiles. ENTRYPOINT chooses the executable. CMD supplies default parameters. If both are set in exec form, Docker effectively runs ENTRYPOINT plus CMD. Arguments passed to docker run replace CMD but do not replace ENTRYPOINT. Shell form starts a shell, which changes signal handling and argument behavior; exec form is usually correct for production.

CMD and ENTRYPOINT matrix:
  ENTRYPOINT ["node", "server.js"]
  CMD ["--port", "3000"]
  docker run my-app                   # node server.js --port 3000
  docker run my-app --port 4000       # node server.js --port 4000
  docker run --entrypoint sh my-app   # overrides entrypoint completely

ARG vs ENV:
ARG is for build-time variation such as selecting a version or a private registry path. ENV is for runtime defaults. Neither is appropriate for secrets. ARG values can appear in image history, build logs, or generated files. ENV values are visible in docker inspect. If a value is sensitive, use BuildKit secrets or inject it only at runtime.

ARG and ENV example:
  ARG NODE_VERSION=20.18.0
  FROM node:${NODE_VERSION}-bookworm-slim
  ARG GIT_SHA=dev
  ENV NODE_ENV=production
  ENV APP_REVISION=$GIT_SHA

The .dockerignore file:
Build context size affects both speed and security. If you send node_modules, .git, local secrets, and test artifacts to the daemon, you slow every build and risk accidental inclusion.

Example .dockerignore:
  node_modules
  .git
  .env
  .next
  coverage
  dist
  *.log
  Dockerfile*

Base image strategy:
Use scratch when you can ship a single static binary. Use distroless for tight production images with minimal attack surface. Use alpine when size matters and musl compatibility is acceptable. Use debian-slim when you need predictable package availability and glibc compatibility. Use ubuntu when you need a fuller userspace or parity with enterprise tooling. Google popularized distroless for reduced attack surface; many Netflix-style platform teams prefer slim Debian bases because debugging and compatibility matter too.

Production Node.js Dockerfile:
  FROM node:20-bookworm-slim AS deps
  WORKDIR /app
  COPY package.json package-lock.json ./
  RUN npm ci

  FROM node:20-bookworm-slim AS build
  WORKDIR /app
  COPY --from=deps /app/node_modules ./node_modules
  COPY . .
  RUN npm run build && npm prune --omit=dev

  FROM node:20-bookworm-slim AS runtime
  WORKDIR /app
  ENV NODE_ENV=production
  LABEL org.opencontainers.image.source="https://github.com/example/app"
  LABEL org.opencontainers.image.description="Node.js API"
  COPY --from=build /app/package.json ./
  COPY --from=build /app/node_modules ./node_modules
  COPY --from=build /app/dist ./dist
  RUN useradd --system --uid 10001 appuser
  USER 10001
  EXPOSE 3000
  HEALTHCHECK --interval=30s --timeout=3s --start-period=15s --retries=3 CMD node -e "fetch('http://127.0.0.1:3000/health').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"
  CMD ["node", "dist/server.js"]

Production Python Dockerfile:
  FROM python:3.12-slim AS build
  WORKDIR /app
  RUN python -m venv /opt/venv
  ENV PATH=/opt/venv/bin:$PATH
  COPY requirements.txt ./
  RUN pip install --no-cache-dir -r requirements.txt
  COPY . .

  FROM python:3.12-slim AS runtime
  WORKDIR /app
  ENV PATH=/opt/venv/bin:$PATH
  COPY --from=build /opt/venv /opt/venv
  COPY --from=build /app /app
  RUN useradd --system --uid 10001 appuser && chown -R appuser:appuser /app
  USER 10001
  EXPOSE 8000
  CMD ["gunicorn", "app:app", "--bind", "0.0.0.0:8000", "--workers", "3"]

Production Go Dockerfile:
  FROM golang:1.23-bookworm AS build
  WORKDIR /src
  COPY go.mod go.sum ./
  RUN go mod download
  COPY . .
  RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -ldflags='-s -w' -o /out/server ./cmd/server

  FROM scratch
  COPY --from=build /out/server /server
  USER 65532:65532
  EXPOSE 8080
  ENTRYPOINT ["/server"]

Environment-specific patterns:
A development Dockerfile may include nodemon, shell tools, debuggers, and source bind mounts. A production Dockerfile should be smaller, non-root, with fewer packages and an explicit health check. Keeping separate dev and prod targets inside one multi-stage Dockerfile is often cleaner than maintaining two completely different files.

Health check examples:
  HEALTHCHECK CMD wget -qO- http://127.0.0.1:8080/health || exit 1
  HEALTHCHECK CMD nc -z 127.0.0.1 5432 || exit 1
  HEALTHCHECK NONE

Best practices:
- Prefer exec form for CMD and ENTRYPOINT.
- Keep one process per container unless there is a deliberate reason not to.
- Order instructions for caching: dependency files first, source later.
- Never COPY secrets into the image.
- Pin base images intentionally and update them on purpose.
- Use LABEL metadata for traceability.

Common pitfalls:
- Using ADD when COPY is clearer.
- Running as root because it is easier during local testing.
- Splitting apt-get update and apt-get install into separate RUN lines.
- Assuming EXPOSE opens a port on the host.
- Treating ARG as a safe place for secrets.

A good Dockerfile is boring in the best way: reproducible, inspectable, and unsurprising under load.