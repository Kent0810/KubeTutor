---
title: "Cluster Maintenance and Disaster Recovery"
order: 2
objectives:
  - "Upgrade a cluster control plane and node pools without downtime."
  - "Drain nodes safely respecting PDBs."
  - "Back up and restore etcd (or use a managed snapshot system)."
  - "Run quarterly disaster recovery drills."
  - "Plan multi-region failover for stateful workloads."
tryIt: "On a non-prod cluster, run `etcdctl snapshot save backup.db`. Then delete a namespace, and restore from the snapshot. Time the whole exercise. The number you measure is your real RTO — usually much longer than the one in your runbook."
takeaways:
  - "Cluster upgrades: **control plane first**, then node pools, one at a time, drain respecting PDBs."
  - "etcd is the source of truth. **Back it up daily** and test restores quarterly."
  - "Velero is the de facto K8s backup tool; managed services (EKS, GKE, AKS) have native equivalents."
  - "**RTO** (time to recover) and **RPO** (acceptable data loss) drive your DR design — measure both."
  - "Stateful workloads need DB-level replication (Postgres logical, etcd, etc.) — Kubernetes alone doesn't replicate data across regions."
quiz:
  - text: "What sequence does the lesson recommend for a routine Kubernetes version upgrade?"
    options:
      - "Worker nodes first, then the control plane, then etcd restore"
      - "Control plane first, then node pools one at a time"
      - "Upgrade all nodes in parallel to minimize total time"
      - "Only upgrade kubelet; kubeadm can stay behind indefinitely"
    correctAnswer: 1
    explanation: "The takeaways say to upgrade the control plane first and then worker node pools one at a time. The procedure section also stresses moving only one minor version at a time."
  - text: "Why is etcd backup treated as critical in this lesson?"
    options:
      - "It stores only audit logs, so losing it affects compliance reports."
      - "It contains the Helm chart repository cache for the cluster."
      - "It is the source of truth for cluster state, including objects like Pods, Secrets, and RBAC policies."
      - "It is required only when using managed Kubernetes services."
    correctAnswer: 2
    explanation: "The lesson describes etcd as the cluster's source of truth. Without a usable etcd backup, you lose the persisted configuration and state for the entire cluster."
  - text: "What is the purpose of `kubectl drain` during node maintenance?"
    options:
      - "It permanently deletes the node from the cluster."
      - "It gracefully evicts Pods while respecting PodDisruptionBudgets."
      - "It upgrades kubeadm on the node automatically."
      - "It backs up etcd before OS patching begins."
    correctAnswer: 1
    explanation: "The lesson differentiates cordon from drain: cordon blocks new scheduling, while drain evicts existing Pods gracefully. It specifically calls out that drain respects PodDisruptionBudgets."
  - text: "According to the lesson, what do GitOps and etcd backups each contribute to disaster recovery?"
    options:
      - "GitOps handles alert routing, while etcd backups handle log retention."
      - "GitOps covers desired state in Git, while etcd backups preserve actual cluster state."
      - "GitOps replaces the need for etcd snapshots entirely."
      - "Both are used only for worker-node upgrades, not recovery."
    correctAnswer: 1
    explanation: "The lesson says etcd backup covers cluster state and Git covers desired state. Together, they turn rebuild and recovery into an operational process instead of a full re-creation effort."
---

Running Kubernetes in production is not just about deploying applications — it is about building operational discipline around the cluster itself. Nodes need maintenance windows. etcd needs regular backups. The control plane needs tested upgrade procedures. When things go catastrophically wrong, you need a runbook that has actually been practiced, not a document that has only been written.

Node maintenance — cordon, drain, and uncordon:
Cordon marks a node as unschedulable so no new Pods are placed on it. Drain evicts all Pods from the node gracefully, respecting PodDisruptionBudgets.
  kubectl cordon node-1
  kubectl drain node-1 \
    --ignore-daemonsets \
    --delete-emptydir-data \
    --grace-period=60 \
    --timeout=300s
  # Perform OS patching, kernel upgrade, or hardware replacement.
  kubectl uncordon node-1
  kubectl get nodes   Verify node returns to Ready status.

