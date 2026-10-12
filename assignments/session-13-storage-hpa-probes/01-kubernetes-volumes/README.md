# Kubernetes Volumes

**Name:** Pulasari Jai · **Roll No:** 24BCS10656

By default, when a pod dies, its data is **gone**. Volumes let pods keep data or share
data. Here is what I learned about each volume type.

## 1. emptyDir

- A **temporary** folder created when the pod starts.
- Shared between containers **in the same pod**.
- **Deleted** when the pod is removed.
- Use case: scratch space, sharing files between two containers in one pod.

```yaml
volumes:
  - name: cache
    emptyDir: {}
```
(see `emptydir-pod.yaml`)

## 2. hostPath

- Mounts a **folder from the node** (the actual machine) into the pod.
- Data stays on that node even if the pod restarts, but it is tied to **one node**.
- Use case: accessing node files/logs. Not good for multi-node apps.

```yaml
volumes:
  - name: host-vol
    hostPath:
      path: /data
      type: DirectoryOrCreate
```
(see `hostpath-pod.yaml`)

## 3. PersistentVolume (PV)

- A **real piece of storage** in the cluster (disk) created by an admin.
- It exists **independently** of any pod — data survives pod deletion.

```yaml
kind: PersistentVolume
spec:
  capacity: { storage: 1Gi }
  accessModes: [ReadWriteOnce]
```
(see `pv.yaml`)

## 4. PersistentVolumeClaim (PVC)

- A **request** for storage by a user/pod ("I need 1Gi").
- Kubernetes **binds** the claim to a matching PV.
- The pod uses the **PVC**, not the PV directly.

```yaml
kind: PersistentVolumeClaim
spec:
  accessModes: [ReadWriteOnce]
  resources: { requests: { storage: 1Gi } }
```
(see `pvc.yaml`)

**PV vs PVC:** the PV is the **actual storage**; the PVC is the **request** for it. It is
like a PV is a parking spot and the PVC is the ticket that reserves it.

## 5. StorageClass

- Describes a **type of storage** (fast SSD, standard, etc.) and **who provisions it**.
- Lets Kubernetes create volumes **automatically** when a PVC asks for them.

```yaml
kind: StorageClass
metadata: { name: standard }
provisioner: k8s.io/minikube-hostpath
```

## 6. Dynamic provisioning

- Instead of an admin creating a PV by hand, a **StorageClass creates the PV
  automatically** when a PVC is made.
- The PVC just says `storageClassName: standard`, and the volume appears on its own.
- Use case: cloud environments (AWS EBS, GCP PD) where storage is created on demand.

(see `storageclass-pvc.yaml`)

## Quick summary

| Type | Lives as long as | Shared across nodes? | Use case |
|------|------------------|----------------------|----------|
| emptyDir | the pod | No | scratch / share in one pod |
| hostPath | the node | No | node files/logs |
| PV + PVC | the cluster | Depends on backend | databases, real data |
| StorageClass | — | — | auto-create PVs (dynamic) |
