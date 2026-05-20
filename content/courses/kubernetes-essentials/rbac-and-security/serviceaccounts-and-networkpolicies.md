---
title: "ServiceAccounts and NetworkPolicies"
order: 2
objectives:
  - "Create a dedicated ServiceAccount per workload."
  - "Disable automatic token mounting where not needed."
  - "Write default-deny NetworkPolicies and selectively allow traffic."
  - "Combine egress NetworkPolicies with DNS exceptions correctly."
  - "Choose a CNI (Calico, Cilium) that enforces NetworkPolicy."
tryIt: "Apply a `default-deny` NetworkPolicy to a namespace. Watch your apps stop talking. Add an `allow-dns` policy for kube-dns. Then add per-app `allow` rules. This is zero-trust networking in 20 lines of YAML."
takeaways:
  - "The default ServiceAccount mounts a token. **Set `automountServiceAccountToken: false`** unless the Pod talks to the API."
  - "NetworkPolicies are **additive allow**: with no policy, all traffic; with any policy, default deny on the selected direction."
  - "Always allow egress to **kube-dns** (UDP/TCP 53) — forgetting this breaks every Pod."
  - "Your CNI must actually enforce NetworkPolicy. Flannel (default) does not. Calico, Cilium, and Weave do."
  - "Pair NetworkPolicies with mTLS via a service mesh for defence in depth."
quiz:
  - text: "When does the lesson say you should leave `automountServiceAccountToken` enabled for a Pod?"
    options:
      - "Only when the Pod needs to talk to the Kubernetes API"
      - "Whenever the Pod also uses a ConfigMap"
      - "Only for Pods running in the `default` namespace"
      - "Whenever IRSA is configured"
    correctAnswer: 0
    explanation: "The lesson recommends setting `automountServiceAccountToken: false` unless the Pod talks to the API. That reduces unnecessary credential exposure."
  - text: "What changes once any NetworkPolicy selects a Pod for a given direction?"
    options:
      - "All traffic is still allowed unless an explicit deny rule exists."
      - "Only traffic explicitly allowed by policy is permitted for that direction."
      - "The Pod can receive traffic but cannot initiate any connections."
      - "The policy applies only to cross-namespace traffic."
    correctAnswer: 1
    explanation: "The lesson explains that NetworkPolicies are additive allow rules. With any policy selecting a Pod, the selected direction becomes default deny unless explicitly allowed."
  - text: "Which egress exception does the lesson warn you to add before locking down traffic broadly?"
    options:
      - "Allow access to the Kubernetes dashboard on port 8443"
      - "Allow SMTP on port 25"
      - "Allow kube-dns on UDP/TCP 53"
      - "Allow the metrics server on port 4443"
    correctAnswer: 2
    explanation: "The takeaways explicitly warn that forgetting kube-dns breaks every Pod. DNS egress on port 53 is the common first exception in a default-deny setup."
  - text: "Why does the lesson mention Calico and Cilium specifically?"
    options:
      - "They automatically create default ServiceAccounts for each Deployment."
      - "They enforce NetworkPolicy, unlike Flannel's default behavior."
      - "They replace RBAC for Pod-to-Pod authorization."
      - "They are required to use projected ServiceAccount tokens."
    correctAnswer: 1
    explanation: "The lesson notes that your CNI must actually enforce NetworkPolicy. It contrasts Calico and Cilium with Flannel, which does not enforce those policies by default."
---

Kubernetes security has two complementary controls that protect the runtime environment: ServiceAccounts (workload identity) and NetworkPolicies (network segmentation). Most breaches in containerized environments happen because workloads run with excessive permissions or because lateral movement is unconstrained. These two primitives, applied correctly, contain the blast radius of any compromise.

ServiceAccounts — workload identity:
Every Pod authenticates to the Kubernetes API using a ServiceAccount token. The default ServiceAccount in each namespace receives a mounted token automatically, but it grants read access to the API server and in permissive clusters much more. Always create dedicated ServiceAccounts per workload and grant only what is needed.

Dedicated ServiceAccount with minimal permissions:
  apiVersion: v1
  kind: ServiceAccount
  metadata:
    name: api-sa
    namespace: production
    annotations:
      eks.amazonaws.com/role-arn: arn:aws:iam::ACCOUNT:role/api-prod-role
  automountServiceAccountToken: false

  apiVersion: apps/v1
  kind: Deployment
  spec:
    template:
      spec:
        serviceAccountName: api-sa
        automountServiceAccountToken: false

Projected service account tokens (bound tokens):
Old-style SA tokens never expire. Kubernetes 1.21+ uses projected volumes with short-lived bound tokens:
  volumes:
    - name: token
      projected:
        sources:
          - serviceAccountToken:
              path: token
              expirationSeconds: 3600
              audience: my-service

AWS IAM Roles for Service Accounts (IRSA):
IRSA maps a Kubernetes ServiceAccount to an AWS IAM Role, letting Pods assume AWS permissions without long-lived credentials:
  eksctl create iamserviceaccount \
    --name api-sa \
    --namespace production \
    --cluster my-cluster \
    --attach-policy-arn arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess \
    --approve

NetworkPolicies — Pod firewall rules:
By default, every Pod can reach every other Pod across all namespaces. NetworkPolicies change this. They are additive: if any NetworkPolicy selects a Pod, only explicitly allowed traffic is permitted. If no policy selects a Pod, all traffic is allowed.

NetworkPolicy requires a CNI plugin that enforces policies (Calico, Cilium, Weave). The default kubenet CNI stores the objects but does not enforce them.

Deny all ingress for a namespace (default deny):
  apiVersion: networking.k8s.io/v1
  kind: NetworkPolicy
  metadata:
    name: default-deny-ingress
    namespace: production
  spec:
    podSelector: {}
    policyTypes:
      - Ingress

Allow only frontend to reach the API on port 3000:
  apiVersion: networking.k8s.io/v1
  kind: NetworkPolicy
  metadata:
    name: api-allow-frontend
    namespace: production
  spec:
    podSelector:
      matchLabels:
        app: api
    policyTypes:
      - Ingress
    ingress:
      - from:
          - podSelector:
              matchLabels:
                app: frontend
        ports:
          - protocol: TCP
            port: 3000

Allow ingress from Prometheus (cross-namespace scraping):
  ingress:
    - from:
        - namespaceSelector:
            matchLabels:
              name: monitoring
          podSelector:
            matchLabels:
              app: prometheus
      ports:
        - port: 9090

Egress policy — prevent database from calling external IPs:
  spec:
    podSelector:
      matchLabels:
        app: postgres
    policyTypes:
      - Egress
    egress:
      - to:
          - namespaceSelector:
              matchLabels:
                name: production
        ports:
          - port: 5432

Pod Security Standards (PSS):
Kubernetes 1.25+ replaces PodSecurityPolicy with built-in admission via labels on namespaces:
  kubectl label namespace production \
    pod-security.kubernetes.io/enforce=restricted \
    pod-security.kubernetes.io/audit=restricted \
    pod-security.kubernetes.io/warn=restricted
The restricted profile disallows privileged containers, host networking, host paths, and requires non-root users.