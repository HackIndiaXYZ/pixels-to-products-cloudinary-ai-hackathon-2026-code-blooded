# Infrastructure — Pravaha

Phase 24 of the original brief asks for infrastructure to be **reproducible, understandable, deployable, and cost-conscious.** This document exists to answer, in one place, how this project hits all four without Terraform, CDK, SAM, or CloudFormation — a decision already made in `docs/TRD.md` and `docs/DECISIONS.md`, consolidated here because "where is the infrastructure documented" shouldn't require reading three files to answer.

## What's Actually Provisioned

| Layer | Provider | Provisioning method |
|---|---|---|
| App hosting | Vercel | Connected directly to the GitHub repo — every push builds and deploys automatically |
| Database | Neon (free tier) | Created once, by hand, through the provider's dashboard — a single Postgres instance, no cluster to manage |
| Media, AI, delivery | Cloudinary (free tier) | A single account, created once |
| DNS/CDN | Vercel + Cloudinary's own CDN | No separate CDN configuration — both providers handle this natively |

## Why No Formal IaC Tool

Terraform, AWS CDK, SAM, and CloudFormation all exist to manage infrastructure that's complex enough to need a declarative model, state tracking, and repeatable multi-resource provisioning. This project has exactly two provisioned resources (a Vercel project, a Postgres instance), both created once, both changing rarely if ever. Introducing a formal IaC tool here would mean maintaining state files and tooling for infrastructure that a dashboard click already handles correctly — the exact overengineering `docs/TRD.md` and `docs/DECISIONS.md` already argue against elsewhere in this project, applied consistently here too.

## How "Reproducible" Is Actually Achieved

Without Terraform, reproducibility comes from documentation instead of code: `SETUP.md` is the literal reproduction recipe — anyone, including a future team member, can stand up an identical environment by following it top to bottom. `.env.example` names every configuration value that differs between environments. That combination is the right amount of "infrastructure as code" for two resources; it would be the wrong amount for twenty.

## What Would Change This Decision

If this project ever needed more than a handful of provisioned resources, multiple environments beyond dev/production, or infrastructure that changes often enough that dashboard clicks become error-prone, that would be the point to revisit this decision — not before. `docs/PRD.md`'s Future Roadmap (institute workspaces, `docs/VISION.md`) is the kind of growth that would eventually justify it; nothing in the current P0/P1 scope does.
