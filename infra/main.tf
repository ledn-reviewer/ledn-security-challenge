# Cloud module (excerpt) — REVIEW TARGET.
#
# This is a trimmed, representative slice of the fictional Ledn Token platform's
# infrastructure. It is NOT applied anywhere; treat it as a design/config review.
# See README.md in this directory for the deliverable.

terraform {
  required_providers {
    aws = { source = "hashicorp/aws", version = "~> 5.0" }
  }
}

# --- Edge: Cloudflare fronts the API and injects a shared secret header --------
# The origin only accepts requests that carry this header.
variable "edge_shared_secret" {
  type    = string
  default = "cf-origin-shared-2023"
}

# --- Origin: the API service on EC2 -------------------------------------------
resource "aws_security_group" "api_origin" {
  name        = "ledn-token-api-origin"
  description = "API origin"

  ingress {
    from_port   = 4000
    to_port     = 4000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_instance" "api" {
  ami                  = "ami-0abcdef1234567890"
  instance_type        = "t3.small"
  vpc_security_group_ids = [aws_security_group.api_origin.id]
  iam_instance_profile = aws_iam_instance_profile.api.name
  # The app trusts var.edge_shared_secret as proof that a request came through
  # Cloudflare (see app env EDGE_SHARED_SECRET in terraform-plan.txt).
}

# --- Secret: the token-signing key --------------------------------------------
resource "aws_secretsmanager_secret" "idp_signing_key" {
  name = "ledn-token/idp-signing-key"
}

# --- IAM: the instance role ----------------------------------------------------
resource "aws_iam_role" "api" {
  name = "ledn-token-api-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{ Effect = "Allow", Principal = { Service = "ec2.amazonaws.com" }, Action = "sts:AssumeRole" }]
  })
}

resource "aws_iam_role_policy" "api" {
  name = "ledn-token-api-policy"
  role = aws_iam_role.api.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      { Effect = "Allow", Action = ["secretsmanager:GetSecretValue"], Resource = "*" }
    ]
  })
}

resource "aws_iam_instance_profile" "api" {
  name = "ledn-token-api-profile"
  role = aws_iam_role.api.name
}
