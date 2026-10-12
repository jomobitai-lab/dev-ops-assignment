# AWS DynamoDB & RDS — Database Services

**Name:** Pulasari Jai · **Roll No:** 24BCS10656

## DynamoDB (NoSQL)
A fully managed **NoSQL** database — very fast, scales automatically, no servers to manage.

- **NoSQL** — no fixed table schema like SQL; stores flexible items.
- **Tables** — hold the data (like a collection).
- **Items** — a single record (like a row).
- **Attributes** — the fields of an item (like columns).
- **Partition key** — the main key used to spread/find data.
- **Sort key** — an optional second key to sort items that share a partition key.
- **Use cases** — gaming leaderboards, shopping carts, session data, IoT, anything needing
  huge scale and fast key lookups.

## RDS (Relational Database Service)
A managed **SQL** (relational) database — AWS handles setup, patching, and backups.

- **Relational database** — tables with rows/columns and relationships (SQL).
- **Supported engines** — MySQL, PostgreSQL, MariaDB, Oracle, SQL Server, Amazon Aurora.
- **DB instances** — the running database server (you pick the size).
- **Security** — runs in a VPC, protected by security groups; encryption available.
- **Backups** — automatic daily backups + manual snapshots.
- **Multi-AZ** — a standby copy in another availability zone for **high availability**
  (auto failover if the main one fails).
- **Read replicas** — extra read-only copies to handle more read traffic (scaling reads).
- **Use cases** — traditional apps needing SQL: e-commerce, banking, any app with related
  data and transactions.

## DynamoDB vs RDS (quick)
| | DynamoDB | RDS |
|-|----------|-----|
| Type | NoSQL | SQL (relational) |
| Schema | Flexible | Fixed tables |
| Scaling | Automatic, huge | Vertical + read replicas |
| Best for | Key lookups at scale | Related data + transactions |
