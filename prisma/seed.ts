import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // Docker course
  const dockerCourse = await prisma.course.upsert({
    where: { slug: "docker-foundations" },
    update: {},
    create: {
      title: "Docker Foundations",
      description:
        "Learn everything you need to containerize applications with Docker — from basic commands to Compose-based multi-service setups.",
      slug: "docker-foundations",
      order: 1,
    },
  });

  // Kubernetes course
  const k8sCourse = await prisma.course.upsert({
    where: { slug: "kubernetes-essentials" },
    update: {},
    create: {
      title: "Kubernetes Essentials",
      description:
        "Master Kubernetes from the ground up — Pods, Deployments, Services, ConfigMaps, Ingress, and cluster operations.",
      slug: "kubernetes-essentials",
      order: 2,
    },
  });

  // Docker Module 1
  const dockerMod1 = await prisma.module.upsert({
    where: { courseId_slug: { courseId: dockerCourse.id, slug: "getting-started" } },
    update: {},
    create: {
      title: "Getting Started with Docker",
      description: "Install Docker, understand containers vs VMs, and run your first container.",
      slug: "getting-started",
      order: 1,
      courseId: dockerCourse.id,
    },
  });

  // Docker Module 2
  const dockerMod2 = await prisma.module.upsert({
    where: { courseId_slug: { courseId: dockerCourse.id, slug: "images-and-containers" } },
    update: {},
    create: {
      title: "Images and Containers",
      description: "Build custom images with Dockerfiles, manage layers, and work with container lifecycles.",
      slug: "images-and-containers",
      order: 2,
      courseId: dockerCourse.id,
    },
  });

  // Docker Module 3
  const dockerMod3 = await prisma.module.upsert({
    where: { courseId_slug: { courseId: dockerCourse.id, slug: "docker-compose" } },
    update: {},
    create: {
      title: "Docker Compose",
      description: "Define and run multi-container applications with Docker Compose YAML files.",
      slug: "docker-compose",
      order: 3,
      courseId: dockerCourse.id,
    },
  });

  // K8s Module 1
  const k8sMod1 = await prisma.module.upsert({
    where: { courseId_slug: { courseId: k8sCourse.id, slug: "pods-and-workloads" } },
    update: {},
    create: {
      title: "Pods and Workloads",
      description: "Understand the basic unit of Kubernetes — the Pod — and higher-level workload controllers.",
      slug: "pods-and-workloads",
      order: 1,
      courseId: k8sCourse.id,
    },
  });

  // K8s Module 2
  const k8sMod2 = await prisma.module.upsert({
    where: { courseId_slug: { courseId: k8sCourse.id, slug: "networking" } },
    update: {},
    create: {
      title: "Networking in Kubernetes",
      description: "Services, DNS, Ingress, and how traffic flows inside and outside your cluster.",
      slug: "networking",
      order: 2,
      courseId: k8sCourse.id,
    },
  });

  // ── Docker modules 4-10 ────────────────────────────────────────────
  const dockerMod4 = await prisma.module.upsert({
    where: { courseId_slug: { courseId: dockerCourse.id, slug: "volumes-and-storage" } },
    update: {},
    create: { title: "Volumes and Data Persistence", description: "Named volumes, bind mounts, and tmpfs — keep your data alive across container restarts.", slug: "volumes-and-storage", order: 4, courseId: dockerCourse.id },
  });
  const dockerMod5 = await prisma.module.upsert({
    where: { courseId_slug: { courseId: dockerCourse.id, slug: "docker-networking" } },
    update: {},
    create: { title: "Docker Networking", description: "Bridge, host, and overlay networks — connect containers reliably and securely.", slug: "docker-networking", order: 5, courseId: dockerCourse.id },
  });
  const dockerMod6 = await prisma.module.upsert({
    where: { courseId_slug: { courseId: dockerCourse.id, slug: "multi-stage-builds" } },
    update: {},
    create: { title: "Multi-stage Builds and Optimization", description: "Shrink images to minimal size using multi-stage builds, layer caching, and distroless bases.", slug: "multi-stage-builds", order: 6, courseId: dockerCourse.id },
  });
  const dockerMod7 = await prisma.module.upsert({
    where: { courseId_slug: { courseId: dockerCourse.id, slug: "docker-security" } },
    update: {},
    create: { title: "Docker Security Best Practices", description: "Run rootless containers, scan images for CVEs, and keep secrets out of layers.", slug: "docker-security", order: 7, courseId: dockerCourse.id },
  });
  const dockerMod8 = await prisma.module.upsert({
    where: { courseId_slug: { courseId: dockerCourse.id, slug: "debugging-containers" } },
    update: {},
    create: { title: "Debugging and Troubleshooting", description: "Diagnose crashes, inspect layers, profile resource usage, and fix the most common Docker problems.", slug: "debugging-containers", order: 8, courseId: dockerCourse.id },
  });
  const dockerMod9 = await prisma.module.upsert({
    where: { courseId_slug: { courseId: dockerCourse.id, slug: "docker-in-cicd" } },
    update: {},
    create: { title: "Docker in CI/CD Pipelines", description: "Build, tag, push, and deploy images automatically with GitHub Actions and other CI systems.", slug: "docker-in-cicd", order: 9, courseId: dockerCourse.id },
  });
  const dockerMod10 = await prisma.module.upsert({
    where: { courseId_slug: { courseId: dockerCourse.id, slug: "docker-in-production" } },
    update: {},
    create: { title: "Docker in Production", description: "Health checks, restart policies, resource limits, and container orchestration fundamentals.", slug: "docker-in-production", order: 10, courseId: dockerCourse.id },
  });

  // ── K8s modules 3-10 ──────────────────────────────────────────────
  const k8sMod3 = await prisma.module.upsert({
    where: { courseId_slug: { courseId: k8sCourse.id, slug: "config-and-secrets" } },
    update: {},
    create: { title: "ConfigMaps and Secrets", description: "Decouple configuration from code and manage sensitive data securely at runtime.", slug: "config-and-secrets", order: 3, courseId: k8sCourse.id },
  });
  const k8sMod4 = await prisma.module.upsert({
    where: { courseId_slug: { courseId: k8sCourse.id, slug: "persistent-storage" } },
    update: {},
    create: { title: "Persistent Storage", description: "PersistentVolumes, PersistentVolumeClaims, StorageClasses, and StatefulSets for stateful apps.", slug: "persistent-storage", order: 4, courseId: k8sCourse.id },
  });
  const k8sMod5 = await prisma.module.upsert({
    where: { courseId_slug: { courseId: k8sCourse.id, slug: "scaling-and-hpa" } },
    update: {},
    create: { title: "Scaling and Autoscaling", description: "Manual scaling, HPA, VPA, and Cluster Autoscaler — handle any traffic pattern automatically.", slug: "scaling-and-hpa", order: 5, courseId: k8sCourse.id },
  });
  const k8sMod6 = await prisma.module.upsert({
    where: { courseId_slug: { courseId: k8sCourse.id, slug: "ingress-and-tls" } },
    update: {},
    create: { title: "Ingress and TLS", description: "Expose multiple services through one load balancer, terminate TLS, and automate certificates.", slug: "ingress-and-tls", order: 6, courseId: k8sCourse.id },
  });
  const k8sMod7 = await prisma.module.upsert({
    where: { courseId_slug: { courseId: k8sCourse.id, slug: "rbac-and-security" } },
    update: {},
    create: { title: "RBAC and Security", description: "Roles, ClusterRoles, ServiceAccounts, NetworkPolicies, and Pod Security Standards.", slug: "rbac-and-security", order: 7, courseId: k8sCourse.id },
  });
  const k8sMod8 = await prisma.module.upsert({
    where: { courseId_slug: { courseId: k8sCourse.id, slug: "observability" } },
    update: {},
    create: { title: "Observability and Monitoring", description: "Collect metrics with Prometheus, visualise with Grafana, and aggregate logs with Loki.", slug: "observability", order: 8, courseId: k8sCourse.id },
  });
  const k8sMod9 = await prisma.module.upsert({
    where: { courseId_slug: { courseId: k8sCourse.id, slug: "helm" } },
    update: {},
    create: { title: "Helm Package Manager", description: "Package, version, and deploy Kubernetes applications as reusable Helm charts.", slug: "helm", order: 9, courseId: k8sCourse.id },
  });
  const k8sMod10 = await prisma.module.upsert({
    where: { courseId_slug: { courseId: k8sCourse.id, slug: "production-operations" } },
    update: {},
    create: { title: "Production Operations", description: "Rolling deployments, canary releases, disaster recovery, and cluster upgrade strategies.", slug: "production-operations", order: 10, courseId: k8sCourse.id },
  });

  // Lessons for Docker Module 1
  const lessons = [
    {
      moduleId: dockerMod1.id,
      title: "What is Docker?",
      slug: "what-is-docker",
      order: 1,
      content: `Docker matters because production failures are often boring environment mismatches dressed up as mysterious bugs. A Node.js API works on a laptop with OpenSSL 3, fails in CI with OpenSSL 1.1, and crashes in staging because the image lacks a system package the developer installed months ago and forgot about. Docker solves this by packaging the application and its runtime assumptions together so the thing you test is the thing you ship.

Why teams adopt Docker:
Docker gives engineering teams a repeatable unit of delivery. Instead of documenting ten setup steps, you publish an image. Instead of arguing about laptop differences, you standardize on a container contract. This is why platform teams at companies like Shopify and Netflix use containers as the default packaging boundary for services, batch jobs, workers, and internal tooling.

Containers vs virtual machines:
- VM: Startup time is usually measured in tens of seconds or minutes because a full guest OS boots.
- Container: Startup time is usually sub-second to a few seconds because the host kernel is reused.
- VM: Disk size is often multiple gigabytes because every VM carries a complete operating system image.
- Container: Disk size is often tens to hundreds of megabytes because layers share common base data.
- VM: OS model is full hardware virtualization with a guest kernel per machine.
- Container: OS model is process isolation using namespaces and cgroups on the host kernel.
- VM: Isolation level is stronger by default because hardware virtualization separates kernels.
- Container: Isolation level is lighter and faster, but you should not treat it as a hard security boundary.
- VM: Portability is good across hypervisors, but images are heavier and slower to distribute.
- Container: Portability is excellent across OCI-compliant runtimes and registries when the target OS and architecture match.

Docker architecture:
The Docker CLI is the client you type commands into. The Docker daemon, dockerd, is the long-running server that builds images, manages networks and volumes, and starts containers. Under the hood Docker uses containerd to manage the container lifecycle and image transfer, and containerd calls runc to create the actual Linux container using kernel primitives. Knowing this stack matters when debugging because a daemon issue, a containerd issue, and an OCI runtime issue show up differently.

Inspect the daemon:
  docker info

Check client and server versions:
  docker version

Interpreting system details:
A production engineer should read docker info like a health report. Storage driver tells you overlay2 versus something slower. Cgroup version affects resource controls. Logging driver impacts disk growth and observability. Number of CPUs and total memory explain whether Docker Desktop defaults are too small for your stack.

Example fields to look for:
  docker info --format 'Server={{.ServerVersion}} Storage={{.Driver}} Cgroup={{.CgroupVersion}} Logging={{.LoggingDriver}} CPUs={{.NCPU}} Mem={{.MemTotal}}'

Core concepts:
An image is an immutable template built from layers. A container is a running or stopped instance of that image plus a thin writable layer. A Dockerfile is the build recipe that turns source code into an image. A registry is the distribution system that stores and serves images. A layer is a content-addressed filesystem diff; this is why cache reuse is possible and why deleting a secret in a later layer does not erase it from history.

Container lifecycle:
The container lifecycle is created, running, paused, stopped, removed. You need to know the transitions because operators debug the state machine, not just the app.

Lifecycle example:
  docker create --name api-demo --label app=payments --label env=dev -e NODE_ENV=development nginx:1.27
  docker start api-demo
  docker pause api-demo
  docker unpause api-demo
  docker stop api-demo
  docker rm api-demo

OCI and portability:
The Open Container Initiative defines image and runtime specifications. OCI is why an image built by Docker can run with containerd, Podman, CRI-O, and Kubernetes-compatible runtimes. The standard reduces vendor lock-in and lets platform teams swap tooling without rebuilding their entire delivery model.

Inspect metadata with jq:
  docker run -d --name inspect-me --label team=platform -e APP_ENV=demo nginx:1.27
  docker inspect inspect-me | jq '.[0] | {name: .Name, image: .Config.Image, env: .Config.Env, labels: .Config.Labels, ip: .NetworkSettings.IPAddress}'
  docker rm -f inspect-me

Real-world use cases:
- Microservices: package each service with its exact runtime and move the same image from CI to prod.
- CI/CD: run disposable integration environments for every pull request.
- Local development: start Postgres, Redis, MinIO, and your API in minutes with no laptop drift.
- Edge deployments: ship the same artifact to stores, factories, or remote devices with poor connectivity.

What Docker is not:
Docker is not a virtual machine. Docker is not magic dependency management. Docker is not a strong security boundary by itself. Docker will not fix poor release engineering if your image build is non-reproducible, your secrets are baked into layers, or your application still assumes mutable local state.

Common pitfalls:
- Confusing image build problems with runtime problems. Build time and runtime are separate phases.
- Treating containers as pets and editing them live with docker exec. Rebuild images instead.
- Publishing every port to 0.0.0.0 even for internal-only services.
- Assuming container names resolve on the default bridge network.

Pro tips:
- Pin image tags or digests for reproducibility.
- Use labels for ownership, service name, commit SHA, and environment.
- Teach developers docker inspect and docker logs early; they solve more issues than random restarts.
- Think of Docker as packaging plus process isolation, not as a replacement for good platform design.`,
    },
    {
      moduleId: dockerMod1.id,
      title: "Installing Docker",
      slug: "installing-docker",
      order: 2,
      content: `Installing Docker well matters because bad defaults become invisible production bottlenecks. Teams frequently lose hours to Docker Desktop memory starvation, Linux permission issues, and WSL2 filesystem slowness before they ever write a Dockerfile. A senior engineer treats installation as platform setup, not as a one-click app install.

macOS:
On macOS the mainstream choice is Docker Desktop. It bundles the daemon, CLI, BuildKit, Compose, and a Linux VM because containers need a Linux kernel. The serious alternative is Colima, which uses Lima under the hood and is lighter on memory for engineers who want a more Unix-like setup.

Docker Desktop on macOS:
  brew install --cask docker
  open /Applications/Docker.app
  docker version

Colima alternative:
  brew install colima docker docker-buildx docker-compose
  colima start --cpu 4 --memory 8 --disk 60
  docker context use colima
  docker info

Windows:
On Windows, Docker Desktop should use the WSL2 backend. That gives you a real Linux kernel with much better compatibility than legacy Hyper-V only setups. Before installing, confirm virtualization is enabled in BIOS and that WSL2 is installed.

Windows setup steps:
  wsl --install
  wsl --set-default-version 2
  dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart
  dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart

Linux:
Linux gives you the most direct control and the least abstraction. For Ubuntu and Debian, prefer the official Docker repository over the distro package if you want current versions. For Fedora and RHEL, use dnf. The convenience script is acceptable for disposable labs, but production hosts should use a managed package source.

Ubuntu or Debian with apt:
  sudo apt-get update
  sudo apt-get install -y ca-certificates curl gnupg
  sudo install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo $VERSION_CODENAME) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
  sudo apt-get update
  sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

Convenience script:
  curl -fsSL https://get.docker.com | sh
  sudo systemctl enable --now docker

Fedora or RHEL:
  sudo dnf -y install dnf-plugins-core
  sudo dnf config-manager --add-repo https://download.docker.com/linux/fedora/docker-ce.repo
  sudo dnf install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
  sudo systemctl enable --now docker

Post-install configuration:
On Linux, add your user to the docker group if you want non-root access, but understand that this is effectively root-equivalent access to the host. On servers, systemd enablement, log rotation, and storage driver validation matter. For high-density hosts, verify kernel settings and filesystem support for overlay2.

Linux post-install commands:
  sudo usermod -aG docker $USER
  sudo systemctl enable docker
  sudo systemctl status docker --no-pager
  sudo sysctl -w vm.max_map_count=262144

Daemon configuration example:
  {
    "log-driver": "json-file",
    "log-opts": {
      "max-size": "10m",
      "max-file": "5"
    },
    "features": {
      "buildkit": true
    },
    "registry-mirrors": ["https://mirror.gcr.io"]
  }

Docker Desktop tuning:
Give Docker enough CPU and memory for your actual workload. A stack with Next.js, Postgres, Redis, and tests can overwhelm the default allocation. File sharing also matters; bind mounts from massive monorepos can be slow on macOS and Windows.

What to tune:
- Memory: 6-12 GB for modern full-stack projects is common.
- CPU: 4 or more cores if you build Node, Java, or Go images frequently.
- Disk image size: increase it before builds start failing mid-CI rehearsal.
- File sharing: share only the directories you need.
- Experimental features: useful for Buildx and Compose watch, but avoid toggling them blindly on team laptops.

Verification:
A real verification sequence checks the CLI, the daemon, networking, and image pull ability.

Verification commands:
  docker version
  docker run --rm hello-world
  docker run --rm -d --name verify-nginx -p 8080:80 nginx:1.27
  curl -I http://127.0.0.1:8080
  docker logs verify-nginx
  docker rm -f verify-nginx

Troubleshooting:
If docker info hangs, the daemon is not healthy. If permission denied appears on Linux, you are probably not in the docker group or your shell session has not reloaded. If WSL2 performance is poor, your repo may live on a Windows filesystem instead of inside the Linux distro.

Troubleshooting commands:
  sudo journalctl -u docker --no-pager -n 100
  systemctl status docker --no-pager
  wsl -l -v
  docker context ls

Alternative runtimes worth knowing:
- Podman: daemonless and strong for rootless workflows.
- containerd plus nerdctl: closer to the runtime stack used in Kubernetes.
- Rancher Desktop or OrbStack: desktop alternatives some teams prefer for performance or UX.

Pro tips:
- Standardize on supported versions across the team.
- Turn on BuildKit early; it changes build performance dramatically.
- Put daemon.json under configuration management for shared Linux hosts.
- Treat Docker installation issues as platform engineering issues, not developer quirks.`,
    },
    {
      moduleId: dockerMod1.id,
      title: "Your First Container",
      slug: "your-first-container",
      order: 3,
      content: `Running your first container is where Docker stops being theory and becomes an operational tool. In production, the difference between a reliable rollout and a midnight incident often comes down to understanding exactly what docker run does: which process starts, which ports bind, which limits apply, and where data goes.

The docker run command:
docker run is really several actions combined: pull the image if missing, create a container, configure namespaces and cgroups, attach storage and networking, then start the entry process. That is why a long run command can feel intimidating. It is configuring a miniature runtime environment in one line.

A realistic web container:
  docker run -d \
    --name web-nginx \
    --hostname web-nginx \
    --label service=frontend \
    --label owner=platform \
    -p 127.0.0.1:8080:80 \
    --restart unless-stopped \
    nginx:1.27

Naming and IDs:
Every container has a long ID and optionally a human name. IDs are immutable and safe for scripting. Names are for humans and logs. In real teams, names matter because dashboards, docker ps output, and incident notes become unreadable if everything is random adjectives.

Foreground vs detached:
Use foreground mode when you want to see the process directly, usually for short-lived commands or debugging. Use detached mode for long-running services. A common beginner mistake is starting a service in the foreground, closing the terminal, and thinking Docker killed it mysteriously.

Foreground and detached examples:
  docker run --rm alpine:3.20 echo "one-shot task"
  docker run -d --name redis-cache redis:7
  docker logs -f redis-cache

Interactive containers:
The -i flag keeps STDIN open. The -t flag allocates a pseudo-TTY. Together, -it gives you an interactive shell experience. Separately they still matter: -i is useful for piping input in scripts, while -t is for human terminal behavior.

Interactive examples:
  docker run --rm -it ubuntu:24.04 bash
  printf 'hello\n' | docker run --rm -i alpine:3.20 cat

Environment variables:
Containers often receive configuration through --env or --env-file. Runtime flags override defaults set by the image. Be careful: environment variables are convenient, but not ideal for highly sensitive secrets because they are visible via inspect and sometimes process listings.

Environment injection:
  cat > .env.runtime <<'EOF'
  APP_ENV=development
  LOG_LEVEL=debug
  REDIS_URL=redis://redis-cache:6379
  EOF
  docker run --rm --env APP_ENV=production --env-file .env.runtime alpine:3.20 env | sort

Resource constraints:
A senior engineer adds limits early. Without them, a memory leak or runaway worker can starve a host. Memory, CPU, and PID limits are especially important for local load testing because they expose failures before production does.

Constrained Postgres:
  docker run -d \
    --name pg-dev \
    -e POSTGRES_PASSWORD=devpass \
    -e POSTGRES_DB=app \
    -p 127.0.0.1:5432:5432 \
    --memory=1g \
    --cpus=1.5 \
    --pids-limit=256 \
    postgres:16

Port publishing:
The -p flag binds a host port to a container port. Use 127.0.0.1 when the service is only for local use. Use 0.0.0.0 only when outside clients must reach it. -P publishes all exposed ports to random host ports, which is handy in tests and usually a bad idea in production because it makes network intent opaque.

Published ports and discovery:
  docker run -d --name api -p 127.0.0.1:3000:3000 node:20-alpine sleep 1d
  docker ps --format 'table {{.Names}}\t{{.ID}}\t{{.Status}}\t{{.Ports}}'
  docker stats --no-stream api pg-dev redis-cache

Lifecycle management:
start resumes a stopped container. stop sends SIGTERM then SIGKILL after a timeout. restart does stop then start. pause freezes processes with cgroup freezer semantics. kill sends a signal immediately. These are not interchangeable. For databases, prefer stop. For hung processes, kill may be required.

Lifecycle commands:
  docker stop redis-cache
  docker start redis-cache
  docker pause redis-cache
  docker unpause redis-cache
  docker restart redis-cache
  docker kill api

Cleanup and file copying:
Use --rm for disposable containers so garbage does not accumulate. Use docker cp when you need artifacts or logs from a container without bind mounting the whole filesystem.

Copy files and cleanup:
  docker run --rm --name worker alpine:3.20 sh -c 'echo report > /tmp/report.txt && sleep 30' &
  docker cp worker:/tmp/report.txt ./report.txt
  docker container prune -f

Real-world development flow:
Imagine you are building a Node.js API that depends on Postgres and Redis. You might run Redis detached, Postgres with a named port, then run your API interactively with source mounted during development. That gives you repeatable dependencies without polluting your laptop.

Production-minded habits:
- Name containers consistently.
- Prefer localhost-only bindings for internal tools.
- Add limits before you need them.
- Use docker ps, docker logs, and docker inspect as your first line of debugging.
- Remove disposable containers aggressively so stale state does not confuse you.`,
    },
    {
      moduleId: dockerMod2.id,
      title: "Writing a Dockerfile",
      slug: "writing-a-dockerfile",
      order: 1,
      content: `A Dockerfile is not just build syntax; it is a contract describing how your software is assembled, which assumptions it makes, and what exactly operators will run in production. Weak Dockerfiles create slow builds, bloated images, leaked secrets, and fragile startup behavior. Strong Dockerfiles produce reproducible artifacts that behave predictably in CI and under pressure.

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
  docker run my-app                 # node server.js --port 3000
  docker run my-app --port 4000     # node server.js --port 4000
  docker run --entrypoint sh my-app # overrides entrypoint completely

ARG vs ENV:
ARG is for build-time variation such as selecting a version or a private registry path. ENV is for runtime defaults. Neither is appropriate for secrets. ARG values can appear in image history, build logs, or generated files. ENV values are visible in docker inspect. If a value is sensitive, use BuildKit secrets or inject it only at runtime.

ARG and ENV example:
  ARG NODE_VERSION=20.18.0
  FROM node:\${NODE_VERSION}-bookworm-slim
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

A good Dockerfile is boring in the best way: reproducible, inspectable, and unsurprising under load.`,
    },
    {
      moduleId: dockerMod3.id,
      title: "Introduction to Docker Compose",
      slug: "intro-to-docker-compose",
      order: 1,
      content: `Compose matters because real systems are almost never a single container. A developer building a Next.js application usually needs a database, a cache, maybe an object store, and often a reverse proxy. Without Compose, every engineer invents their own startup script and the team drifts. Compose gives you one declarative topology that can be run locally, in CI, and in lightweight staging environments.

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
- Use docker compose config in CI to validate merges before anyone runs them.`,
    },
    {
      moduleId: k8sMod1.id,
      title: "Understanding Pods",
      slug: "understanding-pods",
      order: 1,
      content: `The Pod is the atom of Kubernetes. Everything else — Deployments, StatefulSets, DaemonSets — is machinery built on top of it. Understanding Pods deeply is the single most important foundation for operating Kubernetes confidently, because every failure, every resource contention, and every networking mystery ultimately traces back to what happens inside one.

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
Raw Pods are not rescheduled if their node fails. You always wrap them in a controller: Deployment for stateless apps, StatefulSet for ordered stateful apps, DaemonSet for node-level agents, Job for batch tasks, CronJob for scheduled tasks.`,
    },
    {
      moduleId: k8sMod1.id,
      title: "Deployments and ReplicaSets",
      slug: "deployments-and-replicasets",
      order: 2,
      content: `A Deployment is the standard way to run stateless applications in production Kubernetes. It manages a ReplicaSet, which manages Pods, and it handles the entire lifecycle: initial creation, rolling updates, pause and resume, and rollbacks. Understanding how the Deployment controller works underneath saves hours of debugging when rollouts stall.

How the controller loop works:
The Deployment controller watches the desired state you declare and continually reconciles the actual state toward it. When you change the Pod template — image, environment variables, resource limits — the controller creates a new ReplicaSet with the updated template and begins draining the old one according to the update strategy. The old ReplicaSet is kept at zero replicas for rollback purposes until you prune history.

Production-ready Deployment manifest:
  apiVersion: apps/v1
  kind: Deployment
  metadata:
    name: api
    namespace: production
    labels:
      app: api
      team: backend
  spec:
    replicas: 3
    revisionHistoryLimit: 5
    selector:
      matchLabels:
        app: api
    strategy:
      type: RollingUpdate
      rollingUpdate:
        maxSurge: 1
        maxUnavailable: 0
    template:
      metadata:
        labels:
          app: api
          version: "2.1.0"
      spec:
        terminationGracePeriodSeconds: 60
        containers:
          - name: api
            image: myrepo/api:2.1.0
            ports:
              - containerPort: 3000
            resources:
              requests:
                cpu: "250m"
                memory: "256Mi"
              limits:
                cpu: "1"
                memory: "512Mi"
            readinessProbe:
              httpGet:
                path: /health/ready
                port: 3000
              initialDelaySeconds: 5
              periodSeconds: 10
            livenessProbe:
              httpGet:
                path: /health/live
                port: 3000
              periodSeconds: 30

maxSurge and maxUnavailable explained:
maxSurge: 1 allows one extra Pod beyond the desired count during an update — so with replicas: 3 you temporarily have 4. maxUnavailable: 0 means no Pod is taken down until a new one passes its readiness probe. Together these settings give zero-downtime rolling updates. The trade-off is slightly longer rollout time and brief resource overhead. For speed over safety, set maxUnavailable: 1 and maxSurge: 0.

Rollout operations:
  kubectl rollout status deployment/api -n production
  kubectl rollout history deployment/api -n production
  kubectl rollout history deployment/api --revision=3
  kubectl rollout undo deployment/api
  kubectl rollout undo deployment/api --to-revision=2
  kubectl rollout pause deployment/api
  kubectl rollout resume deployment/api

Scaling:
  kubectl scale deployment/api --replicas=10 -n production
  kubectl autoscale deployment/api --cpu-percent=70 --min=3 --max=20

Triggering a rollout without changing the image:
  kubectl rollout restart deployment/api -n production

Deployment vs ReplicaSet vs Pod hierarchy:
Deployment owns multiple ReplicaSets over time (one per unique template). Current ReplicaSet owns Pods. The selector on the Deployment must match the template labels exactly — Kubernetes enforces this to prevent orphaned Pods. Never manage ReplicaSets directly; let the Deployment controller own them.

Common pitfalls:
A readiness probe that is too aggressive (short initialDelaySeconds) kills new Pods before the app finishes booting, causing the rollout to stall. Always set initialDelaySeconds conservatively and watch kubectl describe pod to see probe failures. If a rollout stalls, kubectl rollout undo gets you back immediately while you investigate.

terminationGracePeriodSeconds:
When Kubernetes terminates a Pod it sends SIGTERM. After the grace period it sends SIGKILL. Your application must catch SIGTERM and finish in-flight requests within the grace period. For HTTP servers, combine a preStop: sleep 5 lifecycle hook (to give the load balancer time to remove the endpoint) with a graceful shutdown handler in your code.`,
    },
    {
      moduleId: k8sMod2.id,
      title: "Services Explained",
      slug: "services-explained",
      order: 1,
      content: `Kubernetes networking is built on a contract: every Pod gets a unique IP address, and every Pod can reach every other Pod IP directly without NAT. Services sit on top of this model to provide stable, discoverable endpoints. Understanding how Services work at the kube-proxy level makes debugging connection problems fast and certain.

Why Pod IPs alone are not enough:
Pods are ephemeral. When a Deployment rolls an update, old Pods are replaced with new ones that have different IP addresses. Any service that hardcodes a Pod IP breaks on every update. Services solve this by tracking healthy endpoints through a label selector and providing a stable virtual IP called a ClusterIP that never changes.

How kube-proxy implements Services:
On each node, kube-proxy watches the Kubernetes API for Service and Endpoints objects. In iptables mode (default), it inserts NAT rules that DNAT packets destined for the ClusterIP to a randomly chosen healthy Pod IP. In IPVS mode, it uses the Linux kernel's IPVS load balancer which handles tens of thousands of rules more efficiently — important for clusters with many services.

All four Service types:

ClusterIP (internal only):
  apiVersion: v1
  kind: Service
  metadata:
    name: api-svc
    namespace: production
  spec:
    selector:
      app: api
    ports:
      - name: http
        port: 80
        targetPort: 3000
      - name: metrics
        port: 9090
        targetPort: 9090

NodePort (exposes on every node):
  spec:
    type: NodePort
    selector:
      app: api
    ports:
      - port: 80
        targetPort: 3000
        nodePort: 30080   # 30000-32767 range

LoadBalancer (cloud only):
  spec:
    type: LoadBalancer
    selector:
      app: api
    ports:
      - port: 443
        targetPort: 3000
  Provisions an external load balancer (NLB on AWS, TCP LB on GCP).
  Use Ingress instead when routing multiple services through one LB.

ExternalName (DNS alias):
  spec:
    type: ExternalName
    externalName: my-database.us-east-1.rds.amazonaws.com
  Resolves to a CNAME, useful for migrating on-prem services or referencing managed cloud resources by a stable in-cluster DNS name.

Headless Services (no ClusterIP):
  spec:
    clusterIP: None
    selector:
      app: postgres
  DNS returns the individual Pod IPs instead of a virtual IP. Used by StatefulSets so each replica (postgres-0, postgres-1) is reachable by name. Required by some databases for peer discovery.

DNS resolution mechanics:
Kubernetes runs CoreDNS as the cluster DNS server. Service DNS follows the pattern:
  <service>.<namespace>.svc.cluster.local
  api-svc.production.svc.cluster.local
From within the same namespace you can use just api-svc. Cross-namespace requires at minimum api-svc.production.

Endpoint debugging workflow:
  kubectl get endpoints api-svc -n production
  # Shows the list of Pod IPs backing the service. Empty = no matching Pods.
  kubectl get pods -l app=api -n production
  # Verify Pods exist and are Ready.
  kubectl describe service api-svc -n production
  # Shows selector, port mappings, and endpoint list in one view.

Session affinity:
  spec:
    sessionAffinity: ClientIP
    sessionAffinityConfig:
      clientIP:
        timeoutSeconds: 10800
  Routes requests from the same client IP to the same Pod. Useful for WebSocket connections or session-heavy apps that have not been refactored for stateless operation.

Production tips:
- Always name your ports (http, grpc, metrics) — Istio and Prometheus rely on port names.
- Set targetPort to the named containerPort on the Pod, not a number, to survive port changes.
- Use LoadBalancer with AWS annotations for NLB instead of classic ELB: service.beta.kubernetes.io/aws-load-balancer-type: nlb.
- Avoid NodePort in production; it bypasses the Ingress layer and complicates firewall rules.`,
    },

    // ── Docker Module 4: Volumes and Storage ────────────────────────
    {
      moduleId: dockerMod4.id,
      title: "Understanding Docker Volumes",
      slug: "understanding-volumes",
      order: 1,
      content: `Volumes matter because containers are intentionally ephemeral. The writable container layer is designed for convenience, not durability. If you store database files, uploads, or durable queue state only inside that layer, the data disappears when the container is replaced. Production incidents caused by accidental data loss usually come from not understanding this boundary.

The container storage problem:
Docker images are read-only layers. When a container starts, Docker adds a thin writable layer on top using a copy-on-write filesystem such as overlay2. Writes go into that container-specific layer unless you mount external storage. Remove the container, and that writable layer goes away with it.

Three mount types compared:
Named volumes are Docker-managed storage best suited for databases and application state. Bind mounts map host paths directly and are ideal for development source code or host-managed config. tmpfs mounts live in memory only and are excellent for sensitive temporary files or scratch space that should never hit disk.

Named volume example:
  docker volume create pgdata
  docker run -d --name pg \
    -e POSTGRES_PASSWORD=app \
    -v pgdata:/var/lib/postgresql/data \
    postgres:16

Bind mount example:
  docker run --rm -it \
    -v "$PWD:/app" \
    -w /app \
    node:20-bookworm \
    npm test

tmpfs example:
  docker run --rm \
    --tmpfs /tmp:rw,noexec,nosuid,size=64m \
    alpine:3.20 sh -c 'mount | grep /tmp && touch /tmp/ok'

Named volumes deep dive:
Docker stores local named volumes under /var/lib/docker/volumes on Linux. You normally should not manipulate those directories directly. Use docker volume inspect, backup containers, or driver tooling. In production, the local driver is fine for single-host state but not for multi-host failover; that is where plugins such as NFS, EFS, Azure Files, or CSI-backed systems become relevant.

Inspect a volume:
  docker volume inspect pgdata
  docker system df -v

Bind mounts in detail:
Bind mounts are transparent and powerful, but they couple the container to the host filesystem layout. On macOS and Windows they can be slower than named volumes because of virtualization and filesystem synchronization. Always be explicit with read-only flags for mounted config files.

Read-only config mount:
  docker run --rm \
    -v "$PWD/nginx.conf:/etc/nginx/conf.d/default.conf:ro" \
    nginx:1.27

Permissions and ownership:
The most common storage bug is a UID or GID mismatch. Your image runs as a non-root user, but the mounted directory is owned by root or your local user. Fix this intentionally, not by switching back to root forever.

Entry point ownership fix:
  #!/bin/sh
  chown -R 10001:10001 /data
  exec su-exec 10001:10001 "$@"

Backup and restore:
A simple and portable backup pattern is mounting the volume into a temporary container and using tar. This works well for application data and light databases; for databases under heavy write load, prefer logical dumps or filesystem snapshots coordinated with the database.

Backup and restore script:
  docker run --rm \
    -v pgdata:/data \
    -v "$PWD:/backup" \
    alpine:3.20 sh -c 'tar czf /backup/pgdata.tar.gz -C /data .'
  docker volume create pgdata-restored
  docker run --rm \
    -v pgdata-restored:/data \
    -v "$PWD:/backup" \
    alpine:3.20 sh -c 'tar xzf /backup/pgdata.tar.gz -C /data'

Database backup workflow:
For Postgres, logical backups are often better than raw file copies because they are portable across storage backends and database patch versions.

Postgres dump example:
  docker exec pg pg_dump -U postgres -d postgres > postgres.sql
  docker run --rm -i \
    -e POSTGRES_PASSWORD=app \
    -v pgdata-restored:/var/lib/postgresql/data \
    postgres:16

Sharing data between containers:
A common sidecar pattern is one container producing data into a shared volume and another serving it. For example, a static site generator writes assets to a volume and Nginx serves them.

Legacy note:
You may still encounter --volumes-from in older tutorials or scripts. It works, but modern Docker prefers explicit named volumes because they make ownership and lifecycle clearer.

Cleanup:
Unused volumes silently consume disk. docker volume prune is helpful, but do not run it blindly on hosts you do not understand. First inspect which containers still reference the volume and how much space it uses.

Common pitfalls:
- Storing critical data only in the writable container layer.
- Using bind mounts in production without understanding host coupling.
- Ignoring permissions until the app starts throwing EACCES errors.
- Running volume prune on shared machines without confirming what is unused.

Pro tips:
- Named volumes are the default choice for stateful services on a single host.
- Use read-only bind mounts for config.
- Prefer tmpfs for secrets or sensitive temp data.
- Define backup and restore procedures before the first production launch, not after the first outage.`,
    },
    {
      moduleId: dockerMod4.id,
      title: "Volumes in Docker Compose",
      slug: "volumes-in-compose",
      order: 2,
      content: `Compose volumes matter because multi-service applications need storage that survives container churn and behaves differently across development, CI, and production. A strong Compose file makes that intent obvious: persistent database data lives in named volumes, source code uses bind mounts in development, and sensitive scratch space can use tmpfs.

Compose volume syntax:
At the service level you mount volumes inline. At the top level you declare reusable named volumes and their drivers. This separation is useful because service definitions show how storage is consumed while top-level declarations show how it is provisioned.

Database and app example:
  services:
    db:
      image: postgres:16
      environment:
        POSTGRES_USER: app
        POSTGRES_PASSWORD: app
        POSTGRES_DB: app
      volumes:
        - pgdata:/var/lib/postgresql/data
        - ./backups:/backups
      healthcheck:
        test: ["CMD-SHELL", "pg_isready -U app -d app"]
        interval: 5s
        timeout: 3s
        retries: 10

    app:
      build: .
      depends_on:
        db:
          condition: service_healthy
      environment:
        DATABASE_URL: postgres://app:app@db:5432/app
      volumes:
        - .:/app
        - /app/node_modules

  volumes:
    pgdata:

Bind mounts in Compose:
Relative paths are resolved from the Compose file directory. That is convenient but platform-sensitive. On macOS and Windows, large bind mounts can be slower than on Linux, so keep them narrow: mount the app source you need, not the whole monorepo if you can avoid it.

Named volume configuration:
Named volumes can use custom drivers, driver options, or external lifecycle. External volumes are useful when the storage is managed outside the Compose project and should not be created or removed automatically.

Configured named volumes:
  volumes:
    pgdata:
      driver: local
    shared-assets:
      external: true
    nfs-cache:
      driver: local
      driver_opts:
        type: nfs
        o: addr=10.0.0.50,nolock,soft,rw
        device: :/exports/cache

The node_modules trick:
In Node.js development, binding the whole project into /app can accidentally replace container-installed node_modules with the host directory. The usual fix is a second anonymous volume at /app/node_modules so the container keeps its own dependency tree.

Dev hot-reload pattern:
  services:
    web:
      build:
        context: .
        target: dev
      command: ["npm", "run", "dev"]
      volumes:
        - .:/app
        - /app/node_modules
      ports:
        - "3000:3000"

Database persistence and backups:
Production-minded Compose setups often include a backup service so the backup path is codified alongside the database. Even if you later move to managed backups, this is a great local and staging practice.

Backup service definition:
  services:
    backup:
      image: postgres:16
      depends_on:
        db:
          condition: service_healthy
      environment:
        PGPASSWORD: app
      entrypoint: ["sh", "-c", "pg_dump -h db -U app -d app > /backups/app.sql"]
      volumes:
        - ./backups:/backups

Sharing volumes between services:
A common Next.js pattern is building static output or uploaded files in one service and serving them from Nginx in another. A shared named volume is cleaner than copying files between containers manually.

Shared build output pattern:
  services:
    builder:
      build:
        context: .
        target: build
      command: ["sh", "-c", "cp -R /app/out/. /shared"]
      volumes:
        - shared-build:/shared

    nginx:
      image: nginx:1.27
      depends_on:
        builder:
          condition: service_completed_successfully
      volumes:
        - shared-build:/usr/share/nginx/html:ro

  volumes:
    shared-build:

Read-only config and tmpfs:
Config files should usually be mounted read-only. Temporary runtime state such as small cache directories can use tmpfs to avoid noisy disk writes.

Read-only and tmpfs example:
  services:
    nginx:
      image: nginx:1.27
      volumes:
        - ./ops/nginx.conf:/etc/nginx/conf.d/default.conf:ro
      tmpfs:
        - /var/cache/nginx:size=64m

Lifecycle:
Compose down removes containers and networks. Compose down -v also removes named volumes, which is usually fine in development and almost never what you want around real data. Train your team to understand that flag before they type it.

Migration patterns:
If a service must seed data the first time a volume is empty, make that logic explicit with an init or migration service instead of hidden magic in application startup. Predictable bootstrap beats clever bootstrap.

Common pitfalls:
- Mounting the entire repository and then complaining about performance.
- Using down -v casually and destroying local database state.
- Sharing one volume between unrelated services without ownership rules.
- Assuming host file permissions match the container user.

Pro tips:
- Keep dev and prod volume strategies separate.
- Use named volumes for state, bind mounts for source, tmpfs for short-lived sensitive data.
- Document whether a volume is disposable or durable right in the Compose file.
- Treat backup services and restore drills as part of the app stack, not as an afterthought.`,
    },

    // ── Docker Module 5: Networking ──────────────────────────────────
    {
      moduleId: dockerMod5.id,
      title: "Docker Network Types",
      slug: "network-types",
      order: 1,
      content: `Docker networking matters because most container failures are not compute failures; they are communication failures. The application is healthy, but the API cannot resolve the database, the reverse proxy sits on the wrong network, or a service is exposed publicly when it should be internal only. Production engineers need a mental model of how packets actually move.

How it works under the hood:
On Linux, Docker uses network namespaces to give containers isolated network stacks, veth pairs to connect those namespaces to the host, a bridge interface such as docker0 to switch traffic, and iptables rules to do NAT and filtering. That stack explains why bridge networking feels local and fast, why published ports show up through NAT rules, and why debugging often involves both Docker and the host network state.

Network drivers:
- bridge: the default single-host container network, usually best for local and single-node server deployments.
- host: the container shares the host network namespace; fastest, but least isolated, and Linux only.
- overlay: spans multiple hosts, mainly in Docker Swarm contexts.
- macvlan: gives containers their own MAC addresses on the physical network.
- ipvlan: similar idea with different L2 or L3 behavior and fewer switch constraints.
- none: disables networking entirely for maximum isolation.

Create a user-defined bridge:
  docker network create app-backend
  docker run -d --name db --network app-backend postgres:16
  docker run -d --name api --network app-backend nginx:1.27
  docker exec api getent hosts db

Default bridge limitations:
A critical beginner misunderstanding is assuming container names resolve everywhere. On the default bridge network they do not resolve automatically like they do on a user-defined bridge. That is why user-defined bridges should be your default for anything more than a throwaway test.

Multi-tier isolation:
A good production pattern separates entry, app, and data planes with different networks. The reverse proxy talks to the app network, the app talks to the database network, and the database is never directly attached to the public-facing network.

Three-network setup:
  docker network create edge
  docker network create app
  docker network create data
  docker run -d --name nginx --network edge nginx:1.27
  docker network connect app nginx
  docker run -d --name api --network app my-api:latest
  docker network connect data api
  docker run -d --name postgres --network data postgres:16

Overlay networks:
Overlay networking is primarily relevant in Docker Swarm or similar orchestrated multi-host setups. It lets services on different hosts communicate over a virtual network. If you only run single-host Docker, you may never use it directly, but it is worth understanding because the concept maps cleanly to Kubernetes CNI overlays later.

Host network:
Host mode removes NAT and can reduce latency for high-throughput agents, packet processors, or local observability tools. The trade-off is obvious: no port namespace isolation. A container in host mode can collide with host ports and sees the host network directly.

Host network example:
  docker run --rm --network host nicolaka/netshoot ss -ltnp

Connecting to external services:
Containers sometimes need to call services running on the host or on fixed external systems. On Docker Desktop, host.docker.internal is the standard host alias. On Linux you may need an explicit extra_hosts entry or a published host address.

Host access example:
  docker run --rm alpine:3.20 getent hosts host.docker.internal
  docker run --rm --add-host host.docker.internal:host-gateway alpine:3.20 ping -c 1 host.docker.internal

Inspection and debugging:
Use docker network inspect to understand membership, subnets, and aliases. For deep Linux debugging, nsenter lets you inspect a container namespace from the host.

Inspection commands:
  docker network inspect app-backend
  pid=$(docker inspect -f '{{.State.Pid}}' api)
  sudo nsenter -t "$pid" -n ip addr
  sudo nsenter -t "$pid" -n ip route

Compose pattern:
  services:
    proxy:
      image: nginx:1.27
      ports: ["80:80"]
      networks: [edge, app]
    api:
      build: .
      networks: [app, data]
    db:
      image: postgres:16
      networks: [data]
  networks:
    edge:
    app:
    data:

Common pitfalls:
- Leaving everything on one flat network and calling it simple.
- Publishing ports instead of using internal service networking.
- Expecting default bridge DNS behavior to match Compose.
- Using host mode casually on shared hosts.

Pro tips:
- Create user-defined bridge networks by default.
- Keep databases off the public network.
- Use reverse proxies as the single ingress point.
- Learn docker network inspect before reaching for packet captures; it solves many issues quickly.`,
    },
    {
      moduleId: dockerMod5.id,
      title: "Port Publishing and DNS",
      slug: "port-publishing-and-dns",
      order: 2,
      content: `Port publishing and DNS are where container networking becomes operationally important. If you bind the wrong interface, you expose an internal service to the internet. If you misunderstand Docker DNS, you end up hardcoding IP addresses that break on every restart. Production stability depends on getting these basics exactly right.

How port publishing works:
When you publish a port, Docker programs NAT and filter rules, usually with iptables, so traffic arriving on the host port is forwarded to the container port. Depending on platform and settings, docker-proxy may assist with edge cases. This is why publishing a port is not the same as the container simply listening; the host network path must be configured too.

Port binding syntax:
Use -p hostPort:containerPort for a standard bind. Use -p hostIP:hostPort:containerPort to limit listening to a specific interface. Use multiple -p flags for multiple services. Use -P to publish all exposed ports to random high ports, which is useful in test harnesses and usually undesirable in production.

Binding variants:
  docker run -d -p 8080:80 nginx:1.27
  docker run -d -p 127.0.0.1:8080:80 nginx:1.27
  docker run -d -p 0.0.0.0:443:443 -p 0.0.0.0:80:80 nginx:1.27
  docker run -d -P nginx:1.27

Security implications:
Binding to 0.0.0.0 exposes the service on all host interfaces. Binding to 127.0.0.1 keeps it local to the machine. Databases, admin UIs, and internal APIs should usually bind to localhost or remain unpublished entirely.

Inspect Docker-created rules:
  sudo iptables -t nat -S | grep DOCKER
  sudo iptables -S DOCKER-USER
  docker port $(docker run -d -p 127.0.0.1:8080:80 nginx:1.27)

Docker embedded DNS:
On user-defined networks, containers query Docker's embedded DNS server at 127.0.0.11. It resolves container names, service names, and aliases to the current container IPs. This is why Compose service names are the correct way to connect services together.

DNS resolution example:
  docker network create dns-net
  docker run -d --name redis --network dns-net redis:7
  docker run --rm --network dns-net alpine:3.20 getent hosts redis

Internal vs external traffic:
Most services in a stack should never publish ports. Your reverse proxy or ingress layer should publish 80 and 443, while application and database services stay internal. This reduces attack surface and simplifies observability.

Compose with proper isolation:
  services:
    proxy:
      image: nginx:1.27
      ports:
        - "80:80"
      networks: [edge, app]
    api:
      build: .
      expose:
        - "3000"
      networks: [app]
    db:
      image: postgres:16
      expose:
        - "5432"
      networks: [app]
  networks:
    edge:
    app:

Reverse proxy example:
  upstream api_upstream {
    server api:3000;
  }

  server {
    listen 80;
    location / {
      proxy_pass http://api_upstream;
      proxy_set_header Host $host;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header X-Forwarded-Proto $scheme;
    }
  }

Health endpoints and ports:
Health endpoints should usually be reachable internally by the orchestrator or reverse proxy, not globally exposed. If the only health consumer is another service on the same network, do not publish the port at all.

IPv6:
Docker can support IPv6, but it requires explicit daemon and network configuration. If your organization runs dual-stack infrastructure, test it carefully because assumptions made by IPv4-only images often break in subtle ways.

Firewall considerations:
Many engineers discover the hard way that Docker-managed iptables rules can bypass simplistic ufw assumptions. The safe pattern is to use the DOCKER-USER chain for host-level policy, because Docker preserves it.

ufw-style fix:
  sudo iptables -I DOCKER-USER -i eth0 ! -s 10.0.0.0/8 -p tcp --dport 5432 -j DROP
  sudo iptables -A DOCKER-USER -j RETURN

Common pitfalls:
- Publishing internal service ports just to make debugging easier.
- Using container IPs instead of service names.
- Assuming EXPOSE publishes a port.
- Forgetting that 127.0.0.1 inside a container is not the host.

Pro tips:
- Publish only the reverse proxy.
- Use localhost binds for developer-only services.
- Verify rules with docker port and iptables instead of guessing.
- Make DNS names part of your architecture, not an incidental convenience.`,
    },

    // ── Docker Module 6: Multi-stage Builds ─────────────────────────
    {
      moduleId: dockerMod6.id,
      title: "Multi-stage Build Fundamentals",
      slug: "multistage-fundamentals",
      order: 1,
      content: `Multi-stage builds matter because image size affects everything: pull time, cold-start time, attack surface, and developer patience. A typical Node.js image built from a naïve single-stage Dockerfile might be 900 MB because it contains build tools, source files, dev dependencies, caches, and the runtime all together. A production-grade multi-stage image can often cut that below 200 MB without sacrificing reproducibility.

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
- Use multi-stage builds by default; single-stage should be the exception, not the norm.`,
    },
    {
      moduleId: dockerMod6.id,
      title: "Layer Caching and .dockerignore",
      slug: "layer-caching",
      order: 2,
      content: `Layer caching is one of the highest-leverage Docker skills because it determines whether builds take seconds or minutes. Teams that understand caching get faster CI, tighter feedback loops, and smaller cloud bills. Teams that do not keep rebuilding package managers from scratch because one README changed.

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

Great Docker performance is rarely about heroics. It is usually about ordering, specificity, and respecting how the cache actually works.`,
    },

    // ── Docker Module 7: Security ────────────────────────────────────
    {
      moduleId: dockerMod7.id,
      title: "Running Containers Securely",
      slug: "secure-containers",
      order: 1,
      content: `Container security matters because containers compress a lot of trust into a small unit: code, runtime, base OS packages, kernel interfaces, and registry provenance. When something goes wrong, the blast radius can include data theft, lateral movement, and full host compromise. Production-grade security is therefore a series of small, deliberate constraints rather than one magic flag.

Threat model:
Think in terms of container escape, privilege escalation, credential theft, malicious images, exposed management sockets, and lateral movement across flat internal networks. A container is an isolation boundary, but not an impenetrable one.

Why root is dangerous:
Running as root inside a container is still running as a highly privileged user inside a shared kernel environment. Real container escapes have leveraged kernel bugs, namespace issues, and misconfigurations to turn root-in-container into host impact. Even without a kernel escape, root can make filesystem permissions, mounted secrets, and shared volumes riskier.

Secure Dockerfile template:
  FROM node:20-bookworm-slim
  WORKDIR /app
  COPY package.json package-lock.json ./
  RUN npm ci --omit=dev
  COPY . .
  RUN useradd --system --uid 10001 appuser && chown -R appuser:appuser /app
  USER 10001
  EXPOSE 3000
  HEALTHCHECK CMD node -e "fetch('http://127.0.0.1:3000/health').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"
  CMD ["node", "server.js"]

Read-only root filesystem:
A read-only root filesystem stops accidental writes and makes many classes of persistence harder for an attacker. The catch is that many apps still need writable paths such as /tmp, runtime sockets, or cache directories. Pair --read-only with explicit tmpfs mounts.

Read-only runtime example:
  docker run --read-only \
    --tmpfs /tmp:rw,noexec,nosuid,size=64m \
    --tmpfs /var/run:rw,noexec,nosuid,size=16m \
    my-app:latest

Capabilities:
Linux capabilities split root power into smaller privileges. Docker grants a default set, but many applications need fewer. The strong pattern is drop everything, then add back only what is required.

Drop all, add one back:
  docker run --rm \
    --cap-drop ALL \
    --cap-add NET_BIND_SERVICE \
    --security-opt no-new-privileges:true \
    my-web:latest

Seccomp and AppArmor:
Docker's default seccomp profile blocks dangerous syscalls such as keyring manipulation and some namespace operations. AppArmor adds path and capability controls on systems that support it. These defaults are already useful; custom profiles are for teams that understand the syscall and access patterns of their workloads.

Seccomp snippet:
  {
    "defaultAction": "SCMP_ACT_ERRNO",
    "architectures": ["SCMP_ARCH_X86_64"],
    "syscalls": [
      {"names": ["read", "write", "exit", "futex"], "action": "SCMP_ACT_ALLOW"}
    ]
  }

Rootless Docker:
Rootless Docker runs the daemon and containers without privileged root on the host. It reduces blast radius significantly, especially on multi-user systems. It is not a silver bullet, but it is worth evaluating for developer workstations and some server classes.

Image scanning and supply chain:
You cannot secure what you do not inventory. Scan images for CVEs, generate SBOMs, and sign images so deploy systems can verify provenance.

Scanning and signing:
  trivy image --severity HIGH,CRITICAL my-app:latest
  docker scout cves my-app:latest
  cosign generate-key-pair
  cosign sign --key cosign.key registry.example.com/my-app:1.2.3

Pod Security concepts:
Kubernetes later formalizes many of these ideas through restricted pod security, dropped capabilities, read-only filesystems, and non-root execution. If you learn the Docker runtime controls now, Kubernetes security will feel familiar rather than foreign.

Common pitfalls:
- Mounting /var/run/docker.sock into app containers.
- Using --privileged to make a problem go away.
- Running as root because volume permissions are annoying.
- Treating vulnerability scans as optional cleanup rather than a release gate.

Pro tips:
- Make non-root the default in every base template.
- Use read-only filesystems plus tmpfs where practical.
- Drop capabilities aggressively.
- Sign images and keep SBOMs with releases.
- Segment networks so a compromise has fewer places to go.

Security is mostly discipline. The safe path is rarely harder than the unsafe path once your templates are correct.`,
    },
    {
      moduleId: dockerMod7.id,
      title: "Secrets Management in Docker",
      slug: "secrets-management",
      order: 2,
      content: `Secrets management is one of the few Docker topics where a small mistake can create a long-lived breach. If you put a token into an image layer, that token may end up in docker history, CI logs, registry caches, developer laptops, and backup archives. Deleting the file later does not undo the exposure because image layers are immutable.

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

If you remember one rule, make it this: secrets may touch runtime memory, but they should never become part of the image filesystem history.`,
    },

    // ── Docker Module 8: Debugging ───────────────────────────────────
    {
      moduleId: dockerMod8.id,
      title: "Debugging Running Containers",
      slug: "debugging-running-containers",
      order: 1,
      content: `Great container debugging starts with the right mental model. Do not think "Docker is broken"; think process, network, storage, or environment. Containers fail in familiar ways, but the packaging adds layers of indirection. The fastest debuggers isolate which layer is actually failing before they touch anything.

Logs:
Container-native apps write logs to stdout and stderr. docker logs reads the configured log driver output for a container. Use flags to narrow time windows and reduce noise during incidents.

Log examples:
  docker logs my-api
  docker logs --follow --tail 100 my-api
  docker logs --since 10m --until 1m my-api
  docker logs --timestamps my-api

Log drivers:
json-file is the local default on many systems. syslog, journald, fluentd, and awslogs ship output elsewhere. If logs appear missing, confirm the driver first; the app may be writing correctly while you are looking in the wrong place.

The exec command:
docker exec launches another process inside a running container. This is perfect for inspection, but remember you are debugging a live system. Do not fix production by hand through exec and then forget to update the image.

Exec examples:
  docker exec -it my-api sh
  docker exec -u 0 my-api id
  docker exec my-api printenv | sort
  docker exec my-api ps -ef

Debugging without a shell:
Distroless images and scratch images often have no shell, package manager, or curl binary. In those cases, use a debug sidecar, nsenter from the host, or a separate debug tag built for incidents.

Namespace debugging:
  target_pid=$(docker inspect -f '{{.State.Pid}}' my-api)
  sudo nsenter -t "$target_pid" -n ss -ltnp
  sudo nsenter -t "$target_pid" -m ls -la /
  sudo nsenter -t "$target_pid" -p ps -ef

Process inspection:
Use docker top for a quick view from outside. Use /proc when you need deep runtime detail such as open file descriptors, memory maps, or environment.

Process and resource inspection:
  docker top my-api -eo pid,ppid,user,args
  docker stats --no-stream my-api
  docker inspect my-api | jq '.[0].State'

Network debugging:
If one container cannot reach another, prove each layer: DNS resolution, TCP connectivity, TLS, then application protocol. A dedicated debug image like nicolaka/netshoot is excellent because it includes curl, dig, tcpdump, and more.

Debug sidecar pattern:
  docker run --rm -it \
    --pid=container:my-api \
    --network=container:my-api \
    nicolaka/netshoot

File system inspection:
docker diff shows what changed in the writable layer. docker cp lets you extract config, logs, or output for offline analysis.

Filesystem commands:
  docker diff my-api
  docker cp my-api:/app/logs/error.log ./error.log
  docker inspect my-api | jq '.[0].Mounts'

Events and post-mortem work:
docker events is underused and extremely useful. It shows start, stop, oom, health_status, and die events as they happen. For crash loops, combine events, logs, exit code inspection, and restart policy review.

Event stream:
  docker events --since 30m --filter container=my-api
  docker inspect my-api | jq '.[0].State | {status, exitCode, oomKilled, error, finishedAt}'

Interpreting docker stats:
High memory with growing cache may be normal. High CPU with low throughput suggests a hot loop. Zero network while requests time out points to connectivity or listener issues. Remember stats are symptoms, not diagnoses.

Common pitfalls:
- Restarting immediately and losing the evidence.
- Assuming a missing shell means you cannot debug.
- Editing files inside the container and calling it a fix.
- Looking only at the app and not at network or volume mounts.

Pro tips:
- Keep one debug image in every engineer's toolkit.
- Capture inspect output during incidents before redeploying.
- Prefer immutable fixes after the incident, not live drift.
- Teach teams the four-question flow: is the process alive, can it reach dependencies, can clients reach it, and does it have the expected config?

The best container debugging is systematic, not clever.`,
    },
    {
      moduleId: dockerMod8.id,
      title: "Inspecting Images and Layers",
      slug: "inspecting-images",
      order: 2,
      content: `Image inspection matters because containers are only as good as the images behind them. If an image is bloated, mislabeled, full of stale packages, or carrying accidental files, every environment inherits that problem. Senior engineers inspect images the same way they inspect binaries or deployment manifests: as artifacts that deserve scrutiny.

Image anatomy:
An OCI image consists of a manifest, a config object, and a set of layers. The manifest references the config and layers. The config contains metadata such as environment variables, entrypoint, command, labels, and history. The layers hold the filesystem diffs. Knowing this structure makes tools like history, inspect, save, and SBOM generation much easier to reason about.

Core image commands:
- docker image ls: list images and sizes.
- docker image inspect: view detailed JSON metadata.
- docker image history: show build layers and commands.
- docker pull and push: move images to and from registries.
- docker tag: create additional names for the same image ID.
- docker save and load: archive and restore images for air-gapped movement.
- docker import and export: lower-level filesystem import and container export tools.

History analysis:
History is where you spot large layers, suspicious commands, and accidental bloat. The SIZE column is not always intuitive because metadata-only layers can be zero bytes while one careless COPY can be hundreds of megabytes.

History commands:
  docker image history --no-trunc my-app:latest
  docker image inspect my-app:latest | jq '.[0] | {size: .Size, env: .Config.Env, cmd: .Config.Cmd, entrypoint: .Config.Entrypoint, labels: .Config.Labels}'

Dive tool:
Dive is one of the best tools for understanding wasted space. It shows layer contents, what changed between layers, and whether files were added and later deleted, which still wastes bytes in earlier layers.

Dive usage:
  brew install dive
  dive my-app:latest

Common bloat causes:
Package caches, test artifacts, source maps you did not intend to ship, node_modules copied twice, Python wheels left behind, docs and examples from vendored dependencies, and temporary download archives that were removed in a later layer but still count.

Optimized package install:
  RUN apt-get update \
   && apt-get install -y --no-install-recommends curl ca-certificates \
   && rm -rf /var/lib/apt/lists/*

Comparing images:
Skopeo and crane are excellent when you need to inspect remote images without pulling them or compare tags across registries.

Compare tags remotely:
  skopeo inspect docker://docker.io/library/nginx:1.27
  crane manifest my-registry.example.com/my-app:1.2.3
  crane config my-registry.example.com/my-app:1.2.3

Metadata and provenance:
Good images carry OCI labels for source repository, revision, created timestamp, and description. This is invaluable during incident response when you need to map a running image back to source quickly.

Air-gapped workflows:
Air-gapped environments still exist in finance, defense, and regulated industry. save and load remain important operational tools.

Save and load example:
  docker save my-app:latest -o my-app.tar
  docker load -i my-app.tar

SBOM generation:
SBOMs are increasingly required by security and compliance teams. Generate them alongside image releases.

SBOM tools:
  syft my-app:latest -o table
  docker sbom my-app:latest

Common pitfalls:
- Looking only at final image size instead of layer composition.
- Deleting files in later layers and assuming the image got smaller.
- Shipping images with no provenance labels.
- Treating image archives as informal backups without version control.

Pro tips:
- Review history output for every production image.
- Use Dive during performance or security hardening work.
- Add OCI labels during build.
- Generate SBOMs and keep them with the release artifacts.

If you cannot explain what is inside your image and why it is there, you are not ready to run it in production.`,
    },

    // ── Docker Module 9: CI/CD ───────────────────────────────────────
    {
      moduleId: dockerMod9.id,
      title: "Building Images in GitHub Actions",
      slug: "github-actions-docker",
      order: 1,
      content: `Container CI/CD is where Docker becomes a repeatable delivery system rather than a local convenience. A mature pipeline does the same sequence every time: build, test, scan, tag, push, and promote. The teams that do this well ship faster because they reduce manual judgment in the path to production.

Pipeline lifecycle:
The ideal flow is commit to branch, build image, run tests, scan for vulnerabilities, push to a registry, then deploy a specific immutable tag or digest. Build once and promote the same artifact across environments whenever possible.

GitHub Actions fundamentals:
A workflow has triggers, jobs, steps, permissions, and secrets. Jobs run on GitHub-hosted or self-hosted runners. Environments add approvals and protected secrets. For container pipelines, this structure maps naturally to build, security, and deploy stages.

Production workflow:
  name: docker

  on:
    push:
      branches: [main]
      tags: ['v*.*.*']
    pull_request:

  jobs:
    build-test-scan-push:
      runs-on: ubuntu-latest
      permissions:
        contents: read
        packages: write
        security-events: write
      steps:
        - uses: actions/checkout@v4

        - uses: docker/setup-buildx-action@v3

        - uses: docker/login-action@v3
          with:
            username: \${{ secrets.DOCKERHUB_USERNAME }}
            password: \${{ secrets.DOCKERHUB_TOKEN }}

        - uses: docker/metadata-action@v5
          id: meta
          with:
            images: myorg/my-app
            tags: |
              type=raw,value=latest,enable=\${{ github.ref == 'refs/heads/main' }}
              type=sha
              type=ref,event=branch
              type=semver,pattern={{version}}

        - uses: docker/build-push-action@v6
          with:
            context: .
            target: runtime
            push: \${{ github.event_name != 'pull_request' }}
            tags: \${{ steps.meta.outputs.tags }}
            labels: \${{ steps.meta.outputs.labels }}
            cache-from: type=gha
            cache-to: type=gha,mode=max

Docker-specific actions:
docker/login-action authenticates to Docker Hub, GHCR, ECR, or other registries. docker/build-push-action wraps Buildx and BuildKit cleanly. docker/metadata-action centralizes tagging and OCI labels so tag logic does not sprawl across scripts.

Testing inside Docker:
A strong pattern is building a dedicated test stage and running it in CI. That ensures the same dependencies used in production builds also drive tests.

Test stage example:
  - name: Build test stage
    run: docker build --target test -t my-app:test .

  - name: Run unit tests
    run: docker run --rm my-app:test npm test

Image scanning:
Fail builds on serious vulnerabilities. That keeps security from becoming a best-effort reporting exercise.

Trivy action example:
  - name: Trivy scan
    uses: aquasecurity/trivy-action@0.28.0
    with:
      image-ref: myorg/my-app:\${{ github.sha }}
      format: table
      severity: HIGH,CRITICAL
      exit-code: '1'

Multi-environment promotion:
Do not rebuild for staging and production. Tag or promote the same digest. That keeps the tested artifact identical across environments.

Promotion workflow snippet:
  - name: Promote release tag
    run: |
      docker buildx imagetools create \
        --tag myorg/my-app:staging \
        --tag myorg/my-app:prod \
        myorg/my-app@\${{ steps.build.outputs.digest }}

Secrets management in CI:
Store DOCKERHUB_USERNAME and DOCKERHUB_TOKEN in repository or organization secrets. For production deploys, prefer environment-scoped secrets with approval gates. Never echo secrets, and avoid passing them as build args unless you are using BuildKit secret mounts.

GitLab CI comparison:
GitLab CI provides similar primitives with runners, variables, stages, and container registry integration. The concepts are the same even if YAML syntax differs.

Caching strategies:
- Layer cache: reuse previous build results on persistent builders.
- BuildKit gha cache: ideal for GitHub-hosted runners.
- Registry cache: useful across repos or runners when a registry is the shared cache source.

Common pitfalls:
- Using latest as the only production tag.
- Rebuilding separately in every environment.
- Treating vulnerability scans as informational only.
- Forgetting to grant packages: write permissions for pushes.

Pro tips:
- Tag every build with the Git SHA.
- Add OCI labels with source repo and revision.
- Use build targets for test and runtime separation.
- Keep registry credentials short-lived and rotate them regularly.

A good container pipeline is boring, immutable, and traceable from running pod back to commit in one jump.`,
    },
    {
      moduleId: dockerMod9.id,
      title: "Multi-arch Builds and Registry Best Practices",
      slug: "multiarch-and-registry",
      order: 2,
      content: `Multi-architecture images matter now because the industry is genuinely heterogeneous. Developers use Apple Silicon laptops, CI often runs on amd64, cloud providers increasingly offer ARM nodes such as AWS Graviton, and edge fleets may include older ARM variants. If your image only works on one architecture, portability becomes an illusion.

Architectures:
The most common targets are linux/amd64 and linux/arm64. Smaller edge systems may need linux/arm/v7 or linux/arm/v6. Do not publish unsupported platforms casually; an image manifest is a promise to users.

How multi-arch works:
A multi-architecture image is usually a manifest list, sometimes called a fat manifest. The registry stores references to per-architecture images. When a client pulls the image, it selects the variant matching the local OS and CPU architecture.

Buildx setup:
Buildx wraps BuildKit and is the standard Docker way to produce multi-platform images. It can use QEMU emulation or native builders.

Buildx and QEMU:
  docker buildx create --name multi --use
  docker buildx inspect --bootstrap
  docker run --privileged --rm tonistiigi/binfmt --install all

Build and push multi-arch:
  docker buildx build \
    --platform linux/amd64,linux/arm64 \
    -t myorg/my-app:1.2.3 \
    -t myorg/my-app:latest \
    --push \
    .

Inspect the manifest:
  docker buildx imagetools inspect myorg/my-app:1.2.3
  docker manifest inspect myorg/my-app:1.2.3

Native vs emulated builds:
QEMU is convenient and great for many apps, but compiled languages and heavy native dependencies can be much slower or subtly different under emulation. For performance-sensitive pipelines, native builders for each architecture or true cross-compilation are better.

Registry comparison:
Docker Hub is the default public registry with broad ecosystem support. GitHub Container Registry is excellent for GitHub-native workflows. AWS ECR integrates tightly with IAM, lifecycle policies, and Inspector. Google Artifact Registry fits GCP-heavy shops. The best choice is usually the one closest to your identity model and deployment platform.

ECR login and push:
  aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 123456789012.dkr.ecr.us-east-1.amazonaws.com
  docker tag myorg/my-app:1.2.3 123456789012.dkr.ecr.us-east-1.amazonaws.com/my-app:1.2.3
  docker push 123456789012.dkr.ecr.us-east-1.amazonaws.com/my-app:1.2.3

Tagging strategy:
Use semantic versions for releases, Git SHAs for immutability, branch tags for ephemeral environments, and maybe environment tags for operational convenience. Never rely on latest alone.

Registry mirror configuration:
Mirrors reduce rate-limit pain and speed pulls for common public bases.

daemon.json mirror example:
  {
    "registry-mirrors": ["https://mirror.gcr.io"],
    "features": {"buildkit": true}
  }

Retention and promotion:
Good registries can auto-delete untagged images and keep the last N versions. Promotion should retag or copy an existing digest from dev to staging to prod, not rebuild it.

Metadata-action tagging:
  tags: |
    type=semver,pattern={{version}}
    type=semver,pattern={{major}}.{{minor}}
    type=sha
    type=ref,event=branch

Vulnerability reporting:
ECR integrates with Inspector. Docker Hub and GHCR support scanning through ecosystem tools. Whatever registry you use, surface scan results into developer workflows instead of letting them rot in a dashboard no one opens.

Common pitfalls:
- Publishing a manifest list before testing each architecture.
- Assuming amd64-only native modules will just work on arm64.
- Using long-lived registry passwords in CI.
- Rebuilding the same release differently for each environment.

Pro tips:
- Start with amd64 and arm64; add older ARM variants only when you truly support them.
- Prefer native builds for performance-critical languages.
- Keep registry credentials short-lived and scoped.
- Promote digests, not source commits, through environments.

Multi-arch support is not a luxury anymore; for many teams it is table stakes.`,
    },

    // ── Docker Module 10: Production ─────────────────────────────────
    {
      moduleId: dockerMod10.id,
      title: "Health Checks and Restart Policies",
      slug: "healthchecks-and-restart",
      order: 1,
      content: `Health checks and restart policies are the difference between a container that merely starts and a container that behaves well in production. Without them, zombie processes can sit there serving nothing, apps can start before dependencies are ready, and failed containers can churn forever without a clear signal to operators.

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

Health checks and restart policies are small features with outsized operational payoff.`,
    },
    {
      moduleId: dockerMod10.id,
      title: "Resource Limits and Production Checklist",
      slug: "resource-limits-and-checklist",
      order: 2,
      content: `Production containers need more than a correct image; they need sane runtime boundaries. Without resource limits, logging controls, labels, and security defaults, one noisy service can destabilize an entire host. The mindset is simple: containers should be immutable, ephemeral, observable, and constrained.

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

A production container is not just a running process. It is a constrained, observable, recoverable unit of delivery.`,
    },

    // ── K8s Module 3: ConfigMaps & Secrets ──────────────────────────
    {
      moduleId: k8sMod3.id,
      title: "ConfigMaps in Depth",
      slug: "configmaps-in-depth",
      order: 1,
      content: `ConfigMaps are the primary mechanism for injecting non-sensitive configuration into Kubernetes workloads. They decouple configuration from the container image, enabling the same image to run across development, staging, and production with nothing changing except the ConfigMap. Understanding the difference between the three consumption patterns — environment variables, envFrom, and volume mounts — determines whether your config updates require a Pod restart or take effect live.

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
Store ConfigMaps in Git alongside your application manifests. Use Kustomize overlays or Helm values files to parameterize per-environment values. This gives you full audit history, review processes, and rollback for configuration changes — not just code changes.`,
    },
    {
      moduleId: k8sMod3.id,
      title: "Kubernetes Secrets",
      slug: "kubernetes-secrets",
      order: 2,
      content: `Kubernetes Secrets store sensitive data — passwords, tokens, API keys, TLS certificates — separately from Pods and ConfigMaps. They prevent credentials from being baked into images or appearing in YAML that gets committed to version control. Understanding the security model of Secrets, including their well-known limitations, is essential for anyone operating production clusters.

The base64 confusion:
Secrets store values as base64-encoded strings. This is encoding, not encryption. Anyone who can read the Secret object gets the plaintext credential. The separation of Secrets from ConfigMaps provides access control via RBAC, not cryptographic protection. For encryption at rest, you must configure an encryption provider in the API server — or use a secrets manager integration.

All Secret types:
  Opaque                           Generic arbitrary data (most common)
  kubernetes.io/tls                TLS certificate + private key pair
  kubernetes.io/dockerconfigjson   Registry pull credentials
  kubernetes.io/ssh-auth           SSH private key
  kubernetes.io/basic-auth         Username + password pair
  bootstrap.kubernetes.io/token    Bootstrap tokens for nodes

Creating Secrets:
  # Generic secret
  kubectl create secret generic db-creds \
    --from-literal=DB_USER=appuser \
    --from-literal=DB_PASSWORD=s3cur3P@ss

  # From files (avoids shell history)
  kubectl create secret generic tls-certs \
    --from-file=tls.crt=./certs/server.crt \
    --from-file=tls.key=./certs/server.key

  # Registry credentials
  kubectl create secret docker-registry registry-creds \
    --docker-server=ghcr.io \
    --docker-username=myuser \
    --docker-password=ghp_token123

Declarative Secret (values must be base64 encoded):
  apiVersion: v1
  kind: Secret
  metadata:
    name: db-creds
    namespace: production
  type: Opaque
  data:
    DB_USER: YXBwdXNlcg==
    DB_PASSWORD: czNjdXIzUEBzcw==

Injecting into Pods as environment variables:
  env:
    - name: DB_PASSWORD
      valueFrom:
        secretKeyRef:
          name: db-creds
          key: DB_PASSWORD
          optional: false

Mounting as a volume (supports live rotation):
  volumes:
    - name: db-secret-vol
      secret:
        secretName: db-creds
        defaultMode: 0400
  containers:
    - name: api
      volumeMounts:
        - name: db-secret-vol
          mountPath: /run/secrets/db
          readOnly: true

Production-grade: Sealed Secrets for GitOps:
Bitnami Sealed Secrets encrypts your Secret using the cluster's public key. Only the cluster's controller can decrypt it, so the sealed YAML is safe to commit to Git.
  brew install kubeseal
  kubectl apply -f https://github.com/bitnami-labs/sealed-secrets/releases/latest/download/controller.yaml
  kubectl create secret generic db-creds --from-literal=DB_PASSWORD=secret --dry-run=client -o yaml | \
    kubeseal --format yaml > sealed-db-creds.yaml
  kubectl apply -f sealed-db-creds.yaml

Production-grade: External Secrets Operator:
External Secrets Operator syncs secrets from AWS Secrets Manager, HashiCorp Vault, GCP Secret Manager, or Azure Key Vault directly into Kubernetes Secrets. This is the gold standard for enterprise environments.
  apiVersion: external-secrets.io/v1beta1
  kind: ExternalSecret
  metadata:
    name: db-creds
  spec:
    refreshInterval: 1h
    secretStoreRef:
      name: aws-secretsmanager
      kind: ClusterSecretStore
    target:
      name: db-creds
    data:
      - secretKey: DB_PASSWORD
        remoteRef:
          key: production/api/db
          property: password

RBAC for Secrets:
Limit who can read Secrets with explicit RBAC. The default service account should never have Secret read permissions across namespaces.
  rules:
    - apiGroups: [""]
      resources: ["secrets"]
      resourceNames: ["db-creds"]
      verbs: ["get"]

Audit logging:
Enable audit logging at the RequestResponse level for Secret access. This creates an audit trail for every read of sensitive credentials — critical for SOC 2 and ISO 27001 compliance.`,
    },

    // ── K8s Module 4: Persistent Storage ────────────────────────────
    {
      moduleId: k8sMod4.id,
      title: "PersistentVolumes and PersistentVolumeClaims",
      slug: "pv-and-pvc",
      order: 1,
      content: `Kubernetes storage is designed around a clean separation of concerns: administrators provision storage capacity, developers claim what they need. PersistentVolumes represent physical or cloud storage. PersistentVolumeClaims are requests for storage from a developer, without needing to know the underlying infrastructure. This abstraction lets the same application YAML run on-premises with NFS and in the cloud with AWS EBS by changing only the StorageClass.

The storage lifecycle:
A PersistentVolume moves through phases: Available (ready to be claimed), Bound (claimed by a PVC), Released (the PVC was deleted but the PV still exists), and Failed (reclamation error). When bound, there is a one-to-one relationship between PV and PVC.

Static provisioning — manually created PV:
  apiVersion: v1
  kind: PersistentVolume
  metadata:
    name: postgres-pv
    labels:
      type: ssd
      environment: production
  spec:
    capacity:
      storage: 50Gi
    volumeMode: Filesystem
    accessModes:
      - ReadWriteOnce
    persistentVolumeReclaimPolicy: Retain
    storageClassName: manual-ssd
    hostPath:
      path: /mnt/data/postgres

PersistentVolumeClaim requesting that volume:
  apiVersion: v1
  kind: PersistentVolumeClaim
  metadata:
    name: postgres-pvc
    namespace: production
  spec:
    storageClassName: manual-ssd
    accessModes:
      - ReadWriteOnce
    resources:
      requests:
        storage: 50Gi
    selector:
      matchLabels:
        type: ssd

Using the PVC in a StatefulSet Pod:
  spec:
    containers:
      - name: postgres
        image: postgres:16
        env:
          - name: PGDATA
            value: /var/lib/postgresql/data/pgdata
        volumeMounts:
          - name: postgres-storage
            mountPath: /var/lib/postgresql/data
    volumes:
      - name: postgres-storage
        persistentVolumeClaim:
          claimName: postgres-pvc

Access modes explained:
  ReadWriteOnce (RWO)    One node can mount read-write. Standard for block storage: EBS, PD, Azure Disk.
  ReadOnlyMany (ROX)     Many nodes read-only. Useful for shared config files.
  ReadWriteMany (RWX)    Many nodes read-write simultaneously. Requires NFS, EFS, Azure Files, CephFS.
  ReadWriteOncePod       Kubernetes 1.22+: only one Pod can mount, not just one node. Strictest isolation.

Reclaim policies:
  Retain    The PV persists after PVC deletion. Data is safe; admin must manually reclaim.
  Delete    The PV and its backing storage are deleted when the PVC is deleted. Cloud default.
  Recycle   Deprecated. Ran a basic rm -rf scrub on the volume.

PVC binding status commands:
  kubectl get pvc -n production
  kubectl describe pvc postgres-pvc -n production
  kubectl get pv
  # If a PVC is stuck in Pending, check: no matching PV, wrong StorageClass, or capacity mismatch.

Volume expansion:
If the StorageClass allows expansion (allowVolumeExpansion: true), you can resize a PVC without data loss:
  kubectl patch pvc postgres-pvc -n production \
    -p '{"spec":{"resources":{"requests":{"storage":"100Gi"}}}}'
The actual resize happens at the node when the Pod restarts (for offline resize) or immediately (for online resize on supporting CSI drivers).`,
    },
    {
      moduleId: k8sMod4.id,
      title: "StorageClasses and Dynamic Provisioning",
      slug: "storageclasses",
      order: 2,
      content: `Static PersistentVolume provisioning breaks down at scale. When 50 teams each need a database volume, manually creating PersistentVolumes for each becomes a bottleneck. StorageClasses solve this by allowing Kubernetes to provision storage dynamically the moment a PersistentVolumeClaim is created, using a CSI (Container Storage Interface) driver that talks directly to the cloud provider or storage backend.

What a StorageClass contains:
A StorageClass specifies which CSI provisioner to use, the parameters for that provisioner (disk type, IOPS, encryption), the reclaim policy, and when volume binding should occur. Once defined by a cluster admin, developers never think about provisioning — they just write PVCs.

StorageClass for AWS EBS (gp3):
  apiVersion: storage.k8s.io/v1
  kind: StorageClass
  metadata:
    name: gp3-encrypted
    annotations:
      storageclass.kubernetes.io/is-default-class: "true"
  provisioner: ebs.csi.aws.com
  parameters:
    type: gp3
    iops: "3000"
    throughput: "125"
    encrypted: "true"
    kmsKeyId: arn:aws:kms:us-east-1:123456789:key/my-key
  reclaimPolicy: Delete
  allowVolumeExpansion: true
  volumeBindingMode: WaitForFirstConsumer

StorageClass for GCP Persistent Disk:
  provisioner: pd.csi.storage.gke.io
  parameters:
    type: pd-ssd
    replication-type: regional-pd
  volumeBindingMode: WaitForFirstConsumer

StorageClass for Azure Managed Disk:
  provisioner: disk.csi.azure.com
  parameters:
    skuName: Premium_LRS
    kind: Managed

volumeBindingMode explained:
  Immediate            The PV is provisioned as soon as the PVC is created, potentially in the wrong availability zone.
  WaitForFirstConsumer Provisioning waits until a Pod claims the PVC. Kubernetes picks the zone matching the Pod's node — the correct behaviour for multi-zone clusters.

Using a StorageClass in a PVC:
  apiVersion: v1
  kind: PersistentVolumeClaim
  metadata:
    name: redis-data
    namespace: production
  spec:
    storageClassName: gp3-encrypted
    accessModes:
      - ReadWriteOnce
    resources:
      requests:
        storage: 20Gi

StatefulSet with volumeClaimTemplates:
StatefulSets have a special field that creates a PVC per replica automatically. This is how you run Redis Cluster, Kafka, Elasticsearch, or PostgreSQL HA — each Pod gets its own private PVC.
  apiVersion: apps/v1
  kind: StatefulSet
  metadata:
    name: postgres
    namespace: production
  spec:
    serviceName: postgres
    replicas: 3
    selector:
      matchLabels:
        app: postgres
    template:
      spec:
        containers:
          - name: postgres
            image: postgres:16
            volumeMounts:
              - name: data
                mountPath: /var/lib/postgresql/data
    volumeClaimTemplates:
      - metadata:
          name: data
        spec:
          storageClassName: gp3-encrypted
          accessModes: [ReadWriteOnce]
          resources:
            requests:
              storage: 50Gi

This creates PVCs named data-postgres-0, data-postgres-1, data-postgres-2 automatically.

CSI snapshots for backups:
  apiVersion: snapshot.storage.k8s.io/v1
  kind: VolumeSnapshot
  metadata:
    name: postgres-snapshot-20240115
    namespace: production
  spec:
    volumeSnapshotClassName: csi-aws-vsc
    source:
      persistentVolumeClaimName: data-postgres-0

Restoring from a snapshot:
  spec:
    dataSource:
      name: postgres-snapshot-20240115
      kind: VolumeSnapshot
      apiGroup: snapshot.storage.k8s.io

Managing StorageClasses:
  kubectl get storageclass
  kubectl describe storageclass gp3-encrypted
  kubectl get pvc -n production
  # A PVC in Pending state for more than a minute means provisioning failed.
  kubectl describe pvc redis-data -n production  # Shows provisioner error events`,
    },

    // ── K8s Module 5: Scaling ────────────────────────────────────────
    {
      moduleId: k8sMod5.id,
      title: "Manual Scaling and HPA",
      slug: "hpa",
      order: 1,
      content: `Kubernetes workloads need to handle traffic patterns that vary by orders of magnitude — a flash sale, a viral post, a nightly batch run. The HorizontalPodAutoscaler automates replica management by watching metrics and adjusting Pod count to match demand. Getting HPA right means understanding not just the API, but the metrics pipeline behind it.

Prerequisites — metrics-server:
HPA requires the Kubernetes metrics-server to be installed. Without it, kubectl top and HPA on CPU/memory both fail silently.
  kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
  kubectl top nodes
  kubectl top pods -n production

Manual scaling reference:
  kubectl scale deployment api --replicas=10 -n production
  kubectl scale deployment api --replicas=3 -n production

Production HPA using the v2 API:
  apiVersion: autoscaling/v2
  kind: HorizontalPodAutoscaler
  metadata:
    name: api-hpa
    namespace: production
  spec:
    scaleTargetRef:
      apiVersion: apps/v1
      kind: Deployment
      name: api
    minReplicas: 3
    maxReplicas: 50
    metrics:
      - type: Resource
        resource:
          name: cpu
          target:
            type: Utilization
            averageUtilization: 70
      - type: Resource
        resource:
          name: memory
          target:
            type: AverageValue
            averageValue: 400Mi
    behavior:
      scaleUp:
        stabilizationWindowSeconds: 30
        policies:
          - type: Percent
            value: 100
            periodSeconds: 60
      scaleDown:
        stabilizationWindowSeconds: 300
        policies:
          - type: Pods
            value: 2
            periodSeconds: 60

Scaling behavior explained:
The scaleUp stabilizationWindowSeconds: 30 means HPA waits 30 seconds of sustained high load before adding replicas, avoiding flapping from transient spikes. scaleDown stabilizationWindowSeconds: 300 means it waits 5 minutes before removing Pods, preventing scale-down during a lull in a still-active traffic pattern.

Custom metrics HPA (queue depth example):
KEDA (Kubernetes Event-Driven Autoscaling) extends HPA to scale on any metric — SQS queue length, Kafka lag, Prometheus query results, cron schedule.
  apiVersion: keda.sh/v1alpha1
  kind: ScaledObject
  metadata:
    name: worker-scaledobject
    namespace: production
  spec:
    scaleTargetRef:
      name: worker
    minReplicaCount: 0
    maxReplicaCount: 100
    triggers:
      - type: aws-sqs-queue
        metadata:
          queueURL: https://sqs.us-east-1.amazonaws.com/123/my-queue
          queueLength: "10"
          awsRegion: us-east-1

KEDA can scale to zero, making it ideal for batch workers that should not run at all when the queue is empty.

Vertical Pod Autoscaler (VPA):
VPA adjusts resource requests/limits automatically. It should not be used with HPA on CPU/memory simultaneously, but works well with HPA on custom metrics.
  apiVersion: autoscaling.k8s.io/v1
  kind: VerticalPodAutoscaler
  metadata:
    name: api-vpa
  spec:
    targetRef:
      apiVersion: apps/v1
      kind: Deployment
      name: api
    updatePolicy:
      updateMode: "Auto"

Observing HPA in action:
  kubectl get hpa -n production
  kubectl describe hpa api-hpa -n production
  # Shows current metrics, desired replicas, last scale event, and conditions.
  kubectl get events -n production --sort-by=.metadata.creationTimestamp | grep HPA

Common pitfall — missing resource requests:
HPA calculates CPU utilization as (current CPU usage) / (requested CPU). If a container has no CPU request, Kubernetes cannot compute utilization and HPA will refuse to scale. Always set resource requests on every container in a Deployment that uses HPA.`,
    },
    {
      moduleId: k8sMod5.id,
      title: "Cluster Autoscaler and Pod Disruption Budgets",
      slug: "cluster-autoscaler-and-pdb",
      order: 2,
      content: `HPA handles scaling Pods. But when HPA adds Pods and the cluster runs out of node capacity, those Pods sit in Pending state serving nothing. Cluster Autoscaler (CA) solves the infrastructure half of the autoscaling problem by adding and removing nodes. Pod Disruption Budgets (PDB) complete the picture by ensuring that node removal and cluster maintenance never take down more replicas than you can afford.

How Cluster Autoscaler works:
CA runs as a Deployment in the cluster and watches for Pods stuck in Pending due to Insufficient CPU or Insufficient memory. When it detects them, it calculates which node group could fit them and requests a scale-out from the cloud provider API (AWS Auto Scaling, GCP Managed Instance Group, AKS VMSS). It also scans nodes that have been underutilized for a configurable window and safely evicts their workloads before removing the node.

CA on AWS EKS — required annotation:
  kubectl -n kube-system annotate serviceaccount cluster-autoscaler \
    eks.amazonaws.com/role-arn=arn:aws:iam::ACCOUNT:role/EKSClusterAutoscaler

  kubectl -n kube-system edit deployment cluster-autoscaler
  # Add to args:
  #   --balance-similar-node-groups
  #   --skip-nodes-with-system-pods=false
  #   --scale-down-utilization-threshold=0.5
  #   --scale-down-delay-after-add=10m

CA on GKE — enable at node pool level:
  gcloud container clusters update my-cluster \
    --enable-autoscaling \
    --min-nodes=1 \
    --max-nodes=20 \
    --node-pool=default-pool \
    --region=us-central1

Pod Disruption Budget — protecting availability during disruptions:
A disruption is any voluntary termination: node drain for maintenance, rolling update, Cluster Autoscaler scale-down, or kubectl delete pod. Without a PDB, CA can evict all Pods of a Deployment simultaneously. A PDB prevents that.

PDB using minAvailable:
  apiVersion: policy/v1
  kind: PodDisruptionBudget
  metadata:
    name: api-pdb
    namespace: production
  spec:
    minAvailable: 2
    selector:
      matchLabels:
        app: api

PDB using maxUnavailable:
  apiVersion: policy/v1
  kind: PodDisruptionBudget
  metadata:
    name: api-pdb
    namespace: production
  spec:
    maxUnavailable: 1
    selector:
      matchLabels:
        app: api

Choosing between minAvailable and maxUnavailable:
Use minAvailable when you have an absolute floor — e.g., a payment service must always have at least 2 instances. Use maxUnavailable when you care about the rate of disruption — e.g., roll at most 1 at a time. For a Deployment with replicas: 3, both maxUnavailable: 1 and minAvailable: 2 achieve the same result, but minAvailable scales better if you later increase replicas.

PDB interaction with node drain:
  kubectl drain node-1 --ignore-daemonsets --delete-emptydir-data
  # Drain respects PDBs. If evicting a Pod would violate the budget,
  # drain blocks until other Pods are rescheduled elsewhere.
  kubectl get pdb -n production
  kubectl describe pdb api-pdb -n production
  # ALLOWED DISRUPTIONS column shows how many Pods can currently be disrupted.

Safe to evict annotation:
For standalone Pods or DaemonSet Pods without a PDB, CA will not evict them by default. Override this per Pod:
  annotations:
    cluster-autoscaler.kubernetes.io/safe-to-evict: "true"

Topology spread constraints — distributing Pods across zones:
Combined with CA and PDB, topology spread ensures Pods are not all scheduled on the same AZ:
  topologySpreadConstraints:
    - maxSkew: 1
      topologyKey: topology.kubernetes.io/zone
      whenUnsatisfiable: DoNotSchedule
      labelSelector:
        matchLabels:
          app: api`,
    },

    // ── K8s Module 6: Ingress ────────────────────────────────────────
    {
      moduleId: k8sMod6.id,
      title: "Ingress Controllers and Rules",
      slug: "ingress-controllers",
      order: 1,
      content: `Every production Kubernetes cluster runs dozens of services. Running one cloud load balancer per service costs hundreds of dollars a month and creates a management nightmare. Ingress collapses all external HTTP/HTTPS traffic into a single entry point with intelligent routing. An Ingress Controller watches Ingress resources and translates them into proxy configuration, giving you path-based routing, host-based routing, TLS termination, rate limiting, and auth — all managed as Kubernetes YAML.

Ingress Controller options:
  NGINX Ingress      Most widely used. Battle-tested, rich annotation library.
  Traefik            Native Kubernetes discovery, automatic TLS, dashboard.
  AWS ALB Controller Provisions Application Load Balancers natively. Best for AWS.
  GKE Ingress        GCP's managed Ingress, backed by Google Cloud HTTP(S) LB.
  Istio Gateway      Full service mesh gateway, most powerful but most complex.

Installing NGINX Ingress Controller:
  helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
  helm install ingress-nginx ingress-nginx/ingress-nginx \
    --namespace ingress-nginx \
    --create-namespace \
    --set controller.replicaCount=2 \
    --set controller.resources.requests.cpu=100m \
    --set controller.resources.requests.memory=128Mi

Verify the external IP is assigned:
  kubectl get svc -n ingress-nginx ingress-nginx-controller
  # Wait for EXTERNAL-IP to show a public IP or hostname.

Basic host-based Ingress:
  apiVersion: networking.k8s.io/v1
  kind: Ingress
  metadata:
    name: app-ingress
    namespace: production
    annotations:
      nginx.ingress.kubernetes.io/proxy-body-size: "50m"
      nginx.ingress.kubernetes.io/proxy-read-timeout: "120"
  spec:
    ingressClassName: nginx
    rules:
      - host: api.example.com
        http:
          paths:
            - path: /
              pathType: Prefix
              backend:
                service:
                  name: api-svc
                  port:
                    number: 80

Path-based routing — multiple services on one host:
  rules:
    - host: example.com
      http:
        paths:
          - path: /api
            pathType: Prefix
            backend:
              service:
                name: api-svc
                port:
                  number: 80
          - path: /admin
            pathType: Prefix
            backend:
              service:
                name: admin-svc
                port:
                  number: 80
          - path: /
            pathType: Prefix
            backend:
              service:
                name: frontend-svc
                port:
                  number: 80

Path types:
  Prefix      Matches any path starting with the prefix. /api matches /api, /api/users, /api/v2.
  Exact       Matches only the exact path.
  ImplementationSpecific  Controller-defined matching (Traefik regex, etc.).

Useful NGINX annotations:
  nginx.ingress.kubernetes.io/rewrite-target: /    Strip path prefix before forwarding.
  nginx.ingress.kubernetes.io/rate-limit: "100"    Requests per second per IP.
  nginx.ingress.kubernetes.io/auth-url             External authentication service.
  nginx.ingress.kubernetes.io/ssl-redirect: "true" Force HTTPS.
  nginx.ingress.kubernetes.io/cors-allow-origin    CORS header injection.
  nginx.ingress.kubernetes.io/upstream-hash-by     Consistent hashing for sticky routing.

AWS ALB Ingress (using AWS Load Balancer Controller):
  annotations:
    kubernetes.io/ingress.class: alb
    alb.ingress.kubernetes.io/scheme: internet-facing
    alb.ingress.kubernetes.io/target-type: ip
    alb.ingress.kubernetes.io/certificate-arn: arn:aws:acm:us-east-1:ACCOUNT:certificate/CERT-ID
    alb.ingress.kubernetes.io/listen-ports: '[{"HTTPS":443}]'

Debugging Ingress:
  kubectl describe ingress app-ingress -n production
  kubectl logs -n ingress-nginx -l app.kubernetes.io/name=ingress-nginx --tail=100
  # Look for 502 errors (Pod not ready), 404 (no matching rule), or config reload failures.`,
    },
    {
      moduleId: k8sMod6.id,
      title: "TLS Termination with cert-manager",
      slug: "tls-and-cert-manager",
      order: 2,
      content: `TLS is non-negotiable in production. Without HTTPS, credentials transit in plaintext, browsers warn users, and SEO rankings drop. Manually managing TLS certificates — generating CSRs, completing ACME challenges, renewing every 90 days, updating Kubernetes Secrets — is error-prone and time-consuming. cert-manager automates every step of this lifecycle, watching for expiry and renewing certificates transparently.

How cert-manager works:
cert-manager runs as a controller set in your cluster. It watches Certificate and Ingress resources. When you annotate an Ingress or create a Certificate resource, cert-manager creates a temporary resource (Order, Challenge) to complete the ACME validation, stores the resulting certificate and key in a Kubernetes Secret, and monitors the expiry date to renew 30 days before expiration.

Install cert-manager via Helm:
  helm repo add jetstack https://charts.jetstack.io
  helm install cert-manager jetstack/cert-manager \
    --namespace cert-manager \
    --create-namespace \
    --set installCRDs=true \
    --set replicaCount=2

Verify installation:
  kubectl get pods -n cert-manager
  kubectl get crds | grep cert-manager

ClusterIssuer for Let's Encrypt production:
  apiVersion: cert-manager.io/v1
  kind: ClusterIssuer
  metadata:
    name: letsencrypt-prod
  spec:
    acme:
      server: https://acme-v02.api.letsencrypt.org/directory
      email: admin@example.com
      privateKeySecretRef:
        name: letsencrypt-prod-account-key
      solvers:
        - http01:
            ingress:
              ingressClassName: nginx

HTTP-01 challenge explained:
cert-manager temporarily adds a path like /.well-known/acme-challenge/TOKEN to your Ingress. Let's Encrypt hits that URL to verify you control the domain. This requires your domain to resolve to the cluster's Ingress IP. For wildcard certs, you must use the DNS-01 challenge instead.

ClusterIssuer using DNS-01 with Route53 (for wildcard certs):
  spec:
    acme:
      solvers:
        - dns01:
            route53:
              region: us-east-1
              hostedZoneID: Z123456ABCDEF
              accessKeyIDSecretRef:
                name: route53-credentials
                key: access-key-id
              secretAccessKeySecretRef:
                name: route53-credentials
                key: secret-access-key

Ingress with automated TLS:
  apiVersion: networking.k8s.io/v1
  kind: Ingress
  metadata:
    name: app-ingress
    namespace: production
    annotations:
      cert-manager.io/cluster-issuer: letsencrypt-prod
  spec:
    ingressClassName: nginx
    tls:
      - hosts:
          - api.example.com
          - www.example.com
        secretName: app-tls-secret
    rules:
      - host: api.example.com
        http:
          paths:
            - path: /
              pathType: Prefix
              backend:
                service:
                  name: api-svc
                  port:
                    number: 80

Explicit Certificate resource (more control):
  apiVersion: cert-manager.io/v1
  kind: Certificate
  metadata:
    name: api-cert
    namespace: production
  spec:
    secretName: api-tls-secret
    issuerRef:
      name: letsencrypt-prod
      kind: ClusterIssuer
    commonName: api.example.com
    dnsNames:
      - api.example.com
      - www.example.com
    duration: 2160h    # 90 days
    renewBefore: 720h  # Renew 30 days before expiry

Monitoring certificate health:
  kubectl get certificate -n production
  kubectl describe certificate api-cert -n production
  # Status.Conditions shows Ready=True when the cert is valid.
  kubectl get certificaterequest -n production
  kubectl get order -n production
  kubectl get challenge -n production
  # If a cert is stuck: kubectl describe challenge -n production to see the ACME error.

Force renewal:
  kubectl delete secret app-tls-secret -n production
  # cert-manager detects the missing secret and immediately re-issues the certificate.`,
    },

    // ── K8s Module 7: RBAC ───────────────────────────────────────────
    {
      moduleId: k8sMod7.id,
      title: "Roles and ClusterRoles",
      slug: "roles-and-clusterroles",
      order: 1,
      content: `RBAC (Role-Based Access Control) is Kubernetes' authorization system. Every API request — from kubectl, from a running Pod calling the API server, from CI/CD — goes through the RBAC authorizer. A misconfigured RBAC policy is either too permissive (security risk) or too restrictive (breaks workloads). Understanding the model deeply lets you write least-privilege policies with confidence.

The four RBAC objects:
  Role              Namespace-scoped set of permissions.
  ClusterRole       Cluster-scoped permissions, or a reusable namespace template.
  RoleBinding       Grants a Role or ClusterRole to subjects within one namespace.
  ClusterRoleBinding  Grants a ClusterRole to subjects across all namespaces.

RBAC is additive: there is no "deny" rule. If a permission is not explicitly granted, it is denied. This means an overly permissive RoleBinding cannot be narrowed by another binding — you must restrict what the Role itself grants.

Subject types:
  User         External identity (from the cluster's configured authentication provider).
  Group        A group of users (e.g., system:masters built-in admin group).
  ServiceAccount  A Kubernetes identity assigned to Pods.

Namespace-scoped Role (read Pods and logs):
  apiVersion: rbac.authorization.k8s.io/v1
  kind: Role
  metadata:
    name: pod-reader
    namespace: staging
  rules:
    - apiGroups: [""]
      resources: ["pods", "pods/log", "pods/exec"]
      verbs: ["get", "list", "watch"]
    - apiGroups: [""]
      resources: ["events"]
      verbs: ["get", "list", "watch"]

RoleBinding granting it to a developer:
  apiVersion: rbac.authorization.k8s.io/v1
  kind: RoleBinding
  metadata:
    name: developer-pod-reader
    namespace: staging
  subjects:
    - kind: User
      name: alice@example.com
      apiGroup: rbac.authorization.k8s.io
    - kind: Group
      name: dev-team
      apiGroup: rbac.authorization.k8s.io
  roleRef:
    kind: Role
    name: pod-reader
    apiGroup: rbac.authorization.k8s.io

ClusterRole for read-only cluster admin (view):
  kubectl get clusterrole view
  # Kubernetes ships with built-in ClusterRoles: view, edit, admin, cluster-admin.
  # Grant the built-in view role in a specific namespace:
  kubectl create rolebinding dev-viewer \
    --clusterrole=view \
    --user=alice@example.com \
    --namespace=staging

ClusterRole for a CI/CD system deploying across all namespaces:
  apiVersion: rbac.authorization.k8s.io/v1
  kind: ClusterRole
  metadata:
    name: deployment-manager
  rules:
    - apiGroups: ["apps"]
      resources: ["deployments", "replicasets", "statefulsets"]
      verbs: ["get", "list", "watch", "create", "update", "patch"]
    - apiGroups: [""]
      resources: ["services", "configmaps", "serviceaccounts"]
      verbs: ["get", "list", "watch", "create", "update", "patch"]
    - apiGroups: ["networking.k8s.io"]
      resources: ["ingresses"]
      verbs: ["get", "list", "watch", "create", "update", "patch"]

Auditing permissions:
  kubectl auth can-i get pods --namespace=staging --as=alice@example.com
  kubectl auth can-i delete deployments --namespace=production --as=system:serviceaccount:production:api-sa
  kubectl auth can-i "*" "*"   # Full admin check (cluster-admin only)
  kubectl who-can get pods -n staging   # Requires kubectl who-can plugin

Aggregated ClusterRoles:
Kubernetes allows ClusterRoles to aggregate permissions from other ClusterRoles using label selectors. The built-in view, edit, and admin ClusterRoles use this — any CRD that adds aggregation rules to view or edit automatically extends those ClusterRoles without patching them.
  metadata:
    labels:
      rbac.authorization.k8s.io/aggregate-to-view: "true"

Common mistakes:
- Granting cluster-admin to CI/CD service accounts — use least-privilege ClusterRoles.
- Using wildcards (*) in verbs or resources — always be explicit.
- Forgetting that RoleBindings referencing ClusterRoles are still namespace-scoped.
- Not testing with kubectl auth can-i before assuming access works.`,
    },
    {
      moduleId: k8sMod7.id,
      title: "ServiceAccounts and NetworkPolicies",
      slug: "serviceaccounts-and-networkpolicies",
      order: 2,
      content: `Kubernetes security has two complementary controls that protect the runtime environment: ServiceAccounts (workload identity) and NetworkPolicies (network segmentation). Most breaches in containerized environments happen because workloads run with excessive permissions or because lateral movement is unconstrained. These two primitives, applied correctly, contain the blast radius of any compromise.

ServiceAccounts — workload identity:
Every Pod authenticates to the Kubernetes API using a ServiceAccount token. The default ServiceAccount in each namespace receives a mounted token automatically, but it grants read access to the API server and in permissive clusters much more. Always create dedicated ServiceAccounts per workload and grant only what is needed.

Dedicated ServiceAccount with minimal permissions:
  apiVersion: v1
  kind: ServiceAccount
  metadata:
    name: api-sa
    namespace: production
    annotations:
      eks.amazonaws.com/role-arn: arn:aws:iam::ACCOUNT:role/api-prod-role
  automountServiceAccountToken: false

  apiVersion: apps/v1
  kind: Deployment
  spec:
    template:
      spec:
        serviceAccountName: api-sa
        automountServiceAccountToken: false

Projected service account tokens (bound tokens):
Old-style SA tokens never expire. Kubernetes 1.21+ uses projected volumes with short-lived bound tokens:
  volumes:
    - name: token
      projected:
        sources:
          - serviceAccountToken:
              path: token
              expirationSeconds: 3600
              audience: my-service

AWS IAM Roles for Service Accounts (IRSA):
IRSA maps a Kubernetes ServiceAccount to an AWS IAM Role, letting Pods assume AWS permissions without long-lived credentials:
  eksctl create iamserviceaccount \
    --name api-sa \
    --namespace production \
    --cluster my-cluster \
    --attach-policy-arn arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess \
    --approve

NetworkPolicies — Pod firewall rules:
By default, every Pod can reach every other Pod across all namespaces. NetworkPolicies change this. They are additive: if any NetworkPolicy selects a Pod, only explicitly allowed traffic is permitted. If no policy selects a Pod, all traffic is allowed.

NetworkPolicy requires a CNI plugin that enforces policies (Calico, Cilium, Weave). The default kubenet CNI stores the objects but does not enforce them.

Deny all ingress for a namespace (default deny):
  apiVersion: networking.k8s.io/v1
  kind: NetworkPolicy
  metadata:
    name: default-deny-ingress
    namespace: production
  spec:
    podSelector: {}
    policyTypes:
      - Ingress

Allow only frontend to reach the API on port 3000:
  apiVersion: networking.k8s.io/v1
  kind: NetworkPolicy
  metadata:
    name: api-allow-frontend
    namespace: production
  spec:
    podSelector:
      matchLabels:
        app: api
    policyTypes:
      - Ingress
    ingress:
      - from:
          - podSelector:
              matchLabels:
                app: frontend
        ports:
          - protocol: TCP
            port: 3000

Allow ingress from Prometheus (cross-namespace scraping):
  ingress:
    - from:
        - namespaceSelector:
            matchLabels:
              name: monitoring
          podSelector:
            matchLabels:
              app: prometheus
      ports:
        - port: 9090

Egress policy — prevent database from calling external IPs:
  spec:
    podSelector:
      matchLabels:
        app: postgres
    policyTypes:
      - Egress
    egress:
      - to:
          - namespaceSelector:
              matchLabels:
                name: production
        ports:
          - port: 5432

Pod Security Standards (PSS):
Kubernetes 1.25+ replaces PodSecurityPolicy with built-in admission via labels on namespaces:
  kubectl label namespace production \
    pod-security.kubernetes.io/enforce=restricted \
    pod-security.kubernetes.io/audit=restricted \
    pod-security.kubernetes.io/warn=restricted
The restricted profile disallows privileged containers, host networking, host paths, and requires non-root users.`,
    },

    // ── K8s Module 8: Observability ──────────────────────────────────
    {
      moduleId: k8sMod8.id,
      title: "Prometheus and Grafana",
      slug: "prometheus-and-grafana",
      order: 1,
      content: `You cannot improve what you cannot measure. Kubernetes clusters generate enormous amounts of operational data — CPU and memory per container, HTTP request rates and latencies, error counts, queue depths, disk IO, network throughput — but only if you instrument your applications and install the right collection infrastructure. Prometheus and Grafana have become the de-facto standard for Kubernetes observability because they integrate natively with the Kubernetes API, scale horizontally, and have a massive ecosystem of pre-built dashboards and exporters.

The Prometheus pull model:
Unlike push-based monitoring systems, Prometheus scrapes metrics by making HTTP GET requests to /metrics endpoints on your services. This means your application just needs to expose metrics; Prometheus decides when and how often to collect them. The scrape interval is typically 15–30 seconds.

Install kube-prometheus-stack (the complete observability bundle):
  helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
  helm repo update
  helm install monitoring prometheus-community/kube-prometheus-stack \
    --namespace monitoring \
    --create-namespace \
    --set prometheus.prometheusSpec.retention=30d \
    --set prometheus.prometheusSpec.storageSpec.volumeClaimTemplate.spec.storageClassName=gp3-encrypted \
    --set prometheus.prometheusSpec.storageSpec.volumeClaimTemplate.spec.resources.requests.storage=50Gi \
    --set grafana.persistence.enabled=true \
    --set grafana.persistence.size=10Gi

This installs: Prometheus, Alertmanager, Grafana, node-exporter (per-node hardware metrics), kube-state-metrics (cluster state), and a set of default recording rules and alerts.

Access Grafana:
  kubectl port-forward -n monitoring svc/monitoring-grafana 3000:80
  # Open http://localhost:3000 — credentials: admin / prom-operator
  # Change the password immediately in production.

Exposing custom application metrics (Node.js):
  npm install prom-client
  const client = require('prom-client');
  const collectDefaultMetrics = client.collectDefaultMetrics;
  collectDefaultMetrics();
  const httpRequestsTotal = new client.Counter({
    name: 'http_requests_total',
    help: 'Total HTTP requests',
    labelNames: ['method', 'route', 'status_code'],
  });
  const httpDuration = new client.Histogram({
    name: 'http_request_duration_seconds',
    help: 'HTTP request duration',
    labelNames: ['method', 'route'],
    buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 5],
  });

ServiceMonitor — tell Prometheus about your service:
  apiVersion: monitoring.coreos.com/v1
  kind: ServiceMonitor
  metadata:
    name: api-monitor
    namespace: production
    labels:
      release: monitoring
  spec:
    selector:
      matchLabels:
        app: api
    endpoints:
      - port: metrics
        path: /metrics
        interval: 15s

Essential PromQL queries:
  # HTTP request rate over last 5 minutes
  rate(http_requests_total{namespace="production"}[5m])

  # P99 latency
  histogram_quantile(0.99,
    rate(http_request_duration_seconds_bucket{app="api"}[5m])
  )

  # Error rate percentage
  rate(http_requests_total{status_code=~"5.."}[5m])
  / rate(http_requests_total[5m]) * 100

  # Memory usage per Pod
  container_memory_working_set_bytes{namespace="production"}

  # CPU throttling percentage
  rate(container_cpu_throttled_seconds_total[5m])
  / rate(container_cpu_usage_seconds_total[5m]) * 100

  # Pods not ready
  kube_deployment_status_replicas_unavailable{namespace="production"}

Pre-built dashboards:
Import from grafana.com by ID:
  315   Kubernetes cluster overview
  6417  Kubernetes Pod resources
  1860  Node exporter full
  13502 Kubernetes API server
  12611 Kubernetes Persistent Volumes

Recording rules (pre-compute expensive queries):
  apiVersion: monitoring.coreos.com/v1
  kind: PrometheusRule
  metadata:
    name: api-recording-rules
    namespace: monitoring
  spec:
    groups:
      - name: api.rules
        interval: 30s
        rules:
          - record: job:http_requests_total:rate5m
            expr: rate(http_requests_total[5m])`,
    },
    {
      moduleId: k8sMod8.id,
      title: "Logging with Loki and Alerting",
      slug: "loki-and-alerting",
      order: 2,
      content: `Metrics tell you what is happening numerically. Logs tell you why. A complete observability stack needs both. Loki is purpose-built for Kubernetes log aggregation: it indexes only metadata labels rather than the full log content, making storage 10–100x cheaper than Elasticsearch at the same retention. Combined with Alertmanager, you get a complete feedback loop from raw log lines to a PagerDuty page.

Loki architecture:
  Promtail       DaemonSet running on every node, tailing /var/log/pods/* and shipping to Loki.
  Loki           Receives logs, indexes labels, stores compressed chunks in object storage (S3, GCS).
  Grafana        Queries Loki using LogQL and renders log panels alongside metrics dashboards.

Install Loki stack via Helm:
  helm repo add grafana https://grafana.github.io/helm-charts
  helm repo update
  helm install loki grafana/loki-stack \
    --namespace monitoring \
    --set loki.persistence.enabled=true \
    --set loki.persistence.size=20Gi \
    --set loki.persistence.storageClassName=gp3-encrypted \
    --set promtail.enabled=true \
    --set grafana.enabled=false

Verify Promtail is running on all nodes:
  kubectl get daemonset loki-promtail -n monitoring
  kubectl logs -n monitoring daemonset/loki-promtail --tail=20

LogQL — querying logs in Grafana:
  # All logs from a namespace
  {namespace="production"}

  # All error logs from a specific app
  {namespace="production", app="api"} |= "ERROR"

  # Parse JSON logs and filter by level
  {app="api"} | json | level="error"

  # Count error log rate over time
  rate({app="api"} |= "ERROR" [5m])

  # Find slow requests (>500ms) with regex
  {app="api"} | logfmt | duration > 500ms

  # Aggregate by status code
  sum by (status) (rate({app="api"} | json [5m]))

Structured logging best practice:
Log in JSON for Loki to parse efficiently. Every log line should include at minimum:
  { "level": "error", "msg": "DB query failed", "duration_ms": 523, "error": "connection timeout", "trace_id": "abc123" }

Alertmanager configuration:
  global:
    smtp_smarthost: smtp.example.com:587
    smtp_from: alerts@example.com

  route:
    group_by: ["alertname", "namespace", "severity"]
    group_wait: 30s
    group_interval: 5m
    repeat_interval: 4h
    receiver: default
    routes:
      - match:
          severity: critical
        receiver: pagerduty
      - match:
          severity: warning
        receiver: slack

  receivers:
    - name: default
      slack_configs:
        - api_url: https://hooks.slack.com/services/YOUR/WEBHOOK/URL
          channel: "#k8s-alerts"
          title: "[{{ .Status | toUpper }}] {{ .CommonLabels.alertname }}"
          text: "{{ range .Alerts }}{{ .Annotations.description }}\n{{ end }}"

    - name: pagerduty
      pagerduty_configs:
        - service_key: YOUR_PAGERDUTY_KEY

    - name: slack
      slack_configs:
        - api_url: https://hooks.slack.com/services/YOUR/WEBHOOK/URL
          channel: "#k8s-warnings"

PrometheusRule for critical alerts:
  apiVersion: monitoring.coreos.com/v1
  kind: PrometheusRule
  metadata:
    name: production-alerts
    namespace: monitoring
    labels:
      release: monitoring
  spec:
    groups:
      - name: production
        rules:
          - alert: HighErrorRate
            expr: |
              rate(http_requests_total{status_code=~"5..",namespace="production"}[5m])
              / rate(http_requests_total{namespace="production"}[5m]) > 0.05
            for: 2m
            labels:
              severity: critical
            annotations:
              summary: "High error rate on {{ $labels.app }}"
              description: "Error rate is {{ humanizePercentage $value }} for {{ $labels.app }}"

          - alert: PodCrashLooping
            expr: rate(kube_pod_container_status_restarts_total[15m]) > 0.1
            for: 5m
            labels:
              severity: warning
            annotations:
              summary: "Pod {{ $labels.pod }} is crash-looping"

          - alert: PersistentVolumeFull
            expr: |
              kubelet_volume_stats_available_bytes
              / kubelet_volume_stats_capacity_bytes < 0.1
            for: 5m
            labels:
              severity: critical
            annotations:
              summary: "PV {{ $labels.persistentvolumeclaim }} is 90% full"`,
    },

    // ── K8s Module 9: Helm ───────────────────────────────────────────
    {
      moduleId: k8sMod9.id,
      title: "Helm Chart Fundamentals",
      slug: "helm-chart-fundamentals",
      order: 1,
      content: `Raw kubectl apply works for individual resources in a single environment. It breaks down when you need to deploy the same application across staging and production with different values, share your application with other teams, or roll back a complex multi-resource change atomically. Helm solves all of these problems by packaging an application as a versioned artifact — a Chart — with a declarative lifecycle (install, upgrade, rollback, uninstall) and a powerful templating system.

Helm concepts:
  Chart       A package of templated Kubernetes manifests plus metadata and default values.
  Release     A specific installed instance of a Chart. You can install the same Chart many times with different release names and configurations.
  Repository  A collection of Charts hosted as a static website (GitHub Pages, S3, OCI registry).
  Values      Configuration injected into templates at install time.

Install Helm:
  brew install helm                    macOS
  choco install kubernetes-helm        Windows
  curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash

Working with repositories:
  helm repo add bitnami https://charts.bitnami.com/bitnami
  helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
  helm repo add jetstack https://charts.jetstack.io
  helm repo update
  helm search repo bitnami/postgresql --versions
  helm show values bitnami/postgresql > postgres-values.yaml
  # Edit the values file, then install:
  helm install my-postgres bitnami/postgresql -f postgres-values.yaml -n production

Release lifecycle:
  helm install   my-app ./my-chart -n production
  helm upgrade   my-app ./my-chart -n production --set image.tag=2.0.0
  helm rollback  my-app 1 -n production
  helm uninstall my-app -n production
  helm list -n production
  helm history   my-app -n production
  helm status    my-app -n production
  helm get values my-app -n production    See current user-supplied values
  helm get manifest my-app -n production  See rendered Kubernetes YAML

Upgrading with --atomic:
  helm upgrade my-app ./my-chart \
    --namespace production \
    --install \
    --atomic \
    --timeout 5m \
    --cleanup-on-fail
The --atomic flag rolls back automatically if any hook or resource fails during the upgrade — essential for CI/CD pipelines.

Using --set vs -f values.yaml:
  --set key=value          Good for one-off overrides in CI (image tag, replica count).
  -f custom-values.yaml    Good for environment-specific overrides committed to Git.
  Combine both:
  helm upgrade my-app ./my-chart -f prod-values.yaml --set image.tag=2.1.0

OCI registries:
  helm push my-chart-1.0.0.tgz oci://ghcr.io/myorg/charts
  helm install my-app oci://ghcr.io/myorg/charts/my-chart --version 1.0.0

Chart structure overview:
  my-chart/
    Chart.yaml        Name, version, description, dependencies.
    values.yaml       Default values — the API surface of your chart.
    templates/        Go-templated YAML files rendered by Helm.
    charts/           Unpacked chart dependencies (vendored).
    .helmignore       Files excluded from the chart package.

Inspect a chart's default values:
  helm show values ingress-nginx/ingress-nginx | less
  # Always read these before installing. Almost every Helm problem is a values problem.`,
    },
    {
      moduleId: k8sMod9.id,
      title: "Writing Your Own Helm Chart",
      slug: "writing-helm-charts",
      order: 2,
      content: `Writing your own Helm chart is how you turn a pile of kubectl apply files into a professional, shareable, configurable deployment artifact. A well-written chart is self-documenting through its values.yaml, handles edge cases with conditionals, works across environments with no manifest changes, and is tested before it ships.

Scaffold a new chart:
  helm create my-app
  # Creates: Chart.yaml, values.yaml, templates/ with Deployment, Service, Ingress, HPA, ServiceAccount

Chart.yaml:
  apiVersion: v2
  name: my-app
  description: Production API service
  type: application
  version: 0.1.0          Chart version — bump on every chart change.
  appVersion: "2.1.0"     App version — informational, used in labels.

values.yaml (the chart's public API):
  replicaCount: 2
  image:
    repository: myrepo/my-app
    tag: ""
    pullPolicy: IfNotPresent
  imagePullSecrets: []
  service:
    type: ClusterIP
    port: 80
    targetPort: 3000
  ingress:
    enabled: false
    className: nginx
    host: my-app.example.com
    tls: []
  resources:
    requests:
      cpu: 250m
      memory: 256Mi
    limits:
      cpu: "1"
      memory: 512Mi
  autoscaling:
    enabled: false
    minReplicas: 2
    maxReplicas: 20
    targetCPUUtilizationPercentage: 70
  nodeSelector: {}
  tolerations: []
  affinity: {}
  podAnnotations: {}
  env: []
  envFrom: []

_helpers.tpl — named templates to avoid repetition:
  {{- define "my-app.fullname" -}}
  {{- printf "%s-%s" .Release.Name .Chart.Name | trunc 63 | trimSuffix "-" }}
  {{- end }}

  {{- define "my-app.labels" -}}
  helm.sh/chart: {{ .Chart.Name }}-{{ .Chart.Version }}
  app.kubernetes.io/name: {{ .Chart.Name }}
  app.kubernetes.io/instance: {{ .Release.Name }}
  app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
  app.kubernetes.io/managed-by: {{ .Release.Service }}
  {{- end }}

templates/deployment.yaml — full production template:
  apiVersion: apps/v1
  kind: Deployment
  metadata:
    name: {{ include "my-app.fullname" . }}
    labels:
      {{- include "my-app.labels" . | nindent 4 }}
  spec:
    {{- if not .Values.autoscaling.enabled }}
    replicas: {{ .Values.replicaCount }}
    {{- end }}
    selector:
      matchLabels:
        app.kubernetes.io/name: {{ .Chart.Name }}
        app.kubernetes.io/instance: {{ .Release.Name }}
    template:
      metadata:
        labels:
          {{- include "my-app.labels" . | nindent 8 }}
        {{- with .Values.podAnnotations }}
        annotations:
          {{- toYaml . | nindent 8 }}
        {{- end }}
      spec:
        {{- with .Values.imagePullSecrets }}
        imagePullSecrets:
          {{- toYaml . | nindent 8 }}
        {{- end }}
        containers:
          - name: {{ .Chart.Name }}
            image: "{{ .Values.image.repository }}:{{ .Values.image.tag | default .Chart.AppVersion }}"
            imagePullPolicy: {{ .Values.image.pullPolicy }}
            ports:
              - name: http
                containerPort: {{ .Values.service.targetPort }}
            {{- with .Values.env }}
            env:
              {{- toYaml . | nindent 12 }}
            {{- end }}
            {{- with .Values.envFrom }}
            envFrom:
              {{- toYaml . | nindent 12 }}
            {{- end }}
            resources:
              {{- toYaml .Values.resources | nindent 12 }}

Testing and linting:
  helm lint ./my-app
  helm template my-release ./my-app | kubectl apply --dry-run=client -f -
  helm install --dry-run --debug my-release ./my-app -f prod-values.yaml
  helm test my-release -n production   Runs test Pods defined in templates/tests/

Packaging and distributing:
  helm package ./my-app
  # Creates my-app-0.1.0.tgz
  helm repo index . --url https://charts.example.com
  # Upload tgz and index.yaml to S3 or GitHub Pages.`,
    },

    // ── K8s Module 10: Production Operations ────────────────────────
    {
      moduleId: k8sMod10.id,
      title: "Rolling Deployments and Canary Releases",
      slug: "rolling-and-canary",
      order: 1,
      content: `Shipping software to production without downtime is a solved problem in Kubernetes — but only if you configure your Deployment correctly and understand the mechanics. This lesson covers the full spectrum: zero-downtime rolling updates, instant rollbacks, blue-green switching, and canary releases that gradually shift traffic with real safety signals.

Rolling update mechanics deep dive:
Kubernetes computes the rollout as a series of steps. With replicas: 5, maxSurge: 1, maxUnavailable: 0:
  Step 1: Create 1 new Pod (now 6 total, 5 old + 1 new). Wait for readiness.
  Step 2: Terminate 1 old Pod (back to 5 total: 4 old + 1 new).
  Step 3: Repeat until all 5 are new generation.
If any new Pod fails its readiness probe, the rollout pauses. No more old Pods are removed until the new Pod becomes healthy or you intervene.

Complete Deployment with production rolling update settings:
  apiVersion: apps/v1
  kind: Deployment
  metadata:
    name: api
    namespace: production
    annotations:
      deployment.kubernetes.io/change-cause: "v2.1.0: Add payment provider retry logic"
  spec:
    replicas: 5
    revisionHistoryLimit: 10
    strategy:
      type: RollingUpdate
      rollingUpdate:
        maxSurge: 2
        maxUnavailable: 0
    minReadySeconds: 10
    template:
      spec:
        terminationGracePeriodSeconds: 60
        containers:
          - name: api
            image: myrepo/api:2.1.0
            readinessProbe:
              httpGet:
                path: /health/ready
                port: 3000
              initialDelaySeconds: 5
              periodSeconds: 5
              successThreshold: 2
              failureThreshold: 3
            lifecycle:
              preStop:
                exec:
                  command: ["/bin/sh", "-c", "sleep 10"]

minReadySeconds: 10 means a Pod must pass readiness for 10 continuous seconds before Kubernetes considers it available for the next step. This catches applications that pass the initial health check but fail under real load.

Rollout commands:
  kubectl rollout status deployment/api -n production --timeout=10m
  kubectl rollout history deployment/api -n production
  kubectl rollout history deployment/api --revision=5 -n production
  kubectl rollout undo deployment/api -n production
  kubectl rollout undo deployment/api --to-revision=3 -n production
  kubectl rollout pause deployment/api -n production
  kubectl rollout resume deployment/api -n production

Blue-green deployment (manual):
  # Blue is live. Deploy green alongside:
  kubectl apply -f deployment-green.yaml   # name: api-green, same labels except version: green
  kubectl rollout status deployment/api-green -n production
  # Switch the Service selector to green:
  kubectl patch service api-svc -n production \
    -p '{"spec":{"selector":{"app":"api","version":"green"}}}'
  # Instant traffic switch. Keep blue running for quick rollback.
  # After validation, delete blue:
  kubectl delete deployment api-blue -n production

Canary deployment with Argo Rollouts:
Argo Rollouts extends the Deployment API with weight-based canary and blue-green rollout strategies, integration with Prometheus for automated analysis, and a kubectl plugin for management.
  apiVersion: argoproj.io/v1alpha1
  kind: Rollout
  metadata:
    name: api
    namespace: production
  spec:
    replicas: 10
    strategy:
      canary:
        steps:
          - setWeight: 10    # 10% of traffic to canary
          - pause: { duration: 5m }
          - analysis:
              templates:
                - templateName: error-rate-check
          - setWeight: 50
          - pause: { duration: 10m }
          - setWeight: 100
        canaryMetadata:
          labels:
            version: canary
        stableMetadata:
          labels:
            version: stable

Feature flags as an alternative:
For truly risk-free releases, use feature flags (LaunchDarkly, Unleash, Flagsmith) to decouple code deployment from feature activation. Ship the code to all Pods, then gradually enable the feature for a percentage of users in your flag dashboard — with instant kill-switch, no kubectl required.`,
    },
    {
      moduleId: k8sMod10.id,
      title: "Cluster Maintenance and Disaster Recovery",
      slug: "maintenance-and-dr",
      order: 2,
      content: `Running Kubernetes in production is not just about deploying applications — it is about building operational discipline around the cluster itself. Nodes need maintenance windows. etcd needs regular backups. The control plane needs tested upgrade procedures. When things go catastrophically wrong, you need a runbook that has actually been practiced, not a document that has only been written.

Node maintenance — cordon, drain, and uncordon:
Cordon marks a node as unschedulable so no new Pods are placed on it. Drain evicts all Pods from the node gracefully, respecting PodDisruptionBudgets.
  kubectl cordon node-1
  kubectl drain node-1 \
    --ignore-daemonsets \
    --delete-emptydir-data \
    --grace-period=60 \
    --timeout=300s
  # Perform OS patching, kernel upgrade, or hardware replacement.
  kubectl uncordon node-1
  kubectl get nodes   Verify node returns to Ready status.

etcd — the cluster's source of truth:
etcd stores all cluster state: Pods, Deployments, Secrets, ConfigMaps, node registrations, RBAC policies. If etcd is corrupted or lost without a backup, you lose the entire cluster configuration. All persistent state must be recreated from scratch.

etcd backup (run on a control plane node or via a CronJob):
  ETCDCTL_API=3 etcdctl snapshot save /backup/etcd-$(date +%Y%m%d-%H%M%S).db \
    --endpoints=https://127.0.0.1:2379 \
    --cacert=/etc/kubernetes/pki/etcd/ca.crt \
    --cert=/etc/kubernetes/pki/etcd/server.crt \
    --key=/etc/kubernetes/pki/etcd/server.key

Verify the snapshot:
  etcdctl snapshot status /backup/etcd-20240115-030000.db --write-out=table

Automated etcd backups to S3 via CronJob:
  apiVersion: batch/v1
  kind: CronJob
  metadata:
    name: etcd-backup
    namespace: kube-system
  spec:
    schedule: "0 */6 * * *"    Every 6 hours
    jobTemplate:
      spec:
        template:
          spec:
            hostNetwork: true
            nodeSelector:
              node-role.kubernetes.io/control-plane: ""
            tolerations:
              - key: node-role.kubernetes.io/control-plane
                effect: NoSchedule
            containers:
              - name: backup
                image: bitnami/etcd:3.5
                command:
                  - /bin/sh
                  - -c
                  - |
                    etcdctl snapshot save /backup/etcd-$(date +%Y%m%d-%H%M%S).db
                    aws s3 cp /backup/ s3://my-cluster-backups/etcd/ --recursive
                env:
                  - name: ETCDCTL_API
                    value: "3"
                  - name: ETCDCTL_CACERT
                    value: /etc/kubernetes/pki/etcd/ca.crt

Cluster upgrade procedure (kubeadm):
Kubernetes supports N-2 minor version skew between control plane and worker nodes. Always upgrade one minor version at a time.
  # Step 1: Upgrade kubeadm on control plane
  apt-get update && apt-get install -y kubeadm=1.30.0-00
  kubeadm upgrade plan
  kubeadm upgrade apply v1.30.0

  # Step 2: Upgrade kubelet on control plane
  apt-get install -y kubelet=1.30.0-00 kubectl=1.30.0-00
  systemctl daemon-reload && systemctl restart kubelet

  # Step 3: For each worker node
  kubectl cordon worker-1
  kubectl drain worker-1 --ignore-daemonsets --delete-emptydir-data
  # SSH to worker-1:
  apt-get install -y kubeadm=1.30.0-00 kubelet=1.30.0-00 kubectl=1.30.0-00
  kubeadm upgrade node
  systemctl daemon-reload && systemctl restart kubelet
  # Back on control plane:
  kubectl uncordon worker-1

Disaster recovery runbook:
  1. Restore etcd snapshot:
     etcdctl snapshot restore /backup/etcd-latest.db \
       --data-dir=/var/lib/etcd-restore \
       --initial-cluster=master=https://MASTER_IP:2380 \
       --initial-advertise-peer-urls=https://MASTER_IP:2380 \
       --name=master

  2. Update etcd static Pod manifest to use the restored data dir.

  3. Restart kubelet: systemctl restart kubelet

  4. Verify control plane: kubectl get nodes, kubectl get pods -A

GitOps as DR strategy:
If all your manifests, Helm values, and configuration are in Git, you can rebuild a cluster from scratch by rerunning your CI/CD pipeline. etcd backup covers the cluster state; Git covers the desired state. Together they make recovery a matter of hours, not days.

Quarterly DR drill checklist:
- Restore etcd to a test cluster and verify all workloads come up.
- Test kubectl drain on each node type and verify PDBs are respected.
- Simulate a full cluster rebuild from Git and validate all services respond.
- Verify backup uploads are actually succeeding (check S3 timestamps).
- Review IAM permissions for the backup service account.`,
    },
  ];

  for (const lesson of lessons) {
    await prisma.lesson.upsert({
      where: { moduleId_slug: { moduleId: lesson.moduleId, slug: lesson.slug } },
      update: {},
      create: lesson,
    });
  }

  // Flashcards
  const flashcards = [
    { question: "What is a Docker container?", answer: "A lightweight, isolated runtime environment that packages an application and its dependencies, sharing the host OS kernel.", topic: "Docker" },
    { question: "What is a Docker image?", answer: "A read-only template with instructions for creating a Docker container. Images are built from Dockerfiles.", topic: "Docker" },
    { question: "How do you list running containers?", answer: "Use `docker ps`. Add `-a` flag to also list stopped containers: `docker ps -a`.", topic: "Docker" },
    { question: "What does the `-d` flag do in `docker run`?", answer: "Runs the container in detached (background) mode, returning control to the terminal immediately.", topic: "Docker" },
    { question: "What is the purpose of EXPOSE in a Dockerfile?", answer: "Documents which port the containerized application listens on. It does NOT publish the port — use `-p` with `docker run` for that.", topic: "Docker" },
    { question: "What is Docker Compose?", answer: "A tool for defining and running multi-container Docker applications using a YAML file (docker-compose.yml).", topic: "Docker" },
    { question: "What is a Kubernetes Pod?", answer: "The smallest deployable unit in Kubernetes. A Pod wraps one or more containers that share the same network namespace and storage volumes.", topic: "Kubernetes" },
    { question: "What is a Kubernetes Deployment?", answer: "A controller that manages a set of identical Pod replicas, handling rolling updates, scaling, and rollbacks automatically.", topic: "Kubernetes" },
    { question: "What is a Kubernetes Service?", answer: "An abstraction that provides a stable network endpoint (DNS name and IP) for accessing a group of Pods, even as Pod IPs change.", topic: "Kubernetes" },
    { question: "What does `kubectl get pods` do?", answer: "Lists all Pods in the current namespace, showing their status, restarts, and age.", topic: "Kubernetes" },
    { question: "What is a ConfigMap?", answer: "A Kubernetes object that stores non-confidential configuration data as key-value pairs, decoupling config from container images.", topic: "Kubernetes" },
    { question: "What is the difference between ClusterIP and NodePort?", answer: "ClusterIP is only reachable inside the cluster. NodePort exposes the service on each node's IP at a static port (30000–32767), making it reachable from outside the cluster.", topic: "Kubernetes" },
  ];

  for (const card of flashcards) {
    const existing = await prisma.flashcard.findFirst({ where: { question: card.question } });
    if (!existing) await prisma.flashcard.create({ data: card });
  }

  // Quiz for Docker Module 1
  const existingQuiz = await prisma.quiz.findFirst({ where: { moduleId: dockerMod1.id } });
  if (!existingQuiz) {
    await prisma.quiz.create({
      data: {
        title: "Getting Started with Docker — Quiz",
        moduleId: dockerMod1.id,
        questions: {
          create: [
            {
              text: "What command lists all running Docker containers?",
              options: ["docker list", "docker ps", "docker containers", "docker show"],
              correctAnswer: 1,
              explanation: "`docker ps` lists running containers. Use `docker ps -a` to include stopped ones.",
            },
            {
              text: "What is the main difference between a container and a virtual machine?",
              options: [
                "Containers are slower than VMs",
                "Containers use their own OS kernel",
                "Containers share the host OS kernel, making them lighter and faster",
                "VMs are portable; containers are not",
              ],
              correctAnswer: 2,
              explanation: "Containers share the host OS kernel, which makes them faster to start and more resource-efficient than VMs.",
            },
            {
              text: "Which flag runs a container in the background?",
              options: ["-b", "-bg", "-d", "--detach-mode"],
              correctAnswer: 2,
              explanation: "The `-d` flag (detached) runs the container in the background and returns the terminal prompt.",
            },
            {
              text: "What does `docker run -p 8080:80 nginx` do?",
              options: [
                "Runs nginx and maps container port 8080 to host port 80",
                "Runs nginx and maps host port 8080 to container port 80",
                "Runs nginx on port 8080 inside and outside the container",
                "Exposes port 80 without mapping it",
              ],
              correctAnswer: 1,
              explanation: "The `-p host:container` syntax maps host port 8080 to container port 80. Visit localhost:8080 to reach the nginx server.",
            },
          ],
        },
      },
    });
  }

  console.log("✅ Seeding complete!");
  console.log(`  Courses: 2`);
  console.log(`  Modules: 20 (10 Docker + 10 K8s)`);
  console.log(`  Lessons: ${lessons.length}`);
  console.log(`  Flashcards: ${flashcards.length}`);
  console.log(`  Quizzes: 1`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
