---
title: "Understanding Docker Volumes"
order: 1
objectives:
  - "Distinguish named volumes, bind mounts, and `tmpfs` mounts."
  - "Choose the right mount type for databases, configs, and ephemeral caches."
  - "Back up and restore a named volume."
  - "Understand volume drivers and where data physically lives."
  - "Avoid the most common volume bugs (permissions, bind-mount overwrites)."
tryIt: "Create a named volume `pgdata`, mount it into a Postgres container, write some data, kill the container, then run a new Postgres container against the same volume. Your data should survive. Now try the same with a bind mount on macOS — measure the write performance difference."
takeaways:
  - "**Named volumes** are managed by Docker — best for production data."
  - "**Bind mounts** are host paths — best for development source code, dangerous in production."
  - "**`tmpfs`** mounts live in RAM — perfect for secrets that should never hit disk."
  - "Bind mounts on macOS/Windows are slow because they cross a VM boundary; named volumes don't."
  - "Backing up a volume = `docker run --rm -v vol:/data -v $(pwd):/backup alpine tar czf /backup/vol.tgz -C /data .`"
quiz:
  - text: "Which mount type does the lesson recommend as the default for production database data on a single host?"
    options:
      - "Named volumes"
      - "Bind mounts"
      - "`tmpfs` mounts"
      - "The container writable layer"
    correctAnswer: 0
    explanation: "The lesson says named volumes are Docker-managed storage best suited for databases and application state. They are the default choice for stateful single-host services."
  - text: "Why is storing important data only in the container writable layer risky?"
    options:
      - "Because Docker compresses it and makes it unreadable"
      - "Because that layer disappears when the container is removed"
      - "Because it automatically syncs to every other container"
      - "Because only bind mounts can be written by databases"
    correctAnswer: 1
    explanation: "The lesson explains that Docker adds a thin writable layer on top of the image, and that layer is container-specific. Remove the container and the layer goes away with it."
  - text: "Why are bind mounts often slower than named volumes on macOS and Windows?"
    options:
      - "Because bind mounts disable `overlay2` entirely"
      - "Because Docker encrypts bind mounts by default"
      - "Because they cross a virtualization boundary between the host and Linux VM"
      - "Because bind mounts can only use the `none` network driver"
    correctAnswer: 2
    explanation: "The lesson notes that bind mounts on macOS and Windows are slower because filesystem access crosses a VM boundary. Named volumes avoid much of that overhead."
  - text: "What backup approach does the lesson show for a named volume?"
    options:
      - "Pause the Docker daemon and copy `/var/lib/docker` manually"
      - "Use `docker commit` to snapshot the running container"
      - "Mount the volume into a temporary container and archive it with `tar`"
      - "Publish the volume over host networking and download it with `curl`"
    correctAnswer: 2
    explanation: "The lesson shows mounting a volume and a backup directory into a temporary Alpine container, then using `tar` to create an archive. It also notes that logical dumps are better for busy databases like Postgres."
---

Volumes matter because containers are intentionally ephemeral. The writable container layer is designed for convenience, not durability. If you store database files, uploads, or durable queue state only inside that layer, the data disappears when the container is replaced. Production incidents caused by accidental data loss usually come from not understanding this boundary.

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
- Define backup and restore procedures before the first production launch, not after the first outage.