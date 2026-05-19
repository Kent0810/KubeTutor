// Centralised lesson enrichment + module quizzes.
// Applied generically by prisma/seed.ts so the seed file itself stays clean.

export interface LessonEnrichment {
  objectives: string[];
  tryIt: string;
  takeaways: string[];
}

export const LESSON_ENRICHMENT: Record<string, LessonEnrichment> = {
  // ── Docker Module 1: Getting Started ────────────────────────────
  "what-is-docker": {
    objectives: [
      "Explain why containers matter for reliable software delivery.",
      "Describe the difference between containers and virtual machines.",
      "Identify the major components of the Docker architecture (CLI, daemon, containerd, runc).",
      "Describe the container lifecycle (created → running → stopped → removed).",
      "Recognise where Docker fits — and does **not** fit — in a modern platform.",
    ],
    tryIt:
      "Run `docker info` and `docker version` on your machine. Find the values of `Server Version`, `Storage Driver`, and `Cgroup Version`. Compare with a teammate — any differences usually explain mysterious environment bugs.",
    takeaways: [
      "A container is a process isolated by Linux **namespaces** and **cgroups**, not a tiny VM.",
      "The Docker stack is **CLI → dockerd → containerd → runc** — diagnose problems at the right layer.",
      "**Images are immutable**; containers add a thin writable layer that should be treated as disposable.",
      "OCI standards mean your image runs anywhere — Docker, containerd, Podman, Kubernetes.",
      "Docker solves *packaging* and *process isolation*, not release engineering or security on its own.",
    ],
  },
  "installing-docker": {
    objectives: [
      "Install Docker Engine or Docker Desktop on your operating system.",
      "Verify the install with `docker version`, `docker info`, and `hello-world`.",
      "Configure the daemon (data root, log driver, registry mirrors) via `daemon.json`.",
      "Manage the `docker` group so you don't need `sudo` for every command.",
      "Diagnose the most common install issues (cgroup driver, WSL2 backend, virtualisation).",
    ],
    tryIt:
      "Add your user to the `docker` group (`sudo usermod -aG docker $USER`), then log out and back in. Confirm `docker ps` runs without `sudo`. On Windows/macOS, open Docker Desktop → Settings → Resources and lower memory by 1 GB — does anything break?",
    takeaways: [
      "Docker Desktop is convenient but runs a Linux VM under the hood — it is **not** identical to native Linux.",
      "Adding yourself to the `docker` group grants root-equivalent power on the host. Treat it accordingly.",
      "Configuration lives in `/etc/docker/daemon.json`. Restart the daemon for changes to apply.",
      "On Linux, prefer the systemd cgroup driver (`\"exec-opts\": [\"native.cgroupdriver=systemd\"]`) for parity with Kubernetes.",
      "If `docker run` hangs on pull, suspect DNS, registry rate limits, or a missing proxy — not Docker itself.",
    ],
  },
  "your-first-container": {
    objectives: [
      "Run a container with `docker run` and understand each flag.",
      "Map ports, mount volumes, and pass environment variables.",
      "Use `docker ps`, `docker logs`, and `docker exec` to inspect a running container.",
      "Clean up stopped containers and dangling images with `docker system prune`.",
      "Read the difference between *images* and *containers* in the CLI output.",
    ],
    tryIt:
      "Run `docker run -d -p 8080:80 --name web nginx`, open `http://localhost:8080`, then `docker exec -it web sh` and edit `/usr/share/nginx/html/index.html`. Reload — your changes appear. Stop and remove the container, recreate it — what happened to your edits? Why?",
    takeaways: [
      "`docker run` is shorthand for `pull + create + start` — three separate operations.",
      "Use `--rm` for throwaway commands so you don't leak stopped containers.",
      "Filesystem changes inside a container disappear when the container is deleted unless they're in a **volume**.",
      "`docker exec` runs a new process in an existing container; `docker attach` connects to its main process — pick the right one.",
      "Run `docker system df` weekly to see how much disk Docker is using. `prune` aggressively in dev.",
    ],
  },

  // ── Docker Module 2: Images and Containers ─────────────────────
  "writing-a-dockerfile": {
    objectives: [
      "Use the most important Dockerfile instructions correctly (`FROM`, `RUN`, `COPY`, `CMD`, `ENTRYPOINT`).",
      "Explain the difference between `CMD` and `ENTRYPOINT`, and `ARG` vs `ENV`.",
      "Choose an appropriate base image for a given workload.",
      "Write a production-grade multi-stage Dockerfile for Node.js, Python, and Go.",
      "Apply security and caching best practices that real platform teams use.",
    ],
    tryIt:
      "Take any small app you have and write a Dockerfile that builds in under 10 seconds on a warm cache. Then change one line of source and rebuild — did your cached layers survive? If not, your `COPY` order is wrong.",
    takeaways: [
      "Order instructions from **least to most likely to change** — dependency files before source code — to maximise layer cache hits.",
      "Prefer the **exec form** (`[\"node\", \"server.js\"]`) over shell form for predictable signal handling.",
      "**Never** put secrets in `ARG` or `ENV`; use BuildKit secrets or runtime injection.",
      "Pin base images to a digest or specific tag and update them deliberately.",
      "Multi-stage builds with a small runtime base (`distroless`, `alpine`, `debian-slim`) keep your attack surface and image pull time tiny.",
    ],
  },

  // ── Docker Module 3: Docker Compose ────────────────────────────
  "intro-to-docker-compose": {
    objectives: [
      "Write a `compose.yaml` file that runs multiple services together.",
      "Use Compose networks and volumes to wire services together cleanly.",
      "Use `depends_on` with `condition: service_healthy` for ordered startup.",
      "Override settings per environment with `compose.override.yaml`.",
      "Decide when Compose is the right tool — and when you should reach for Kubernetes.",
    ],
    tryIt:
      "Write a `compose.yaml` with a web service and a Postgres service. Add a healthcheck to Postgres and make web `depends_on` it with `condition: service_healthy`. Run `docker compose up` from a clean state — web should never start before Postgres is ready.",
    takeaways: [
      "Compose is for **local development and small single-host deployments** — use Kubernetes or ECS for multi-host production.",
      "Every service joins a default network named after the project. Service names resolve via DNS.",
      "Healthchecks are how Compose knows a dependency is *ready*, not just *started*.",
      "Use `profiles:` to keep optional services (like a debug UI) out of the default `up`.",
      "`compose.override.yaml` is auto-merged — perfect for per-developer tweaks.",
    ],
  },

  // ── Docker Module 4: Volumes and Storage ───────────────────────
  "understanding-volumes": {
    objectives: [
      "Distinguish named volumes, bind mounts, and `tmpfs` mounts.",
      "Choose the right mount type for databases, configs, and ephemeral caches.",
      "Back up and restore a named volume.",
      "Understand volume drivers and where data physically lives.",
      "Avoid the most common volume bugs (permissions, bind-mount overwrites).",
    ],
    tryIt:
      "Create a named volume `pgdata`, mount it into a Postgres container, write some data, kill the container, then run a new Postgres container against the same volume. Your data should survive. Now try the same with a bind mount on macOS — measure the write performance difference.",
    takeaways: [
      "**Named volumes** are managed by Docker — best for production data.",
      "**Bind mounts** are host paths — best for development source code, dangerous in production.",
      "**`tmpfs`** mounts live in RAM — perfect for secrets that should never hit disk.",
      "Bind mounts on macOS/Windows are slow because they cross a VM boundary; named volumes don't.",
      "Backing up a volume = `docker run --rm -v vol:/data -v $(pwd):/backup alpine tar czf /backup/vol.tgz -C /data .`",
    ],
  },
  "volumes-in-compose": {
    objectives: [
      "Declare top-level `volumes:` and reference them from services.",
      "Use bind mounts for live source reloading in development.",
      "Mount config files read-only with the `:ro` flag.",
      "Share a volume between two services safely.",
      "Migrate data between volumes when refactoring a Compose stack.",
    ],
    tryIt:
      "Add a `volumes:` block to your Compose file with a named volume `dbdata`, plus a bind mount of `./src` into your web service. Edit a file in `./src` while the stack is running — your change should be visible immediately. Now stop the stack with `docker compose down` (without `-v`) — does `dbdata` survive? What about with `-v`?",
    takeaways: [
      "`docker compose down` keeps named volumes; `docker compose down -v` deletes them — know the difference.",
      "Mount config files as **single files**, not directories, to avoid hiding the rest of the path.",
      "Use `read_only: true` plus a `tmpfs:` for `/tmp` to harden production containers.",
      "Two services can share a volume, but only one should write to a given file at a time.",
      "Name your volumes explicitly with `name:` to keep them stable across project renames.",
    ],
  },

  // ── Docker Module 5: Networking ────────────────────────────────
  "network-types": {
    objectives: [
      "Describe how the **bridge**, **host**, **none**, and **overlay** drivers differ.",
      "Create a user-defined bridge and explain why it beats the default bridge.",
      "Connect a container to multiple networks.",
      "Use `--network host` for high-performance edge cases and know its risks.",
      "Understand how container DNS resolution works on a user-defined network.",
    ],
    tryIt:
      "Create a user-defined bridge: `docker network create app-net`. Run two containers on it and `ping` each other by container name — it works. Now do the same on the default `bridge` — DNS by name doesn't work. That's why user-defined networks are the rule.",
    takeaways: [
      "**Always** use a user-defined bridge in development — it gives you container-name DNS for free.",
      "The default `bridge` network exists only for backwards compatibility. Avoid it.",
      "**`host`** networking removes isolation and the port-mapping layer — use only when latency matters more than safety.",
      "**Overlay** networks span multiple hosts (Swarm) — for single-host work, bridge is enough.",
      "Containers can join multiple networks — useful for separating frontend/backend traffic.",
    ],
  },
  "port-publishing-and-dns": {
    objectives: [
      "Publish container ports with `-p host:container` and `-P`.",
      "Bind a publish to a specific host interface for security.",
      "Use container-name DNS on user-defined networks.",
      "Diagnose 'port already in use' and 'connection refused' problems.",
      "Understand IPv6, UDP, and SCTP publishing options.",
    ],
    tryIt:
      "Run `docker run -d -p 127.0.0.1:8080:80 nginx`. Try to reach it from another machine on your LAN — you can't, because you bound to loopback. Change to `-p 8080:80` and try again. This is exactly how you accidentally expose a dev database to the office Wi-Fi.",
    takeaways: [
      "`-p 8080:80` binds to **all** host interfaces. `-p 127.0.0.1:8080:80` binds to loopback only.",
      "On a user-defined network, containers reach each other by **container name**, no port mapping needed.",
      "`EXPOSE` in a Dockerfile is documentation — it does **not** publish a port on the host.",
      "`docker port <name>` shows live port mappings; `ss -tnlp` on the host shows what's bound.",
      "UDP needs `-p 53:53/udp` — the `/udp` suffix is mandatory.",
    ],
  },

  // ── Docker Module 6: Multi-stage Builds ────────────────────────
  "multistage-fundamentals": {
    objectives: [
      "Write a Dockerfile with multiple `FROM` stages.",
      "Copy artifacts between stages with `COPY --from`.",
      "Use named stages (`AS build`) and target one with `--target`.",
      "Shrink a final image to <50 MB using `distroless` or `alpine`.",
      "Reuse a single Dockerfile for build, test, and production targets.",
    ],
    tryIt:
      "Take a Go program. Write a single Dockerfile with `FROM golang:1.22 AS build` and `FROM gcr.io/distroless/static`, copying only the binary. Compare the final image size to `golang:1.22` — typically **800 MB → 10 MB**.",
    takeaways: [
      "Each `FROM` starts a fresh stage with its own filesystem.",
      "Only the **last** stage ends up in the published image unless you `--target`.",
      "Named stages (`AS build`) make refactors safe — names are stable, indexes aren't.",
      "Pair multi-stage with **`distroless`** runtime bases for the smallest, most secure image.",
      "Use `--target test` in CI to run unit tests inside the same Dockerfile that builds prod.",
    ],
  },
  "layer-caching": {
    objectives: [
      "Explain how BuildKit decides whether to reuse a layer.",
      "Order instructions to maximise cache hits.",
      "Write a `.dockerignore` that keeps junk out of the build context.",
      "Use `--mount=type=cache` for package-manager caches.",
      "Diagnose surprise cache misses with `docker build --progress=plain`.",
    ],
    tryIt:
      "Add `node_modules/`, `.git/`, and `*.log` to `.dockerignore`. Measure the build context size with `docker build .` (look at the first line). Removing `.git` from the context often shaves 100+ MB and seconds off every build.",
    takeaways: [
      "BuildKit hashes the **instruction text plus the inputs** — change either and the layer rebuilds.",
      "Copy `package.json`/`go.sum`/`requirements.txt` and install dependencies **before** copying source.",
      "`.dockerignore` is the cheapest, highest-impact change you'll ever make.",
      "`RUN --mount=type=cache,target=/root/.npm` keeps npm's cache across builds without bloating the image.",
      "`docker build --progress=plain --no-cache` is the diagnostic command for 'why did my cache break?'.",
    ],
  },

  // ── Docker Module 7: Security ──────────────────────────────────
  "secure-containers": {
    objectives: [
      "Run a container as a non-root user with `USER`.",
      "Drop Linux capabilities with `--cap-drop=ALL` and add back only what's needed.",
      "Mount the root filesystem read-only.",
      "Apply seccomp and AppArmor profiles.",
      "Scan images for known CVEs with `docker scout` or Trivy.",
    ],
    tryIt:
      "Run a container with `docker run --read-only --cap-drop=ALL --security-opt=no-new-privileges --user 1000:1000 alpine sh`. Try `apk add curl` — it fails. That's the goal: a container that *can't* be modified at runtime.",
    takeaways: [
      "**Root inside a container is root on the host** for many capabilities. Always set `USER` to non-zero.",
      "Default capability list is far too permissive. Drop all, add back `NET_BIND_SERVICE` only if needed.",
      "`--read-only` plus a `tmpfs` for `/tmp` blocks an entire class of post-exploitation behaviour.",
      "Image scans should run in CI **and** at admission — vulnerabilities are discovered every day.",
      "User namespaces (`--userns-remap`) add another isolation layer — worth enabling on multi-tenant hosts.",
    ],
  },
  "secrets-management": {
    objectives: [
      "Explain why `ENV` and `ARG` are not safe for secrets.",
      "Use Docker BuildKit secrets at build time.",
      "Use Docker Swarm secrets or external managers (Vault, AWS SM) at runtime.",
      "Avoid leaking secrets into image layers, history, or `docker inspect` output.",
      "Rotate secrets without rebuilding images.",
    ],
    tryIt:
      "Bake a fake secret into a Dockerfile with `ENV SECRET=hunter2`, build, then run `docker history --no-trunc <image>`. Your secret is visible to anyone with pull access. Now do the same with `RUN --mount=type=secret,id=mysecret` — `docker history` shows nothing. That's the only acceptable way.",
    takeaways: [
      "Anything in `ENV` or `ARG` is **public** to anyone who can pull the image — use BuildKit secrets instead.",
      "Runtime secrets belong in a secret manager (Vault, AWS Secrets Manager, K8s Secrets), injected at start.",
      "`RUN --mount=type=secret,id=foo cat /run/secrets/foo` is the safe build-time pattern.",
      "Rotate secrets out-of-band of image builds so rotation doesn't require a redeploy.",
      "Audit `docker history`, `docker inspect`, and image layers for leaks before pushing.",
    ],
  },

  // ── Docker Module 8: Debugging ─────────────────────────────────
  "debugging-running-containers": {
    objectives: [
      "Use `docker logs`, `docker exec`, and `docker inspect` to diagnose live containers.",
      "Attach a debugger or sidecar to a running container.",
      "Diagnose 'container keeps restarting' with exit codes and the restart policy.",
      "Measure CPU, memory, and IO with `docker stats` and `docker top`.",
      "Use ephemeral debug containers for `distroless` images.",
    ],
    tryIt:
      "Run `docker run --rm -d --name flap busybox sh -c 'sleep 1; exit 1'`. Check `docker ps -a` — it's gone. Restart with `--restart=on-failure` and watch `docker events` in another terminal. Now you can see the crash loop in real time.",
    takeaways: [
      "Exit codes carry information: `137` = SIGKILL (usually OOM), `143` = SIGTERM, `139` = segfault.",
      "`docker exec -it <c> sh` only works if the image *has* a shell. Distroless does not — use `--pid=container:<c>` debug containers.",
      "`docker logs --since=10m --tail=200 -f` is more useful than scrolling raw output.",
      "`docker stats` shows live cgroup numbers — match against your `--memory` / `--cpus` limits.",
      "If `docker inspect` shows `OOMKilled: true`, raise the limit or fix the leak.",
    ],
  },
  "inspecting-images": {
    objectives: [
      "Read an image manifest and inspect its layers.",
      "Use `docker history` to see how an image was built.",
      "Extract files from an image without running it.",
      "Diff two images to find what changed between tags.",
      "Use `dive` or `docker image inspect` for deep analysis.",
    ],
    tryIt:
      "Install `dive` and run `dive <your-image>`. Sort layers by size — the biggest one is usually `npm install` or `apt-get`. That's where multi-stage builds pay off most.",
    takeaways: [
      "Images are **stacks of tarballs** plus a JSON manifest — there's no magic.",
      "`docker history` reveals every build step, including any leaked secrets in `ENV`.",
      "`docker save` + `tar xf` lets you extract files without running the image.",
      "`dive` is the fastest way to find layer bloat in someone else's image.",
      "Compare two image digests with `docker buildx imagetools inspect` — useful for supply-chain audits.",
    ],
  },

  // ── Docker Module 9: CI/CD ─────────────────────────────────────
  "github-actions-docker": {
    objectives: [
      "Build and push images from GitHub Actions using `docker/build-push-action`.",
      "Cache layers across CI runs with `cache-from` and `cache-to`.",
      "Tag images with branch, SHA, and semantic version simultaneously.",
      "Sign and verify images with `cosign`.",
      "Avoid the most common 'works on my machine' CI failures.",
    ],
    tryIt:
      "Write a workflow that runs on push to `main` and builds your image with `docker/build-push-action@v5` using `cache-from: type=gha,scope=build` and `cache-to: type=gha,mode=max`. Push twice — the second run should be 5–10× faster.",
    takeaways: [
      "`docker/setup-buildx-action` enables BuildKit features (cache, multi-arch, secrets) in CI.",
      "Cache to `type=gha,mode=max` for full layer caching across runs in the same repo.",
      "Tag with both an **immutable** tag (`sha-abc123`) and a **moving** tag (`latest`, `v1`) — deploy by digest.",
      "Sign images with `cosign sign` and verify at admission with policy controllers like Kyverno.",
      "Pin action versions to a SHA, not `@v5` — supply-chain attacks have hit popular actions.",
    ],
  },
  "multiarch-and-registry": {
    objectives: [
      "Build images for multiple architectures with `docker buildx`.",
      "Push a multi-arch manifest list to a registry.",
      "Configure registry retention, immutable tags, and vulnerability scanning.",
      "Mirror upstream images to avoid rate limits and outages.",
      "Use OCI artifacts to store more than just images (charts, SBOMs).",
    ],
    tryIt:
      "Run `docker buildx create --use && docker buildx build --platform linux/amd64,linux/arm64 -t you/app:multi --push .`. Pull on an Apple Silicon Mac and an x86 Linux box — the same tag, two different binaries.",
    takeaways: [
      "`buildx` uses QEMU under the hood for cross-arch builds — slower than native but works anywhere.",
      "A multi-arch tag is actually a **manifest list** pointing at per-arch image manifests.",
      "Set up a pull-through cache (Harbor, Artifactory, ECR) to insulate yourself from Docker Hub rate limits.",
      "Enable **tag immutability** so a deployed `v1.2.3` can never be silently replaced.",
      "OCI registries now store charts, SBOMs, and signatures — your registry is a supply-chain root of trust.",
    ],
  },

  // ── Docker Module 10: Production ───────────────────────────────
  "healthchecks-and-restart": {
    objectives: [
      "Write a `HEALTHCHECK` instruction with sensible interval, timeout, retries, and start period.",
      "Use restart policies (`no`, `on-failure`, `always`, `unless-stopped`) appropriately.",
      "Pair healthchecks with orchestrator readiness probes.",
      "Distinguish **liveness** (am I alive?) from **readiness** (am I ready for traffic?).",
      "Avoid the crash-loop death-spiral patterns.",
    ],
    tryIt:
      "Add `HEALTHCHECK --interval=5s --timeout=2s --start-period=20s --retries=3 CMD curl -fsS http://localhost/health` to your Dockerfile. Run the container and watch `docker ps` — the STATUS column shows `(healthy)` once probes pass.",
    takeaways: [
      "A healthcheck that's too aggressive (`--interval=1s --retries=1`) will restart healthy containers under load.",
      "Use `--start-period` to give slow-starting apps (JVMs, Rails) time to warm up before probes count.",
      "**Liveness** failures restart the container; **readiness** failures only drop it from load balancing.",
      "Health endpoints should check **dependencies you need**, not just `return 200`.",
      "`restart: unless-stopped` is the right default for production single-host Docker.",
    ],
  },
  "resource-limits-and-checklist": {
    objectives: [
      "Set memory and CPU limits with `--memory` and `--cpus` (and the Compose equivalents).",
      "Understand OOMKilled and how Linux decides what to kill.",
      "Pin log drivers and rotate logs to avoid disk-full incidents.",
      "Apply a production readiness checklist to every image and container.",
      "Plan for capacity, not just correctness.",
    ],
    tryIt:
      "Run `docker run --memory=64m --memory-swap=64m python:3 python -c 'a=[0]*10**8'`. The process gets OOMKilled within seconds; `docker inspect` shows `OOMKilled: true`. Memory limits are not suggestions.",
    takeaways: [
      "**Always** set both `--memory` and `--cpus`. Unlimited containers eventually starve the host.",
      "`OOMKilled` is the kernel saving the host — fix the leak or raise the limit, don't disable OOM.",
      "Default log driver writes JSON forever. Configure `max-size`/`max-file` or ship logs elsewhere.",
      "Production checklist: non-root user, read-only fs, dropped caps, resource limits, healthcheck, log rotation.",
      "Capacity planning means leaving headroom: target ~70% utilisation, not 100%.",
    ],
  },

  // ── K8s Module 1: Pods and Workloads ───────────────────────────
  "understanding-pods": {
    objectives: [
      "Describe the shared network and storage model of a Pod.",
      "Explain the role of **init containers** and **sidecars**.",
      "Tune `requests` and `limits` so the scheduler and kernel cooperate.",
      "Choose between **readiness**, **liveness**, and **startup** probes.",
      "Explain why production workloads almost always use a controller (Deployment, StatefulSet, DaemonSet) instead of raw Pods.",
    ],
    tryIt:
      "Run `kubectl explain pod.spec` and `kubectl explain pod.spec.containers.resources` to explore the live API. Then `kubectl run demo --image=nginx --dry-run=client -o yaml` and read the generated spec — every default the API server filled in for you is worth knowing.",
    takeaways: [
      "All containers in a Pod share **network** and **IPC** namespaces — they talk over `localhost`.",
      "**Requests** drive scheduling; **limits** are enforced by the kernel cgroup at runtime.",
      "A **readiness** failure removes a Pod from a Service; a **liveness** failure restarts the container.",
      "Use **init containers** for one-shot pre-start work (migrations, secret fetches, waiting on deps).",
      "Production = controllers, not raw Pods. Pods are the *unit of work*; controllers are the *unit of operation*.",
    ],
  },
  "deployments-and-replicasets": {
    objectives: [
      "Create a Deployment and explain the Deployment → ReplicaSet → Pod chain.",
      "Roll out a new version safely and roll it back with `kubectl rollout undo`.",
      "Configure `maxSurge` and `maxUnavailable` for the rollout speed you want.",
      "Use labels and selectors correctly (and avoid the 'orphaned ReplicaSet' trap).",
      "Decide when a Deployment is the wrong choice (use StatefulSet or DaemonSet instead).",
    ],
    tryIt:
      "Create a Deployment of `nginx:1.25`. Run `kubectl set image deploy/nginx nginx=nginx:1.26 && kubectl rollout status deploy/nginx`. Now `kubectl rollout history` and `kubectl rollout undo` — you've shipped and reverted in 30 seconds.",
    takeaways: [
      "A Deployment owns ReplicaSets; the ReplicaSet owns Pods. Three controllers, one story.",
      "Each rollout creates a **new** ReplicaSet — that's how rollback is instant.",
      "`maxSurge: 25%, maxUnavailable: 0` is the safe production default for stateless apps.",
      "Never edit a ReplicaSet directly; change the Deployment and let it cascade.",
      "Stateful or ordered? Use **StatefulSet**. One-per-node agent? Use **DaemonSet**.",
    ],
  },

  // ── K8s Module 2: Networking ───────────────────────────────────
  "services-explained": {
    objectives: [
      "Explain the Kubernetes networking contract (every Pod gets a routable IP).",
      "Pick the right Service type — **ClusterIP**, **NodePort**, **LoadBalancer**, **ExternalName** — for a given problem.",
      "Understand how **kube-proxy** programs iptables / IPVS to implement Services.",
      "Resolve Services by DNS using the `<svc>.<ns>.svc.cluster.local` pattern.",
      "Debug broken Services using **endpoints** as your primary diagnostic signal.",
    ],
    tryIt:
      "When in doubt, `kubectl get endpoints <svc>` first. Create a Service whose selector doesn't match any Pods — the endpoints list is empty. Fix the selector and watch endpoints populate. That's 80% of Service debugging.",
    takeaways: [
      "A Service is just a **stable virtual IP** plus a **label selector** — endpoints are dynamic.",
      "**ClusterIP** is the default and right answer 90% of the time; expose externally through **Ingress**, not raw LoadBalancers per service.",
      "**Headless** Services (`clusterIP: None`) give per-Pod DNS — essential for StatefulSets and peer-aware databases.",
      "DNS pattern: `api-svc` inside the namespace, `api-svc.production` across namespaces.",
      "Empty `Endpoints` = label mismatch or no Ready Pods — almost never a networking issue.",
    ],
  },

  // ── K8s Module 3: ConfigMaps & Secrets ─────────────────────────
  "configmaps-in-depth": {
    objectives: [
      "Create ConfigMaps from literals, files, and directories.",
      "Mount a ConfigMap as files or inject it as environment variables.",
      "Understand the propagation delay when a mounted ConfigMap changes.",
      "Version ConfigMaps to force rollouts when configuration changes.",
      "Avoid the most common ConfigMap anti-patterns.",
    ],
    tryIt:
      "Mount a ConfigMap as a volume and `kubectl edit cm` to change a value. Watch `kubectl exec <pod> -- cat /etc/config/foo` — the file updates within ~60s. Now mount it as `env:` — the env var **never** updates without a Pod restart.",
    takeaways: [
      "Mounted ConfigMap files **update in place** (~60s lag); env-var injections do **not** update until restart.",
      "Don't store secrets in a ConfigMap. Use a Secret. They're the same shape; the difference is intent and RBAC.",
      "Append a hash of the data to the ConfigMap name (or annotation) to force a rollout on change.",
      "ConfigMaps have a **1 MiB** size limit — split big configs or use a Volume.",
      "Use `immutable: true` for ConfigMaps that should never change; it improves API server performance too.",
    ],
  },
  "kubernetes-secrets": {
    objectives: [
      "Create and consume Secrets safely.",
      "Encrypt Secrets at rest with a KMS provider.",
      "Integrate external secret stores (Vault, AWS, GCP) via External Secrets Operator.",
      "Audit who can `get` and `list` Secrets in your cluster.",
      "Avoid baking secrets into images, ConfigMaps, or git.",
    ],
    tryIt:
      "`kubectl create secret generic db --from-literal=password=hunter2`. Then `kubectl get secret db -o yaml` — the value is base64, not encrypted. **Base64 is not encryption.** Enable KMS encryption at rest in your cluster config to actually protect it.",
    takeaways: [
      "Secrets are **base64-encoded**, not encrypted. Encryption at rest is a separate config (`EncryptionConfiguration`).",
      "RBAC `get`/`list` on Secrets is equivalent to reading the value — audit it tightly.",
      "Mount Secrets as files (mode `0400`) rather than env vars to limit accidental leaks via process listings.",
      "Prefer **External Secrets Operator** so the source of truth is Vault/AWS/GCP, not etcd.",
      "Rotate secrets without app changes by mounting as files and signalling the app to reload.",
    ],
  },

  // ── K8s Module 4: Persistent Storage ───────────────────────────
  "pv-and-pvc": {
    objectives: [
      "Distinguish PersistentVolumes (cluster resources) from PersistentVolumeClaims (namespaced requests).",
      "Use **access modes** (`RWO`, `ROX`, `RWX`, `RWOP`) correctly.",
      "Understand reclaim policies (`Retain`, `Delete`) and when to choose each.",
      "Bind a Pod to a PVC and survive Pod restarts.",
      "Diagnose `Pending` PVCs.",
    ],
    tryIt:
      "Create a PVC requesting 1 Gi. Watch it stay `Pending` until you create a matching PV (static provisioning) or have a StorageClass (dynamic). `kubectl describe pvc` tells you exactly which one is missing.",
    takeaways: [
      "A **PVC** is what the developer writes; the **PV** is what the platform provides.",
      "`ReadWriteOnce` means one **node** (not one Pod) can mount it — important for HA failover.",
      "`Retain` keeps data when the PVC is deleted; `Delete` removes the underlying disk. Pick deliberately.",
      "`Pending` PVCs almost always mean **no matching PV** and **no working StorageClass**.",
      "StatefulSets use a `volumeClaimTemplates:` so each replica gets its own PVC automatically.",
    ],
  },
  "storageclasses": {
    objectives: [
      "Create a StorageClass and mark it as default.",
      "Use dynamic provisioning to skip manual PV management.",
      "Tune `volumeBindingMode: WaitForFirstConsumer` for topology-aware scheduling.",
      "Expand a volume online with `allowVolumeExpansion: true`.",
      "Choose CSI drivers appropriate to your cloud or on-prem storage.",
    ],
    tryIt:
      "Set `volumeBindingMode: Immediate` on a StorageClass in a multi-zone cluster and observe Pods getting scheduled to a different zone than their PV. Switch to `WaitForFirstConsumer` and watch the scheduler pick a node *before* the volume is created.",
    takeaways: [
      "Dynamic provisioning via a default StorageClass is the modern norm — static PVs are legacy.",
      "**`WaitForFirstConsumer`** prevents the cross-zone scheduling nightmare in multi-AZ clusters.",
      "`allowVolumeExpansion: true` enables `kubectl edit pvc` resize without downtime (on supporting CSIs).",
      "One cluster can have many StorageClasses — fast SSD, slow HDD, encrypted, etc.",
      "Snapshots are a separate CSI feature — enable them before you wish you had.",
    ],
  },

  // ── K8s Module 5: Scaling ──────────────────────────────────────
  "hpa": {
    objectives: [
      "Scale a Deployment manually with `kubectl scale`.",
      "Configure a HorizontalPodAutoscaler driven by CPU and memory.",
      "Use custom and external metrics with the metrics adapter.",
      "Tune HPA stabilisation windows and scaling policies.",
      "Combine HPA with VPA and Cluster Autoscaler safely.",
    ],
    tryIt:
      "Apply `kubectl autoscale deploy web --min=2 --max=10 --cpu-percent=70`. Generate load with `kubectl run -it --rm load --image=busybox -- /bin/sh -c 'while true; do wget -qO- http://web; done'`. Watch `kubectl get hpa -w` — pod count rises, then settles.",
    takeaways: [
      "HPA needs **`resources.requests`** to compute utilisation — without it, HPA does nothing.",
      "`metrics-server` is the prerequisite. No metrics, no autoscaling.",
      "The default cool-down (`stabilizationWindowSeconds`) prevents flapping — don't set it to zero.",
      "Custom metrics (req/sec, queue depth) almost always scale better than CPU.",
      "**Never** combine HPA and VPA on the same metric (CPU) — they will fight.",
    ],
  },
  "cluster-autoscaler-and-pdb": {
    objectives: [
      "Install and configure Cluster Autoscaler (or Karpenter) for your cloud.",
      "Use PodDisruptionBudgets to keep apps healthy during drains.",
      "Configure node groups with appropriate taints and tolerations.",
      "Plan for spot/preemptible nodes safely.",
      "Diagnose 'pod won't schedule' vs 'node won't scale up'.",
    ],
    tryIt:
      "Apply a PDB with `minAvailable: 50%` to a 4-replica Deployment, then `kubectl drain <node>`. The drain stalls if it would breach the budget — that's the safety net working.",
    takeaways: [
      "Cluster Autoscaler scales **nodes** based on **unschedulable Pods**. No pending Pods, no scale-up.",
      "PDBs protect apps during **voluntary** disruptions (drains, upgrades) — not from a Node crash.",
      "Use `minAvailable: 1` for singletons; `maxUnavailable: 25%` for fleets.",
      "Karpenter is newer, faster, and provisions per-Pod — strongly preferred over CA on AWS now.",
      "Spot nodes need PDBs, tolerations, and apps that handle 2-minute eviction notices gracefully.",
    ],
  },

  // ── K8s Module 6: Ingress ──────────────────────────────────────
  "ingress-controllers": {
    objectives: [
      "Install an Ingress controller (NGINX, Traefik, or cloud-native).",
      "Write Ingress rules with hosts, paths, and `pathType`.",
      "Route to multiple services through a single LoadBalancer.",
      "Use annotations for rewrite, rate limiting, and timeouts.",
      "Migrate from Ingress to the newer **Gateway API**.",
    ],
    tryIt:
      "Install ingress-nginx with `helm install ingress-nginx ingress-nginx/ingress-nginx`. Create two Ingress rules for `app.local` and `api.local` pointing at different Services. Add both to `/etc/hosts` and curl them — one LoadBalancer, two apps.",
    takeaways: [
      "An Ingress **resource** is a request; an Ingress **controller** is what fulfils it. You need both.",
      "Always set `pathType: Prefix` or `Exact` explicitly — the default behaviour varies.",
      "Per-controller annotations diverge wildly. Pin to one controller per cluster.",
      "**Gateway API** is the long-term successor and handles multi-tenancy and protocols cleanly.",
      "Don't route raw `LoadBalancer` services per app; the Ingress LB is your money saver.",
    ],
  },
  "tls-and-cert-manager": {
    objectives: [
      "Install cert-manager and register a Let's Encrypt ClusterIssuer.",
      "Issue and auto-renew certificates for Ingress hosts.",
      "Use HTTP-01 vs DNS-01 challenges and know when each is required.",
      "Mount certificates as Kubernetes Secrets consumed by Ingress.",
      "Troubleshoot stuck `Order` and `Challenge` resources.",
    ],
    tryIt:
      "Add `cert-manager.io/cluster-issuer: letsencrypt-prod` and a `tls:` block to your Ingress. Watch `kubectl get certificate,order,challenge` — within ~60s you have a real cert. Visit the URL — green padlock.",
    takeaways: [
      "**HTTP-01** is simpler but requires the cluster to be reachable from the internet.",
      "**DNS-01** works for internal/wildcard certs but needs DNS provider API credentials.",
      "Use `letsencrypt-staging` first — the prod issuer has aggressive rate limits.",
      "cert-manager stores the cert as a Secret; Ingress references it by name. Don't manage TLS Secrets by hand.",
      "Stuck Challenges = DNS not propagated or port 80 not reachable. 90% of failures.",
    ],
  },

  // ── K8s Module 7: RBAC ─────────────────────────────────────────
  "roles-and-clusterroles": {
    objectives: [
      "Distinguish Role (namespaced) from ClusterRole (cluster-wide).",
      "Bind roles to users, groups, and ServiceAccounts.",
      "Apply the principle of least privilege.",
      "Audit effective permissions with `kubectl auth can-i`.",
      "Avoid the most dangerous default bindings.",
    ],
    tryIt:
      "Run `kubectl auth can-i --list --as=system:serviceaccount:default:default` — that's what your default ServiceAccount can do. Anything broader than `selfsubjectaccessreviews` and you should be uncomfortable.",
    takeaways: [
      "**Role** + **RoleBinding** = namespaced; **ClusterRole** + **ClusterRoleBinding** = cluster-wide.",
      "A ClusterRole can be bound by a RoleBinding to scope it to a namespace — a hugely useful pattern.",
      "`cluster-admin` is for break-glass only. Nobody and nothing should run with it day-to-day.",
      "`kubectl auth can-i` is your audit tool. Use it on every ServiceAccount you create.",
      "Wildcard verbs (`*`) on resources are almost always a mistake.",
    ],
  },
  "serviceaccounts-and-networkpolicies": {
    objectives: [
      "Create a dedicated ServiceAccount per workload.",
      "Disable automatic token mounting where not needed.",
      "Write default-deny NetworkPolicies and selectively allow traffic.",
      "Combine egress NetworkPolicies with DNS exceptions correctly.",
      "Choose a CNI (Calico, Cilium) that enforces NetworkPolicy.",
    ],
    tryIt:
      "Apply a `default-deny` NetworkPolicy to a namespace. Watch your apps stop talking. Add an `allow-dns` policy for kube-dns. Then add per-app `allow` rules. This is zero-trust networking in 20 lines of YAML.",
    takeaways: [
      "The default ServiceAccount mounts a token. **Set `automountServiceAccountToken: false`** unless the Pod talks to the API.",
      "NetworkPolicies are **additive allow**: with no policy, all traffic; with any policy, default deny on the selected direction.",
      "Always allow egress to **kube-dns** (UDP/TCP 53) — forgetting this breaks every Pod.",
      "Your CNI must actually enforce NetworkPolicy. Flannel (default) does not. Calico, Cilium, and Weave do.",
      "Pair NetworkPolicies with mTLS via a service mesh for defence in depth.",
    ],
  },

  // ── K8s Module 8: Observability ────────────────────────────────
  "prometheus-and-grafana": {
    objectives: [
      "Install the kube-prometheus-stack Helm chart.",
      "Expose application metrics in Prometheus format.",
      "Write a PromQL query for rate, percentile, and aggregation.",
      "Build a Grafana dashboard for the RED method (Rate, Errors, Duration).",
      "Configure recording rules and alert rules.",
    ],
    tryIt:
      "`helm install kps prometheus-community/kube-prometheus-stack`. Port-forward Grafana, log in (`admin`/`prom-operator`), open the 'Kubernetes / Compute Resources / Pod' dashboard. Your cluster is now observable in 5 commands.",
    takeaways: [
      "Prometheus is a **pull-based** TSDB — your app exposes `/metrics`; Prometheus scrapes it.",
      "The **RED** method (Rate, Errors, Duration) for services; **USE** (Utilisation, Saturation, Errors) for resources.",
      "PromQL `histogram_quantile(0.99, sum(rate(http_request_duration_seconds_bucket[5m])) by (le))` = p99 latency.",
      "Use **recording rules** for expensive queries so dashboards stay fast.",
      "Alerts should be **symptom-based** (users hurt) not **cause-based** (CPU > 80%).",
    ],
  },
  "loki-and-alerting": {
    objectives: [
      "Install Loki and Promtail for log aggregation.",
      "Query logs with LogQL — labels for filtering, line matchers for content.",
      "Configure Alertmanager routes, receivers, and inhibitions.",
      "Avoid label cardinality explosions in Loki and Prometheus.",
      "Build a basic SLO and burn-rate alert.",
    ],
    tryIt:
      "In Grafana, switch the data source to Loki and run `{namespace=\"default\"} |= \"error\"`. You now see every error log across the namespace — without grepping individual Pods.",
    takeaways: [
      "Loki indexes **labels**, not log content. Keep label cardinality low (no user IDs, no request IDs).",
      "LogQL looks like PromQL: `{app=\"web\"} |= \"500\" | rate [5m]` gives you the error rate from logs.",
      "Alertmanager **groups**, **inhibits**, and **silences**. Configure all three or you'll wake people up needlessly.",
      "Page on **SLO burn rates**, not raw error rates — the math is well-defined and noise-resistant.",
      "Send alerts to a chat channel first; only escalate to phone for SLO-breaking incidents.",
    ],
  },

  // ── K8s Module 9: Helm ─────────────────────────────────────────
  "helm-chart-fundamentals": {
    objectives: [
      "Install, upgrade, and rollback releases with `helm`.",
      "Use `--values` files to keep secrets and env-specific config out of the chart.",
      "Read a chart's `values.yaml` and override fields safely.",
      "Inspect manifests before applying with `helm template` or `--dry-run`.",
      "Manage chart repositories and OCI registries.",
    ],
    tryIt:
      "`helm install pg bitnami/postgresql --set auth.postgresPassword=demo`. Then `helm upgrade pg bitnami/postgresql --set image.tag=16` and `helm rollback pg 1`. Three commands, one full release lifecycle.",
    takeaways: [
      "A **release** is a named instance of a chart in a cluster — you can install the same chart many times.",
      "`helm template` shows you exactly what would be applied — use it before every prod upgrade.",
      "Override only the values you care about; let the chart's defaults handle the rest.",
      "Store env-specific values in `values-prod.yaml` files under version control, not on operators' laptops.",
      "OCI registries (`oci://ghcr.io/...`) are the modern chart distribution channel; standalone repos are legacy.",
    ],
  },
  "writing-helm-charts": {
    objectives: [
      "Scaffold a chart with `helm create` and understand the file layout.",
      "Use template helpers in `_helpers.tpl` to avoid repetition.",
      "Validate values with a `values.schema.json`.",
      "Write `helm test` hooks and Helmfile/Helm Diff plugins.",
      "Avoid template anti-patterns (overuse of `tpl`, hard-coded namespaces).",
    ],
    tryIt:
      "`helm create demo`. Inspect `templates/deployment.yaml` — every value comes from `.Values.*`. Run `helm template demo --debug` to see the rendered output. Then add a value to `values.schema.json` and break it deliberately — Helm fails fast.",
    takeaways: [
      "Charts are just **templated YAML** + a values schema. No magic.",
      "Use `_helpers.tpl` for fully-qualified names, common labels, and the chart's selector labels.",
      "`values.schema.json` catches typos at install time — much better than runtime failures.",
      "Always include a NOTES.txt with post-install instructions. Operators thank you.",
      "Use **library charts** for shared logic across multiple applications.",
    ],
  },

  // ── K8s Module 10: Production Operations ───────────────────────
  "rolling-and-canary": {
    objectives: [
      "Configure rolling updates with `maxSurge` and `maxUnavailable`.",
      "Implement a canary release manually or with Argo Rollouts / Flagger.",
      "Pair canaries with metric-based promotion gates.",
      "Roll back fast with `kubectl rollout undo` and Argo Rollouts.",
      "Distinguish blue-green, canary, and progressive delivery patterns.",
    ],
    tryIt:
      "Install Argo Rollouts. Convert one Deployment to a `Rollout` with `steps: [setWeight: 20, pause: {duration: 30s}, setWeight: 50, pause: {}]`. Trigger a rollout — promotion pauses until you `kubectl argo rollouts promote`. That's controlled blast radius.",
    takeaways: [
      "Plain Deployments do **rolling updates** — fine for low-risk changes.",
      "**Canary** = same Service, weighted traffic to new version. **Blue-green** = swap Services.",
      "Auto-promote canaries based on **metrics**, not time — Flagger and Argo Rollouts do this.",
      "Always test rollback before you need it. `kubectl rollout undo` should be muscle memory.",
      "Progressive delivery = canary + feature flags + metric gates. The modern production default.",
    ],
  },
  "maintenance-and-dr": {
    objectives: [
      "Upgrade a cluster control plane and node pools without downtime.",
      "Drain nodes safely respecting PDBs.",
      "Back up and restore etcd (or use a managed snapshot system).",
      "Run quarterly disaster recovery drills.",
      "Plan multi-region failover for stateful workloads.",
    ],
    tryIt:
      "On a non-prod cluster, run `etcdctl snapshot save backup.db`. Then delete a namespace, and restore from the snapshot. Time the whole exercise. The number you measure is your real RTO — usually much longer than the one in your runbook.",
    takeaways: [
      "Cluster upgrades: **control plane first**, then node pools, one at a time, drain respecting PDBs.",
      "etcd is the source of truth. **Back it up daily** and test restores quarterly.",
      "Velero is the de facto K8s backup tool; managed services (EKS, GKE, AKS) have native equivalents.",
      "**RTO** (time to recover) and **RPO** (acceptable data loss) drive your DR design — measure both.",
      "Stateful workloads need DB-level replication (Postgres logical, etcd, etc.) — Kubernetes alone doesn't replicate data across regions.",
    ],
  },
};

