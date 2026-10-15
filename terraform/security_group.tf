# Security Group matching SAKEC DevSecOps Lab Port Architecture
# (Covers SSH, Web, Jenkins, SonarQube, and Cloudflare integration)

resource "aws_security_group" "edusprint_sg" {
  name        = "edusprint-devsecops-sg"
  description = "Security Group for EduSprint DevSecOps Infrastructure"
  vpc_id      = aws_vpc.edusprint_vpc.id

  # Port 22: Remote Administration via SSH
  ingress {
    description = "SSH Administration"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.ssh_source_cidr]
  }

  # Port 80: HTTP Web Access & Reverse Proxy
  ingress {
    description = "HTTP / Web / Cloudflare"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Port 443: HTTPS Secure Web Traffic
  ingress {
    description = "HTTPS Secure Web Traffic"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Port 5000: EduSprint Application Service (Docker Container)
  ingress {
    description = "EduSprint E-Learning Platform"
    from_port   = 5000
    to_port     = 5000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Port 8080: Jenkins CI/CD Automation Server
  ingress {
    description = "Jenkins CI/CD Automation Server"
    from_port   = 8080
    to_port     = 8080
    protocol    = "tcp"
    cidr_blocks = [var.ssh_source_cidr]
  }

  # Port 9000: SonarQube SAST Server
  ingress {
    description = "SonarQube SAST Server"
    from_port   = 9000
    to_port     = 9000
    protocol    = "tcp"
    cidr_blocks = [var.ssh_source_cidr]
  }

  # All outbound traffic allowed (for package installations, updates, image pulls)
  egress {
    description = "Allow all outbound traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "edusprint-devsecops-sg"
  }
}
