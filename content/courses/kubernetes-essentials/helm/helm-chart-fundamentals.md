---
title: "Helm Chart Fundamentals"
order: 1
objectives:
  - "Install, upgrade, and rollback releases with `helm`."
  - "Use `--values` files to keep secrets and env-specific config out of the chart."
  - "Read a chart's `values.yaml` and override fields safely."
  - "Inspect manifests before applying with `helm template` or `--dry-run`."
  - "Manage chart repositories and OCI registries."
tryIt: "`helm install pg bitnami/postgresql --set auth.postgresPassword=demo`. Then `helm upgrade pg bitnami/postgresql --set image.tag=16` and `helm rollback pg 1`. Three commands, one full release lifecycle."
takeaways:
  - "A **release** is a named instance of a chart in a cluster — you can install the same chart many times."
  - "`helm template` shows you exactly what would be applied — use it before every prod upgrade."
  - "Override only the values you care about; let the chart's defaults handle the rest."
  - "Store env-specific values in `values-prod.yaml` files under version control, not on operators' laptops."
  - "OCI registries (`oci://ghcr.io/...`) are the modern chart distribution channel; standalone repos are legacy."
quiz:
  - text: "In Helm terminology, what is a release?"
    options:
      - "A version number stored in `Chart.yaml`"
      - "A named installed instance of a chart in a cluster"
      - "A chart repository published to GitHub Pages"
      - "The rendered YAML output from `helm template`"
    correctAnswer: 1
    explanation: "The lesson defines a release as a specific installed instance of a chart. That is why the same chart can be installed multiple times with different names and values."
  - text: "Why does the lesson recommend running `helm template` before a production upgrade?"
    options:
      - "It automatically applies the manifests if they are valid."
      - "It shows exactly what Helm would render and apply."
      - "It encrypts sensitive values before they reach the cluster."
      - "It converts a chart into an OCI artifact."
    correctAnswer: 1
    explanation: "One takeaway is that `helm template` shows exactly what would be applied. Seeing the rendered manifests before a prod change helps catch values and templating mistakes early."
  - text: "When does the lesson say `--set` is a better choice than `-f custom-values.yaml`?"
    options:
      - "For environment-specific configuration committed to Git"
      - "For one-off overrides like an image tag in CI"
      - "For publishing a chart to an OCI registry"
      - "For reading the chart's default values"
    correctAnswer: 1
    explanation: "The lesson distinguishes `--set` for quick, one-off overrides from `-f` files for committed environment-specific config. The image tag example is given directly."
  - text: "What does `helm upgrade --atomic` do if a hook or resource fails during the upgrade?"
    options:
      - "It pauses and waits for manual approval."
      - "It leaves partial resources in place for debugging."
      - "It automatically rolls the release back."
      - "It retries forever until all Pods become ready."
    correctAnswer: 2
    explanation: "The lesson says `--atomic` rolls back automatically on failure. It is presented as especially important for CI/CD pipelines."
---

Raw kubectl apply works for individual resources in a single environment. It breaks down when you need to deploy the same application across staging and production with different values, share your application with other teams, or roll back a complex multi-resource change atomically. Helm solves all of these problems by packaging an application as a versioned artifact — a Chart — with a declarative lifecycle (install, upgrade, rollback, uninstall) and a powerful templating system.

Helm concepts:
  Chart       A package of templated Kubernetes manifests plus metadata and default values.
  Release     A specific installed instance of a Chart. You can install the same Chart many times with different release names and configurations.
  Repository  A collection of Charts hosted as a static website (GitHub Pages, S3, OCI registry).
  Values      Configuration injected into templates at install time.

Install Helm:
  brew install helm                    macOS
  choco install kubernetes-helm        Windows
  curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash

Working with repositories:
  helm repo add bitnami https://charts.bitnami.com/bitnami
  helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
  helm repo add jetstack https://charts.jetstack.io
  helm repo update
  helm search repo bitnami/postgresql --versions
  helm show values bitnami/postgresql > postgres-values.yaml
  # Edit the values file, then install:
  helm install my-postgres bitnami/postgresql -f postgres-values.yaml -n production

Release lifecycle:
  helm install   my-app ./my-chart -n production
  helm upgrade   my-app ./my-chart -n production --set image.tag=2.0.0
  helm rollback  my-app 1 -n production
  helm uninstall my-app -n production
  helm list -n production
  helm history   my-app -n production
  helm status    my-app -n production
  helm get values my-app -n production    See current user-supplied values
  helm get manifest my-app -n production  See rendered Kubernetes YAML

Upgrading with --atomic:
  helm upgrade my-app ./my-chart \
    --namespace production \
    --install \
    --atomic \
    --timeout 5m \
    --cleanup-on-fail
The --atomic flag rolls back automatically if any hook or resource fails during the upgrade — essential for CI/CD pipelines.

Using --set vs -f values.yaml:
  --set key=value          Good for one-off overrides in CI (image tag, replica count).
  -f custom-values.yaml    Good for environment-specific overrides committed to Git.
  Combine both:
  helm upgrade my-app ./my-chart -f prod-values.yaml --set image.tag=2.1.0

OCI registries:
  helm push my-chart-1.0.0.tgz oci://ghcr.io/myorg/charts
  helm install my-app oci://ghcr.io/myorg/charts/my-chart --version 1.0.0

Chart structure overview:
  my-chart/
    Chart.yaml        Name, version, description, dependencies.
    values.yaml       Default values — the API surface of your chart.
    templates/        Go-templated YAML files rendered by Helm.
    charts/           Unpacked chart dependencies (vendored).
    .helmignore       Files excluded from the chart package.

Inspect a chart's default values:
  helm show values ingress-nginx/ingress-nginx | less
  # Always read these before installing. Almost every Helm problem is a values problem.