etcd — the cluster's source of truth:
etcd stores all cluster state: Pods, Deployments, Secrets, ConfigMaps, node registrations, RBAC policies. If etcd is corrupted or lost without a backup, you lose the entire cluster configuration. All persistent state must be recreated from scratch.

etcd backup (run on a control plane node or via a CronJob):
  ETCDCTL_API=3 etcdctl snapshot save /backup/etcd-$(date +%Y%m%d-%H%M%S).db \
    --endpoints=https://127.0.0.1:2379 \
    --cacert=/etc/kubernetes/pki/etcd/ca.crt \
    --cert=/etc/kubernetes/pki/etcd/server.crt \
    --key=/etc/kubernetes/pki/etcd/server.key

Verify the snapshot:
  etcdctl snapshot status /backup/etcd-20240115-030000.db --write-out=table

Automated etcd backups to S3 via CronJob:
  apiVersion: batch/v1
  kind: CronJob
  metadata:
    name: etcd-backup
    namespace: kube-system
  spec:
    schedule: "0 */6 * * *"    Every 6 hours
    jobTemplate:
      spec:
        template:
          spec:
            hostNetwork: true
            nodeSelector:
              node-role.kubernetes.io/control-plane: ""
            tolerations:
              - key: node-role.kubernetes.io/control-plane
                effect: NoSchedule
            containers:
              - name: backup
                image: bitnami/etcd:3.5
                command:
                  - /bin/sh
                  - -c
                  - |
                    etcdctl snapshot save /backup/etcd-$(date +%Y%m%d-%H%M%S).db
                    aws s3 cp /backup/ s3://my-cluster-backups/etcd/ --recursive
                env:
                  - name: ETCDCTL_API
                    value: "3"
                  - name: ETCDCTL_CACERT
                    value: /etc/kubernetes/pki/etcd/ca.crt

Cluster upgrade procedure (kubeadm):
Kubernetes supports N-2 minor version skew between control plane and worker nodes. Always upgrade one minor version at a time.
  # Step 1: Upgrade kubeadm on control plane
  apt-get update && apt-get install -y kubeadm=1.30.0-00
  kubeadm upgrade plan
  kubeadm upgrade apply v1.30.0

  # Step 2: Upgrade kubelet on control plane
  apt-get install -y kubelet=1.30.0-00 kubectl=1.30.0-00
  systemctl daemon-reload && systemctl restart kubelet

  # Step 3: For each worker node
  kubectl cordon worker-1
  kubectl drain worker-1 --ignore-daemonsets --delete-emptydir-data
  # SSH to worker-1:
  apt-get install -y kubeadm=1.30.0-00 kubelet=1.30.0-00 kubectl=1.30.0-00
  kubeadm upgrade node
  systemctl daemon-reload && systemctl restart kubelet
  # Back on control plane:
  kubectl uncordon worker-1

Disaster recovery runbook:
  1. Restore etcd snapshot:
     etcdctl snapshot restore /backup/etcd-latest.db \
       --data-dir=/var/lib/etcd-restore \
       --initial-cluster=master=https://MASTER_IP:2380 \
       --initial-advertise-peer-urls=https://MASTER_IP:2380 \
       --name=master

  2. Update etcd static Pod manifest to use the restored data dir.

  3. Restart kubelet: systemctl restart kubelet

  4. Verify control plane: kubectl get nodes, kubectl get pods -A

GitOps as DR strategy:
If all your manifests, Helm values, and configuration are in Git, you can rebuild a cluster from scratch by rerunning your CI/CD pipeline. etcd backup covers the cluster state; Git covers the desired state. Together they make recovery a matter of hours, not days.

Quarterly DR drill checklist:
- Restore etcd to a test cluster and verify all workloads come up.
- Test kubectl drain on each node type and verify PDBs are respected.
- Simulate a full cluster rebuild from Git and validate all services respond.
- Verify backup uploads are actually succeeding (check S3 timestamps).
- Review IAM permissions for the backup service account.