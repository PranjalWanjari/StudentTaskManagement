terraform {
  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 5.0"
    }
  }

  required_version = ">= 1.0"
}

provider "cloudflare" {}

# Create Workers KV Namespace
resource "cloudflare_workers_kv_namespace" "task_storage" {
  account_id = var.cloudflare_account_id
  title      = "StudentTaskManagementKV"
}

# Create Cloudflare Worker
resource "cloudflare_workers_script" "task_app" {
  account_id   = var.cloudflare_account_id
  script_name  = "student-task-management"
  content      = file("${path.module}/worker.js")

  bindings = [
    {
      name         = "TASKS"
      namespace_id = cloudflare_workers_kv_namespace.task_storage.id
      type         = "kv_namespace"
    }
  ]
}


resource "cloudflare_workers_script_subdomain" "task_app_url" {
  account_id  = var.cloudflare_account_id
  script_name = cloudflare_workers_script.task_app.script_name
  enabled     = true
}