---
title: "Multi-arch Builds and Registry Best Practices"
order: 2
objectives:
  - "Build images for multiple architectures with `docker buildx`."
  - "Push a multi-arch manifest list to a registry."
  - "Configure registry retention, immutable tags, and vulnerability scanning."
  - "Mirror upstream images to avoid rate limits and outages."
  - "Use OCI artifacts to store more than just images (charts, SBOMs)."
tryIt: "Run `docker buildx create --use && docker buildx build --platform linux/amd64,linux/arm64 -t you/app:multi --push .`. Pull on an Apple Silicon Mac and an x86 Linux box — the same tag, two different binaries."
takeaways:
  - "`buildx` uses QEMU under the hood for cross-arch builds — slower than native but works anywhere."
  - "A multi-arch tag is actually a **manifest list** pointing at per-arch image manifests."
  - "Set up a pull-through cache (Harbor, Artifactory, ECR) to insulate yourself from Docker Hub rate limits."
  - "Enable **tag immutability** so a deployed `v1.2.3` can never be silently replaced."
  - "OCI registries now store charts, SBOMs, and signatures — your registry is a supply-chain root of trust."
quiz:
  - text: "What is a multi-architecture image tag actually pointing to?"
    options:
      - "A single universal Linux binary"
      - "A manifest list that references per-architecture image manifests"
      - "A compressed tarball stored outside the registry"
      - "Only the amd64 image plus optional metadata"
    correctAnswer: 1
    explanation: "The lesson explains that a multi-arch image is usually a manifest list, sometimes called a fat manifest. Pulling clients select the matching image for their architecture."
  - text: "What trade-off does the lesson describe for QEMU-based cross-architecture builds?"
    options:
      - "They are faster than native builds but less secure"
      - "They work broadly, but can be slower or subtly different than native builds"
      - "They only support ARM images"
      - "They remove the need for Buildx"
    correctAnswer: 1
    explanation: "The takeaways and native-vs-emulated section both say QEMU is convenient and works anywhere, but it is slower and can behave differently for compiled workloads."
  - text: "Why does the lesson recommend pull-through caches or registry mirrors?"
    options:
      - "To prevent the need for tags"
      - "To insulate teams from Docker Hub rate limits and upstream outages"
      - "To make every image immutable"
      - "To convert private registries into public ones"
    correctAnswer: 1
    explanation: "The lesson says mirrors reduce rate-limit pain and speed pulls for common bases. It specifically names Harbor, Artifactory, and ECR as ways to buffer upstream dependency risk."
  - text: "How should teams promote a tested release across environments according to the lesson?"
    options:
      - "Rebuild the release separately in each environment"
      - "Edit the Dockerfile to match each cluster"
      - "Retag or copy the existing digest instead of rebuilding"
      - "Always deploy the latest tag"
    correctAnswer: 2
    explanation: "The retention and promotion section says promotion should retag or copy an existing digest from dev to staging to prod. That preserves the tested artifact exactly."
---

Multi-architecture images matter now because the industry is genuinely heterogeneous. Developers use Apple Silicon laptops, CI often runs on amd64, cloud providers increasingly offer ARM nodes such as AWS Graviton, and edge fleets may include older ARM variants. If your image only works on one architecture, portability becomes an illusion.

Architectures:
The most common targets are linux/amd64 and linux/arm64. Smaller edge systems may need linux/arm/v7 or linux/arm/v6. Do not publish unsupported platforms casually; an image manifest is a promise to users.

How multi-arch works:
A multi-architecture image is usually a manifest list, sometimes called a fat manifest. The registry stores references to per-architecture images. When a client pulls the image, it selects the variant matching the local OS and CPU architecture.

Buildx setup:
Buildx wraps BuildKit and is the standard Docker way to produce multi-platform images. It can use QEMU emulation or native builders.

Buildx and QEMU:
  docker buildx create --name multi --use
  docker buildx inspect --bootstrap
  docker run --privileged --rm tonistiigi/binfmt --install all

Build and push multi-arch:
  docker buildx build \
    --platform linux/amd64,linux/arm64 \
    -t myorg/my-app:1.2.3 \
    -t myorg/my-app:latest \
    --push \
    .

Inspect the manifest:
  docker buildx imagetools inspect myorg/my-app:1.2.3
  docker manifest inspect myorg/my-app:1.2.3

Native vs emulated builds:
QEMU is convenient and great for many apps, but compiled languages and heavy native dependencies can be much slower or subtly different under emulation. For performance-sensitive pipelines, native builders for each architecture or true cross-compilation are better.

Registry comparison:
Docker Hub is the default public registry with broad ecosystem support. GitHub Container Registry is excellent for GitHub-native workflows. AWS ECR integrates tightly with IAM, lifecycle policies, and Inspector. Google Artifact Registry fits GCP-heavy shops. The best choice is usually the one closest to your identity model and deployment platform.

ECR login and push:
  aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 123456789012.dkr.ecr.us-east-1.amazonaws.com
  docker tag myorg/my-app:1.2.3 123456789012.dkr.ecr.us-east-1.amazonaws.com/my-app:1.2.3
  docker push 123456789012.dkr.ecr.us-east-1.amazonaws.com/my-app:1.2.3

Tagging strategy:
Use semantic versions for releases, Git SHAs for immutability, branch tags for ephemeral environments, and maybe environment tags for operational convenience. Never rely on latest alone.

Registry mirror configuration:
Mirrors reduce rate-limit pain and speed pulls for common public bases.

daemon.json mirror example:
  {
    "registry-mirrors": ["https://mirror.gcr.io"],
    "features": {"buildkit": true}
  }

Retention and promotion:
Good registries can auto-delete untagged images and keep the last N versions. Promotion should retag or copy an existing digest from dev to staging to prod, not rebuild it.

Metadata-action tagging:
  tags: |
    type=semver,pattern={{version}}
    type=semver,pattern={{major}}.{{minor}}
    type=sha
    type=ref,event=branch

Vulnerability reporting:
ECR integrates with Inspector. Docker Hub and GHCR support scanning through ecosystem tools. Whatever registry you use, surface scan results into developer workflows instead of letting them rot in a dashboard no one opens.

Common pitfalls:
- Publishing a manifest list before testing each architecture.
- Assuming amd64-only native modules will just work on arm64.
- Using long-lived registry passwords in CI.
- Rebuilding the same release differently for each environment.

Pro tips:
- Start with amd64 and arm64; add older ARM variants only when you truly support them.
- Prefer native builds for performance-critical languages.
- Keep registry credentials short-lived and scoped.
- Promote digests, not source commits, through environments.

Multi-arch support is not a luxury anymore; for many teams it is table stakes.