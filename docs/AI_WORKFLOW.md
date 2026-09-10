# Working with Claude Code and Codex

Both tools work on the same React application and use the same project rules. Run commands
from the repository root in your terminal.

## Start a tool

```bash
npm run ai:check
```

This checks the shared instruction files and whether each CLI can run. It uses version
commands only; it does not send project content to a model or check account authentication.

Choose the tool you want to use:

```bash
npm run ai:codex
```

```bash
npm run ai:claude
```

Follow the selected tool's sign-in flow on first launch. Credentials belong to that tool's
account setup. No AI API keys are required in the application's `.env` files for this workflow.
The application itself does not call either coding assistant.

You can also open this folder in the Codex app or use either tool's editor extension.
The npm commands are shortcuts for the terminal tools, which must be installed separately.
See the official [Codex CLI setup](https://developers.openai.com/codex/cli/) and
[Claude Code setup](https://code.claude.com/docs/en/setup) if a command is missing.

On a Mac with Homebrew, install Claude Code with:

```bash
brew install --cask claude-code
```

Homebrew installations can be updated with `brew upgrade claude-code`.
These tools are developer utilities and are not application dependencies.

## Shared instructions

| File | Purpose |
| --- | --- |
| `AGENTS.md` | Shared architecture, styling, validation, and working rules |
| `CLAUDE.md` | Imports `AGENTS.md` for Claude Code |
| `docs/AI_HANDOFF.md` | Current result, validation evidence, and next steps |
| `docs/ARCHITECTURE.md` | Implemented modules and integration boundaries |
| `docs/PROJECT_SPEC.md` | Product and architecture requirements |
| `docs/grid.md` | Responsive layout rules |

Codex discovers `AGENTS.md` directly, and Claude Code supports importing it through
`@AGENTS.md` in `CLAUDE.md`. This keeps the rules in one place. See the official
[Codex guidance](https://developers.openai.com/codex/guides/agents-md/) and
[Claude Code import guidance](https://code.claude.com/docs/en/memory#agentsmd).
Restart an existing tool session after changing startup instructions.

Keep personal Claude preferences in the ignored `CLAUDE.local.md` or
`.claude/settings.local.json`. Shared project instructions belong in `AGENTS.md`.

## Switch tools

1. Ask the current tool: “Update docs/AI_HANDOFF.md with what changed, checks run, and next steps.”
2. Let that editing session finish, then launch the other tool from this checkout.
3. Tell it: “Read the shared instructions and docs/AI_HANDOFF.md, inspect the current diff,
   and continue with [your next task].”

Saved files and the handoff carry work between tools. Chat history, sign-ins, and personal
memory stay separate. Uncommitted files remain available when switching in the same checkout.
Check `git status --short` before continuing so existing work is preserved.

For simultaneous tasks, use distinct branches and Git worktrees and give each tool a separate
task. A new worktree starts from a commit; it does not automatically contain this checkout's
uncommitted work. Review and commit the intended baseline before using it in another worktree.

## Validate changes

Both tools use the existing project commands:

```bash
npm run check
```

This runs architecture checks, ESLint, TypeScript, and the production build. For changed
browser workflows, start the app in another terminal with `npm run dev`, then run:

```bash
npm run test:smoke
```

Browser checks use mocked API responses. RDI remains a local CMS and website preview;
connecting APIs or publishing requires a separate user request.
