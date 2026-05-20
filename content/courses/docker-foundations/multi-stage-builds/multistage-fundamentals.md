---
title: "Multi-stage Build Fundamentals"
order: 1
objectives:
  - "Write a Dockerfile with multiple `FROM` stages."
  - "Copy artifacts between stages with `COPY --from`."
  - "Use named stages (`AS build`) and target one with `--target`."
  - "Shrink a final image to <50 MB using `distroless` or `alpine`."
  - "Reuse a single Dockerfile for build, test, and production targets."
tryIt: "Take a Go program. Write a single Dockerfile with `FROM golang:1.22 AS build` and `FROM gcr.io/distroless/static`, copying only the binary. Compare the final image size to `golang:1.22` — typically **800 MB → 10 MB**."
takeaways:
  - "Each `FROM` starts a fresh stage with its own filesystem."
  - "Only the **last** stage ends up in the published image unless you `--target`."
  - "Named stages (`AS build`) make refactors safe — names are stable, indexes aren't."
  - "Pair multi-stage with **`distroless`** runtime bases for the smallest, most secure image."
  - "Use `--target test` in CI to run unit tests inside the same Dockerfile that builds prod."
quiz:
  - text: "What does each new `FROM` instruction do in a multi-stage Dockerfile?"
    options:
      - "It starts a fresh stage with its own filesystem"
      - "It appends files directly into the previous stage"
      - "It publishes the intermediate image automatically"
      - "It clears the build context from disk"
    correctAnswer: 0
    explanation: "The lesson says every `FROM` starts a new stage with its own filesystem. That separation is what lets you keep build tools out of the final runtime image."
  - text: "Which stage becomes the published image by default?"
    options:
      - "The first stage only"
      - "The stage named `build`"
      - "The last stage, unless you build with `--target`"
      - "Every stage is published together as one image"
    correctAnswer: 2
    explanation: "A core takeaway is that only the last stage ends up in the final image unless you target a different one explicitly. That is why runtime stages are usually placed last."
  - text: "Why does the lesson prefer named stages such as `AS build` over numeric stage indexes?"
    options:
      - "Named stages make Docker build faster than indexed stages"
      - "Indexes are more secure but harder to read"
      - "Named stages are stable during refactors, while indexes can shift"
      - "Only named stages can be used with `COPY --from`"
    correctAnswer: 2
    explanation: "The lesson says names are stable and indexes are not. If you reorder stages later, `COPY --from=build` still works, while `COPY --from=0` can silently point at the wrong stage."
  - text: "Why might a team keep both a distroless runtime stage and a separate debug stage?"
    options:
      - "Because distroless images require a second stage before they can run"
      - "Because distroless reduces runtime surface, while a debug stage keeps shell tools available for incidents"
      - "Because Docker cannot copy files into distroless images"
      - "Because debug stages are the only way to enable BuildKit cache mounts"
    correctAnswer: 1
    explanation: "The lesson highlights distroless for smaller attack surface, but also warns that debugging is harder without shell tools. A separate debug stage gives you a better incident-response option without bloating production."
---

Multi-stage builds matter because image size affects everything: pull time, cold-start time, attack surface, and developer patience. A typical Node.js image built from a naïve single-stage Dockerfile might be 900 MB because it contains build tools, source files, dev dependencies, caches, and the runtime all together. A production-grade multi-stage image can often cut that below 200 MB without sacrificing reproducibility.

The image bloat problem:
Large images move slowly through CI, registries, and clusters. They also contain more packages to patch and more noise to inspect during incidents. Multi-stage builds let you separate build-time concerns from runtime concerns.

Before and after:
  # single-stage: 900 MB, contains TypeScript, test deps, build cache
  docker build -t app:single -f Dockerfile.single .
  docker image ls app:single

  # multi-stage: 180 MB, contains only built app + prod deps
  docker build -t app:multi -f Dockerfile.multi .
  docker image ls app:multi

Syntax and stage naming:
Use FROM image AS stage-name to create named stages. COPY --from=stage-name lets later stages copy only selected artifacts. Use descriptive names like deps, build, test, runtime, debug. That doubles as documentation.

Go scratch build:
  FROM golang:1.23-bookworm AS build
  WORKDIR /src
  COPY go.mod go.sum ./
  RUN go mod download
  COPY . .
  RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -trimpath -ldflags='-s -w' -o /out/server ./cmd/server

  FROM scratch
  COPY --from=build /out/server /server
  USER 65532:65532
  ENTRYPOINT ["/server"]

Node.js three-stage build:
A strong Node pattern is dependencies, build, runtime. Install dependencies once, build with dev tooling, then prune or copy only production dependencies into the final image.

Node.js multi-stage:
  FROM node:20-bookworm-slim AS deps
  WORKDIR /app
  COPY package.json package-lock.json ./
  RUN npm ci

  FROM node:20-bookworm-slim AS build
  WORKDIR /app
  COPY --from=deps /app/node_modules ./node_modules
  COPY . .
  RUN npm run build && npm prune --omit=dev

  FROM gcr.io/distroless/nodejs20-debian12 AS runtime
  WORKDIR /app
  COPY --from=build /app/dist ./dist
  COPY --from=build /app/node_modules ./node_modules
  COPY --from=build /app/package.json ./package.json
  USER nonroot
  CMD ["dist/server.js"]

Python virtualenv copy pattern:
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
  CMD ["python", "app.py"]

Java Maven example:
  FROM maven:3.9-eclipse-temurin-21 AS build
  WORKDIR /src
  COPY pom.xml ./
  RUN mvn -q -DskipTests dependency:go-offline
  COPY . .
  RUN mvn -q -DskipTests package

  FROM eclipse-temurin:21-jre-jammy
  WORKDIR /app
  COPY --from=build /src/target/app.jar /app/app.jar
  ENTRYPOINT ["java", "-jar", "/app/app.jar"]

Distroless images:
Google's distroless images remove shells and package managers, leaving only the runtime essentials. The benefit is smaller attack surface and less noise in scans. The drawback is debugging difficulty. A common pattern is shipping distroless in production and keeping a :debug target with BusyBox or Debian slim for incident response.

Debug variant pattern:
  FROM node:20-bookworm-slim AS debug
  WORKDIR /app
  COPY --from=build /app /app
  CMD ["bash"]

BuildKit and cache mounts:
BuildKit can run independent stages in parallel and supports filesystem cache mounts that are separate from layer cache. This is excellent for package managers.

BuildKit cache mount:
  RUN --mount=type=cache,target=/root/.npm npm ci
  RUN --mount=type=cache,target=/root/.cache/pip pip install -r requirements.txt
  RUN --mount=type=cache,target=/go/pkg/mod go mod download

Image size comparison:
- alpine: tiny, but musl can surprise some binaries and native modules.
- debian-slim: slightly larger, usually the best compatibility default.
- distroless: minimal runtime surface, harder to debug.
- scratch: smallest possible, only for static binaries and very controlled workloads.

Common pitfalls:
- Copying the whole source tree into the final runtime stage.
- Forgetting CA certificates or timezone data when using scratch.
- Using distroless before the team has a debugging story.
- Naming stages builder and final everywhere without expressing intent.

Pro tips:
- Add a test stage and build it in CI with --target test.
- Keep a debug stage even if production is distroless.
- Measure image size after every major dependency change.
- Use multi-stage builds by default; single-stage should be the exception, not the norm.