// ──────────────────────────────────────────────────────────────────
// Module quizzes — keyed by module slug. seed.ts maps slug → id.
// ──────────────────────────────────────────────────────────────────

export interface QuizQuestion {
  text: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}
export interface ModuleQuiz {
  moduleSlug: string;
  title: string;
  questions: QuizQuestion[];
}

export const MODULE_QUIZZES: ModuleQuiz[] = [
  {
    moduleSlug: "images-and-containers",
    title: "Images and Containers — Quiz",
    questions: [
      {
        text: "Which Dockerfile form gives correct signal handling (so SIGTERM reaches your app)?",
        options: ["`CMD node server.js`", "`CMD [\"node\", \"server.js\"]`", "Either is identical", "Only `ENTRYPOINT` matters"],
        correctAnswer: 1,
        explanation: "The exec form runs the binary as PID 1 directly. The shell form wraps it in `/bin/sh -c`, which doesn't forward signals.",
      },
      {
        text: "Where should you store a build-time secret in a Dockerfile?",
        options: ["`ENV SECRET=...`", "`ARG SECRET=...`", "Neither — use `RUN --mount=type=secret`", "In a comment"],
        correctAnswer: 2,
        explanation: "`ENV` and `ARG` are visible to anyone who can pull the image via `docker history`. BuildKit's `--mount=type=secret` keeps secrets out of layers entirely.",
      },
      {
        text: "What is the main benefit of putting `COPY package.json ./` before `COPY . .`?",
        options: ["Smaller final image", "Better layer caching when source changes", "Faster `docker push`", "Required by BuildKit"],
        correctAnswer: 1,
        explanation: "Dependencies change less often than source. Copying and installing them first means source-only changes don't bust the dependency cache.",
      },
      {
        text: "What does `FROM gcr.io/distroless/static` give you?",
        options: ["A full Debian userspace", "A shell and package manager", "Only the libraries needed to run a statically-linked binary", "An Alpine-based image"],
        correctAnswer: 2,
        explanation: "Distroless images contain no shell, package manager, or extras — just enough to run your app. They're tiny and have a small attack surface.",
      },
    ],
  },
  {
    moduleSlug: "docker-compose",
    title: "Docker Compose — Quiz",
    questions: [
      {
        text: "How can a `web` service wait for Postgres to be **ready** (not just started) in Compose?",
        options: ["`depends_on: [postgres]`", "`depends_on: { postgres: { condition: service_healthy } }`", "Use a `sleep` in the web entrypoint", "Compose doesn't support this"],
        correctAnswer: 1,
        explanation: "The long-form `depends_on` with `condition: service_healthy` waits for the dependency's healthcheck to pass before starting the service.",
      },
      {
        text: "What does `docker compose down -v` do that `docker compose down` does not?",
        options: ["Stops verbose logging", "Removes named volumes", "Verifies image signatures", "Validates the compose file"],
        correctAnswer: 1,
        explanation: "`-v` deletes named volumes too. Without it, your data survives `down` and is reattached on the next `up`.",
      },
      {
        text: "Two services in the same Compose project want to talk to each other. What hostname does `web` use to reach `db`?",
        options: ["`localhost`", "`db`", "`db.compose.local`", "The container's IP"],
        correctAnswer: 1,
        explanation: "Compose creates a default network and gives each service a DNS name equal to its service name.",
      },
      {
        text: "Where do per-developer overrides typically live?",
        options: ["`compose.dev.yaml`", "`compose.override.yaml` (auto-merged)", "Inside the main `compose.yaml`", "Environment variables only"],
        correctAnswer: 1,
        explanation: "Compose automatically merges `compose.override.yaml` on top of `compose.yaml` without an explicit `-f` flag.",
      },
    ],
  },
  {
    moduleSlug: "volumes-and-storage",
    title: "Volumes and Storage — Quiz",
    questions: [
      {
        text: "Which mount type stores data **in RAM only**, so it's never written to disk?",
        options: ["Named volume", "Bind mount", "`tmpfs` mount", "Anonymous volume"],
        correctAnswer: 2,
        explanation: "`tmpfs` mounts live in memory. They disappear when the container stops — ideal for secrets or scratch space.",
      },
      {
        text: "Why are bind mounts noticeably slower than named volumes on macOS and Windows?",
        options: ["Docker throttles them", "Bind mounts cross the Linux VM boundary", "They run on `fuse`", "They use NFS"],
        correctAnswer: 1,
        explanation: "Docker Desktop runs a Linux VM. Bind mounts cross between the host filesystem and the VM, which adds significant overhead. Named volumes live inside the VM.",
      },
      {
        text: "Which is the recommended way to back up a named volume `mydata`?",
        options: ["Copy the path from `docker volume inspect`", "`docker run --rm -v mydata:/data -v $(pwd):/backup alpine tar czf /backup/mydata.tgz -C /data .`", "`docker volume backup mydata`", "Volumes can't be backed up"],
        correctAnswer: 1,
        explanation: "Backup is done with an ephemeral container that has both the volume and your host directory mounted, then tars the contents.",
      },
      {
        text: "A bind mount onto a path inside a container that already had files — what happens?",
        options: ["The container's files are merged with the host", "The container's files at that path are hidden", "Docker refuses to start", "Docker copies the container files to the host"],
        correctAnswer: 1,
        explanation: "Bind mounts (and volumes) **shadow** anything that was at the mount point in the image. This catches people out constantly.",
      },
    ],
  },
  {
    moduleSlug: "docker-networking",
    title: "Docker Networking — Quiz",
    questions: [
      {
        text: "Why should you create a user-defined bridge network instead of using the default `bridge`?",
        options: ["It's faster", "Container-name DNS works", "It uses less memory", "It enables IPv6 by default"],
        correctAnswer: 1,
        explanation: "User-defined bridges give you automatic DNS resolution between containers by name. The default `bridge` only supports IP-based connectivity.",
      },
      {
        text: "What does `docker run -p 8080:80` do?",
        options: ["Maps container port 8080 → host port 80", "Maps host port 8080 → container port 80", "Exposes port 80 internally", "Both ports on both sides"],
        correctAnswer: 1,
        explanation: "The syntax is always `host:container`. So `-p 8080:80` publishes the container's port 80 on the host's port 8080.",
      },
      {
        text: "What does the `EXPOSE 8080` directive in a Dockerfile actually do?",
        options: ["Opens port 8080 on the host", "Documents the intended port; doesn't publish it", "Forces a port mapping", "Configures NAT"],
        correctAnswer: 1,
        explanation: "`EXPOSE` is metadata — it's documentation and a hint for `-P`. It does **not** publish a port. You still need `-p`.",
      },
      {
        text: "You want to bind a container's port only on the local machine (not the LAN). Which is correct?",
        options: ["`-p 8080:80`", "`-p 127.0.0.1:8080:80`", "`-p 0.0.0.0:8080:80`", "`-p :8080:80`"],
        correctAnswer: 1,
        explanation: "Prefixing the host IP restricts the publish to that interface. `127.0.0.1` is loopback only — invisible to the LAN.",
      },
    ],
  },
  {
    moduleSlug: "multi-stage-builds",
    title: "Multi-stage Builds — Quiz",
    questions: [
      {
        text: "What ends up in the final published image from a multi-stage Dockerfile?",
        options: ["All stages concatenated", "Only the last stage", "Only the first stage", "Whichever stage is largest"],
        correctAnswer: 1,
        explanation: "Only the final `FROM` stage is committed to the published image unless you build with `--target`. Earlier stages are discarded.",
      },
      {
        text: "Which file makes the biggest difference to build context size and cache stability?",
        options: ["`Dockerfile`", "`.dockerignore`", "`docker-compose.yaml`", "`README.md`"],
        correctAnswer: 1,
        explanation: "`.dockerignore` keeps `.git`, `node_modules`, build artifacts, and logs out of the build context — usually reducing it by 10× or more and stabilising the cache.",
      },
      {
        text: "Which BuildKit feature caches package manager downloads across builds without bloating the image?",
        options: ["`COPY --link`", "`RUN --mount=type=cache,target=/root/.cache`", "`ARG CACHE`", "`HEALTHCHECK`"],
        correctAnswer: 1,
        explanation: "`--mount=type=cache` mounts a persistent cache directory only during the `RUN`, so it never becomes part of the image layer.",
      },
      {
        text: "You want to build a CI test image and a production image from the same Dockerfile. What's the cleanest approach?",
        options: ["Two Dockerfiles", "One Dockerfile with named stages built with `--target test` and `--target prod`", "Use `docker compose`", "Bash heredoc"],
        correctAnswer: 1,
        explanation: "Named stages plus `--target` keep test and production in lockstep using the same base layers, eliminating drift between environments.",
      },
    ],
  },
  {
    moduleSlug: "docker-security",
    title: "Docker Security — Quiz",
    questions: [
      {
        text: "What does running a container with `--cap-drop=ALL --cap-add=NET_BIND_SERVICE` achieve?",
        options: ["No network access", "Only the capability to bind low ports; everything else is dropped", "Drops privileges only after startup", "Disables seccomp"],
        correctAnswer: 1,
        explanation: "This is the least-privilege pattern: drop every Linux capability, then re-add only the specific ones the app needs (binding ports <1024 in this case).",
      },
      {
        text: "Why is putting a secret in `ENV SECRET=hunter2` dangerous?",
        options: ["Env vars are case-sensitive", "It's visible in `docker history` and `docker inspect`", "It slows the container down", "It's encrypted incorrectly"],
        correctAnswer: 1,
        explanation: "Anyone who can pull the image can read it via `docker history --no-trunc`. The secret is effectively public.",
      },
      {
        text: "A container running as root inside but mapped to UID 0 on the host — true or false: root in the container is root on the host?",
        options: ["True, for most capabilities", "False, containers are fully isolated", "Only on Windows", "Only with `--privileged`"],
        correctAnswer: 0,
        explanation: "Without user-namespace remapping, UID 0 inside the container is UID 0 on the host. A compromise + a host volume mount = root on the host.",
      },
      {
        text: "Which is the safest pattern for build-time secrets?",
        options: ["`ENV`", "`ARG`", "`RUN --mount=type=secret,id=foo`", "Bake them into a file and `RUN rm`"],
        correctAnswer: 2,
        explanation: "Only BuildKit's secret mount keeps the value out of every image layer. Even files that you `rm` later remain in earlier layers.",
      },
    ],
  },
  {
    moduleSlug: "debugging-containers",
    title: "Debugging Containers — Quiz",
    questions: [
      {
        text: "A container exited with code `137`. What's the most likely cause?",
        options: ["Application bug", "Out of memory (SIGKILL)", "Clean shutdown", "Image not found"],
        correctAnswer: 1,
        explanation: "Exit code 137 is `128 + 9`, where 9 is SIGKILL — almost always the kernel OOM-killer hitting your memory limit.",
      },
      {
        text: "Your image is `distroless` so `docker exec -it sh` fails. What's the right next step?",
        options: ["Rebuild with Alpine", "Use `docker run` with a debug container sharing the target's namespaces", "Give up", "`docker cp` the binary out"],
        correctAnswer: 1,
        explanation: "Run a busybox container with `--pid=container:<name>` and shared network/IPC namespaces. You get a shell in the same context without polluting the production image.",
      },
      {
        text: "Which command shows live CPU and memory usage per container?",
        options: ["`docker logs`", "`docker stats`", "`docker inspect`", "`docker top`"],
        correctAnswer: 1,
        explanation: "`docker stats` streams live cgroup usage — perfect for spotting memory leaks or CPU spikes in real time.",
      },
      {
        text: "What does `docker logs --since=10m --tail=200 -f <c>` do?",
        options: ["Follows logs for 10 minutes", "Shows the last 200 lines from the last 10 minutes and follows new ones", "Tails 10 lines every minute", "Truncates the log file"],
        correctAnswer: 1,
        explanation: "Combining time and tail filters with `-f` gives you a focused, scrollable, live log view instead of dumping the entire history.",
      },
    ],
  },
  {
    moduleSlug: "docker-in-cicd",
    title: "Docker in CI/CD — Quiz",
    questions: [
      {
        text: "What's the simplest way to make GitHub Actions Docker builds 5–10× faster on repeated runs?",
        options: ["Use bigger runners", "Configure `cache-from`/`cache-to` with `type=gha,mode=max`", "Disable BuildKit", "Use `--no-cache=false`"],
        correctAnswer: 1,
        explanation: "GitHub Actions cache (`type=gha`) backed by BuildKit lets layers persist across runs in the same repo.",
      },
      {
        text: "How should you tag images so deployments are reproducible?",
        options: ["Always `latest`", "Immutable tag (commit SHA) plus a moving tag (`latest`, `v1`)", "Random UUID", "Tag is unnecessary"],
        correctAnswer: 1,
        explanation: "Deploy by **digest** or the immutable SHA tag so you know exactly what's running. Moving tags are convenient pointers, not deployment targets.",
      },
      {
        text: "Which tool signs and verifies container images in the Sigstore ecosystem?",
        options: ["`cosign`", "`docker sign`", "`gpg`", "`notation`"],
        correctAnswer: 0,
        explanation: "`cosign` is the de facto Sigstore signer/verifier. Pair it with an admission policy controller for end-to-end supply-chain assurance.",
      },
      {
        text: "Which is a real supply-chain risk in CI workflows?",
        options: ["Using `actions/checkout@v4`", "Pinning to a tag instead of a SHA", "Using Ubuntu runners", "Running tests in parallel"],
        correctAnswer: 1,
        explanation: "Tags can be moved. Pinning third-party actions to a SHA is the only way to defend against a maintainer (or attacker) repointing a tag.",
      },
    ],
  },
  {
    moduleSlug: "docker-in-production",
    title: "Docker in Production — Quiz",
    questions: [
      {
        text: "A long-startup app (JVM) keeps getting marked unhealthy and restarted. What's the right tuning?",
        options: ["Lower `--interval`", "Raise `--retries` to 100", "Add `--start-period=30s`", "Remove the healthcheck"],
        correctAnswer: 2,
        explanation: "`--start-period` tells Docker to ignore probe failures during initial startup. Without it, slow-booting apps die in a crash loop.",
      },
      {
        text: "What restart policy do you want for a typical production service?",
        options: ["`no`", "`on-failure`", "`always`", "`unless-stopped`"],
        correctAnswer: 3,
        explanation: "`unless-stopped` restarts on crash and on host reboot but respects manual stops. The other policies either don't auto-recover or fight you when you intentionally stop.",
      },
      {
        text: "What happens if a container hits its `--memory` limit?",
        options: ["Docker logs a warning", "The container is paused", "The kernel OOM-kills a process inside it (often the main PID)", "Memory is swapped out"],
        correctAnswer: 2,
        explanation: "Memory limits are enforced by the kernel cgroup. When you exceed them, the OOM-killer fires inside the container.",
      },
      {
        text: "What's the biggest risk of leaving Docker's default log driver unconfigured in production?",
        options: ["Logs are encrypted", "Disks fill up because JSON logs grow forever", "Logs are missing timestamps", "Logs aren't shipped to stdout"],
        correctAnswer: 1,
        explanation: "The default `json-file` driver has no rotation. Set `max-size` and `max-file`, or ship logs to a central system before your disks fill up at 3 AM.",
      },
    ],
  },
  {
    moduleSlug: "pods-and-workloads",
    title: "Pods and Workloads — Quiz",
    questions: [
      {
        text: "Which of these is true about containers in the **same** Pod?",
        options: ["They have separate IP addresses", "They share the network namespace and reach each other via `localhost`", "They're on different nodes", "They have separate hostnames"],
        correctAnswer: 1,
        explanation: "All containers in a Pod share a network namespace, so they see the same IP and the same loopback interface — they talk via `localhost:<port>`.",
      },
      {
        text: "What is the difference between **liveness** and **readiness** probes?",
        options: ["No difference", "Liveness restarts the container on failure; readiness removes it from Service endpoints", "Readiness restarts; liveness removes", "Liveness only runs once"],
        correctAnswer: 1,
        explanation: "Liveness failures kill and restart the container. Readiness failures keep the container running but stop sending it traffic until it recovers.",
      },
      {
        text: "Why do production workloads use a Deployment rather than a raw Pod?",
        options: ["Deployments are faster", "Raw Pods are not rescheduled if their node fails", "Pods can't have labels", "Pods don't support images"],
        correctAnswer: 1,
        explanation: "A bare Pod has no controller above it. If its node dies, it's gone forever. A Deployment (or other controller) ensures the desired Pod count is maintained.",
      },
      {
        text: "What does the `requests` field on a container drive?",
        options: ["The hard upper bound on usage", "Scheduling decisions and resource reservations", "Healthcheck cadence", "Image pull priority"],
        correctAnswer: 1,
        explanation: "`requests` is what the scheduler uses to place the Pod and what the kernel uses to guarantee minimum resources. `limits` is the hard cap.",
      },
    ],
  },
  {
    moduleSlug: "networking",
    title: "Networking in Kubernetes — Quiz",
    questions: [
      {
        text: "A Service shows `Endpoints: <none>`. What's the most likely cause?",
        options: ["Network plugin broken", "Label selector doesn't match any Ready Pods", "DNS misconfigured", "API server overloaded"],
        correctAnswer: 1,
        explanation: "Empty endpoints almost always means the Service's `selector` doesn't match Pods, or matching Pods aren't `Ready`. Check labels first.",
      },
      {
        text: "Which Service type is right for **internal-only** traffic between Pods?",
        options: ["LoadBalancer", "NodePort", "ClusterIP", "ExternalName"],
        correctAnswer: 2,
        explanation: "ClusterIP is the in-cluster, internally-routable virtual IP — the default and right choice for service-to-service traffic.",
      },
      {
        text: "From a Pod in namespace `default`, what's the DNS name to reach Service `api` in namespace `prod`?",
        options: ["`api`", "`api.prod`", "`api.default`", "`api@prod`"],
        correctAnswer: 1,
        explanation: "Within the same namespace, `api` works. Across namespaces, `api.prod` (or fully `api.prod.svc.cluster.local`). The namespace is the second segment.",
      },
      {
        text: "What is a **headless** Service (`clusterIP: None`) used for?",
        options: ["Disabling networking", "Returning each Pod's IP directly via DNS", "Faster load balancing", "Exposing UDP only"],
        correctAnswer: 1,
        explanation: "Headless Services return all matching Pod IPs as DNS A records, giving the client per-Pod addressing — essential for StatefulSets and peer-aware databases.",
      },
    ],
  },
  {
    moduleSlug: "config-and-secrets",
    title: "ConfigMaps and Secrets — Quiz",
    questions: [
      {
        text: "You mount a ConfigMap as a volume and update it. The Pod sees the change because...",
        options: ["Kubelet rewrites the file (~60s lag)", "The Pod restarts", "Never — Pods must restart", "The container image is rebuilt"],
        correctAnswer: 0,
        explanation: "Volume-mounted ConfigMaps are projected by the kubelet and refreshed in place with a short delay. Env-var injections, however, never update without a restart.",
      },
      {
        text: "Kubernetes Secrets are stored in etcd as...",
        options: ["AES-256 encrypted by default", "Base64-encoded only, unless you configure encryption at rest", "Plaintext", "TLS-encrypted only"],
        correctAnswer: 1,
        explanation: "By default Secrets are base64 — not encryption. Enable `EncryptionConfiguration` with a KMS provider for real encryption at rest.",
      },
      {
        text: "Best practice for sourcing Secrets in modern clusters?",
        options: ["Keep them in git", "Use External Secrets Operator to sync from Vault/AWS/GCP", "Bake into images", "Pass via command-line args"],
        correctAnswer: 1,
        explanation: "Keep the source of truth in a real secret manager. ESO syncs to native K8s Secrets so apps don't need vault SDKs.",
      },
      {
        text: "ConfigMap size limit?",
        options: ["No limit", "1 MiB", "10 MiB", "Same as etcd's value limit (1.5 MB)"],
        correctAnswer: 1,
        explanation: "ConfigMaps (and Secrets) are limited to 1 MiB. Split large configs or mount them via a Volume backed by a different storage class.",
      },
    ],
  },
  {
    moduleSlug: "persistent-storage",
    title: "Persistent Storage — Quiz",
    questions: [
      {
        text: "Access mode `ReadWriteOnce` means...",
        options: ["One Pod can mount it", "One node can mount it (one or many Pods on that node)", "Read-only after first write", "Only the controller can read"],
        correctAnswer: 1,
        explanation: "`RWO` is per-**node**, not per-Pod. That distinction matters during failover and when scheduling multiple replicas of a controller.",
      },
      {
        text: "A PVC is stuck `Pending`. Most likely?",
        options: ["Permissions issue", "No matching PV and no usable StorageClass", "Volume name typo", "Network plugin not installed"],
        correctAnswer: 1,
        explanation: "A PVC stays Pending until it can bind. Either provide a matching static PV or ensure a default StorageClass can dynamically provision one.",
      },
      {
        text: "Which `volumeBindingMode` avoids the cross-zone scheduling bug in multi-AZ clusters?",
        options: ["`Immediate`", "`WaitForFirstConsumer`", "`OnDemand`", "`Topology`"],
        correctAnswer: 1,
        explanation: "`WaitForFirstConsumer` delays volume provisioning until a Pod is scheduled, so the volume lands in the right zone.",
      },
      {
        text: "How do StatefulSets give each replica its own PVC?",
        options: ["You create them manually", "Via `volumeClaimTemplates`", "Via `dynamicClaims: true`", "They share one PVC"],
        correctAnswer: 1,
        explanation: "`volumeClaimTemplates` causes the controller to create a uniquely-named PVC per replica, preserved across restarts.",
      },
    ],
  },
  {
    moduleSlug: "scaling-and-hpa",
    title: "Scaling and Autoscaling — Quiz",
    questions: [
      {
        text: "HPA isn't scaling your Deployment. First thing to check?",
        options: ["Network policies", "That `metrics-server` is installed and Pods have `resources.requests` set", "Node taints", "DNS config"],
        correctAnswer: 1,
        explanation: "HPA needs metrics from metrics-server and a `requests` value to compute utilisation. Without either, HPA is silent.",
      },
      {
        text: "What does Cluster Autoscaler use to decide it needs more nodes?",
        options: ["CPU usage on existing nodes", "The presence of unschedulable Pods", "Time of day", "PDB violations"],
        correctAnswer: 1,
        explanation: "CA looks for Pods that can't be scheduled because of resource constraints. No pending Pods = no scale-up, even if nodes are full.",
      },
      {
        text: "A PodDisruptionBudget with `minAvailable: 50%` on a 4-replica Deployment. You drain a node hosting 3 of them. What happens?",
        options: ["Drain succeeds immediately", "Drain stalls until enough replicas are ready elsewhere", "Drain fails permanently", "PDB is ignored"],
        correctAnswer: 1,
        explanation: "The drain respects the PDB and waits for replicas to be rescheduled and Ready before evicting more. That's the safety net.",
      },
      {
        text: "Combining HPA and VPA on the same metric (CPU) is...",
        options: ["Recommended", "A known anti-pattern — they fight", "Required for elasticity", "Only safe with KEDA"],
        correctAnswer: 1,
        explanation: "HPA wants to add replicas when CPU is high; VPA wants to raise requests of existing replicas. On the same metric they oscillate.",
      },
    ],
  },
  {
    moduleSlug: "ingress-and-tls",
    title: "Ingress and TLS — Quiz",
    questions: [
      {
        text: "What's the relationship between an `Ingress` resource and an Ingress controller?",
        options: ["Same thing", "Resource declares rules; controller enforces them", "Controller is optional", "Resource includes the controller binary"],
        correctAnswer: 1,
        explanation: "The Ingress *resource* is desired config; the Ingress *controller* (NGINX, Traefik, etc.) is the running component that actually accepts traffic.",
      },
      {
        text: "cert-manager `HTTP-01` challenge requires...",
        options: ["DNS API credentials", "Port 80 reachable from the internet", "TLS client certs", "Cluster admin access"],
        correctAnswer: 1,
        explanation: "HTTP-01 proves domain control by serving a file at `http://<domain>/.well-known/...`. The Let's Encrypt servers must reach you on port 80.",
      },
      {
        text: "When should you choose **DNS-01** over **HTTP-01**?",
        options: ["For wildcard certificates or non-internet-reachable clusters", "For faster issuance", "Always", "Never"],
        correctAnswer: 0,
        explanation: "DNS-01 is the only way to issue wildcard certs (`*.example.com`) and works for private clusters because it proves domain control via DNS, not HTTP.",
      },
      {
        text: "What's the modern, more flexible successor to the Ingress API?",
        options: ["IngressV2", "Gateway API", "ServiceMesh", "ExternalDNS"],
        correctAnswer: 1,
        explanation: "Gateway API splits the responsibilities of an Ingress across multiple resources (Gateway, HTTPRoute, etc.), enabling clean multi-tenant and protocol-aware routing.",
      },
    ],
  },
  {
    moduleSlug: "rbac-and-security",
    title: "RBAC and Security — Quiz",
    questions: [
      {
        text: "What's the difference between a Role and a ClusterRole?",
        options: ["None", "Role is namespaced; ClusterRole is cluster-wide", "Role is for users; ClusterRole is for ServiceAccounts", "ClusterRole is deprecated"],
        correctAnswer: 1,
        explanation: "Role lives in a single namespace; ClusterRole is cluster-scoped. You can also bind a ClusterRole with a RoleBinding to scope it to one namespace.",
      },
      {
        text: "How do you check what a ServiceAccount can do?",
        options: ["Read its YAML", "`kubectl auth can-i --list --as=system:serviceaccount:ns:sa`", "Run a Pod and try", "Check audit logs"],
        correctAnswer: 1,
        explanation: "`kubectl auth can-i` impersonates the subject and queries the API server's authorisation engine — the definitive answer.",
      },
      {
        text: "Your Pod doesn't talk to the Kubernetes API. What's the safe default?",
        options: ["Mount the default token", "Set `automountServiceAccountToken: false`", "Create a Role with no rules", "Disable RBAC"],
        correctAnswer: 1,
        explanation: "If the workload doesn't need the API, don't mount a token at all. It removes an entire class of escalation paths.",
      },
      {
        text: "Your cluster has no NetworkPolicies and you create one with `policyTypes: [Ingress]` selecting Pod `web` with no rules. Result?",
        options: ["No change", "All ingress to `web` is denied (default deny)", "All ingress is allowed", "Egress is denied"],
        correctAnswer: 1,
        explanation: "Once any Ingress policy selects a Pod, the default for that Pod becomes deny. An empty rules block means no traffic is allowed.",
      },
    ],
  },
  {
    moduleSlug: "observability",
    title: "Observability and Monitoring — Quiz",
    questions: [
      {
        text: "Prometheus collects metrics by...",
        options: ["Receiving pushes from apps", "Scraping `/metrics` endpoints on a schedule", "Tailing log files", "Reading kernel counters"],
        correctAnswer: 1,
        explanation: "Prometheus is pull-based: apps expose `/metrics`, Prometheus scrapes them periodically. (Pushgateway exists for short-lived jobs only.)",
      },
      {
        text: "The RED method for service observability stands for...",
        options: ["Rate, Errors, Duration", "Read, Edit, Delete", "Receive, Encode, Dispatch", "Requests, Endpoints, Dependencies"],
        correctAnswer: 0,
        explanation: "RED — Rate, Errors, Duration — covers the user-visible properties of a service. Pair with USE (Utilisation, Saturation, Errors) for resources.",
      },
      {
        text: "Why should Loki label cardinality be kept low?",
        options: ["Loki indexes labels — high cardinality wrecks performance and cost", "Loki only supports 5 labels", "It's a security policy", "It improves Grafana rendering"],
        correctAnswer: 0,
        explanation: "Loki indexes labels, not content. Putting high-cardinality fields (user_id, request_id) in labels explodes the index. Use line content (`|=`) for those.",
      },
      {
        text: "Best practice for paging alerts?",
        options: ["Page on CPU > 80%", "Page on SLO burn-rate breaches", "Page on every WARN log", "Page on every restart"],
        correctAnswer: 1,
        explanation: "Symptom-based alerts tied to user-visible SLOs minimise pager noise. CPU and resource alerts belong in a dashboard, not in your phone at 3 AM.",
      },
    ],
  },
  {
    moduleSlug: "helm",
    title: "Helm — Quiz",
    questions: [
      {
        text: "What is a Helm **release**?",
        options: ["A chart version", "A named instance of a chart installed in a cluster", "A git tag", "A Docker image"],
        correctAnswer: 1,
        explanation: "You can install the same chart many times under different release names; each release is tracked independently and can be upgraded or rolled back.",
      },
      {
        text: "How do you preview what `helm install` will create without applying it?",
        options: ["`helm install --preview`", "`helm template` or `helm install --dry-run`", "`kubectl diff`", "It's not possible"],
        correctAnswer: 1,
        explanation: "Both render the chart to YAML so you can review the manifests. Use this for every prod upgrade.",
      },
      {
        text: "Where should environment-specific overrides live?",
        options: ["Edit the chart in place", "`values-prod.yaml` files passed with `-f`", "On the operator's laptop", "Hard-coded in templates"],
        correctAnswer: 1,
        explanation: "Per-environment values files keep your chart generic and your environments explicit and version-controlled.",
      },
      {
        text: "Which catches typos at install time?",
        options: ["`values.schema.json`", "A linter", "Kubernetes admission", "Nothing — runtime only"],
        correctAnswer: 0,
        explanation: "JSON schema validation runs before any resources are created. It's the cheapest way to prevent misconfigured releases.",
      },
    ],
  },
  {
    moduleSlug: "production-operations",
    title: "Production Operations — Quiz",
    questions: [
      {
        text: "Safe production default for a stateless Deployment rolling update?",
        options: ["`maxSurge: 100%, maxUnavailable: 100%`", "`maxSurge: 25%, maxUnavailable: 0`", "`maxSurge: 0, maxUnavailable: 100%`", "Defaults are fine for any workload"],
        correctAnswer: 1,
        explanation: "Surge by 25% and never go below desired keeps capacity stable during rollouts — the standard safe default for stateless apps.",
      },
      {
        text: "Difference between **canary** and **blue-green**?",
        options: ["Same thing", "Canary sends a small % of traffic to the new version; blue-green switches all at once between two full environments", "Blue-green is faster", "Canary requires Istio"],
        correctAnswer: 1,
        explanation: "Canary gradually shifts traffic and limits blast radius. Blue-green flips 100% from the old (blue) to the new (green) environment in one cutover.",
      },
      {
        text: "Which is the source of truth for a Kubernetes cluster's state?",
        options: ["API server", "etcd", "kubelet", "Scheduler"],
        correctAnswer: 1,
        explanation: "etcd holds the canonical state. **Back it up daily** and rehearse restores quarterly — your RTO is whatever you've actually measured.",
      },
      {
        text: "Recommended cluster upgrade order?",
        options: ["All nodes first, then control plane", "Control plane first, then node pools one at a time, draining with PDB respect", "Random order", "Skip versions to save time"],
        correctAnswer: 1,
        explanation: "Control plane components are backward compatible with one minor version of kubelet — upgrade control plane first, then nodes incrementally.",
      },
    ],
  },
];
