variable "aws_region" {
  description = "Región de AWS donde se desplegará la infraestructura"
  default     = "eu-west-1"
}

variable "ami_id" {
  description = "ID de la AMI para la instancia EC2"
  type        = string
}

variable "instance_type" {
  description = "Tipo de instancia EC2"
  default     = "t2.micro"
}

variable "instance_name" {
  description = "Nombre de la instancia EC2"
  default     = "TM-SERVER-IRL"
}

variable "key_name" {
  description = "Nombre de la clave SSH configurada en AWS"
  type        = string
}

variable "ssh_private_key_path" {
  description = "Ruta local a la clave privada SSH para conectarse a la instancia"
  type        = string
}

variable "vpc_id" {
  description = "ID de la VPC donde lanzar la infraestructura"
  type     = string
}

variable "subnet_id" {
  description = "ID de la subred de la VPC donde lanzar la instancia"
  type     = string
}

variable "subnet_id_2" {
  description = "ID de la subred 2 de la VPC donde lanzar la instancia"
  type     = string
}

variable "acm_certificate_arn" {
  description = "ARN del certificado SSL de ACM"
  type        = string
}

variable "my_ip" {
  description = "Mi dirección IP pública para acceso a RDS"
  type        = string
}