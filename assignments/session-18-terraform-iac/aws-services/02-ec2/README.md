# AWS EC2 — Elastic Compute Cloud (Compute)

**Name:** Pulasari Jai · **Roll No:** 24BCS10656

## What is EC2?
EC2 gives **virtual servers (instances)** in the cloud. You rent a machine, choose its
size and OS, and pay only for what you use.

## Key concepts
- **AMI (Amazon Machine Image)** — the template (OS + software) used to launch an instance,
  e.g. Ubuntu or Amazon Linux.
- **Instance types** — the size/power of the machine (e.g. `t2.micro` = small/cheap,
  `m5.large` = bigger). Families are tuned for compute, memory, or storage.
- **Key pairs** — an SSH key used to log in securely to a Linux instance.
- **Security Groups** — a virtual firewall that controls which ports/IPs can reach the
  instance (e.g. allow 22 for SSH, 80 for web).
- **EBS (Elastic Block Store)** — a virtual hard disk attached to the instance; data
  survives a stop/start.
- **Public vs private IP** — a **public IP** is reachable from the internet; a **private
  IP** is only reachable inside the VPC.

## Instance lifecycle
`pending → running → stopping → stopped → terminated`.
A **stopped** instance keeps its EBS data; a **terminated** instance is deleted.

## Common use cases
- Hosting a web server or API.
- Running a backend application or database.
- Batch jobs and processing.
