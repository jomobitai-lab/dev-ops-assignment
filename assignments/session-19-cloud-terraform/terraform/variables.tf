variable "aws_region" {
  description = "AWS region for the Session 19 mini project."
  type        = string
  default     = "ap-south-1"
}

variable "instance_type" {
  description = "EC2 instance type."
  type        = string
  default     = "t2.micro"
}

variable "bucket_name" {
  description = "Name of the S3 bucket (must be globally unique)."
  type        = string
  default     = "pulasari-jai-session19-assets"
}
