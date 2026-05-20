---
title: "Inspecting Images and Layers"
order: 2
objectives:
  - "Read an image manifest and inspect its layers."
  - "Use `docker history` to see how an image was built."
  - "Extract files from an image without running it."
  - "Diff two images to find what changed between tags."
  - "Use `dive` or `docker image inspect` for deep analysis."
tryIt: "Install `dive` and run `dive <your-image>`. Sort layers by size — the biggest one is usually `npm install` or `apt-get`. That's where multi-stage builds pay off most."
takeaways:
  - "Images are **stacks of tarballs** plus a JSON manifest — there's no magic."
  - "`docker history` reveals every build step, including any leaked secrets in `ENV`."
  - "`docker save` + `tar xf` lets you extract files without running the image."
  - "`dive` is the fastest way to find layer bloat in someone else's image."
  - "Compare two image digests with `docker buildx imagetools inspect` — useful for supply-chain audits."
quiz:
  - text: "Which three pieces make up an OCI image according to the lesson?"
    options:
      - "A manifest, a config object, and layers"
      - "A container, a network, and a volume"
      - "A Dockerfile, a running process, and a log driver"
      - "A tag, a repository, and a registry mirror"
    correctAnswer: 0
    explanation: "The image anatomy section says an OCI image consists of a manifest, a config object, and a set of layers. The config stores metadata while the layers hold filesystem diffs."
  - text: "What kind of problem is docker history especially good at revealing?"
    options:
      - "Kubernetes scheduling errors"
      - "Large build steps and leaked secrets in image history"
      - "Live CPU throttling inside a running container"
      - "DNS failures between containers"
    correctAnswer: 1
    explanation: "The lesson highlights docker history for spotting large layers, suspicious commands, and leaked secrets such as values placed in ENV. It shows how build steps become visible in the image history."
  - text: "How can you extract files from an image without running a container from it?"
    options:
      - "Use docker save and unpack the archive with tar"
      - "Use docker logs --follow"
      - "Use docker exec into the image"
      - "Use docker restart on the image ID"
    correctAnswer: 0
    explanation: "One takeaway explicitly calls out docker save plus tar extraction as a way to inspect image contents offline. That works without starting the image as a container."
  - text: "Why does deleting a file in a later image layer not fully remove its size cost?"
    options:
      - "Because Docker stores deleted files in /tmp"
      - "Because earlier layers are immutable, so the bytes still exist in those previous layers"
      - "Because docker image inspect recreates deleted files"
      - "Because OCI manifests cannot reference fewer than ten layers"
    correctAnswer: 1
    explanation: "The lesson explains that files added in one layer still count even if removed later. Tools like Dive make this wasted space easy to see."
---

Image inspection matters because containers are only as good as the images behind them. If an image is bloated, mislabeled, full of stale packages, or carrying accidental files, every environment inherits that problem. Senior engineers inspect images the same way they inspect binaries or deployment manifests: as artifacts that deserve scrutiny.

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

If you cannot explain what is inside your image and why it is there, you are not ready to run it in production.