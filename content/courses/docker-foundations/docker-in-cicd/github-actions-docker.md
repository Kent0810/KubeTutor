---
title: "Building Images in GitHub Actions"
order: 1
objectives:
  - "Build and push images from GitHub Actions using `docker/build-push-action`."
  - "Cache layers across CI runs with `cache-from` and `cache-to`."
  - "Tag images with branch, SHA, and semantic version simultaneously."
  - "Sign and verify images with `cosign`."
  - "Avoid the most common 'works on my machine' CI failures."
tryIt: "Write a workflow that runs on push to `main` and builds your image with `docker/build-push-action@v5` using `cache-from: type=gha,scope=build` and `cache-to: type=gha,mode=max`. Push twice — the second run should be 5–10× faster."
takeaways:
  - "`docker/setup-buildx-action` enables BuildKit features (cache, multi-arch, secrets) in CI."
  - "Cache to `type=gha,mode=max` for full layer caching across runs in the same repo."
  - "Tag with both an **immutable** tag (`sha-abc123`) and a **moving** tag (`latest`, `v1`) — deploy by digest."
  - "Sign images with `cosign sign` and verify at admission with policy controllers like Kyverno."
  - "Pin action versions to a SHA, not `@v5` — supply-chain attacks have hit popular actions."
quiz:
  - text: "Which GitHub Action in the lesson is responsible for enabling BuildKit features like cache and multi-arch builds?"
    options:
      - "actions/checkout"
      - "docker/setup-buildx-action"
      - "docker/metadata-action"
      - "aquasecurity/trivy-action"
    correctAnswer: 1
    explanation: "The takeaways explicitly say docker/setup-buildx-action enables BuildKit capabilities in CI. That is what unlocks features like advanced caching and multi-arch builds."
  - text: "Why does the lesson recommend tagging images with both SHA-based and moving tags?"
    options:
      - "So every image can be rebuilt for each environment"
      - "So you can deploy immutable artifacts while still keeping convenient human-facing tags"
      - "So Docker Hub accepts the push faster"
      - "So the workflow can skip metadata generation"
    correctAnswer: 1
    explanation: "The lesson recommends immutable tags like sha-abc123 alongside moving tags like latest or v1. It also says deployments should use digests for traceability."
  - text: "What caching configuration is recommended for GitHub-hosted runners?"
    options:
      - "cache-from: type=local and cache-to: type=local"
      - "cache-from: type=registry and no cache-to"
      - "cache-from: type=gha and cache-to: type=gha,mode=max"
      - "Disable caching because runners are ephemeral"
    correctAnswer: 2
    explanation: "The example workflow and takeaways both call out the GitHub Actions cache backend. mode=max preserves more layers across runs in the same repository."
  - text: "Why does the lesson warn against pinning actions only as @v5 or @v6?"
    options:
      - "Version tags are too slow to download"
      - "GitHub Actions only supports SHA pins on weekends"
      - "Action tags can move, so SHA pinning reduces supply-chain risk"
      - "docker/build-push-action does not support semantic versions"
    correctAnswer: 2
    explanation: "The final takeaway says to pin action versions to a commit SHA rather than a major tag. The reason given is supply-chain protection against compromised or retagged actions."
---

Container CI/CD is where Docker becomes a repeatable delivery system rather than a local convenience. A mature pipeline does the same sequence every time: build, test, scan, tag, push, and promote. The teams that do this well ship faster because they reduce manual judgment in the path to production.

Pipeline lifecycle:
The ideal flow is commit to branch, build image, run tests, scan for vulnerabilities, push to a registry, then deploy a specific immutable tag or digest. Build once and promote the same artifact across environments whenever possible.

GitHub Actions fundamentals:
A workflow has triggers, jobs, steps, permissions, and secrets. Jobs run on GitHub-hosted or self-hosted runners. Environments add approvals and protected secrets. For container pipelines, this structure maps naturally to build, security, and deploy stages.

Production workflow:
  name: docker

  on:
    push:
      branches: [main]
      tags: ['v*.*.*']
    pull_request:

  jobs:
    build-test-scan-push:
      runs-on: ubuntu-latest
      permissions:
        contents: read
        packages: write
        security-events: write
      steps:
        - uses: actions/checkout@v4

        - uses: docker/setup-buildx-action@v3

        - uses: docker/login-action@v3
          with:
            username: ${{ secrets.DOCKERHUB_USERNAME }}
            password: ${{ secrets.DOCKERHUB_TOKEN }}

        - uses: docker/metadata-action@v5
          id: meta
          with:
            images: myorg/my-app
            tags: |
              type=raw,value=latest,enable=${{ github.ref == 'refs/heads/main' }}
              type=sha
              type=ref,event=branch
              type=semver,pattern={{version}}

        - uses: docker/build-push-action@v6
          with:
            context: .
            target: runtime
            push: ${{ github.event_name != 'pull_request' }}
            tags: ${{ steps.meta.outputs.tags }}
            labels: ${{ steps.meta.outputs.labels }}
            cache-from: type=gha
            cache-to: type=gha,mode=max

Docker-specific actions:
docker/login-action authenticates to Docker Hub, GHCR, ECR, or other registries. docker/build-push-action wraps Buildx and BuildKit cleanly. docker/metadata-action centralizes tagging and OCI labels so tag logic does not sprawl across scripts.

Testing inside Docker:
A strong pattern is building a dedicated test stage and running it in CI. That ensures the same dependencies used in production builds also drive tests.

Test stage example:
  - name: Build test stage
    run: docker build --target test -t my-app:test .

  - name: Run unit tests
    run: docker run --rm my-app:test npm test

Image scanning:
Fail builds on serious vulnerabilities. That keeps security from becoming a best-effort reporting exercise.

Trivy action example:
  - name: Trivy scan
    uses: aquasecurity/trivy-action@0.28.0
    with:
      image-ref: myorg/my-app:${{ github.sha }}
      format: table
      severity: HIGH,CRITICAL
      exit-code: '1'

Multi-environment promotion:
Do not rebuild for staging and production. Tag or promote the same digest. That keeps the tested artifact identical across environments.

Promotion workflow snippet:
  - name: Promote release tag
    run: |
      docker buildx imagetools create \
        --tag myorg/my-app:staging \
        --tag myorg/my-app:prod \
        myorg/my-app@${{ steps.build.outputs.digest }}

Secrets management in CI:
Store DOCKERHUB_USERNAME and DOCKERHUB_TOKEN in repository or organization secrets. For production deploys, prefer environment-scoped secrets with approval gates. Never echo secrets, and avoid passing them as build args unless you are using BuildKit secret mounts.

GitLab CI comparison:
GitLab CI provides similar primitives with runners, variables, stages, and container registry integration. The concepts are the same even if YAML syntax differs.

Caching strategies:
- Layer cache: reuse previous build results on persistent builders.
- BuildKit gha cache: ideal for GitHub-hosted runners.
- Registry cache: useful across repos or runners when a registry is the shared cache source.

Common pitfalls:
- Using latest as the only production tag.
- Rebuilding separately in every environment.
- Treating vulnerability scans as informational only.
- Forgetting to grant packages: write permissions for pushes.

Pro tips:
- Tag every build with the Git SHA.
- Add OCI labels with source repo and revision.
- Use build targets for test and runtime separation.
- Keep registry credentials short-lived and rotate them regularly.

A good container pipeline is boring, immutable, and traceable from running pod back to commit in one jump.