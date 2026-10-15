output "instance_id" {
  description = "AWS EC2 Instance ID"
  value       = aws_instance.edusprint_server.id
}

output "instance_public_ip" {
  description = "Public IPv4 address of the deployed EC2 server"
  value       = aws_instance.edusprint_server.public_ip
}

output "ssh_connection_string" {
  description = "Command to SSH into the instance"
  value       = "ssh -i ${var.key_name}.pem ubuntu@${aws_instance.edusprint_server.public_ip}"
}

output "edusprint_app_url" {
  description = "Direct Web URL for EduSprint application"
  value       = "http://${aws_instance.edusprint_server.public_ip}:5000"
}

output "jenkins_url" {
  description = "Jenkins CI/CD Automation Web Interface"
  value       = "http://${aws_instance.edusprint_server.public_ip}:8080"
}

output "sonarqube_url" {
  description = "SonarQube SAST Security Dashboard"
  value       = "http://${aws_instance.edusprint_server.public_ip}:9000"
}
