# Current handoff

Update this file when handing work between Claude Code and Codex. Keep current facts and
actionable next steps; replace stale task notes instead of appending a conversation log.
Confirm the working tree before relying on this snapshot.

## Current task

Completed the repository setup for both Claude Code and Codex with shared instructions,
terminal launch commands, and a documented handoff workflow.

## Changes

- `AGENTS.md` is the shared source of project rules, including RDI's local-only scope.
- `CLAUDE.md` imports that file using Claude Code's supported import syntax.
- `package.json` provides `ai:codex`, `ai:claude`, and `ai:check`.
- `scripts/check-ai-tools.mjs` checks guidance files and CLI availability without a model call.
- `docs/AI_WORKFLOW.md` explains startup, switching tools, and validation.
- `.gitignore` excludes personal Claude settings and local worktree folders.

## Existing application work to preserve

The working tree contains the completed RDI static website and local CMS changes from the
preceding task, including removal of its old API/editor implementation. Preserve those changes.
RDI has six editable pages, live previews, local images and uploads, shared settings,
undo/redo, local draft persistence, and backup restore. There is no RDI API or publishing.
See `README.md` and `docs/ARCHITECTURE.md` for the current feature details.

## Validation and next steps

- Previous RDI task: architecture, lint, production build, and production browser checks passed.
- Dual-tool setup: `npm run check`, `npm run ai:check`, both npm launch commands with
  `--version`, and `git diff --check` passed. Personal settings/worktree ignore rules were checked.
- Claude Code 2.1.236 was installed through Homebrew; Codex CLI 0.153.4 was already available.
  Both version commands run successfully. No model sessions or account sign-ins were initiated.
- User next step: launch `npm run ai:claude` or `npm run ai:codex` in their terminal and sign in
  if prompted. Account sign-in stays with each tool and is not shared.
- No commits, pushes, or deployments were made by this task.
