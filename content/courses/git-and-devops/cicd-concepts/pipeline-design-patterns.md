---
title: "Pipeline Design Patterns"
order: 2
objectives:
  - "Design efficient pipelines using parallelism, fan-out, and fan-in patterns."
  - "Implement dependency caching strategies to reduce pipeline duration."
  - "Use matrix builds to test across multiple environments simultaneously."
  - "Apply environment promotion strategies: dev → staging → production."
  - "Implement pipeline security best practices: secrets, OIDC, and least-privilege."
tryIt: "In a GitHub Actions workflow file, add a matrix strategy that runs the test job on Node.js versions 18, 20, and 22. Observe how the job count multiplies and the results aggregate."
takeaways:
  - "Parallelism is the single most impactful lever for reducing pipeline duration — identify and fan out independent jobs."
  - "Caching dependency installs (npm, pip, Maven) can cut 2–5 minutes from every pipeline run."
  - "Matrix builds give you confidence across environments without writing duplicate jobs."
  - "Never store secrets in environment variables for long-lived processes — use short-lived OIDC tokens instead."
  - "Treat your pipeline configuration like production code: review it, test it, and version it."
quiz:
  - text: "What is the primary benefit of a fan-out/fan-in pipeline pattern?"
    options:
      - "It reduces the number of jobs in a pipeline"
      - "It runs independent jobs in parallel, reducing total wall-clock time"
      - "It prevents jobs from failing"
      - "It automatically retries failed steps"
    correctAnswer: 1
    explanation: "Fan-out means splitting work into parallel jobs that run simultaneously. Fan-in means collecting results after all parallel jobs complete. Total duration is limited by the slowest parallel branch, not the sum of all branches."
  - text: "Why should CI/CD secrets be stored in the platform's secrets store rather than in code or environment files?"
    options:
      - "Platform secrets are faster to read at runtime"
      - "Storing secrets in code makes them visible in version history; platform secrets are injected at runtime and never committed"
      - "It is a requirement of the CI platform licensing"
      - "Secrets stored in code cannot be rotated"
    correctAnswer: 1
    explanation: "Once a secret is committed to Git history, it is extremely difficult to remove — it may exist in forks, caches, and backups. Platform-managed secrets are injected at runtime, never written to disk, and can be rotated without changing code."
  - text: "What does a matrix build strategy accomplish?"
    options:
      - "It distributes test files across multiple agents to run faster"
      - "It runs the same job across a set of variable combinations (e.g., OS versions, language versions)"
      - "It chains jobs sequentially in a predefined order"
      - "It creates multiple deployment targets from one build"
    correctAnswer: 1
    explanation: "A matrix strategy automatically generates one job instance per combination of the defined variables. Testing on Node 18, 20, and 22 across Ubuntu and macOS would generate 6 parallel jobs from a single job definition."
---

A pipeline that works is not the same as a pipeline that is well designed. Poorly structured pipelines are slow, brittle, and expensive. Great pipeline architecture reduces feedback time, increases reliability, and controls costs.

## Fan-Out / Fan-In Parallelism

The most impactful optimization in any pipeline is parallelism. Sequential pipelines add each stage's duration to the total. Parallel pipelines are bounded by the slowest stage only.

**Sequential (slow):**

  Source (30s) → Lint (60s) → Unit Tests (120s) → Integration Tests (180s) → Build (90s)
  Total: 480 seconds

**Fan-out / Fan-in (fast):**

  Source (30s)
    ├── Lint (60s)         ┐
    ├── Unit Tests (120s)  ├── Fan-in gate
    └── Integration (180s) ┘
  Build (90s) [after all pass]
  Total: 30 + 180 + 90 = 300 seconds

GitHub Actions example:

  jobs:
    lint:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v4
        - run: npm ci && npm run lint

    unit-tests:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v4
        - run: npm ci && npm test

    integration-tests:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v4
        - run: npm ci && npm run test:integration

    build:
      needs: [lint, unit-tests, integration-tests]  # fan-in gate
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v4
        - run: docker build -t myapp:${{ github.sha }} .

## Dependency Caching

Reinstalling dependencies on every run wastes time. Most CI platforms support caching keyed on a lockfile hash.

GitHub Actions cache example:

  - uses: actions/setup-node@v4
    with:
      node-version: 20
      cache: npm          # built-in cache for npm

  # For custom cache paths:
  - uses: actions/cache@v4
    with:
      path: ~/.m2/repository
      key: maven-${{ hashFiles('**/pom.xml') }}
      restore-keys: |
        maven-

  # Python / pip
  - uses: actions/cache@v4
    with:
      path: ~/.cache/pip
      key: pip-${{ hashFiles('**/requirements.txt') }}

**Cache invalidation strategy:**
- Key on the lockfile hash (`package-lock.json`, `requirements.txt`, `go.sum`)
- Use `restore-keys` for partial cache hits when the lockfile changes
- Separate caches for different jobs that have different dependency sets

