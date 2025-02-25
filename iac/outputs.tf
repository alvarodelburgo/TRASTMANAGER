output "instance_id_1" {
  description = "ID de la instancia EC2 creada"
  value       = aws_instance.ec2_instance_1.id
}

output "ec2_instance_1_public_ip" {
  description = "IP pública de la primera instancia EC2"
  value       = aws_instance.ec2_instance_1.public_ip
}

output "private_ip_1" {
  description = "IP privada de la instancia EC2"
  value       = aws_instance.ec2_instance_1.private_ip
}

output "ec2_instance_1_public_dns" {
  description = "IP pública de la primera instancia EC2"
  value       = aws_instance.ec2_instance_1.public_dns
}

output "instance_id_2" {
  description = "ID de la instancia EC2 creada"
  value       = aws_instance.ec2_instance_2.id
}

output "ec2_instance_2_public_ip" {
  description = "IP pública de la segunda instancia EC2"
  value       = aws_instance.ec2_instance_2.public_ip
}

output "private_ip_2" {
  description = "IP privada de la instancia EC2"
  value       = aws_instance.ec2_instance_2.private_ip
}

output "ec2_instance_2_public_dns" {
  description = "IP pública de la primera instancia EC2"
  value       = aws_instance.ec2_instance_2.public_dns
}