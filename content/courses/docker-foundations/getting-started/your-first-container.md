---
title: "Your First Container"
order: 3
objectives:
  - "Run a container with `docker run` and understand each flag."
  - "Map ports, mount volumes, and pass environment variables."
  - "Use `docker ps`, `docker logs`, and `docker exec` to inspect a running container."
  - "Clean up stopped containers and dangling images with `docker system prune`."
  - "Read the difference between *images* and *containers* in the CLI output."
tryIt: "Run `docker run -d -p 8080:80 --name web nginx`, open `http://localhost:8080`, then `docker exec -it web sh` and edit `/usr/share/nginx/html/index.html`. Reload — your changes appear. Stop and remove the container, recreate it — what happened to your edits? Why?"
takeaways:
  - "`docker run` is shorthand for `pull + create + start` — three separate operations."
  - "Use `--rm` for throwaway commands so you don't leak stopped containers."
  - "Filesystem changes inside a container disappear when the container is deleted unless they're in a **volume**."
  - "`docker exec` runs a new process in an existing container; `docker attach` connects to its main process — pick the right one."
  - "Run `docker system df` weekly to see how much disk Docker is using. `prune` aggressively in dev."
quiz:
  - text: "What sequence is hidden behind a single `docker run` command?"
    options:
      - "build, tag, push"
      - "pull, create, start"
      - "attach, exec, restart"
      - "network, volume, inspect"
    correctAnswer: 1
    explanation: "The lesson says `docker run` is shorthand for pull plus create plus start. Understanding those separate operations makes CLI output and failures easier to interpret."
  - text: "What do the `-i` and `-t` flags do when used together as `-it`?"
    options:
      - "They publish ports and mount a tmpfs"
      - "They keep STDIN open and allocate a pseudo-TTY for an interactive shell"
      - "They force detached mode and automatic cleanup"
      - "They make the container ignore terminal signals"
    correctAnswer: 1
    explanation: "The lesson explains that `-i` keeps STDIN open and `-t` allocates a pseudo-TTY. Together they give you an interactive shell experience inside the container."
  - text: "Which port mapping keeps a containerized service reachable only from the local machine?"
    options:
      - "`-p 0.0.0.0:8080:80`"
      - "`-p 127.0.0.1:8080:80`"
      - "`-P`"
      - "`-p 80:8080`"
    correctAnswer: 1
    explanation: "The lesson recommends binding to `127.0.0.1` when a service is for local use only. Using `0.0.0.0` exposes it on all host interfaces instead."
  - text: "Why did edits made inside the Nginx container disappear after the container was removed and recreated?"
    options:
      - "Because `docker exec` always rolls back file changes on exit"
      - "Because Nginx images reject all writes"
      - "Because filesystem changes live in the container writable layer unless stored in a volume"
      - "Because published ports erase the filesystem when the container stops"
    correctAnswer: 2
    explanation: "The takeaway says filesystem changes disappear when the container is deleted unless they are stored in a volume. The try-it exercise is designed to demonstrate exactly that behavior."
---

Running your first container is where Docker stops being theory and becomes an operational tool. In production, the difference between a reliable rollout and a midnight incident often comes down to understanding exactly what docker run does: which process starts, which ports bind, which limits apply, and where data goes.

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
  printf 'hello
' | docker run --rm -i alpine:3.20 cat

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
  docker ps --format 'table {{.Names}}	{{.ID}}	{{.Status}}	{{.Ports}}'
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
- Remove disposable containers aggressively so stale state does not confuse you.