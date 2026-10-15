# Dedicated Virtual Private Cloud (VPC)
resource "aws_vpc" "edusprint_vpc" {
  cidr_block           = var.vpc_cidr
  enable_dns_support   = true
  enable_dns_hostnames = true

  tags = {
    Name = "edusprint-vpc"
  }
}

# Internet Gateway for public internet routing
resource "aws_internet_gateway" "edusprint_igw" {
  vpc_id = aws_vpc.edusprint_vpc.id

  tags = {
    Name = "edusprint-igw"
  }
}

# Public Subnet
resource "aws_subnet" "public_subnet" {
  vpc_id                  = aws_vpc.edusprint_vpc.id
  cidr_block              = var.subnet_cidr
  map_public_ip_on_launch = true
  availability_zone       = "${var.aws_region}a"

  tags = {
    Name = "edusprint-public-subnet"
  }
}

# Route Table for Internet Access
resource "aws_route_table" "public_rt" {
  vpc_id = aws_vpc.edusprint_vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.edusprint_igw.id
  }

  tags = {
    Name = "edusprint-public-rt"
  }
}

# Associate Subnet with Route Table
resource "aws_route_table_association" "public_assoc" {
  subnet_id      = aws_subnet.public_subnet.id
  route_table_id = aws_route_table.public_rt.id
}
