data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"]

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd*/ubuntu-noble-24.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

resource "aws_instance" "edusprint_server" {
  ami                         = data.aws_ami.ubuntu.id
  instance_type               = var.instance_type
  key_name                    = var.key_name
  subnet_id                   = aws_subnet.public_subnet.id
  vpc_security_group_ids      = [aws_security_group.edusprint_sg.id]
  associate_public_ip_address = true

  root_block_device {
    volume_size           = 50
    volume_type           = "gp3"
    delete_on_termination = true

    tags = {
      Name = "edusprint-root-disk"
    }
  }

  user_data = <<-USERDATA
  #!/bin/bash
  set -euxo pipefail
  exec > >(tee -a /var/log/edusprint-bootstrap.log) 2>&1
  export DEBIAN_FRONTEND=noninteractive

  # Install prerequisites
  apt-get update -y
  apt-get install -y ca-certificates curl gnupg lsb-release git wget

  # Install Docker Engine
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  chmod a+r /etc/apt/keyrings/docker.gpg

  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" > /etc/apt/sources.list.d/docker.list
  apt-get update -y
  apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
  systemctl enable --now docker
  usermod -aG docker ubuntu

  # Install Trivy vulnerability scanner
  wget -qO - https://aquasecurity.github.io/trivy-repo/deb/public.key | gpg --dearmor -o /usr/share/keyrings/trivy.gpg
  echo "deb [signed-by=/usr/share/keyrings/trivy.gpg] https://aquasecurity.github.io/trivy-repo/deb generic main" > /etc/apt/sources.list.d/trivy.list
  apt-get update -y
  apt-get install -y trivy

  # Configure SonarQube kernel requirements
  printf '%s\n' 'vm.max_map_count=524288' 'fs.file-max=131072' > /etc/sysctl.d/99-sonarqube.conf
  sysctl --system

  # Add swap for additional memory headroom
  if [ ! -f /swapfile ]; then
    fallocate -l 4G /swapfile
    chmod 600 /swapfile
    mkswap /swapfile
  fi
  if ! swapon --show=NAME | grep -q '^/swapfile$'; then
    swapon /swapfile
  fi
  grep -q '^/swapfile ' /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab

  # Install Java 21 before Jenkins
  apt-get install -y fontconfig openjdk-21-jre

  # Install Jenkins LTS using the current repository signing key
  mkdir -p /etc/apt/keyrings
  wget -qO /etc/apt/keyrings/jenkins-keyring.asc https://pkg.jenkins.io/debian-stable/jenkins.io-2026.key
  echo "deb [signed-by=/etc/apt/keyrings/jenkins-keyring.asc] https://pkg.jenkins.io/debian-stable binary/" > /etc/apt/sources.list.d/jenkins.list
  apt-get update -y
  apt-get install -y jenkins

  # Allow Jenkins to run Docker-based CI stages
  usermod -aG docker jenkins
  systemctl enable --now jenkins
  systemctl restart jenkins

  # Start SonarQube with persistent storage
  docker volume create edusprint_sonarqube_data
  docker volume create edusprint_sonarqube_extensions
  docker volume create edusprint_sonarqube_logs
  docker pull sonarqube:26.9.0.129388-community
  docker run -d --name sonarqube-server --restart unless-stopped --ulimit nofile=131072:131072 --ulimit nproc=8192:8192 -p 9000:9000 -v edusprint_sonarqube_data:/opt/sonarqube/data -v edusprint_sonarqube_extensions:/opt/sonarqube/extensions -v edusprint_sonarqube_logs:/opt/sonarqube/logs sonarqube:26.9.0.129388-community

  echo "EduSprint DevSecOps Bootstrap Completed Successfully" > /var/log/bootstrap.done
  USERDATA

  tags = {
    Name = "edusprint-devsecops-ec2"
  }
}
