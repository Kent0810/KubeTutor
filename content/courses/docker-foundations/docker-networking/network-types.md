---
title: "Docker Network Types"
order: 1
objectives:
  - "Describe how the **bridge**, **host**, **none**, and **overlay** drivers differ."
  - "Create a user-defined bridge and explain why it beats the default bridge."
  - "Connect a container to multiple networks."
  - "Use `--network host` for high-performance edge cases and know its risks."
  - "Understand how container DNS resolution works on a user-defined network."
tryIt: "Create a user-defined bridge: `docker network create app-net`. Run two containers on it and `ping` each other by container name — it works. Now do the same on the default `bridge` — DNS by name doesn't work. That's why user-defined networks are the rule."
takeaways:
  - "**Always** use a user-defined bridge in development — it gives you container-name DNS for free."
  - "The default `bridge` network exists only for backwards compatibility. Avoid it."
  - "**`host`** networking removes isolation and the port-mapping layer — use only when latency matters more than safety."
  - "**Overlay** networks span multiple hosts (Swarm) — for single-host work, bridge is enough."
  - "Containers can join multiple networks — useful for separating frontend/backend traffic."
quiz:
  - text: "Why does the lesson recommend user-defined bridge networks over the default bridge?"
    options:
      - "They automatically publish all exposed ports"
      - "They provide container-name DNS resolution"
      - "They disable NAT entirely"
      - "They are the only networks that support Postgres"
    correctAnswer: 1
    explanation: "The lesson says user-defined bridges give you container-name DNS for free, unlike the default bridge. That is why they should be your default for real development stacks."
  - text: "What is the main trade-off of using `--network host`?"
    options:
      - "It is slower because it adds extra NAT rules"
      - "It only works with overlay networks"
      - "It removes port isolation in exchange for lower overhead"
      - "It prevents containers from reaching external services"
    correctAnswer: 2
    explanation: "The lesson explains that host mode removes NAT and can reduce latency, but it also removes the port namespace isolation layer. Containers can collide with host ports and see the host network directly."
  - text: "In the lesson, overlay networks are mainly associated with which kind of deployment?"
    options:
      - "Single-host local development"
      - "Docker Swarm or other multi-host setups"
      - "Rootless Docker on laptops"
      - "Containers with networking disabled"
    correctAnswer: 1
    explanation: "The lesson describes overlay networks as spanning multiple hosts and being most relevant in Docker Swarm-style orchestration. For single-host work, bridge networking is usually enough."
  - text: "Why might a reverse proxy container join both an `edge` network and an `app` network?"
    options:
      - "To keep databases directly reachable from the public internet"
      - "To separate frontend ingress traffic from backend service traffic"
      - "To avoid using `iptables` on the host"
      - "To make the container run without a hostname"
    correctAnswer: 1
    explanation: "The lesson shows a three-network pattern where entry, app, and data traffic are separated. A reverse proxy joins the public-facing edge network and the internal app network so it can bridge those layers cleanly."
---

Docker networking matters because most container failures are not compute failures; they are communication failures. The application is healthy, but the API cannot resolve the database, the reverse proxy sits on the wrong network, or a service is exposed publicly when it should be internal only. Production engineers need a mental model of how packets actually move.

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
- Learn docker network inspect before reaching for packet captures; it solves many issues quickly.