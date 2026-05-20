---
title: "Cluster Autoscaler and Pod Disruption Budgets"
order: 2
objectives:
  - "Install and configure Cluster Autoscaler (or Karpenter) for your cloud."
  - "Use PodDisruptionBudgets to keep apps healthy during drains."
  - "Configure node groups with appropriate taints and tolerations."
  - "Plan for spot/preemptible nodes safely."
  - "Diagnose 'pod won't schedule' vs 'node won't scale up'."
tryIt: "Apply a PDB with `minAvailable: 50%` to a 4-replica Deployment, then `kubectl drain <node>`. The drain stalls if it would breach the budget — that's the safety net working."
takeaways:
  - "Cluster Autoscaler scales **nodes** based on **unschedulable Pods**. No pending Pods, no scale-up."
  - "PDBs protect apps during **voluntary** disruptions (drains, upgrades) — not from a Node crash."
  - "Use `minAvailable: 1` for singletons; `maxUnavailable: 25%` for fleets."
  - "Karpenter is newer, faster, and provisions per-Pod — strongly preferred over CA on AWS now."
  - "Spot nodes need PDBs, tolerations, and apps that handle 2-minute eviction notices gracefully."
quiz:
  - text: "What condition causes Cluster Autoscaler to add nodes, according to the lesson?"
    options:
      - "Any Deployment with more than three replicas"
      - "Pods stuck Pending because the cluster lacks resources"
      - "Any PDB with maxUnavailable set"
      - "A manual kubectl drain command on a healthy node"
    correctAnswer: 1
    explanation: "The lesson says Cluster Autoscaler reacts to unschedulable Pending Pods, such as those blocked by insufficient CPU or memory. No Pending Pods means no scale-up signal."
  - text: "Which disruptions does a PodDisruptionBudget protect against in the lesson?"
    options:
      - "Only node crashes and kernel panics"
      - "Voluntary disruptions like drains, upgrades, and scale-downs"
      - "Any OOM kill inside a container"
      - "Network partitions between zones"
    correctAnswer: 1
    explanation: "The lesson is explicit that PDBs cover voluntary disruptions, not unexpected failures like a node crash. They are guardrails for maintenance and eviction workflows."
  - text: "What simple PDB setting does the lesson recommend for a singleton workload?"
    options:
      - "minAvailable: 1"
      - "maxUnavailable: 50%"
      - "minAvailable: 0"
      - "maxUnavailable: 2"
    correctAnswer: 0
    explanation: "The takeaways state that minAvailable: 1 is the right pattern for singletons. It ensures voluntary disruption cannot take the only replica down."
  - text: "When you run kubectl describe pdb, what does the ALLOWED DISRUPTIONS field tell you?"
    options:
      - "How many Pods the Deployment wants in total"
      - "How many nodes Cluster Autoscaler may delete in parallel"
      - "How many Pods can currently be evicted without violating the budget"
      - "How many failed readiness probes happened in the last hour"
    correctAnswer: 2
    explanation: "The lesson points to ALLOWED DISRUPTIONS as the live safety signal for a PDB. It shows how much voluntary disruption is safe right now."
---

HPA handles scaling Pods. But when HPA adds Pods and the cluster runs out of node capacity, those Pods sit in Pending state serving nothing. Cluster Autoscaler (CA) solves the infrastructure half of the autoscaling problem by adding and removing nodes. Pod Disruption Budgets (PDB) complete the picture by ensuring that node removal and cluster maintenance never take down more replicas than you can afford.

How Cluster Autoscaler works:
CA runs as a Deployment in the cluster and watches for Pods stuck in Pending due to Insufficient CPU or Insufficient memory. When it detects them, it calculates which node group could fit them and requests a scale-out from the cloud provider API (AWS Auto Scaling, GCP Managed Instance Group, AKS VMSS). It also scans nodes that have been underutilized for a configurable window and safely evicts their workloads before removing the node.

CA on AWS EKS — required annotation:
  kubectl -n kube-system annotate serviceaccount cluster-autoscaler \
    eks.amazonaws.com/role-arn=arn:aws:iam::ACCOUNT:role/EKSClusterAutoscaler

  kubectl -n kube-system edit deployment cluster-autoscaler
  # Add to args:
  #   --balance-similar-node-groups
  #   --skip-nodes-with-system-pods=false
  #   --scale-down-utilization-threshold=0.5
  #   --scale-down-delay-after-add=10m

CA on GKE — enable at node pool level:
  gcloud container clusters update my-cluster \
    --enable-autoscaling \
    --min-nodes=1 \
    --max-nodes=20 \
    --node-pool=default-pool \
    --region=us-central1

Pod Disruption Budget — protecting availability during disruptions:
A disruption is any voluntary termination: node drain for maintenance, rolling update, Cluster Autoscaler scale-down, or kubectl delete pod. Without a PDB, CA can evict all Pods of a Deployment simultaneously. A PDB prevents that.

PDB using minAvailable:
  apiVersion: policy/v1
  kind: PodDisruptionBudget
  metadata:
    name: api-pdb
    namespace: production
  spec:
    minAvailable: 2
    selector:
      matchLabels:
        app: api

PDB using maxUnavailable:
  apiVersion: policy/v1
  kind: PodDisruptionBudget
  metadata:
    name: api-pdb
    namespace: production
  spec:
    maxUnavailable: 1
    selector:
      matchLabels:
        app: api

Choosing between minAvailable and maxUnavailable:
Use minAvailable when you have an absolute floor — e.g., a payment service must always have at least 2 instances. Use maxUnavailable when you care about the rate of disruption — e.g., roll at most 1 at a time. For a Deployment with replicas: 3, both maxUnavailable: 1 and minAvailable: 2 achieve the same result, but minAvailable scales better if you later increase replicas.

PDB interaction with node drain:
  kubectl drain node-1 --ignore-daemonsets --delete-emptydir-data
  # Drain respects PDBs. If evicting a Pod would violate the budget,
  # drain blocks until other Pods are rescheduled elsewhere.
  kubectl get pdb -n production
  kubectl describe pdb api-pdb -n production
  # ALLOWED DISRUPTIONS column shows how many Pods can currently be disrupted.

Safe to evict annotation:
For standalone Pods or DaemonSet Pods without a PDB, CA will not evict them by default. Override this per Pod:
  annotations:
    cluster-autoscaler.kubernetes.io/safe-to-evict: "true"

Topology spread constraints — distributing Pods across zones:
Combined with CA and PDB, topology spread ensures Pods are not all scheduled on the same AZ:
  topologySpreadConstraints:
    - maxSkew: 1
      topologyKey: topology.kubernetes.io/zone
      whenUnsatisfiable: DoNotSchedule
      labelSelector:
        matchLabels:
          app: api