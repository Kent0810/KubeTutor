---
title: "Secrets Management in Docker"
order: 2
objectives:
  - "Explain why `ENV` and `ARG` are not safe for secrets."
  - "Use Docker BuildKit secrets at build time."
  - "Use Docker Swarm secrets or external managers (Vault, AWS SM) at runtime."
  - "Avoid leaking secrets into image layers, history, or `docker inspect` output."
  - "Rotate secrets without rebuilding images."
tryIt: "Bake a fake secret into a Dockerfile with `ENV SECRET=hunter2`, build, then run `docker history --no-trunc <image>`. Your secret is visible to anyone with pull access. Now do the same with `RUN --mount=type=secret,id=mysecret` — `docker history` shows nothing. That's the only acceptable way."
takeaways:
  - "Anything in `ENV` or `ARG` is **public** to anyone who can pull the image — use BuildKit secrets instead."
  - "Runtime secrets belong in a secret manager (Vault, AWS Secrets Manager, K8s Secrets), injected at start."
  - "`RUN --mount=type=secret,id=foo cat /run/secrets/foo` is the safe build-time pattern."
  - "Rotate secrets out-of-band of image builds so rotation doesn't require a redeploy."
  - "Audit `docker history`, `docker inspect`, and image layers for leaks before pushing."
quiz:
  - text: "Why are ENV and ARG unsafe places for Docker secrets according to the lesson?"
    options:
      - "They only work on Linux hosts"
      - "Their values can leak through image metadata, history, logs, or layers"
      - "They prevent multi-stage builds from working"
      - "They are ignored by Docker BuildKit"
    correctAnswer: 1
    explanation: "The lesson warns that ENV bakes secrets into image metadata and ARG values can still appear in history or logs. Once a secret touches image artifacts, the exposure can spread widely."
  - text: "What is the safe build-time pattern shown for using a secret inside a Dockerfile?"
    options:
      - "COPY .env /app/.env"
      - "ARG NPM_TOKEN followed by npm config set"
      - "RUN --mount=type=secret,id=foo cat /run/secrets/foo"
      - "ENV SECRET_FILE=/run/secrets/foo"
    correctAnswer: 2
    explanation: "BuildKit secret mounts make the secret available only for that RUN step and do not commit it to the final image. The lesson calls this the correct build-time pattern."
  - text: "How does the lesson recommend handling secrets at runtime in production?"
    options:
      - "Bake them into a separate release image"
      - "Fetch or inject them at container start from a secret manager or orchestrator"
      - "Store them in git so CI can pass them easily"
      - "Put them in LABEL instructions instead of ENV"
    correctAnswer: 1
    explanation: "The lesson says runtime secrets belong in systems like Vault, AWS Secrets Manager, Docker Swarm, or Kubernetes, injected when the container starts. That keeps the image artifact environment-agnostic."
  - text: "If a build needs to clone a private Git repository, what does the lesson recommend?"
    options:
      - "Copy an SSH private key into the build context"
      - "Use an SSH mount with BuildKit"
      - "Embed a GitHub token in the base image"
      - "Run git clone after the container starts in production"
    correctAnswer: 1
    explanation: "For private repositories, the lesson recommends RUN --mount=type=ssh instead of copying keys into the image or build context. This limits exposure of SSH credentials."
---

Secrets management is one of the few Docker topics where a small mistake can create a long-lived breach. If you put a token into an image layer, that token may end up in docker history, CI logs, registry caches, developer laptops, and backup archives. Deleting the file later does not undo the exposure because image layers are immutable.

Why baked secrets are catastrophic:
Images are copied everywhere. A leaked credential in an image is not just one bad deploy; it is a supply chain problem. There have been repeated public incidents where cloud keys or package tokens were accidentally shipped in images and later extracted from registries or CI artifacts.

The wrong ways:
Using ENV bakes the secret into image metadata. COPY .env puts the file into a layer forever. ARG feels temporary, but values can still appear in history, logs, or derived files.

Bad examples:
  ENV AWS_SECRET_ACCESS_KEY=super-secret
  COPY .env /app/.env
  ARG NPM_TOKEN
  RUN npm config set //registry.npmjs.org/:_authToken=$NPM_TOKEN

Proof with history:
  docker build --build-arg NPM_TOKEN=super-secret -t bad-image .
  docker history --no-trunc bad-image | grep -i secret

BuildKit secret mounts:
The correct build-time pattern is mounting secrets into a single RUN step so they are available temporarily and never committed to the final image. This is ideal for npm tokens, private package indexes, and build-time API credentials.

BuildKit secret with npm:
  # syntax=docker/dockerfile:1.7
  FROM node:20-bookworm-slim
  WORKDIR /app
  COPY package.json package-lock.json ./
  RUN --mount=type=secret,id=npm_token \
      sh -c 'echo "//registry.npmjs.org/:_authToken=$(cat /run/secrets/npm_token)" > ~/.npmrc && npm ci && rm -f ~/.npmrc'
  COPY . .

Build command:
  docker build \
    --secret id=npm_token,src=$HOME/.config/npm/token.txt \
    -t my-app:secure .

BuildKit SSH mounts:
If your build needs to clone a private Git repository, use an SSH mount instead of copying keys into the context.

SSH mount example:
  # syntax=docker/dockerfile:1.7
  FROM alpine:3.20
  RUN apk add --no-cache git openssh-client
  RUN --mount=type=ssh git clone git@github.com:example/private-repo.git /src

  docker build --ssh default -t app-with-private-deps .

Runtime secrets:
Runtime injection is usually the right model. CI systems, secret managers, or orchestrators inject values only when the container starts. That still requires care: environment variables are easy, but secret files or dedicated providers can be safer for some workloads.

Runtime patterns:
  docker run --rm \
    -e DATABASE_URL="$DATABASE_URL" \
    -e STRIPE_SECRET_KEY="$STRIPE_SECRET_KEY" \
    my-app:latest

Swarm and Kubernetes:
Docker Swarm has native secrets objects mounted as in-memory files. Kubernetes has Secrets resources, usually consumed as environment variables or mounted files. Both are improvements over baking values into images, though they still require RBAC and encryption discipline.

Cloud and Vault patterns:
Modern production stacks often fetch secrets from HashiCorp Vault, AWS Secrets Manager, or AWS SSM Parameter Store. A Vault agent sidecar can write short-lived credentials to a shared volume. Cloud-native apps may fetch secrets at startup through an SDK using workload identity.

Detecting leaks:
Assume some secrets have already slipped somewhere. Scan images and repositories proactively.

Detection tools:
  trivy image --scanners secret my-app:latest
  trufflehog docker --image=my-app:latest
  trufflehog git file://. --since-commit HEAD~50

12-factor principle:
Configuration and secrets should be external to the image artifact. Build once, promote the same image, inject environment-specific values later. That is the core operational discipline.

Common pitfalls:
- Keeping .env in the build context.
- Passing secrets as ARG and assuming they disappear.
- Echoing secrets in CI logs during debug sessions.
- Leaving long-lived registry or cloud credentials in developer shells.

Pro tips:
- Use BuildKit secrets for builds and a secret manager for runtime.
- Rotate any credential that ever touched an image layer.
- Scan images and Git history continuously.
- Separate secret delivery from application delivery.

If you remember one rule, make it this: secrets may touch runtime memory, but they should never become part of the image filesystem history.