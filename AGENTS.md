<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- convex-ai-start -->
This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read `convex/_generated/ai/guidelines.md` first** for important guidelines on how to correctly use Convex APIs and patterns. The file contains rules that override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running `npx convex ai-files install`.
<!-- convex-ai-end -->

<!-- BEGIN:arc-skills-policy -->
## ARC Skills Policy

Use these ARC skills when the task matches their scope. If a skill name is explicitly provided by the user, run that skill first.

### Available ARC Skills
- `arc-contract-review`
- `arc-creating-user-stories`
- `arc-defining-work`
- `arc-ideabrowser-openclaw-flow`
- `arc-implementation-plan-progress`
- `arc-planning-github-issues`
- `arc-planning-work`
- `arc-prd-to-issues`
- `arc-project-deploy-portfolio-sync`

### Trigger Rules
- IdeaBrowser-origin projects: run `arc-ideabrowser-openclaw-flow` first, then `arc-implementation-plan-progress`.
- When asked for plans/roadmaps/progress updates: run `arc-implementation-plan-progress`.
- When converting product intent to execution artifacts:
  - PRD to issues: `arc-prd-to-issues`
  - planning work or issue breakdown: `arc-planning-work`, `arc-planning-github-issues`, `arc-defining-work`, `arc-creating-user-stories`
- Contract/compliance review tasks: `arc-contract-review`.
- Deploy + portfolio sync requests: `arc-project-deploy-portfolio-sync`.

### Execution Defaults
- Prefer Bun for install/run commands.
- Do not push, merge, or deploy unless explicitly requested by the user.
- Keep `IMPLEMENTATION_PLAN.md` and `progress.txt` synchronized whenever scope changes.
<!-- END:arc-skills-policy -->
