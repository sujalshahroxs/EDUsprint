variable "aws_region" {
  description = "AWS region for provisioning EduSprint infrastructure"
  type        = string
  default     = "ap-south-1" # Mumbai (closest to SAKEC)
}

variable "vpc_cidr" {
  description = "CIDR block for the dedicated EduSprint VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "subnet_cidr" {
  description = "CIDR block for the public subnet"
  type        = string
  default     = "10.0.1.0/24"
}

variable "instance_type" {
  description = "EC2 instance size for Docker, Jenkins and EduSprint app"
  type        = string
  default     = "m7i-flex.large" # Recommended for running Jenkins + SonarQube + EduSprint simultaneously
}

variable "key_name" {
  description = "Name of the existing AWS EC2 Key Pair for SSH access"
  type        = string
  default     = "sakec-devsecops-key"
}

variable "ssh_source_cidr" {
  description = "Admin public IPv4 CIDR allowed to access SSH, Jenkins, and SonarQube"
  type        = string
}
