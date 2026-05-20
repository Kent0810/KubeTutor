---
title: "Debugging Running Containers"
order: 1
objectives:
  - "Use `docker logs`, `docker exec`, and `docker inspect` to diagnose live containers."
  - "Attach a debugger or sidecar to a running container."
  - "Diagnose 'container keeps restarting' with exit codes and the restart policy."
  - "Measure CPU, memory, and IO with `docker stats` and `docker top`."
  - "Use ephemeral debug containers for `distroless` images."
tryIt: "Run `docker run --rm -d --name flap busybox sh -c 'sleep 1; exit 1'`. Check `docker ps -a` — it's gone. Restart with `--restart=on-failure` and watch `docker events` in another terminal. Now you can see the crash loop in real time."
takeaways:
  - "Exit codes carry information: `137` = SIGKILL (usually OOM), `143` = SIGTERM, `139` = segfault."
  - "`docker exec -it <c> sh` only works if the image *has* a shell. Distroless does not — use `--pid=container:<c>` debug containers."
  - "`docker logs --since=10m --tail=200 -f` is more useful than scrolling raw output."
  - "`docker stats` shows live cgroup numbers — match against your `--memory` / `--cpus` limits."
  - "If `docker inspect` shows `OOMKilled: true`, raise the limit or fix the leak."
quiz:
  - text: "According to the lesson, what does exit code 137 usually indicate for a container?"
    options:
      - "The process exited normally"
      - "The container was stopped by SIGTERM"
      - "The process was killed with SIGKILL, often because of OOM"
      - "The image failed to pull from the registry"
    correctAnswer: 2
    explanation: "The takeaways map 137 to SIGKILL and note that this is usually an out-of-memory kill. Inspecting OOMKilled in docker inspect helps confirm that diagnosis."
  - text: "Why might docker exec -it <container> sh fail during an incident?"
    options:
      - "docker exec only works on paused containers"
      - "The image may be distroless or scratch and not contain a shell"
      - "docker exec requires the container to be unhealthy"
      - "The command only works if the log driver is json-file"
    correctAnswer: 1
    explanation: "The lesson notes that distroless images often have no shell or package manager. In that case, you need a debug sidecar, nsenter, or a debug-tag image instead."
  - text: "What combination is recommended for understanding a crash loop in real time?"
    options:
      - "docker tag plus docker save"
      - "docker events, logs, exit-code inspection, and restart-policy review"
      - "docker login and docker push"
      - "docker build --no-cache and docker commit"
    correctAnswer: 1
    explanation: "The lesson calls docker events underused and especially useful for crash loops. It recommends combining events with logs, inspect output, and restart policy review."
  - text: "What is the purpose of the debug sidecar pattern using --pid=container:my-api and --network=container:my-api?"
    options:
      - "To rebuild the image inside the running container"
      - "To share the target container's namespaces for troubleshooting without changing the app image"
      - "To copy the writable layer back into the image"
      - "To disable logging during debugging"
    correctAnswer: 1
    explanation: "The sidecar pattern gives a toolbox container access to the target container's process and network namespaces. That is especially helpful when the original image is minimal."
---

Great container debugging starts with the right mental model. Do not think "Docker is broken"; think process, network, storage, or environment. Containers fail in familiar ways, but the packaging adds layers of indirection. The fastest debuggers isolate which layer is actually failing before they touch anything.

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

The best container debugging is systematic, not clever.