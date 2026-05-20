---
title: "What is Docker?"
order: 1
objectives:
  - "Explain why containers matter for reliable software delivery."
  - "Describe the difference between containers and virtual machines."
  - "Identify the major components of the Docker architecture (CLI, daemon, containerd, runc)."
  - "Describe the container lifecycle (created → running → stopped → removed)."
  - "Recognise where Docker fits — and does **not** fit — in a modern platform."
tryIt: "Run `docker info` and `docker version` on your machine. Find the values of `Server Version`, `Storage Driver`, and `Cgroup Version`. Compare with a teammate — any differences usually explain mysterious environment bugs."
takeaways:
  - "A container is a process isolated by Linux **namespaces** and **cgroups**, not a tiny VM."
  - "The Docker stack is **CLI → dockerd → containerd → runc** — diagnose problems at the right layer."
  - "**Images are immutable**; containers add a thin writable layer that should be treated as disposable."
  - "OCI standards mean your image runs anywhere — Docker, containerd, Podman, Kubernetes."
  - "Docker solves *packaging* and *process isolation*, not release engineering or security on its own."
quiz:
  - text: "According to the lesson, what is a container compared with a virtual machine?"
    options:
      - "A full guest OS with its own kernel"
      - "A process isolated by namespaces and cgroups on the host kernel"
      - "A hardware-virtualized environment identical to a VM"
      - "A packaging format that always includes a desktop OS"
    correctAnswer: 1
    explanation: "The lesson defines a container as a process isolated by Linux namespaces and cgroups, not a tiny VM. That is why containers start faster and are lighter than virtual machines."
  - text: "Which stack order matches the Docker architecture described in the lesson?"
    options:
      - "runc → containerd → dockerd → CLI"
      - "CLI → dockerd → containerd → runc"
      - "CLI → runc → dockerd → containerd"
      - "dockerd → CLI → runc → containerd"
    correctAnswer: 1
    explanation: "The lesson says the Docker stack is CLI to dockerd to containerd to runc. Knowing that order helps you debug the correct layer when something fails."
  - text: "What is the relationship between an image and a container?"
    options:
      - "A container is an immutable template and an image is its writable runtime state"
      - "An image is a running process, while a container is just metadata"
      - "An image is immutable, and a container adds a thin writable layer on top of it"
      - "They are identical terms used interchangeably by Docker"
    correctAnswer: 2
    explanation: "The lesson says images are immutable templates built from layers, while containers are running or stopped instances with a thin writable layer. That writable layer should be treated as disposable."
  - text: "Which statement best matches what Docker does not solve on its own?"
    options:
      - "It replaces all release engineering and security work automatically"
      - "It removes the need for registries and image standards"
      - "It eliminates the need to understand Linux processes"
      - "It solves packaging and process isolation, but not release engineering or security by itself"
    correctAnswer: 3
    explanation: "The lesson is explicit that Docker helps with packaging and process isolation. It does not automatically fix secrets management, reproducibility, or broader platform design."
---

Docker matters because production failures are often boring environment mismatches dressed up as mysterious bugs. A Node.js API works on a laptop with OpenSSL 3, fails in CI with OpenSSL 1.1, and crashes in staging because the image lacks a system package the developer installed months ago and forgot about. Docker solves this by packaging the application and its runtime assumptions together so the thing you test is the thing you ship.

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
- Think of Docker as packaging plus process isolation, not as a replacement for good platform design.