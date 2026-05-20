---
title: "Roles and ClusterRoles"
order: 1
objectives:
  - "Distinguish Role (namespaced) from ClusterRole (cluster-wide)."
  - "Bind roles to users, groups, and ServiceAccounts."
  - "Apply the principle of least privilege."
  - "Audit effective permissions with `kubectl auth can-i`."
  - "Avoid the most dangerous default bindings."
tryIt: "Run `kubectl auth can-i --list --as=system:serviceaccount:default:default` — that's what your default ServiceAccount can do. Anything broader than `selfsubjectaccessreviews` and you should be uncomfortable."
takeaways:
  - "**Role** + **RoleBinding** = namespaced; **ClusterRole** + **ClusterRoleBinding** = cluster-wide."
  - "A ClusterRole can be bound by a RoleBinding to scope it to a namespace — a hugely useful pattern."
  - "`cluster-admin` is for break-glass only. Nobody and nothing should run with it day-to-day."
  - "`kubectl auth can-i` is your audit tool. Use it on every ServiceAccount you create."
  - "Wildcard verbs (`*`) on resources are almost always a mistake."
quiz:
  - text: "Which RBAC combination grants permissions only inside a single namespace?"
    options:
      - "ClusterRole plus ClusterRoleBinding"
      - "Role plus ClusterRoleBinding"
      - "Role plus RoleBinding"
      - "ClusterRole plus AggregatedClusterRole"
    correctAnswer: 2
    explanation: "The lesson states that Role and RoleBinding are namespaced objects. By contrast, ClusterRoleBinding grants access across all namespaces."
  - text: "What happens if you bind a ClusterRole with a RoleBinding in `staging`?"
    options:
      - "The permissions become cluster-wide because the role is cluster-scoped."
      - "The permissions are still limited to the `staging` namespace."
      - "The binding fails because RoleBindings cannot reference ClusterRoles."
      - "Only ServiceAccounts can use that binding pattern."
    correctAnswer: 1
    explanation: "One key takeaway is that a ClusterRole can be bound with a RoleBinding to scope it to a namespace. The example using the built-in `view` ClusterRole in `staging` demonstrates this pattern."
  - text: "Why is `cluster-admin` described as break-glass access only?"
    options:
      - "It only works during control-plane upgrades."
      - "It bypasses RBAC auditing but cannot modify resources."
      - "It grants extremely broad privileges and should not be used for normal day-to-day access."
      - "It is intended only for kubelet identities."
    correctAnswer: 2
    explanation: "The lesson warns that nobody and nothing should run with `cluster-admin` day to day. It is reserved for exceptional situations because it effectively grants full control."
  - text: "Which command from the lesson is the primary way to audit what a user or ServiceAccount can actually do?"
    options:
      - "`kubectl auth can-i`"
      - "`kubectl describe rolebinding`"
      - "`kubectl rollout history`"
      - "`kubectl drain`"
    correctAnswer: 0
    explanation: "The takeaways call `kubectl auth can-i` your audit tool. The lesson shows using it both for a user and for a ServiceAccount impersonated with `--as`."
---

RBAC (Role-Based Access Control) is Kubernetes' authorization system. Every API request — from kubectl, from a running Pod calling the API server, from CI/CD — goes through the RBAC authorizer. A misconfigured RBAC policy is either too permissive (security risk) or too restrictive (breaks workloads). Understanding the model deeply lets you write least-privilege policies with confidence.

The four RBAC objects:
  Role              Namespace-scoped set of permissions.
  ClusterRole       Cluster-scoped permissions, or a reusable namespace template.
  RoleBinding       Grants a Role or ClusterRole to subjects within one namespace.
  ClusterRoleBinding  Grants a ClusterRole to subjects across all namespaces.

RBAC is additive: there is no "deny" rule. If a permission is not explicitly granted, it is denied. This means an overly permissive RoleBinding cannot be narrowed by another binding — you must restrict what the Role itself grants.

Subject types:
  User         External identity (from the cluster's configured authentication provider).
  Group        A group of users (e.g., system:masters built-in admin group).
  ServiceAccount  A Kubernetes identity assigned to Pods.

Namespace-scoped Role (read Pods and logs):
  apiVersion: rbac.authorization.k8s.io/v1
  kind: Role
  metadata:
    name: pod-reader
    namespace: staging
  rules:
    - apiGroups: [""]
      resources: ["pods", "pods/log", "pods/exec"]
      verbs: ["get", "list", "watch"]
    - apiGroups: [""]
      resources: ["events"]
      verbs: ["get", "list", "watch"]

RoleBinding granting it to a developer:
  apiVersion: rbac.authorization.k8s.io/v1
  kind: RoleBinding
  metadata:
    name: developer-pod-reader
    namespace: staging
  subjects:
    - kind: User
      name: alice@example.com
      apiGroup: rbac.authorization.k8s.io
    - kind: Group
      name: dev-team
      apiGroup: rbac.authorization.k8s.io
  roleRef:
    kind: Role
    name: pod-reader
    apiGroup: rbac.authorization.k8s.io

ClusterRole for read-only cluster admin (view):
  kubectl get clusterrole view
  # Kubernetes ships with built-in ClusterRoles: view, edit, admin, cluster-admin.
  # Grant the built-in view role in a specific namespace:
  kubectl create rolebinding dev-viewer \
    --clusterrole=view \
    --user=alice@example.com \
    --namespace=staging

ClusterRole for a CI/CD system deploying across all namespaces:
  apiVersion: rbac.authorization.k8s.io/v1
  kind: ClusterRole
  metadata:
    name: deployment-manager
  rules:
    - apiGroups: ["apps"]
      resources: ["deployments", "replicasets", "statefulsets"]
      verbs: ["get", "list", "watch", "create", "update", "patch"]
    - apiGroups: [""]
      resources: ["services", "configmaps", "serviceaccounts"]
      verbs: ["get", "list", "watch", "create", "update", "patch"]
    - apiGroups: ["networking.k8s.io"]
      resources: ["ingresses"]
      verbs: ["get", "list", "watch", "create", "update", "patch"]

Auditing permissions:
  kubectl auth can-i get pods --namespace=staging --as=alice@example.com
  kubectl auth can-i delete deployments --namespace=production --as=system:serviceaccount:production:api-sa
  kubectl auth can-i "*" "*"   # Full admin check (cluster-admin only)
  kubectl who-can get pods -n staging   # Requires kubectl who-can plugin

Aggregated ClusterRoles:
Kubernetes allows ClusterRoles to aggregate permissions from other ClusterRoles using label selectors. The built-in view, edit, and admin ClusterRoles use this — any CRD that adds aggregation rules to view or edit automatically extends those ClusterRoles without patching them.
  metadata:
    labels:
      rbac.authorization.k8s.io/aggregate-to-view: "true"

Common mistakes:
- Granting cluster-admin to CI/CD service accounts — use least-privilege ClusterRoles.
- Using wildcards (*) in verbs or resources — always be explicit.
- Forgetting that RoleBindings referencing ClusterRoles are still namespace-scoped.
- Not testing with kubectl auth can-i before assuming access works.