---
title: "Installing Docker"
order: 2
objectives:
  - "Install Docker Engine or Docker Desktop on your operating system."
  - "Verify the install with `docker version`, `docker info`, and `hello-world`."
  - "Configure the daemon (data root, log driver, registry mirrors) via `daemon.json`."
  - "Manage the `docker` group so you don't need `sudo` for every command."
  - "Diagnose the most common install issues (cgroup driver, WSL2 backend, virtualisation)."
tryIt: "Add your user to the `docker` group (`sudo usermod -aG docker $USER`), then log out and back in. Confirm `docker ps` runs without `sudo`. On Windows/macOS, open Docker Desktop → Settings → Resources and lower memory by 1 GB — does anything break?"
takeaways:
  - "Docker Desktop is convenient but runs a Linux VM under the hood — it is **not** identical to native Linux."
  - "Adding yourself to the `docker` group grants root-equivalent power on the host. Treat it accordingly."
  - "Configuration lives in `/etc/docker/daemon.json`. Restart the daemon for changes to apply."
  - "On Linux, prefer the systemd cgroup driver (`\"exec-opts\": [\"native.cgroupdriver=systemd\"]`) for parity with Kubernetes."
  - "If `docker run` hangs on pull, suspect DNS, registry rate limits, or a missing proxy — not Docker itself."
quiz:
  - text: "Why does Docker Desktop on macOS include a Linux VM?"
    options:
      - "Because containers need a Linux kernel to run"
      - "Because Docker Desktop only supports Windows containers by default"
      - "Because BuildKit requires a separate VM on every platform"
      - "Because macOS blocks local ports without a VM"
    correctAnswer: 0
    explanation: "The lesson says macOS uses Docker Desktop plus a Linux VM because containers require a Linux kernel. That is why Docker Desktop is convenient but not identical to native Linux."
  - text: "What is the security implication of adding your user to the docker group on Linux?"
    options:
      - "It only allows image pulls, not container execution"
      - "It grants root-equivalent access to the host"
      - "It disables the need for a running daemon"
      - "It enables rootless Docker automatically"
    correctAnswer: 1
    explanation: "The lesson explicitly warns that membership in the docker group is effectively root-equivalent. It should be treated like privileged host access, not a harmless convenience."
  - text: "Where should shared daemon settings like log drivers or registry mirrors be configured on Linux?"
    options:
      - "In `~/.docker/config.json`"
      - "In `/usr/local/docker/settings.yml`"
      - "In `/etc/docker/daemon.json`"
      - "In `/var/lib/docker/daemon.conf`"
    correctAnswer: 2
    explanation: "The lesson points to `/etc/docker/daemon.json` for daemon settings such as log drivers, BuildKit, and registry mirrors. It also notes that the daemon must be restarted for changes to apply."
  - text: "If `docker run` hangs while pulling an image, what should you suspect first?"
    options:
      - "That Linux always requires `sudo` for image pulls"
      - "That the image is broken because it lacks an ENTRYPOINT"
      - "That Docker Desktop memory is set too high"
      - "That DNS, registry rate limits, or a missing proxy is interfering"
    correctAnswer: 3
    explanation: "One takeaway says pull hangs usually point to DNS, rate limiting, or proxy problems rather than Docker itself. The troubleshooting section reinforces checking platform and daemon health first."
---

Installing Docker well matters because bad defaults become invisible production bottlenecks. Teams frequently lose hours to Docker Desktop memory starvation, Linux permission issues, and WSL2 filesystem slowness before they ever write a Dockerfile. A senior engineer treats installation as platform setup, not as a one-click app install.

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
- Treat Docker installation issues as platform engineering issues, not developer quirks.