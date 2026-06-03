---
title: "What is CI/CD?"
order: 1
objectives:
  - "Define continuous integration, continuous delivery, and continuous deployment."
  - "Identify the key stages in a typical CI/CD pipeline."
  - "Explain why fast feedback loops reduce risk and increase delivery speed."
  - "Describe the role of automated testing in a CI/CD system."
  - "Recognise common CI/CD platforms and when to use each."
tryIt: "Look at a public GitHub repository with a `.github/workflows` directory. Read the workflow YAML and identify: the trigger, the jobs, and the steps. Map each step to a pipeline stage (build, test, deploy)."
takeaways:
  - "CI means every commit is automatically integrated and verified — not just when developers remember."
  - "CD (delivery) means every passing build is releasable; CD (deployment) means it is automatically released."
  - "The cost of a bug grows exponentially with time — CI exists to catch it at commit time, not in production."
  - "A pipeline is only as useful as its test coverage and as fast as its slowest stage."
  - "Treat pipeline configuration as code: version it, review it, and apply the same quality standards."
quiz:
  - text: "What is the key difference between continuous delivery and continuous deployment?"
    options:
      - "Continuous delivery uses Docker; continuous deployment does not"
      - "Continuous delivery requires manual approval before production release; continuous deployment releases automatically"
      - "Continuous deployment only applies to frontend applications"
      - "There is no practical difference between the two"
    correctAnswer: 1
    explanation: "Continuous delivery ensures every build is releasable, but a human presses the button to deploy to production. Continuous deployment removes that gate — every passing build goes straight to production automatically."
  - text: "Why does CI reduce integration risk?"
    options:
      - "It prevents developers from making breaking changes"
      - "It locks the codebase during integration periods"
      - "It integrates and verifies changes frequently so problems are caught early when they are cheap to fix"
      - "It replaces code reviews with automated style checking"
    correctAnswer: 2
    explanation: "The longer branches diverge, the more painful the eventual merge. CI forces integration at every commit, reducing the blast radius of any single change and giving immediate feedback."
  - text: "Which of these is NOT a standard stage in a CI/CD pipeline?"
    options:
      - "Build"
      - "Test"
      - "Deploy"
      - "Archive"
    correctAnswer: 3
    explanation: "Standard pipeline stages are build, test, and deploy (sometimes with separate stages for security scanning, staging, and production). Archiving is not a standard pipeline stage, though artifacts may be stored after build."
---

CI/CD is the practice of automating the path from code commit to production deployment. It is the engineering foundation that allows companies like Netflix to deploy thousands of times per day while maintaining reliability.

## Why CI/CD Exists

Traditional software delivery was slow and risky: developers worked in isolation for weeks or months, then merged everything in a painful "integration hell" phase, followed by a lengthy manual testing and deployment process. The result was infrequent, high-risk releases.

CI/CD inverts this model:
- Small changes are integrated continuously
- Automated pipelines verify every change
- The path to production is automated and repeatable
- Feedback arrives in minutes, not weeks

## Continuous Integration (CI)

CI is the practice of automatically building and testing every commit pushed to a shared repository.

The CI contract:
1. Developer pushes code
2. Pipeline triggers automatically
3. Code is compiled/built
4. Tests run (unit, integration, linting)
5. Developer gets feedback in minutes

Without CI, the question is: "does it work on my machine?" With CI, the question is: "does it work everywhere, every time?"

## Continuous Delivery vs Continuous Deployment

**Continuous Delivery**: Every passing pipeline build produces a deployable artifact. A human makes the decision to deploy it to production. The deployment process itself is still automated — only the trigger is manual.

**Continuous Deployment**: Every passing pipeline build is automatically deployed to production. No human approval gate exists. This requires very high confidence in the automated test suite.

Most organizations practice continuous delivery and selectively automate the final deployment step.

## Anatomy of a CI/CD Pipeline

A typical pipeline for a containerized service:

  Stage 1: Source
    - Trigger: push to feature branch or merge to main
    - Action: checkout code, install dependencies

  Stage 2: Build
    - Compile code or build Docker image
    - Run linters and static analysis
    - Fail fast on syntax errors

  Stage 3: Test
    - Unit tests
    - Integration tests
    - Security scanning (SAST)
    - Dependency vulnerability scanning

  Stage 4: Package
    - Build and tag Docker image
    - Push image to container registry

  Stage 5: Deploy to Staging
    - Deploy to staging environment
    - Run smoke tests
    - Run end-to-end tests

  Stage 6: Deploy to Production
    - Manual approval gate (CD) or automatic (continuous deployment)
    - Deploy with zero-downtime strategy (rolling, blue/green, canary)
    - Post-deploy health check

## GitHub Actions Example

A minimal CI pipeline for a Node.js app:

  name: CI
  on:
    push:
      branches: [main, "feature/**"]
    pull_request:
      branches: [main]

  jobs:
    test:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v4
        - uses: actions/setup-node@v4
          with:
            node-version: 20
            cache: npm
        - run: npm ci
        - run: npm run lint
        - run: npm test -- --coverage
        - run: docker build -t myapp:${{ github.sha }} .

## CI/CD Platform Overview

  Platform            Best For
  GitHub Actions      GitHub-hosted projects; tight VCS integration
  GitLab CI/CD        GitLab users; strong built-in container registry
  CircleCI            Speed; parallelism; Docker-first workflows
  Jenkins             On-premise; maximum customization; large plugin ecosystem
  ArgoCD              Kubernetes-native GitOps continuous deployment
  Tekton              Kubernetes-native CI/CD primitives

## Key Metrics for Pipeline Health

- **Build frequency**: how often does the pipeline run? (aim for multiple per day per developer)
- **Build duration**: how long does a full pipeline take? (aim for under 10 minutes)
- **Build success rate**: what percentage of builds pass? (aim for > 90%)
- **Mean time to recovery (MTTR)**: how quickly can you fix a broken build? (aim for under 60 minutes)

These four metrics (derived from DORA research) predict overall software delivery performance.

## GitOps: Infrastructure as Code for Deployments

GitOps extends CI/CD to infrastructure:
- The desired state of the system is stored in Git
- A controller (ArgoCD, Flux) continuously reconciles actual state with desired state
- Every infrastructure change is a pull request
- Rollbacks are `git revert`

  # ArgoCD watches a Git repo and keeps the cluster in sync
  kubectl apply -f argocd-app.yml
  # Any change to the Kubernetes manifests in Git automatically deploys

## Pro Tips

- Fail fast: put the quickest checks (linting, unit tests) first, slowest last.
- Cache aggressively: cache npm/pip/maven dependencies between runs to cut minutes off build times.
- Never embed secrets in pipeline configuration — use the platform's secrets management.
- Add a deployment frequency metric to your team dashboard. Teams that track it tend to improve it.
- A broken build is a P1 incident for the whole team — fix or revert immediately, never let it sit.
