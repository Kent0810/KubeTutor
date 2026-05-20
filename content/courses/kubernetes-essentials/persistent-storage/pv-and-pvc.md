---
title: "PersistentVolumes and PersistentVolumeClaims"
order: 1
objectives:
  - "Distinguish PersistentVolumes (cluster resources) from PersistentVolumeClaims (namespaced requests)."
  - "Use **access modes** (`RWO`, `ROX`, `RWX`, `RWOP`) correctly."
  - "Understand reclaim policies (`Retain`, `Delete`) and when to choose each."
  - "Bind a Pod to a PVC and survive Pod restarts."
  - "Diagnose `Pending` PVCs."
tryIt: "Create a PVC requesting 1 Gi. Watch it stay `Pending` until you create a matching PV (static provisioning) or have a StorageClass (dynamic). `kubectl describe pvc` tells you exactly which one is missing."
takeaways:
  - "A **PVC** is what the developer writes; the **PV** is what the platform provides."
  - "`ReadWriteOnce` means one **node** (not one Pod) can mount it — important for HA failover."
  - "`Retain` keeps data when the PVC is deleted; `Delete` removes the underlying disk. Pick deliberately."
  - "`Pending` PVCs almost always mean **no matching PV** and **no working StorageClass**."
  - "StatefulSets use a `volumeClaimTemplates:` so each replica gets its own PVC automatically."
quiz:
  - text: "How does the lesson distinguish a PVC from a PV?"
    options:
      - "A PVC is cluster-scoped storage and a PV is namespaced"
      - "A PVC is what the developer requests and a PV is what the platform provides"
      - "A PVC is for secrets and a PV is for filesystems"
      - "A PVC is dynamic storage and a PV is static storage only"
    correctAnswer: 1
    explanation: "The lesson frames PVCs as developer requests and PVs as administrator-provided capacity. That separation lets apps stay portable across different storage backends."
  - text: "What does ReadWriteOnce mean in the lesson's access mode explanation?"
    options:
      - "Exactly one Pod in the cluster may mount the volume"
      - "Many nodes may mount the volume read-only"
      - "One node may mount the volume read-write"
      - "The volume may be mounted by one namespace only"
    correctAnswer: 2
    explanation: "The lesson specifically warns that ReadWriteOnce is about one node, not one Pod. Multiple Pods on that same node can still use the volume."
  - text: "If a PVC stays Pending, what does the lesson say is the usual reason?"
    options:
      - "The Pod is missing a liveness probe"
      - "There is no matching PV and no working StorageClass"
      - "The Service selector is wrong"
      - "The node is missing kube-proxy"
    correctAnswer: 1
    explanation: "The lesson says Pending PVCs almost always point to storage matching problems. Most often there is no suitable PV or dynamic provisioning is not working."
  - text: "Which reclaim policy keeps the underlying storage after the PVC is deleted?"
    options:
      - "Recycle"
      - "Delete"
      - "Retain"
      - "Archive"
    correctAnswer: 2
    explanation: "Retain leaves the PV and backing storage in place after claim deletion. The lesson recommends choosing it deliberately when you need to preserve data."
---

Kubernetes storage is designed around a clean separation of concerns: administrators provision storage capacity, developers claim what they need. PersistentVolumes represent physical or cloud storage. PersistentVolumeClaims are requests for storage from a developer, without needing to know the underlying infrastructure. This abstraction lets the same application YAML run on-premises with NFS and in the cloud with AWS EBS by changing only the StorageClass.

The storage lifecycle:
A PersistentVolume moves through phases: Available (ready to be claimed), Bound (claimed by a PVC), Released (the PVC was deleted but the PV still exists), and Failed (reclamation error). When bound, there is a one-to-one relationship between PV and PVC.

Static provisioning — manually created PV:
  apiVersion: v1
  kind: PersistentVolume
  metadata:
    name: postgres-pv
    labels:
      type: ssd
      environment: production
  spec:
    capacity:
      storage: 50Gi
    volumeMode: Filesystem
    accessModes:
      - ReadWriteOnce
    persistentVolumeReclaimPolicy: Retain
    storageClassName: manual-ssd
    hostPath:
      path: /mnt/data/postgres

PersistentVolumeClaim requesting that volume:
  apiVersion: v1
  kind: PersistentVolumeClaim
  metadata:
    name: postgres-pvc
    namespace: production
  spec:
    storageClassName: manual-ssd
    accessModes:
      - ReadWriteOnce
    resources:
      requests:
        storage: 50Gi
    selector:
      matchLabels:
        type: ssd

Using the PVC in a StatefulSet Pod:
  spec:
    containers:
      - name: postgres
        image: postgres:16
        env:
          - name: PGDATA
            value: /var/lib/postgresql/data/pgdata
        volumeMounts:
          - name: postgres-storage
            mountPath: /var/lib/postgresql/data
    volumes:
      - name: postgres-storage
        persistentVolumeClaim:
          claimName: postgres-pvc

Access modes explained:
  ReadWriteOnce (RWO)    One node can mount read-write. Standard for block storage: EBS, PD, Azure Disk.
  ReadOnlyMany (ROX)     Many nodes read-only. Useful for shared config files.
  ReadWriteMany (RWX)    Many nodes read-write simultaneously. Requires NFS, EFS, Azure Files, CephFS.
  ReadWriteOncePod       Kubernetes 1.22+: only one Pod can mount, not just one node. Strictest isolation.

Reclaim policies:
  Retain    The PV persists after PVC deletion. Data is safe; admin must manually reclaim.
  Delete    The PV and its backing storage are deleted when the PVC is deleted. Cloud default.
  Recycle   Deprecated. Ran a basic rm -rf scrub on the volume.

PVC binding status commands:
  kubectl get pvc -n production
  kubectl describe pvc postgres-pvc -n production
  kubectl get pv
  # If a PVC is stuck in Pending, check: no matching PV, wrong StorageClass, or capacity mismatch.

Volume expansion:
If the StorageClass allows expansion (allowVolumeExpansion: true), you can resize a PVC without data loss:
  kubectl patch pvc postgres-pvc -n production \
    -p '{"spec":{"resources":{"requests":{"storage":"100Gi"}}}}'
The actual resize happens at the node when the Pod restarts (for offline resize) or immediately (for online resize on supporting CSI drivers).