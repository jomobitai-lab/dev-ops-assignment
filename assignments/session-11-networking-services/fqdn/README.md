# FQDN in Kubernetes

**Name:** Pulasari Jai · **Roll No:** 24BCS10656

## What is FQDN?

**FQDN** = **Fully Qualified Domain Name**. It is the **complete** DNS name of a service,
not a short name. In Kubernetes, every Service gets an FQDN so pods can find each other by
name instead of by IP.

## Kubernetes Service DNS

When you create a Service, Kubernetes DNS (CoreDNS) automatically gives it a name. A pod
can reach the service using the short name (same namespace) or the full FQDN (any
namespace).

## Kubernetes DNS naming convention

```
<service-name>.<namespace>.svc.<cluster-domain>
```

Example:

```
web-service-clusterip.default.svc.cluster.local
```

- `web-service-clusterip` → the Service name
- `default` → the namespace it lives in
- `svc` → means it is a Service
- `cluster.local` → the cluster's base domain

## Namespace-based DNS

The namespace matters:

| From where | Name to use |
|------------|-------------|
| Same namespace | `web-service-clusterip` (short name works) |
| Different namespace | `web-service-clusterip.default` or the full FQDN |
| Always safe | `web-service-clusterip.default.svc.cluster.local` |

So two services with the same name can exist in different namespaces without clashing,
because the namespace is part of the FQDN.

## Pod-to-Service communication

1. Pod A wants to talk to a service `web-service-clusterip`.
2. It asks CoreDNS to resolve the name.
3. CoreDNS returns the Service's ClusterIP.
4. Pod A sends traffic to that IP, and the Service forwards it to a healthy pod.

This is why we never hard-code pod IPs — we use the service name/FQDN.

## Examples of Kubernetes FQDNs

| Resource | FQDN |
|----------|------|
| Service `web` in `default` | `web.default.svc.cluster.local` |
| Service `db` in `prod` | `db.prod.svc.cluster.local` |
| Kubernetes API service | `kubernetes.default.svc.cluster.local` |
| CoreDNS service | `kube-dns.kube-system.svc.cluster.local` |
| Headless pod | `web-0.web-headless.default.svc.cluster.local` |