Typical savings: 2–5 minutes per run for a medium-sized project.

## Matrix Builds

Matrix builds let you test across a combination of variables without duplicating job definitions.

  jobs:
    test:
      strategy:
        matrix:
          node-version: [18, 20, 22]
          os: [ubuntu-latest, macos-latest]
        fail-fast: false   # continue other matrix jobs even if one fails
      runs-on: ${{ matrix.os }}
      steps:
        - uses: actions/checkout@v4
        - uses: actions/setup-node@v4
          with:
            node-version: ${{ matrix.node-version }}
        - run: npm ci && npm test

This generates 6 parallel jobs (3 versions × 2 operating systems) from one definition.

**Excluding combinations:**

  strategy:
    matrix:
      node-version: [18, 20, 22]
      os: [ubuntu-latest, windows-latest]
      exclude:
        - node-version: 18
          os: windows-latest

**Including additional combinations:**

  include:
    - node-version: 22
      os: ubuntu-latest
      experimental: true

## Environment Promotion Strategy

A robust promotion pipeline gates each environment behind automated quality checks.

  Commit Push
    ↓
  CI Pipeline (lint, test, build, scan)
    ↓
  Deploy to Dev (automatic on every passing build)
    ↓
  Smoke Tests (automatic)
    ↓
  Deploy to Staging (automatic after dev smoke tests pass)
    ↓
  End-to-End Tests (automatic)
    ↓
  Deploy to Production (manual approval or automatic for mature teams)
    ↓
  Post-deploy Health Checks (automatic)

GitHub Actions environments with protection rules:

  jobs:
    deploy-staging:
      needs: build
      environment: staging        # triggers environment protection rules
      runs-on: ubuntu-latest
      steps:
        - name: Deploy to staging
          run: ./scripts/deploy.sh staging ${{ github.sha }}

    deploy-production:
      needs: deploy-staging
      environment: production     # requires manual approval via GitHub UI
      runs-on: ubuntu-latest
      steps:
        - name: Deploy to production
          run: ./scripts/deploy.sh production ${{ github.sha }}

## Pipeline Security

### Never Store Secrets in Code

Bad:
  env:
    API_KEY: "sk-production-abc123"    # visible in git history forever

Good:
  env:
    API_KEY: ${{ secrets.API_KEY }}    # injected at runtime from secrets store

### OIDC: Short-Lived Cloud Credentials

Instead of long-lived cloud credentials stored as secrets, use OpenID Connect (OIDC) to get short-lived tokens at runtime.

GitHub Actions + AWS example:

  permissions:
    id-token: write      # required for OIDC
    contents: read

  jobs:
    deploy:
      runs-on: ubuntu-latest
      steps:
        - uses: aws-actions/configure-aws-credentials@v4
          with:
            role-to-assume: arn:aws:iam::123456789012:role/GitHubActionsRole
            aws-region: us-east-1
        # No long-lived AWS keys stored anywhere

### Least-Privilege Permissions

  # Restrict default permissions
  permissions:
    contents: read     # can read repo files
    packages: write    # can push to GitHub Container Registry
    # All other permissions: none

### Dependency Pinning

  # Bad: floating tag can change unexpectedly
  - uses: actions/checkout@main

  # Good: pinned to a specific SHA
  - uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683  # v4.2.2

Pin third-party actions to a full commit SHA, then use a tool like Dependabot to keep them updated.

## Artifact Management

Build artifacts (compiled binaries, Docker images, test reports) should be stored and passed between jobs.

  jobs:
    build:
      runs-on: ubuntu-latest
      steps:
        - run: npm run build
        - uses: actions/upload-artifact@v4
          with:
            name: build-output
            path: dist/
            retention-days: 7

    deploy:
      needs: build
      runs-on: ubuntu-latest
      steps:
        - uses: actions/download-artifact@v4
          with:
            name: build-output
            path: dist/
        - run: ./scripts/deploy.sh

## Fail Fast Principles

1. **Order jobs by speed**: lint → unit tests → integration → e2e
2. **Short-circuit on failure**: don't deploy if tests fail
3. **Use timeouts**: prevent runaway jobs from consuming minutes of billed time

  jobs:
    test:
      timeout-minutes: 15    # kill if it hangs
      runs-on: ubuntu-latest

4. **Concurrency control**: cancel in-progress runs when a new commit is pushed

  concurrency:
    group: ${{ github.workflow }}-${{ github.ref }}
    cancel-in-progress: true

## Pro Tips

- Instrument your pipelines with timing metrics. Steps that consistently take over 2 minutes are candidates for parallelisation or caching.
- Use `workflow_dispatch` to create manually-triggerable pipelines for operations like DB migrations or smoke test suites.
- Store pipeline configuration in a reusable, composable form — GitHub Actions reusable workflows, GitLab CI templates, or Jenkins shared libraries.
- Review pipeline costs monthly. Matrix builds multiplied by frequent commits can surprise you with a large bill.
