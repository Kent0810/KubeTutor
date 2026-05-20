---
title: "Kubernetes Secrets"
order: 2
objectives:
  - "Create and consume Secrets safely."
  - "Encrypt Secrets at rest with a KMS provider."
  - "Integrate external secret stores (Vault, AWS, GCP) via External Secrets Operator."
  - "Audit who can `get` and `list` Secrets in your cluster."
  - "Avoid baking secrets into images, ConfigMaps, or git."
tryIt: "`kubectl create secret generic db --from-literal=password=hunter2`. Then `kubectl get secret db -o yaml` — the value is base64, not encrypted. **Base64 is not encryption.** Enable KMS encryption at rest in your cluster config to actually protect it."
takeaways:
  - "Secrets are **base64-encoded**, not encrypted. Encryption at rest is a separate config (`EncryptionConfiguration`)."
  - "RBAC `get`/`list` on Secrets is equivalent to reading the value — audit it tightly."
  - "Mount Secrets as files (mode `0400`) rather than env vars to limit accidental leaks via process listings."
  - "Prefer **External Secrets Operator** so the source of truth is Vault/AWS/GCP, not etcd."
  - "Rotate secrets without app changes by mounting as files and signalling the app to reload."
quiz:
  - text: "What does the lesson say base64 encoding of Secret data actually provides?"
    options:
      - "Strong encryption by default"
      - "Only encoding, not encryption"
      - "Automatic rotation every hour"
      - "Protection from anyone with Secret read access"
    correctAnswer: 1
    explanation: "The lesson repeatedly stresses that base64 is not encryption. Anyone who can read the Secret object can recover the plaintext value."
  - text: "Which Secret consumption method does the lesson prefer to limit accidental leaks and support reloads?"
    options:
      - "Bake the secret into the image"
      - "Expose it only through env vars"
      - "Mount it as files with mode 0400"
      - "Store it in a ConfigMap with immutable: true"
    correctAnswer: 2
    explanation: "The lesson recommends mounting Secrets as files, ideally read-only with mode 0400. It notes this is safer than environment variables and works better with rotation."
  - text: "According to the lesson, what is the enterprise-friendly source of truth pattern for secrets?"
    options:
      - "Opaque Secrets written manually into every namespace"
      - "ConfigMaps synced from Git"
      - "External Secrets Operator syncing from Vault or a cloud secret manager"
      - "NodePort services that proxy secret requests"
    correctAnswer: 2
    explanation: "The lesson calls External Secrets Operator the gold standard because Vault, AWS, GCP, or Azure stays the source of truth. Kubernetes then receives synced Secrets instead of storing secrets only in etcd."
  - text: "Why does the lesson say RBAC get/list permissions on Secrets must be audited tightly?"
    options:
      - "They allow changing Secret values without approval"
      - "They are effectively equivalent to reading the plaintext secret"
      - "They disable encryption at rest"
      - "They force Secrets to be exposed as environment variables"
    correctAnswer: 1
    explanation: "The lesson explains that anyone who can get or list Secret objects can access the sensitive values. That makes those permissions security-critical."
---

Kubernetes Secrets store sensitive data — passwords, tokens, API keys, TLS certificates — separately from Pods and ConfigMaps. They prevent credentials from being baked into images or appearing in YAML that gets committed to version control. Understanding the security model of Secrets, including their well-known limitations, is essential for anyone operating production clusters.

The base64 confusion:
Secrets store values as base64-encoded strings. This is encoding, not encryption. Anyone who can read the Secret object gets the plaintext credential. The separation of Secrets from ConfigMaps provides access control via RBAC, not cryptographic protection. For encryption at rest, you must configure an encryption provider in the API server — or use a secrets manager integration.

All Secret types:
  Opaque                           Generic arbitrary data (most common)
  kubernetes.io/tls                TLS certificate + private key pair
  kubernetes.io/dockerconfigjson   Registry pull credentials
  kubernetes.io/ssh-auth           SSH private key
  kubernetes.io/basic-auth         Username + password pair
  bootstrap.kubernetes.io/token    Bootstrap tokens for nodes

Creating Secrets:
  # Generic secret
  kubectl create secret generic db-creds \
    --from-literal=DB_USER=appuser \
    --from-literal=DB_PASSWORD=s3cur3P@ss

  # From files (avoids shell history)
  kubectl create secret generic tls-certs \
    --from-file=tls.crt=./certs/server.crt \
    --from-file=tls.key=./certs/server.key

  # Registry credentials
  kubectl create secret docker-registry registry-creds \
    --docker-server=ghcr.io \
    --docker-username=myuser \
    --docker-password=ghp_token123

Declarative Secret (values must be base64 encoded):
  apiVersion: v1
  kind: Secret
  metadata:
    name: db-creds
    namespace: production
  type: Opaque
  data:
    DB_USER: YXBwdXNlcg==
    DB_PASSWORD: czNjdXIzUEBzcw==

Injecting into Pods as environment variables:
  env:
    - name: DB_PASSWORD
      valueFrom:
        secretKeyRef:
          name: db-creds
          key: DB_PASSWORD
          optional: false

Mounting as a volume (supports live rotation):
  volumes:
    - name: db-secret-vol
      secret:
        secretName: db-creds
        defaultMode: 0400
  containers:
    - name: api
      volumeMounts:
        - name: db-secret-vol
          mountPath: /run/secrets/db
          readOnly: true

Production-grade: Sealed Secrets for GitOps:
Bitnami Sealed Secrets encrypts your Secret using the cluster's public key. Only the cluster's controller can decrypt it, so the sealed YAML is safe to commit to Git.
  brew install kubeseal
  kubectl apply -f https://github.com/bitnami-labs/sealed-secrets/releases/latest/download/controller.yaml
  kubectl create secret generic db-creds --from-literal=DB_PASSWORD=secret --dry-run=client -o yaml | \
    kubeseal --format yaml > sealed-db-creds.yaml
  kubectl apply -f sealed-db-creds.yaml

Production-grade: External Secrets Operator:
External Secrets Operator syncs secrets from AWS Secrets Manager, HashiCorp Vault, GCP Secret Manager, or Azure Key Vault directly into Kubernetes Secrets. This is the gold standard for enterprise environments.
  apiVersion: external-secrets.io/v1beta1
  kind: ExternalSecret
  metadata:
    name: db-creds
  spec:
    refreshInterval: 1h
    secretStoreRef:
      name: aws-secretsmanager
      kind: ClusterSecretStore
    target:
      name: db-creds
    data:
      - secretKey: DB_PASSWORD
        remoteRef:
          key: production/api/db
          property: password

RBAC for Secrets:
Limit who can read Secrets with explicit RBAC. The default service account should never have Secret read permissions across namespaces.
  rules:
    - apiGroups: [""]
      resources: ["secrets"]
      resourceNames: ["db-creds"]
      verbs: ["get"]

Audit logging:
Enable audit logging at the RequestResponse level for Secret access. This creates an audit trail for every read of sensitive credentials — critical for SOC 2 and ISO 27001 compliance.