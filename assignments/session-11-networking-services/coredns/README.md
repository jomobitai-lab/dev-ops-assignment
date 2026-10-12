# CoreDNS in Kubernetes

**Name:** Pulasari Jai · **Roll No:** 24BCS10656

## What is CoreDNS?

**CoreDNS** is the **DNS server inside Kubernetes**. It runs as pods in the
`kube-system` namespace and answers name questions for the whole cluster — for example,
turning a service name like `web-service.default.svc.cluster.local` into an IP address.

## Why Kubernetes uses CoreDNS

- Pods and services get **new IPs** all the time, so we can't use fixed IPs.
- CoreDNS lets everything talk using **names** instead of IPs.
- It is flexible (plugin-based) and is the **default DNS** in modern Kubernetes
  (it replaced the older `kube-dns`).

## How service discovery works

1. You create a Service, e.g. `web-service`.
2. Kubernetes automatically adds a DNS record for it in CoreDNS.
3. Any pod can now reach it using the name `web-service` (or the full FQDN).
4. No manual DNS setup is needed — it is automatic.

## How DNS queries are resolved

1. A pod tries to connect to `web-service`.
2. The pod's `/etc/resolv.conf` points to the CoreDNS service IP (usually `10.96.0.10`).
3. CoreDNS looks up the name and returns the service's ClusterIP.
4. The pod connects to that IP, and the Service forwards traffic to a pod.

```bash
# inside a pod, the DNS server is CoreDNS:
cat /etc/resolv.conf
# nameserver 10.96.0.10
# search default.svc.cluster.local svc.cluster.local cluster.local
```

## CoreDNS configuration

CoreDNS is configured by a **ConfigMap** named `coredns` in `kube-system`. The config is
called the **Corefile**:

```
.:53 {
    errors
    health
    kubernetes cluster.local in-addr.arpa ip6.arpa {
       pods insecure
       fallthrough in-addr.arpa ip6.arpa
    }
    forward . /etc/resolv.conf     # send non-cluster names to the upstream DNS
    cache 30
    loop
    reload
}
```

- `kubernetes cluster.local` → handle names ending in `cluster.local`
- `forward` → anything else (like google.com) is sent to the normal internet DNS
- `cache 30` → cache answers for 30 seconds

## How to troubleshoot DNS issues

```bash
# 1. Are the CoreDNS pods running?
kubectl get pods -n kube-system -l k8s-app=kube-dns

# 2. Test name resolution from a temporary pod
kubectl run dnstest --rm -it --image=busybox --restart=Never -- nslookup kubernetes.default

# 3. Check a pod's DNS settings
kubectl exec -it <pod> -- cat /etc/resolv.conf

# 4. Look at CoreDNS logs
kubectl logs -n kube-system -l k8s-app=kube-dns

# 5. Check the CoreDNS config
kubectl get configmap coredns -n kube-system -o yaml
```

**Common causes of DNS problems:** CoreDNS pods are down, wrong service name/namespace,
or a NetworkPolicy blocking DNS (port 53).
