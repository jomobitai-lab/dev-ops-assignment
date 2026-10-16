# Terraform — AWS infrastructure for TrackMate

Provisions the cloud infrastructure the Kubernetes workloads run on:

- a **VPC** with two public and two private subnets across two AZs
- a **NAT gateway** for private-subnet egress
- an **EKS cluster** (`cluster_version` 1.31) with a managed node group (2× `t3.medium`)

Terraform creates the network and cluster; Helm then deploys the app into it.

## Usage

```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars   # adjust region/name if needed

terraform init
terraform plan
terraform apply        # creates real AWS resources (billable)

# point kubectl at the new cluster (command is in the outputs):
aws eks update-kubeconfig --region ap-south-1 --name trackmate-eks

terraform destroy      # tear everything down when finished
```

The default region is `ap-south-1`.

## Notes

- Requires AWS credentials configured (`aws configure` / env vars). **Never** commit
  access keys — `*.tfvars`, state files, and `.terraform/` are git-ignored.
- EKS (control plane + nodes + NAT) is **billable** — run `terraform destroy` after use.
- State is local by default; a real team would use a remote backend (S3 + DynamoDB lock).
