terraform {
  backend "s3" {
    encrypt        = true
    bucket         = "bucket-data-242201299422"
    dynamodb_table = "terraform-state-lock"
    key            = "terraform.tfstate"
    region         = "eu-west-1"
  }
}

# Configuración del proveedor AWS
provider "aws" {
  region = var.aws_region
}

# Crear un grupo de seguridad para la instancia EC2
resource "aws_security_group" "ec2_sg" {
  name        = "${var.instance_name}-sg"
  description = "Grupo de seguridad para la instancia EC2"

  # Permitir SSH
  ingress {
    description = "SSH desde cualquier lugar"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Permitir HTTP
  ingress {
    description = "HTTP desde cualquier lugar"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Permitir HTTPS
  ingress {
    description = "HTTPS desde cualquier lugar"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Permitir conexion a puerto 5000
  ingress {
    description = "TCP desde 5000"
    from_port   = 5000
    to_port     = 5000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Salida para todo el tráfico
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.instance_name}-sg"
  }
}

# Crear dos instancias EC2
resource "aws_instance" "ec2_instance_1" {
  ami                    = var.ami_id
  instance_type          = var.instance_type
  key_name               = var.key_name
  vpc_security_group_ids = [aws_security_group.ec2_sg.id]
  subnet_id              = var.subnet_id

  tags = {
    Name        = "${var.instance_name}-1"
    Environment = "Production"
    Project     = "TrastManager"
  }

  # Esperar a que la instancia esté completamente lista
  provisioner "remote-exec" {
    inline = [
      "echo 'Instancia EC2 lista!'"
    ]

    connection {
      type        = "ssh"
      user        = "ubuntu" # Ajusta el usuario según la AMI
      private_key = file(var.ssh_private_key_path)
      host        = self.public_ip
    }
  }
}

resource "aws_instance" "ec2_instance_2" {
  ami                    = var.ami_id
  instance_type          = var.instance_type
  key_name               = var.key_name
  vpc_security_group_ids = [aws_security_group.ec2_sg.id]
  subnet_id              = var.subnet_id
  tags = {
    Name        = "${var.instance_name}-2"
    Environment = "Production"
    Project     = "TrastManager"
  }

  # Esperar a que la instancia esté completamente lista
  provisioner "remote-exec" {
    inline = [
      "echo 'Instancia EC2 2 lista!'"
    ]
    connection {
      type        = "ssh"
      user        = "ubuntu" # Ajusta el usuario según la AMI
      private_key = file(var.ssh_private_key_path)
      host        = self.public_ip
    }
  }
}


# 1. Crear un Load Balancer de tipo Application Load Balancer (ALB)

resource "aws_lb" "app_lb" {
  name               = "app-lb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.ec2_sg.id]
  subnets            = [var.subnet_id, var.subnet_id_2]

  enable_deletion_protection = false

  tags = {
    Name = "app-lb"
  }
}

# 1.1. Crear un grupo de seguridad para el Load Balancer
resource "aws_security_group" "lb_sg" {
  name        = "LoadBalancer-IRL-sg"
  description = "Grupo de seguridad para el Load Balancer"

  # Permitir HTTP
  ingress {
    description = "HTTP desde cualquier lugar"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Permitir HTTPS
  ingress {
    description = "HTTPS desde cualquier lugar"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Salida para todo el tráfico
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.instance_name}-sg"
  }
}


# 2. Crear un Target Group para el ALB
resource "aws_lb_target_group" "app_target_group" {
  name     = "app-target-group"
  port     = 80
  protocol = "HTTP"
  vpc_id   = var.vpc_id

  health_check {
    path                = "/"
    interval            = 30
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 2
  }

  tags = {
    Name = "app-target-group"
  }
}

# 3. Registrar las instancias EC2 en el Target Group
resource "aws_lb_target_group_attachment" "ec2_instance_1_attachment" {
  target_group_arn = aws_lb_target_group.app_target_group.arn
  target_id        = aws_instance.ec2_instance_1.id
  port             = 80
}

resource "aws_lb_target_group_attachment" "ec2_instance_2_attachment" {
  target_group_arn = aws_lb_target_group.app_target_group.arn
  target_id        = aws_instance.ec2_instance_2.id
  port             = 80
}

# 4. Configuración del listener HTTPS
resource "aws_lb_listener" "https" {
  load_balancer_arn = aws_lb.app_lb.arn
  port              = 443
  protocol          = "HTTPS"

  # Asociar el certificado SSL de ACM al listener HTTPS
  ssl_policy = "ELBSecurityPolicy-2016-08"
  certificate_arn = var.acm_certificate_arn

  # Asociar el certificado SSL (ACM) al listener HTTPS
  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.app_target_group.arn
  }
}

# 5. Crear un listener HTTP (puerto 80) y redirigir a HTTPS
resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.app_lb.arn
  port              = 5000
  protocol          = "HTTP"

  default_action {
    type = "redirect"
    redirect {
      protocol = "HTTPS"
      port     = "443"
      status_code = "HTTP_301"
    }
  }
}