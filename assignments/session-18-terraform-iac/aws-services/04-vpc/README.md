# AWS VPC — Virtual Private Cloud (Networking)

**Name:** Pulasari Jai · **Roll No:** 24BCS10656

## What is VPC?
A VPC is your **own private network inside AWS**. You decide the IP range, subnets, and
routing — like having your own data-center network in the cloud.

## Key concepts
- **CIDR** — the IP range of the VPC, e.g. `10.0.0.0/16` (gives ~65,000 addresses).
- **Subnets** — smaller IP ranges inside the VPC, usually one per availability zone.
  - **Public subnet** — can reach the internet (via an Internet Gateway).
  - **Private subnet** — no direct internet access (e.g. databases).
- **Route tables** — rules that decide where network traffic goes.
- **Internet Gateway (IGW)** — lets resources in public subnets reach the internet.
- **NAT Gateway** — lets **private** subnet resources reach the internet *outbound only*
  (for updates), while staying unreachable from outside.
- **Security Groups** — firewall at the **instance** level (stateful).
- **Network ACLs** — firewall at the **subnet** level (stateless).

## Public vs private subnet (simple)
- **Public:** web servers, load balancers (need internet).
- **Private:** databases, internal services (should not be exposed).

## Common use cases
- Separate public web servers from private databases.
- Build a secure, isolated network for an application.
