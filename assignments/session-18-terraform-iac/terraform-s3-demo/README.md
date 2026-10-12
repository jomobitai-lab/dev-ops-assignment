# Terraform S3 Demo

Creates one AWS S3 bucket using Terraform.

## Files
- `main.tf` — the `aws_s3_bucket` resource
- `variables.tf` — `aws_region` and `bucket_name`
- `outputs.tf` — bucket name, ARN, region
- `providers.tf` — AWS provider
- `terraform.tf` — required Terraform + provider versions
- `terraform.tfvars.example` — sample values (copy to `terraform.tfvars`)

## Run
```bash
terraform init
terraform fmt
terraform validate
terraform plan
terraform apply -auto-approve
terraform output
terraform destroy -auto-approve
```

## Note on secrets
Never commit AWS keys. `.gitignore` excludes `*.tfstate` and `terraform.tfvars`.
Credentials should come from `aws configure` or environment variables.
