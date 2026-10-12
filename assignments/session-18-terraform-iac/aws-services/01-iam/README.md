# AWS IAM — Identity and Access Management (Governance)

**Name:** Pulasari Jai · **Roll No:** 24BCS10656

## What is IAM?
IAM controls **who** can access AWS and **what** they are allowed to do. It is how AWS
handles login and permissions. IAM is **free** and **global** (not tied to one region).

## Core parts
- **Users** — a person or application with login credentials.
- **Groups** — a collection of users (e.g. "Developers"). Give permissions to the group
  once, and every user in it gets them.
- **Roles** — temporary permissions that can be *assumed* (by a user, an EC2 instance, or
  another AWS service). No long-term password/keys — safer.
- **Policies** — JSON documents that list the actual permissions (Allow/Deny on actions
  and resources). Policies are attached to users, groups or roles.
- **Permissions** — what a policy grants, e.g. `s3:GetObject` on a specific bucket.

## Least privilege
Give **only the permissions that are needed**, nothing more. If a user only needs to read
one S3 bucket, don't give full admin. This limits the damage if the account is misused.

## IAM best practices
- Do **not** use the root account for daily work; create IAM users/roles.
- Turn on **MFA** (multi-factor authentication).
- Use **roles** for EC2/apps instead of hardcoding access keys.
- Follow **least privilege** and review permissions regularly.
- Use groups to manage permissions, not per-user policies.

## Common use cases
- Give a developer read-only access to one service.
- Let an EC2 instance read from S3 using a role (no keys in code).
- Separate dev / prod access with different groups.
