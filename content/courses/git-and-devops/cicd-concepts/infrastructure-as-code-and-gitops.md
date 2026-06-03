---
title: "Infrastructure as Code & GitOps"
order: 3
objectives:
  - "Understand core IaC principles and why declarative infrastructure reduces drift."
  - "Write and apply basic Terraform configurations for cloud resources."
  - "Explain the GitOps operating model and how ArgoCD implements it."
  - "Integrate Terraform and ArgoCD into a CI/CD pipeline."
  - "Apply secrets management strategies in an IaC workflow."
tryIt: "Write a minimal Terraform configuration that declares an S3 bucket (or equivalent). Run `terraform init`, `terraform plan`, and observe the execution plan without applying it. Notice how Terraform describes every resource it intends to create."
takeaways:
  - "IaC makes infrastructure reproducible, reviewable, and auditable — treat it with the same discipline as application code."
  - "Declarative tools (Terraform, Kubernetes manifests) describe the desired end state; the tool figures out how to get there."
  - "GitOps closes the loop: Git is the single source of truth, and automation continuously reconciles actual state with desired state."
  - "State files contain sensitive data — always use remote, encrypted state storage, never commit them to Git."
  - "Drift detection is as important as provisioning — infrastructure that diverges from its declared state is a liability."
quiz:
  - text: "What is the key distinction between imperative and declarative infrastructure as code?"
    options:
      - "Imperative IaC tools are faster; declarative tools are more accurate"
      - "Imperative IaC describes step-by-step commands; declarative IaC describes the desired end state and lets the tool determine the steps"
      - "Declarative IaC requires a scripting language; imperative uses YAML"
      - "There is no meaningful difference between the two approaches"
    correctAnswer: 1
    explanation: "Imperative scripts say 'create this, then do that'. Declarative configurations say 'I want the system to look like this' and the tool computes the necessary changes. Declarative tools handle idempotency automatically."
  - text: "In a GitOps workflow, what happens when someone manually modifies a Kubernetes resource with `kubectl edit`?"
    options:
      - "The change is automatically committed back to Git"
      - "The GitOps controller detects drift and reverts the resource to the state declared in Git"
      - "The pipeline is triggered to re-apply the Git state"
      - "Nothing — GitOps only manages new deployments"
    correctAnswer: 1
    explanation: "A GitOps controller like ArgoCD continuously reconciles the cluster state against the Git repository. Out-of-band changes (kubectl edits) are detected as drift and reverted, enforcing Git as the authoritative source of truth."
  - text: "Why should Terraform state files never be committed to a Git repository?"
    options:
      - "They are binary files that Git cannot handle"
      - "They contain sensitive resource metadata and secrets; they must be stored in remote, encrypted backends"
      - "Git cannot handle files larger than 100MB"
      - "Terraform does not support Git-tracked state files"
    correctAnswer: 1
    explanation: "Terraform state files often contain sensitive data like database passwords, certificates, and resource IDs. They must be stored in a remote backend (S3 + DynamoDB, Terraform Cloud, GCS) with encryption at rest and state locking to prevent concurrent modifications."
---

Infrastructure as Code (IaC) and GitOps extend the principles of software engineering to infrastructure: version control, code review, automated testing, and continuous delivery. When done well, your entire system — application and infrastructure — lives in Git and can be reproduced from scratch in minutes.

## Infrastructure as Code Principles

**Without IaC:**
- Infrastructure is provisioned by hand through cloud consoles
- Steps are undocumented and unrepeatable
- Configuration drifts over time as people make one-off changes
- Disaster recovery takes days or weeks

**With IaC:**
- Infrastructure is declared in code files
- Provisioning is reproducible and automated
- Drift is detectable and correctable
- A complete environment can be recreated in minutes

### Declarative vs Imperative

| Approach    | Style                     | Examples                   |
|-------------|---------------------------|----------------------------|
| Declarative | Describe desired end state | Terraform, Kubernetes YAML |
| Imperative  | Step-by-step instructions | Bash scripts, Ansible tasks |

Declarative tools are idempotent by design — running `terraform apply` twice produces the same result as running it once.

## Terraform Fundamentals

Terraform is the industry-standard declarative IaC tool for cloud infrastructure.

### Core Workflow

  terraform init      # download providers and set up backend
  terraform plan      # preview changes without applying
  terraform apply     # apply changes (prompts for confirmation)
  terraform destroy   # destroy all managed resources

### Provider and Resource Configuration

  # provider.tf
  terraform {
    required_providers {
      aws = {
        source  = "hashicorp/aws"
        version = "~> 5.0"
      }
    }
    backend "s3" {
      bucket         = "my-terraform-state"
      key            = "prod/terraform.tfstate"
      region         = "us-east-1"
      dynamodb_table = "terraform-state-lock"
      encrypt        = true
    }
  }

  provider "aws" {
    region = var.aws_region
  }

  # main.tf
  resource "aws_s3_bucket" "assets" {
    bucket = "${var.environment}-app-assets"
    tags = {
      Environment = var.environment
      ManagedBy   = "terraform"
    }
  }

  resource "aws_s3_bucket_versioning" "assets" {
    bucket = aws_s3_bucket.assets.id
    versioning_configuration {
      status = "Enabled"
    }
  }

### Variables and Outputs

  # variables.tf
  variable "environment" {
    type        = string
    description = "Deployment environment (dev, staging, prod)"
  }

  variable "aws_region" {
    type    = string
    default = "us-east-1"
  }

  # outputs.tf
  output "bucket_name" {
    value = aws_s3_bucket.assets.id
  }

  output "bucket_arn" {
    value       = aws_s3_bucket.assets.arn
    sensitive   = false
  }

