---
title: "Running Containers Securely"
order: 1
objectives:
  - "Run a container as a non-root user with `USER`."
  - "Drop Linux capabilities with `--cap-drop=ALL` and add back only what's needed."
  - "Mount the root filesystem read-only."
  - "Apply seccomp and AppArmor profiles."
  - "Scan images for known CVEs with `docker scout` or Trivy."
tryIt: "Run a container with `docker run --read-only --cap-drop=ALL --security-opt=no-new-privileges --user 1000:1000 alpine sh`. Try `apk add curl` — it fails. That's the goal: a container that *can't* be modified at runtime."
takeaways:
  - "**Root inside a container is root on the host** for many capabilities. Always set `USER` to non-zero."
  - "Default capability list is far too permissive. Drop all, add back `NET_BIND_SERVICE` only if needed."
  - "`--read-only` plus a `tmpfs` for `/tmp` blocks an entire class of post-exploitation behaviour."
  - "Image scans should run in CI **and** at admission — vulnerabilities are discovered every day."
  - "User namespaces (`--userns-remap`) add another isolation layer — worth enabling on multi-tenant hosts."
quiz:
  - text: "Why does the lesson insist on setting USER to a non-zero value?"
    options:
      - "Because root inside a container can still be dangerous on a shared host"
      - "Because Docker refuses to start root processes in production"
      - "Because HEALTHCHECK only works for non-root users"
      - "Because non-root users automatically get read-only filesystems"
    correctAnswer: 0
    explanation: "The lesson explains that root in a container is still highly privileged in a shared-kernel environment. Running as non-root reduces the impact of escapes and misconfigurations."
  - text: "What capability pattern does the lesson recommend for most containers?"
    options:
      - "Keep Docker's default capabilities"
      - "Use --privileged to avoid permission issues"
      - "Drop all capabilities, then add back only what is required"
      - "Add SYS_ADMIN first and remove it later"
    correctAnswer: 2
    explanation: "The recommended runtime pattern is --cap-drop ALL and then selective --cap-add for only the privileges the app truly needs. The example adds back NET_BIND_SERVICE for binding low ports."
  - text: "What security benefit comes from combining --read-only with tmpfs mounts for paths like /tmp?"
    options:
      - "It makes the image smaller at build time"
      - "It blocks many runtime writes and persistence attempts while still allowing necessary writable paths"
      - "It automatically enables rootless Docker"
      - "It disables network access from the container"
    correctAnswer: 1
    explanation: "The lesson says a read-only root filesystem prevents accidental writes and makes persistence harder for attackers. tmpfs mounts provide the few writable locations an app may still need."
  - text: "Which supply-chain practice is specifically recommended alongside image scanning?"
    options:
      - "Signing images so deploy systems can verify provenance"
      - "Disabling vulnerability scans on trusted registries"
      - "Mounting the Docker socket into app containers"
      - "Running everything with --privileged during CI"
    correctAnswer: 0
    explanation: "The lesson pairs CVE scanning with SBOM generation and image signing. Signing helps deployment systems verify where an image came from before it runs."
---

Container security matters because containers compress a lot of trust into a small unit: code, runtime, base OS packages, kernel interfaces, and registry provenance. When something goes wrong, the blast radius can include data theft, lateral movement, and full host compromise. Production-grade security is therefore a series of small, deliberate constraints rather than one magic flag.

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

Security is mostly discipline. The safe path is rarely harder than the unsafe path once your templates are correct.