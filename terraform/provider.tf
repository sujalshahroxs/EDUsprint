terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "EduSprint-E-Learning"
      Environment = "Production"
      ManagedBy   = "Terraform"
      Course      = "SAKEC-DevSecOps-Lab"
      Student     = "Sujal-Shah"
    }
  }
}