### Terraform Modules

Modules encapsulate reusable infrastructure patterns:

  # modules/rds/main.tf
  resource "aws_db_instance" "this" {
    identifier     = var.identifier
    engine         = "postgres"
    instance_class = var.instance_class
    username       = var.username
    password       = var.password
    # ...
  }

  # Usage
  module "database" {
    source         = "./modules/rds"
    identifier     = "app-db-prod"
    instance_class = "db.t3.micro"
    username       = "appuser"
    password       = var.db_password
  }

### Terraform State

State tracks the mapping between declared resources and real cloud objects.

  # View current state
  terraform state list

  # Inspect a specific resource
  terraform state show aws_s3_bucket.assets

  # Import existing infrastructure into state
  terraform import aws_s3_bucket.assets my-existing-bucket

  # Remove a resource from state without destroying it
  terraform state rm aws_s3_bucket.assets

**Remote state best practices:**
- Always use a remote backend (S3, GCS, Terraform Cloud)
- Enable state locking (DynamoDB for S3 backend) to prevent concurrent runs
- Enable encryption at rest
- Use separate state files per environment

## GitOps with ArgoCD

GitOps is an operational model where:
1. Git is the single source of truth for desired system state
2. Changes are made through pull requests, not direct cluster access
3. A controller continuously reconciles actual state with declared state
4. Rollbacks are `git revert`

### ArgoCD Architecture

  Developer → PR → Git Repository
                       ↓
                  ArgoCD Controller (watches repo)
                       ↓
               Kubernetes Cluster (reconciles state)

### ArgoCD Application Definition

  # argocd-app.yml
  apiVersion: argoproj.io/v1alpha1
  kind: Application
  metadata:
    name: my-app
    namespace: argocd
  spec:
    project: default
    source:
      repoURL: https://github.com/myorg/k8s-manifests
      targetRevision: main
      path: apps/my-app
    destination:
      server: https://kubernetes.default.svc
      namespace: production
    syncPolicy:
      automated:
        prune: true      # remove resources deleted from Git
        selfHeal: true   # revert out-of-band changes

  kubectl apply -f argocd-app.yml

Once applied, ArgoCD watches the Git path and automatically syncs any changes to the cluster.

### Flux (Alternative to ArgoCD)

Flux is a CNCF GitOps controller that integrates tightly with Helm and Kustomize:

  # Install Flux CLI
  brew install fluxcd/tap/flux

  # Bootstrap Flux on a cluster
  flux bootstrap github \
    --owner=myorg \
    --repository=fleet-infra \
    --branch=main \
    --path=./clusters/production

## Terraform in CI/CD Pipelines

Integrate Terraform into pipelines to automate infrastructure changes with proper review gates.

  # .github/workflows/terraform.yml
  name: Terraform
  on:
    pull_request:
      paths: ['infrastructure/**']
    push:
      branches: [main]
      paths: ['infrastructure/**']

  jobs:
    plan:
      runs-on: ubuntu-latest
      permissions:
        id-token: write
        contents: read
        pull-requests: write
      steps:
        - uses: actions/checkout@v4
        - uses: aws-actions/configure-aws-credentials@v4
          with:
            role-to-assume: ${{ secrets.AWS_ROLE_ARN }}
            aws-region: us-east-1

        - uses: hashicorp/setup-terraform@v3

        - name: Terraform Init
          run: terraform init
          working-directory: infrastructure/

        - name: Terraform Plan
          id: plan
          run: terraform plan -out=tfplan
          working-directory: infrastructure/

        - name: Post Plan to PR
          uses: actions/github-script@v7
          with:
            script: |
              const output = `${{ steps.plan.outputs.stdout }}`
              github.rest.issues.createComment({
                issue_number: context.issue.number,
                owner: context.repo.owner,
                repo: context.repo.repo,
                body: `\`\`\`\n${output}\n\`\`\``
              })

    apply:
      needs: plan
      if: github.ref == 'refs/heads/main'
      environment: production        # requires manual approval
      runs-on: ubuntu-latest
      steps:
        - run: terraform apply tfplan
          working-directory: infrastructure/

## Secrets Management in IaC

### Never Store Secrets in Terraform Code

Bad:
  resource "aws_db_instance" "db" {
    password = "supersecret123"    # NEVER do this
  }

Good options:

**AWS Secrets Manager:**

  data "aws_secretsmanager_secret_version" "db_password" {
    secret_id = "production/db/password"
  }

  resource "aws_db_instance" "db" {
    password = data.aws_secretsmanager_secret_version.db_password.secret_string
  }

**HashiCorp Vault:**

  provider "vault" {
    address = "https://vault.example.com"
  }

  data "vault_generic_secret" "db" {
    path = "secret/database"
  }

**Environment variables (for Terraform variables marked sensitive):**

  variable "db_password" {
    type      = string
    sensitive = true      # masked in plan output
  }

  # Set via environment variable
  export TF_VAR_db_password="$(aws secretsmanager get-secret-value ...)"

## Pro Tips

- Use `terraform plan -out=tfplan` in CI and `terraform apply tfplan` in CD — this ensures apply uses exactly what was reviewed.
- Set `prevent_destroy = true` in the lifecycle block for production databases and state buckets.
- Run `terraform fmt -recursive` in a CI lint step to enforce consistent formatting.
- Use workspaces or separate state files per environment — never share state between prod and staging.
- ArgoCD's app-of-apps pattern lets you manage many applications declaratively from a single root application manifest.
