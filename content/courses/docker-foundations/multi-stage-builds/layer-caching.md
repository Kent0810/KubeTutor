---
title: "Layer Caching and .dockerignore"
order: 2
objectives:
  - "Explain how BuildKit decides whether to reuse a layer."
  - "Order instructions to maximise cache hits."
  - "Write a `.dockerignore` that keeps junk out of the build context."
  - "Use `--mount=type=cache` for package-manager caches."
  - "Diagnose surprise cache misses with `docker build --progress=plain`."
tryIt: "Add `node_modules/`, `.git/`, and `*.log` to `.dockerignore`. Measure the build context size with `docker build .` (look at the first line). Removing `.git` from the context often shaves 100+ MB and seconds off every build."
takeaways:
  - "BuildKit hashes the **instruction text plus the inputs** — change either and the layer rebuilds."
  - "Copy `package.json`/`go.sum`/`requirements.txt` and install dependencies **before** copying source."
  - "`.dockerignore` is the cheapest, highest-impact change you'll ever make."
  - "`RUN --mount=type=cache,target=/root/.npm` keeps npm's cache across builds without bloating the image."
  - "`docker build --progress=plain --no-cache` is the diagnostic command for 'why did my cache break?'."
quiz:
  - text: "What does BuildKit hash to decide whether a layer can be reused?"
    options:
      - "Only the resulting filesystem snapshot"
      - "The instruction text plus the inputs it depends on"
      - "Only the Dockerfile line number"
      - "Only the base image digest"
    correctAnswer: 1
    explanation: "The lesson explains that layer reuse depends on both the instruction text and its inputs. Changing either one invalidates the cache for that step."
  - text: "Why does the lesson recommend copying package.json and package-lock.json before application source in a Node.js Dockerfile?"
    options:
      - "So npm can run as root"
      - "So Docker can skip the base image pull"
      - "So npm ci stays cached when only src files change"
      - "So COPY . . becomes unnecessary"
    correctAnswer: 2
    explanation: "Dependency metadata changes less often than source code. Copying lockfiles first lets the npm install layer stay cached across normal code changes."
  - text: "What is the main benefit of RUN --mount=type=cache for package managers?"
    options:
      - "It shrinks the final image by deleting package-lock.json"
      - "It preserves package-manager directories across builds even when the step reruns"
      - "It prevents Docker from creating image layers"
      - "It automatically pushes the cache to Docker Hub"
    correctAnswer: 1
    explanation: "The lesson distinguishes layer cache from cache mounts. Cache mounts keep directories like /root/.npm or /root/.cache/pip available across builds without baking them into the image."
  - text: "Why is .dockerignore described as a hidden cache saver?"
    options:
      - "It forces Docker to use --no-cache"
      - "It removes the need for COPY instructions"
      - "It keeps noisy files like .git and node_modules out of the build context"
      - "It converts all COPY commands into bind mounts"
    correctAnswer: 2
    explanation: "Large or noisy build contexts can invalidate COPY steps for unrelated changes. Excluding junk like .git, coverage output, and node_modules helps preserve cache hits."
---

Layer caching is one of the highest-leverage Docker skills because it determines whether builds take seconds or minutes. Teams that understand caching get faster CI, tighter feedback loops, and smaller cloud bills. Teams that do not keep rebuilding package managers from scratch because one README changed.

How layer caching works:
Docker stores layers as content-addressed objects keyed by hashes of the instruction and its inputs. If an instruction and everything it depends on are unchanged, Docker can reuse the previous result. If one early layer changes, every later layer must be rebuilt because the filesystem state has changed. That is the cache invalidation cascade.

The golden rule:
Order Dockerfile instructions from least frequently changing to most frequently changing. Dependency metadata changes rarely. Application source changes constantly. Put dependency installation before source copies.

Unoptimized vs optimized Node.js:
  # bad
  COPY . .
  RUN npm ci
  RUN npm run build

  # good
  COPY package.json package-lock.json ./
  RUN npm ci
  COPY src ./src
  COPY public ./public
  RUN npm run build

Why package.json first works:
If only src files change, the package.json layer remains identical, so npm ci stays cached. This pattern has direct equivalents in other ecosystems.

Language-specific cache-friendly patterns:
- Python: copy requirements.txt or poetry.lock first, then install, then copy source.
- Go: copy go.mod and go.sum first, run go mod download, then copy source.
- Java: copy pom.xml or gradle files first, prefetch dependencies, then copy source.
- Rust: copy Cargo.toml and Cargo.lock first, build dependency graph, then copy source.

BuildKit cache mounts:
Layer cache and package-manager cache are different things. Layer cache reuses a whole step result. Cache mounts preserve directories across builds even when the step must rerun. For package managers, this can be a huge speedup.

Cache mount examples:
  RUN --mount=type=cache,target=/root/.npm npm ci
  RUN --mount=type=cache,target=/root/.cache/pip pip install -r requirements.txt
  RUN --mount=type=cache,target=/go/pkg/mod go mod download

CI cache strategies:
CI runners are often ephemeral, so local layer cache disappears between jobs. BuildKit supports registry cache and GitHub Actions cache. Inline cache metadata also helps downstream builds reuse previous results.

GitHub Actions cache example:
  - uses: docker/build-push-action@v6
    with:
      context: .
      push: false
      cache-from: type=gha
      cache-to: type=gha,mode=max

The .dockerignore file:
A noisy build context is a hidden cache killer. If you send node_modules, .git, test artifacts, or coverage into the build context, unrelated changes can invalidate COPY instructions and waste time.

Example .dockerignore:
  node_modules
  .git
  .env
  coverage
  dist
  .next
  *.log
  !important-template.env.example

Specific COPY patterns:
COPY . . is easy but broad. COPY src/ /app/src/ is more precise and invalidates less often. Specificity improves cache behavior and documents intent.

Measure builds:
  docker build --progress=plain -t app:measure .
  docker history app:measure --no-trunc
  docker buildx build --progress=plain --load -t app:buildx .

When not to cache blindly:
apt-get update should live in the same RUN step as apt-get install. Caching an old update result separately can cause stale indexes or broken installs. Fresh indexes and package installation must happen together.

Safe apt pattern:
  RUN apt-get update \
   && apt-get install -y --no-install-recommends curl ca-certificates \
   && rm -rf /var/lib/apt/lists/*

Cache busters to watch:
- Copying the entire repository too early.
- Injecting dynamic timestamps or build numbers into early layers.
- Reordering instructions casually.
- Leaving package lockfiles out of the build context.

Pro tips:
- Treat lockfiles as first-class build inputs.
- Use cache mounts for npm, pip, Maven, Go modules, and Cargo.
- Compare build timings before and after Dockerfile changes.
- Review .dockerignore every time the repo structure changes.

Great Docker performance is rarely about heroics. It is usually about ordering, specificity, and respecting how the cache actually works.