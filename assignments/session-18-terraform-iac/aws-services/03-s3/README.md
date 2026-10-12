# AWS S3 — Simple Storage Service (Storage)

**Name:** Pulasari Jai · **Roll No:** 24BCS10656

## What is S3?
S3 is **object storage** — you store files ("objects") in "buckets". It is highly durable,
scalable, and accessed over HTTP(S). Great for files, backups, images, and static websites.

## Key concepts
- **Buckets** — a container for objects. Bucket names are **globally unique**.
- **Objects** — the actual files plus metadata. Each has a **key** (its name/path).
- **Storage classes** — price/performance tiers:
  - *Standard* (frequent access), *Standard-IA* (infrequent), *Glacier* (archive, cheapest
    but slow to retrieve).
- **Versioning** — keeps old versions of an object so you can recover overwrites/deletes.
- **Lifecycle policies** — rules to auto-move old objects to cheaper classes or delete them.
- **Encryption** — data can be encrypted at rest (SSE-S3, SSE-KMS).
- **Bucket policies** — JSON rules that control who can access the bucket/objects.

## Common use cases
- Storing images/files for a website or app.
- Backups and log storage.
- Hosting a static website.
- Data lake / big-data storage.
