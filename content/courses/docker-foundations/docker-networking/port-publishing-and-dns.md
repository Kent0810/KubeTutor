---
title: "Port Publishing and DNS"
order: 2
objectives:
  - "Publish container ports with `-p host:container` and `-P`."
  - "Bind a publish to a specific host interface for security."
  - "Use container-name DNS on user-defined networks."
  - "Diagnose 'port already in use' and 'connection refused' problems."
  - "Understand IPv6, UDP, and SCTP publishing options."
tryIt: "Run `docker run -d -p 127.0.0.1:8080:80 nginx`. Try to reach it from another machine on your LAN — you can't, because you bound to loopback. Change to `-p 8080:80` and try again. This is exactly how you accidentally expose a dev database to the office Wi-Fi."
takeaways:
  - "`-p 8080:80` binds to **all** host interfaces. `-p 127.0.0.1:8080:80` binds to loopback only."
  - "On a user-defined network, containers reach each other by **container name**, no port mapping needed."
  - "`EXPOSE` in a Dockerfile is documentation — it does **not** publish a port on the host."
  - "`docker port <name>` shows live port mappings; `ss -tnlp` on the host shows what's bound."
  - "UDP needs `-p 53:53/udp` — the `/udp` suffix is mandatory."
quiz:
  - text: "What is the security difference between `-p 8080:80` and `-p 127.0.0.1:8080:80`?"
    options:
      - "There is no difference; both bind only to localhost"
      - "`-p 8080:80` binds to all interfaces, while `127.0.0.1` limits access to loopback"
      - "The first exposes UDP and the second exposes TCP"
      - "The first works only on Linux and the second only on Docker Desktop"
    correctAnswer: 1
    explanation: "The lesson warns that `-p 8080:80` binds on all host interfaces, which can expose a service more widely than intended. Binding to `127.0.0.1` keeps it local to the machine."
  - text: "How do containers normally find each other on a user-defined network?"
    options:
      - "By hardcoding each container's current IP address"
      - "By reading the host's `/etc/hosts` file directly"
      - "By querying Docker's embedded DNS using container or service names"
      - "By publishing every internal port to the host first"
    correctAnswer: 2
    explanation: "The lesson says Docker runs an embedded DNS server at `127.0.0.11` on user-defined networks. That lets containers resolve service names and aliases without relying on fragile IP addresses."
  - text: "What does `EXPOSE` do in the Compose isolation example?"
    options:
      - "It documents internal ports without publishing them to the host"
      - "It creates `iptables` rules on the host automatically"
      - "It forces all traffic through the reverse proxy"
      - "It converts the service to host networking mode"
    correctAnswer: 0
    explanation: "The lesson states that `EXPOSE` is documentation only, not host publication. In the Compose example, `api` and `db` are reachable internally on the app network without publishing ports externally."
  - text: "Which host firewall chain does the lesson recommend for Docker-aware host policy?"
    options:
      - "`INPUT`"
      - "`FORWARD`"
      - "`PREROUTING`"
      - "`DOCKER-USER`"
    correctAnswer: 3
    explanation: "The lesson notes that Docker can bypass simplistic `ufw` assumptions and recommends the `DOCKER-USER` chain for host-level policy. Docker preserves that chain, making it the safer place for custom filtering."
---

Port publishing and DNS are where container networking becomes operationally important. If you bind the wrong interface, you expose an internal service to the internet. If you misunderstand Docker DNS, you end up hardcoding IP addresses that break on every restart. Production stability depends on getting these basics exactly right.

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
- Make DNS names part of your architecture, not an incidental convenience.