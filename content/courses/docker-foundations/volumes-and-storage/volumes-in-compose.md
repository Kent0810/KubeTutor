---
title: "Volumes in Docker Compose"
order: 2
objectives:
  - "Declare top-level `volumes:` and reference them from services."
  - "Use bind mounts for live source reloading in development."
  - "Mount config files read-only with the `:ro` flag."
  - "Share a volume between two services safely."
  - "Migrate data between volumes when refactoring a Compose stack."
tryIt: "Add a `volumes:` block to your Compose file with a named volume `dbdata`, plus a bind mount of `./src` into your web service. Edit a file in `./src` while the stack is running — your change should be visible immediately. Now stop the stack with `docker compose down` (without `-v`) — does `dbdata` survive? What about with `-v`?"
takeaways:
  - "`docker compose down` keeps named volumes; `docker compose down -v` deletes them — know the difference."
  - "Mount config files as **single files**, not directories, to avoid hiding the rest of the path."
  - "Use `read_only: true` plus a `tmpfs:` for `/tmp` to harden production containers."
  - "Two services can share a volume, but only one should write to a given file at a time."
  - "Name your volumes explicitly with `name:` to keep them stable across project renames."
quiz:
  - text: "What is the difference between `docker compose down` and `docker compose down -v`?"
    options:
      - "There is no difference for named volumes"
      - "`down` keeps named volumes, while `down -v` removes them"
      - "`down` removes bind mounts, while `down -v` keeps them"
      - "`down` only works for anonymous volumes, while `down -v` only works for named volumes"
    correctAnswer: 1
    explanation: "The lesson emphasizes that plain `compose down` removes containers and networks but keeps named volumes. Adding `-v` also removes named volumes, which can destroy local database state."
  - text: "Why does the lesson recommend mounting config as a single file with `:ro` instead of mounting a whole directory?"
    options:
      - "Because Docker Compose cannot mount directories on Linux"
      - "Because single-file mounts avoid hiding the rest of the target path"
      - "Because read-only mounts only work on directories"
      - "Because directory mounts disable service healthchecks"
    correctAnswer: 1
    explanation: "One takeaway says config files should be mounted as single files, not directories. That avoids accidentally masking other files already present in the target path."
  - text: "What problem does the extra `/app/node_modules` volume solve in a Node.js dev container?"
    options:
      - "It exposes `node_modules` on port 3000 for debugging"
      - "It prevents the host bind mount from replacing the container's installed dependencies"
      - "It makes `npm install` run in a separate network namespace"
      - "It converts `node_modules` into a `tmpfs` for faster builds"
    correctAnswer: 1
    explanation: "The lesson says binding the entire project into `/app` can overwrite the container's `node_modules` with the host directory. A second anonymous volume at `/app/node_modules` preserves the container-managed dependency tree."
  - text: "What is the key safety rule when two services share a volume?"
    options:
      - "Both services should write to the same files for redundancy"
      - "The shared volume must always use the external driver"
      - "Only one service should write to a given file at a time"
      - "The volume must be removed with `down -v` after every run"
    correctAnswer: 2
    explanation: "The takeaway warns that two services can share a volume, but only one should write to a given file at a time. That keeps ownership and update behavior predictable."
---

Compose volumes matter because multi-service applications need storage that survives container churn and behaves differently across development, CI, and production. A strong Compose file makes that intent obvious: persistent database data lives in named volumes, source code uses bind mounts in development, and sensitive scratch space can use tmpfs.

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
- Treat backup services and restore drills as part of the app stack, not as an afterthought.