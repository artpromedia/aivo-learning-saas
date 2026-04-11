terraform {
  required_providers {
    hcloud = {
      source  = "hetznercloud/hcloud"
      version = "~> 1.45"
    }
  }

  backend "s3" {
    bucket = "aivo-terraform-state"
    key    = "secondary-region/terraform.tfstate"
    region = "eu-central-1"
  }
}

provider "hcloud" {
  token = var.hcloud_token
}

variable "hcloud_token" {
  description = "Hetzner Cloud API token"
  type        = string
  sensitive   = true
}

variable "ssh_key_ids" {
  description = "SSH key IDs for server access"
  type        = list(number)
}

variable "primary_db_ip" {
  description = "IP address of the primary PostgreSQL server in HEL1"
  type        = string
}

variable "ssh_allowed_ips" {
  description = "CIDR blocks allowed for SSH access (bastion/VPN only)"
  type        = list(string)
  default     = ["10.0.0.0/16"]
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "production"
}

locals {
  location = "fsn1"
  labels = {
    environment = var.environment
    managed_by  = "terraform"
    region      = "fsn1"
    role        = "secondary"
  }
}

resource "hcloud_network" "secondary" {
  name     = "aivo-secondary-network"
  ip_range = "10.1.0.0/16"
  labels   = local.labels
}

resource "hcloud_network_subnet" "secondary_subnet" {
  network_id   = hcloud_network.secondary.id
  type         = "cloud"
  network_zone = "eu-central"
  ip_range     = "10.1.0.0/24"
}

resource "hcloud_firewall" "db_replica" {
  name   = "aivo-db-replica-fw"
  labels = local.labels

  rule {
    direction  = "in"
    protocol   = "tcp"
    port       = "5432"
    source_ips = [
      "${var.primary_db_ip}/32",
      "10.0.0.0/16",
      "10.1.0.0/16",
    ]
    description = "PostgreSQL from primary and internal networks"
  }

  rule {
    direction  = "in"
    protocol   = "tcp"
    port       = "22"
    source_ips = var.ssh_allowed_ips
    description = "SSH access (restricted to bastion/VPN)"
  }

  rule {
    direction       = "out"
    protocol        = "tcp"
    port            = "any"
    destination_ips = ["0.0.0.0/0", "::/0"]
    description     = "All outbound"
  }
}

resource "hcloud_server" "db_replica" {
  name        = "aivo-db-replica-fsn1"
  server_type = "cpx31"
  image       = "ubuntu-22.04"
  location    = local.location
  ssh_keys    = var.ssh_key_ids
  labels      = merge(local.labels, { service = "postgresql-replica" })

  firewall_ids = [hcloud_firewall.db_replica.id]

  network {
    network_id = hcloud_network.secondary.id
    ip         = "10.1.0.10"
  }

  user_data = templatefile("${path.module}/cloud-init-db-replica.yaml", {
    primary_db_ip = var.primary_db_ip
  })
}

resource "hcloud_server" "app_standby" {
  name        = "aivo-app-standby-fsn1"
  server_type = "cpx41"
  image       = "ubuntu-22.04"
  location    = local.location
  ssh_keys    = var.ssh_key_ids
  labels      = merge(local.labels, { service = "k3s-standby" })

  firewall_ids = [hcloud_firewall.db_replica.id]

  network {
    network_id = hcloud_network.secondary.id
    ip         = "10.1.0.20"
  }
}

output "db_replica_ip" {
  value       = hcloud_server.db_replica.ipv4_address
  description = "Public IP of the PostgreSQL replica in FSN1"
}

output "app_standby_ip" {
  value       = hcloud_server.app_standby.ipv4_address
  description = "Public IP of the standby app server in FSN1"
}

output "network_id" {
  value       = hcloud_network.secondary.id
  description = "Secondary region network ID"
}
