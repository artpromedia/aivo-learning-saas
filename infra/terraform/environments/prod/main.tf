terraform {
  required_version = ">= 1.7.0"

  required_providers {
    hcloud = {
      source  = "hetznercloud/hcloud"
      version = "~> 1.48"
    }
  }

  backend "s3" {
    bucket                      = "aivo"
    key                         = "prod/terraform.tfstate"
    region                      = "auto"
    endpoints                   = { s3 = "https://56f34d4c32d7deeeb917c5e27e0083ac.r2.cloudflarestorage.com" }
    skip_credentials_validation = true
    skip_metadata_api_check     = true
    skip_region_validation      = true
    skip_requesting_account_id  = true
    skip_s3_checksum            = true
    use_path_style              = true
  }
}

provider "hcloud" {
  token = var.hcloud_token
}

# ─────────────────────────────────────────────
# Variables
# ─────────────────────────────────────────────

variable "hcloud_token" {
  description = "Hetzner Cloud API token"
  type        = string
  sensitive   = true
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "prod"
}

variable "location" {
  description = "Hetzner datacenter location"
  type        = string
  default     = "fsn1"
}

variable "k8s_version" {
  description = "Kubernetes version"
  type        = string
  default     = "1.29"
}

# ─────────────────────────────────────────────
# Network
# ─────────────────────────────────────────────

resource "hcloud_network" "aivo" {
  name     = "aivo-${var.environment}"
  ip_range = "10.0.0.0/16"
}

resource "hcloud_network_subnet" "k8s" {
  network_id   = hcloud_network.aivo.id
  type         = "cloud"
  network_zone = "eu-central"
  ip_range     = "10.0.1.0/24"
}

# ─────────────────────────────────────────────
# Kubernetes Cluster (Hetzner Cloud)
# ─────────────────────────────────────────────

resource "hcloud_server" "k8s_control_plane" {
  name        = "aivo-cp-${var.environment}"
  server_type = "cx32"
  image       = "ubuntu-24.04"
  location    = var.location
  ssh_keys    = [hcloud_ssh_key.deploy.id]

  network {
    network_id = hcloud_network.aivo.id
    ip         = "10.0.1.10"
  }

  labels = {
    environment = var.environment
    role        = "control-plane"
    project     = "aivo"
  }

  depends_on = [hcloud_network_subnet.k8s]
}

resource "hcloud_server" "k8s_worker" {
  count       = 3
  name        = "aivo-worker-${var.environment}-${count.index + 1}"
  server_type = "cx42"
  image       = "ubuntu-24.04"
  location    = var.location
  ssh_keys    = [hcloud_ssh_key.deploy.id]

  network {
    network_id = hcloud_network.aivo.id
    ip         = "10.0.1.${20 + count.index}"
  }

  labels = {
    environment = var.environment
    role        = "worker"
    project     = "aivo"
  }

  depends_on = [hcloud_network_subnet.k8s]
}

# ─────────────────────────────────────────────
# SSH Key
# ─────────────────────────────────────────────

resource "hcloud_ssh_key" "deploy" {
  name       = "aivo-deploy-${var.environment}"
  public_key = var.ssh_public_key
}

variable "ssh_public_key" {
  description = "SSH public key for server access"
  type        = string

  validation {
    condition     = length(var.ssh_public_key) > 0
    error_message = "ssh_public_key must not be empty. Set the SSH_PUBLIC_KEY secret in GitHub."
  }
}

# ─────────────────────────────────────────────
# Load Balancer
# ─────────────────────────────────────────────

resource "hcloud_load_balancer" "ingress" {
  name               = "aivo-lb-${var.environment}"
  load_balancer_type = "lb11"
  location           = var.location

  labels = {
    environment = var.environment
    project     = "aivo"
  }
}

resource "hcloud_load_balancer_network" "ingress" {
  load_balancer_id = hcloud_load_balancer.ingress.id
  network_id       = hcloud_network.aivo.id
  ip               = "10.0.1.100"
}

resource "hcloud_load_balancer_target" "workers" {
  count            = 3
  type             = "server"
  load_balancer_id = hcloud_load_balancer.ingress.id
  server_id        = hcloud_server.k8s_worker[count.index].id
}

resource "hcloud_load_balancer_service" "https" {
  load_balancer_id = hcloud_load_balancer.ingress.id
  protocol         = "tcp"
  listen_port      = 443
  destination_port = 443
}

resource "hcloud_load_balancer_service" "http" {
  load_balancer_id = hcloud_load_balancer.ingress.id
  protocol         = "tcp"
  listen_port      = 80
  destination_port = 80
}

# ─────────────────────────────────────────────
# Firewall
# ─────────────────────────────────────────────

resource "hcloud_firewall" "k8s" {
  name = "aivo-fw-${var.environment}"

  rule {
    direction  = "in"
    protocol   = "tcp"
    port       = "22"
    source_ips = ["0.0.0.0/0", "::/0"]
  }

  rule {
    direction  = "in"
    protocol   = "tcp"
    port       = "80"
    source_ips = ["0.0.0.0/0", "::/0"]
  }

  rule {
    direction  = "in"
    protocol   = "tcp"
    port       = "443"
    source_ips = ["0.0.0.0/0", "::/0"]
  }

  rule {
    direction  = "in"
    protocol   = "tcp"
    port       = "6443"
    source_ips = ["10.0.0.0/16"]
    description = "K8s API server (internal only)"
  }

  rule {
    direction  = "in"
    protocol   = "tcp"
    port       = "10250"
    source_ips = ["10.0.0.0/16"]
    description = "Kubelet API"
  }
}

resource "hcloud_firewall_attachment" "k8s" {
  firewall_id = hcloud_firewall.k8s.id
  label_selectors = ["project=aivo"]
}

# ─────────────────────────────────────────────
# Volumes (persistent storage)
# ─────────────────────────────────────────────

resource "hcloud_volume" "postgres_data" {
  name     = "aivo-pg-data-${var.environment}"
  size     = 100
  location = var.location

  labels = {
    environment = var.environment
    project     = "aivo"
    role        = "database"
  }
}

resource "hcloud_volume_attachment" "postgres_data" {
  volume_id = hcloud_volume.postgres_data.id
  server_id = hcloud_server.k8s_worker[0].id
  automount = true
}

# ─────────────────────────────────────────────
# Outputs
# ─────────────────────────────────────────────

output "control_plane_ip" {
  value       = hcloud_server.k8s_control_plane.ipv4_address
  description = "Control plane public IP"
}

output "worker_ips" {
  value       = hcloud_server.k8s_worker[*].ipv4_address
  description = "Worker node public IPs"
}

output "load_balancer_ip" {
  value       = hcloud_load_balancer.ingress.ipv4
  description = "Load balancer public IP"
}

output "network_id" {
  value       = hcloud_network.aivo.id
  description = "Hetzner network ID"
}
