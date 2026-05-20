---
title: "StorageClasses and Dynamic Provisioning"
order: 2
objectives:
  - "Create a StorageClass and mark it as default."
  - "Use dynamic provisioning to skip manual PV management."
  - "Tune `volumeBindingMode: WaitForFirstConsumer` for topology-aware scheduling."
  - "Expand a volume online with `allowVolumeExpansion: true`."
  - "Choose CSI drivers appropriate to your cloud or on-prem storage."
tryIt: "Set `volumeBindingMode: Immediate` on a StorageClass in a multi-zone cluster and observe Pods getting scheduled to a different zone than their PV. Switch to `WaitForFirstConsumer` and watch the scheduler pick a node *before* the volume is created."
takeaways:
  - "Dynamic provisioning via a default StorageClass is the modern norm — static PVs are legacy."
  - "**`WaitForFirstConsumer`** prevents the cross-zone scheduling nightmare in multi-AZ clusters."
  - "`allowVolumeExpansion: true` enables `kubectl edit pvc` resize without downtime (on supporting CSIs)."
  - "One cluster can have many StorageClasses — fast SSD, slow HDD, encrypted, etc."
  - "Snapshots are a separate CSI feature — enable them before you wish you had."
quiz:
  - text: "Why does the lesson recommend volumeBindingMode: WaitForFirstConsumer in multi-zone clusters?"
    options:
      - "It disables dynamic provisioning until a PV is created manually"
      - "It waits for the scheduler to pick a node so the volume is created in the correct zone"
      - "It lets one PVC bind to multiple PVs for HA"
      - "It forces all volumes to use regional replication"
    correctAnswer: 1
    explanation: "The lesson explains that Immediate can create a volume in the wrong availability zone. WaitForFirstConsumer delays provisioning until Kubernetes knows where the Pod will run."
  - text: "What does allowVolumeExpansion: true enable on a supporting CSI driver?"
    options:
      - "Automatic snapshot creation before every write"
      - "Editing a PVC to grow the volume without recreating it"
      - "Using one volume across multiple clusters"
      - "Converting a StatefulSet into a Deployment"
    correctAnswer: 1
    explanation: "The lesson says allowVolumeExpansion lets you resize a claim, often with kubectl edit pvc or a patch. On supporting drivers, that can happen without destroying the existing data."
  - text: "What operational problem does dynamic provisioning with a default StorageClass solve?"
    options:
      - "It eliminates the need for any PVCs"
      - "It removes the manual PV-by-PV provisioning bottleneck"
      - "It makes all volumes ReadWriteMany"
      - "It bypasses CSI drivers entirely"
    correctAnswer: 1
    explanation: "The lesson opens by explaining that manually creating PVs does not scale across many teams. A default StorageClass provisions storage automatically when a PVC appears."
  - text: "What does volumeClaimTemplates do for a StatefulSet, according to the lesson?"
    options:
      - "Creates one shared PVC for all replicas"
      - "Creates a PVC per replica automatically"
      - "Turns every Pod volume into an emptyDir"
      - "Backs up each PVC to a VolumeSnapshot every hour"
    correctAnswer: 1
    explanation: "The lesson says volumeClaimTemplates is how StatefulSets give each replica its own private storage. It even shows the resulting PVC names such as data-postgres-0 and data-postgres-1."
---

Static PersistentVolume provisioning breaks down at scale. When 50 teams each need a database volume, manually creating PersistentVolumes for each becomes a bottleneck. StorageClasses solve this by allowing Kubernetes to provision storage dynamically the moment a PersistentVolumeClaim is created, using a CSI (Container Storage Interface) driver that talks directly to the cloud provider or storage backend.

What a StorageClass contains:
A StorageClass specifies which CSI provisioner to use, the parameters for that provisioner (disk type, IOPS, encryption), the reclaim policy, and when volume binding should occur. Once defined by a cluster admin, developers never think about provisioning — they just write PVCs.

StorageClass for AWS EBS (gp3):
  apiVersion: storage.k8s.io/v1
  kind: StorageClass
  metadata:
    name: gp3-encrypted
    annotations:
      storageclass.kubernetes.io/is-default-class: "true"
  provisioner: ebs.csi.aws.com
  parameters:
    type: gp3
    iops: "3000"
    throughput: "125"
    encrypted: "true"
    kmsKeyId: arn:aws:kms:us-east-1:123456789:key/my-key
  reclaimPolicy: Delete
  allowVolumeExpansion: true
  volumeBindingMode: WaitForFirstConsumer

StorageClass for GCP Persistent Disk:
  provisioner: pd.csi.storage.gke.io
  parameters:
    type: pd-ssd
    replication-type: regional-pd
  volumeBindingMode: WaitForFirstConsumer

StorageClass for Azure Managed Disk:
  provisioner: disk.csi.azure.com
  parameters:
    skuName: Premium_LRS
    kind: Managed

volumeBindingMode explained:
  Immediate            The PV is provisioned as soon as the PVC is created, potentially in the wrong availability zone.
  WaitForFirstConsumer Provisioning waits until a Pod claims the PVC. Kubernetes picks the zone matching the Pod's node — the correct behaviour for multi-zone clusters.

Using a StorageClass in a PVC:
  apiVersion: v1
  kind: PersistentVolumeClaim
  metadata:
    name: redis-data
    namespace: production
  spec:
    storageClassName: gp3-encrypted
    accessModes:
      - ReadWriteOnce
    resources:
      requests:
        storage: 20Gi

StatefulSet with volumeClaimTemplates:
StatefulSets have a special field that creates a PVC per replica automatically. This is how you run Redis Cluster, Kafka, Elasticsearch, or PostgreSQL HA — each Pod gets its own private PVC.
  apiVersion: apps/v1
  kind: StatefulSet
  metadata:
    name: postgres
    namespace: production
  spec:
    serviceName: postgres
    replicas: 3
    selector:
      matchLabels:
        app: postgres
    template:
      spec:
        containers:
          - name: postgres
            image: postgres:16
            volumeMounts:
              - name: data
                mountPath: /var/lib/postgresql/data
    volumeClaimTemplates:
      - metadata:
          name: data
        spec:
          storageClassName: gp3-encrypted
          accessModes: [ReadWriteOnce]
          resources:
            requests:
              storage: 50Gi

This creates PVCs named data-postgres-0, data-postgres-1, data-postgres-2 automatically.

CSI snapshots for backups:
  apiVersion: snapshot.storage.k8s.io/v1
  kind: VolumeSnapshot
  metadata:
    name: postgres-snapshot-20240115
    namespace: production
  spec:
    volumeSnapshotClassName: csi-aws-vsc
    source:
      persistentVolumeClaimName: data-postgres-0

Restoring from a snapshot:
  spec:
    dataSource:
      name: postgres-snapshot-20240115
      kind: VolumeSnapshot
      apiGroup: snapshot.storage.k8s.io

Managing StorageClasses:
  kubectl get storageclass
  kubectl describe storageclass gp3-encrypted
  kubectl get pvc -n production
  # A PVC in Pending state for more than a minute means provisioning failed.
  kubectl describe pvc redis-data -n production  # Shows provisioner error events