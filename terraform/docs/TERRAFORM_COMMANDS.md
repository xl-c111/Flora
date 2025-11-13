# Terraform Command Cheat Sheet

Use this as a quick reference for the core Terraform commands you’ll run in the Flora project: what they do, when to run them, and any tips specific to this repo.

---

## terraform init

- **Purpose:** Downloads the required provider plugins, sets up the backend defined in `backend.tf`, and prepares the working directory.
- **When to run:**
  - The very first time you enter a Terraform directory (root or an environment folder like `terraform/environments/prod`).
  - After switching branches/modules when providers or backend config changed.
  - After cloning the repo or deleting the `.terraform` folder.
- **Tip:** Run `terraform init -upgrade` if you intentionally bumped provider versions in `versions.tf`.

---

## terraform plan

- **Purpose:** Shows a preview of what Terraform will create, change, or destroy without making actual modifications.
- **When to run:**
  - Before every `apply`, to confirm the changes look correct.
  - When reviewing someone else’s infrastructure change (pair it with `tfplan` artifacts if needed).
- **Tip:** Use `terraform plan -out=tfplan` to save the plan for later `apply tfplan`.

---

## terraform apply

- **Purpose:** Executes the changes proposed in the last plan (or regenerates and applies if no plan file is supplied).
- **When to run:**
  - After reviewing the plan and you’re ready to make those changes live.
  - Anytime you’ve updated Terraform code or variables and want AWS to match.
- **Tip:** If you saved a plan (`tfplan`), run `terraform apply tfplan` to guarantee you’re applying exactly what you reviewed.

---

## terraform output

- **Purpose:** Prints the values defined in `outputs.tf` (S3 bucket name, CloudFront distribution ID, EC2 IP).
- **When to run:**
  - After provisioning, when you need bucket/distribution IDs for deployment commands (e.g., `aws s3 sync`, `aws cloudfront create-invalidation`).
  - During debugging to confirm resource IDs.
- **Tip:** Use `terraform output -raw <name>` to get plain text without quotes (perfect for scripting).

---

## terraform destroy (bonus)

- **Purpose:** Tears down everything Terraform created.
- **When to run:** Only when you intentionally want to remove the entire stack (e.g., cleaning up dev resources to save money).
- **Tip:** Always double-check the plan before confirming destroys, especially in shared accounts.

---

### Workflow Examples

```bash
# Fresh checkout or new environment
cd terraform/environments/prod
terraform init
terraform plan -out=tfplan
terraform apply tfplan

# Later, after code changes
terraform plan
terraform apply

# Need bucket/distribution IDs for frontend deploy
terraform output -raw frontend_bucket_name
terraform output -raw cloudfront_distribution_id
```

Keep this file handy to stay confident with Terraform operations during interviews or day-to-day work.

