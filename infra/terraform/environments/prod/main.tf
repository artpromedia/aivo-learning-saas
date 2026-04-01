# ─────────────────────────────────────────────────────────────
# AIVO Platform — Hetzner Dedicated Server Infrastructure
# ─────────────────────────────────────────────────────────────
#
# This project runs on 4 Hetzner Robot DEDICATED servers (not Cloud VMs).
# Dedicated servers are provisioned via Hetzner Robot console and configured
# manually per HETZNER_DEPLOYMENT_GUIDE.md. They CANNOT be managed by the
# hcloud Terraform provider (which only targets Hetzner Cloud resources).
#
# Infrastructure managed here:
#   - Terraform state backend (Cloudflare R2)
#   - Server inventory as locals (documentation-as-code)
#
# Infrastructure managed OUTSIDE Terraform:
#   - Hetzner Robot dedicated servers (ordered via Robot console)
#   - Hetzner vSwitch (VLAN 4000, 10.0.0.0/24, configured via Robot console)
#   - UFW firewall rules (configured per-server via SSH)
#   - K3s cluster (installed via k3s.io install script)
#   - Kubernetes workloads (deployed via Helm — see deploy-staging.yml)
#   - Cloudflare DNS, WAF, R2, Workers (managed via Cloudflare dashboard)
#
# See: HETZNER_DEPLOYMENT_GUIDE.md for full setup procedures.
# ─────────────────────────────────────────────────────────────

terraform {
  required_version = ">= 1.7.0"

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

# ─────────────────────────────────────────────
# Variables
# ─────────────────────────────────────────────

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "prod"
}

# ─────────────────────────────────────────────
# Server Inventory (Hetzner Robot Dedicated)
# ─────────────────────────────────────────────
# These are DOCUMENTATION ONLY — dedicated servers are not managed by Terraform.
# Source of truth: HETZNER_DEPLOYMENT_GUIDE.md

locals {
  servers = {
    "aivo-db1" = {
      role        = "database"
      private_ip  = "10.0.0.1"
      location    = "HEL1"
      cpu         = "Xeon W-2145 8C/16T @ 4.5GHz"
      ram         = "128GB ECC"
      storage     = "2x1.92TB Datacenter SSD"
      services    = ["postgresql", "pgbouncer", "redis"]
      k3s_role    = "agent"
      k3s_labels  = ["role=database"]
      k3s_taints  = ["role=database:NoSchedule"]
    }
    "aivo-app1" = {
      role        = "app-primary"
      private_ip  = "10.0.0.2"
      location    = "HEL1"
      cpu         = "i9-9900K 8C/16T @ 5.0GHz"
      ram         = "128GB"
      storage     = "2x1TB NVMe"
      services    = ["k3s-control-plane", "ingress-nginx", "monitoring", "typescript-services"]
      k3s_role    = "server"
      k3s_labels  = ["role=app"]
      k3s_taints  = []
    }
    "aivo-app2" = {
      role        = "app-secondary"
      private_ip  = "10.0.0.3"
      location    = "HEL1"
      cpu         = "i7-8700 6C/12T @ 4.6GHz"
      ram         = "128GB"
      storage     = "3x1TB NVMe"
      services    = ["k3s-agent", "minio", "backup-mirror"]
      k3s_role    = "agent"
      k3s_labels  = ["role=app"]
      k3s_taints  = []
    }
    "aivo-ml1" = {
      role        = "ml"
      private_ip  = "10.0.0.4"
      location    = "HEL1"
      cpu         = "Ryzen 9 5950X 16C/32T @ 4.9GHz"
      ram         = "128GB ECC"
      storage     = "2x3.84TB Datacenter SSD"
      services    = ["k3s-agent", "ai-svc"]
      k3s_role    = "agent"
      k3s_labels  = ["role=ml"]
      k3s_taints  = []
    }
  }

  # vSwitch configuration (Hetzner Robot, not Cloud Network)
  vswitch = {
    vlan_id  = 4000
    ip_range = "10.0.0.0/24"
    location = "HEL1"
  }
}

# ─────────────────────────────────────────────
# Outputs
# ─────────────────────────────────────────────

output "server_inventory" {
  value       = { for name, s in local.servers : name => {
    role       = s.role
    private_ip = s.private_ip
    location   = s.location
    k3s_role   = s.k3s_role
  }}
  description = "Hetzner dedicated server inventory (documentation only)"
}

output "vswitch_config" {
  value       = local.vswitch
  description = "Hetzner vSwitch configuration (documentation only)"
}
