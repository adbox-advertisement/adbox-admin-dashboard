# AGENTS.md

Shared project guidance for Codex and Claude Code working in this repository.
Codex reads this file directly; `CLAUDE.md` imports it for Claude Code. Keep shared rules here.

## Starting And Handing Off Work

- Read `docs/AI_HANDOFF.md` at the start of a task, then check `git status --short` and the
  relevant diff. The working tree may contain unfinished user work or changes from the other tool.
- Continue from the files on disk. Preserve unrelated changes and do not reset, clean, stash,
  commit, push, or deploy work unless the user requests that action.
- Before switching tools or ending a substantive task, update `docs/AI_HANDOFF.md` with the
  result, relevant files, checks actually run, remaining work, and any blockers. Keep it concise;
  do not store credentials, private account details, or chat transcripts.
- The two tools share repository files, not conversation history or account credentials.
  Follow the latest user request when it changes the handoff's scope.
- Use one editing session per checkout. If the user requests simultaneous work, use separate
  branches and worktrees with distinct tasks; do not have both tools edit the same files at once.
- See `docs/AI_WORKFLOW.md` for launch commands and the switching workflow.

## Project Context

AdBox is an enterprise-grade Online Ads Management Dashboard built with React 19, Vite,
TypeScript, Tailwind CSS v4, and shadcn/Radix primitives.

Before making structural decisions, read `docs/PROJECT_SPEC.md`. It is the product and
architecture source of truth. Before making layout decisions, read `docs/grid.md` and use it as
the responsive grid guidance.

Current implementation: `src/main.tsx` mounts `src/app/App.tsx` inside the shared providers.
Auth, Dashboard, Video Management, and RDI own their lazy routes under `src/features/`.
Read `docs/ARCHITECTURE.md` for module ownership, data integration status, and extension steps.

RDI is a browser-only CMS and website UI. Preserve its local drafts, bundled images, backups,
and previews. Do not add RDI APIs, remote uploads, publishing, or contact delivery without a new
user request. Authentication uses the existing API independently. Historical database scripts
under `database/rdi-cms/` are disconnected from the frontend; do not run them during setup.

## Architecture Rules

- Use feature-first organization.
- Keep app-level composition in `src/app/`, `src/routes/`, `src/layouts/`, or `src/App.tsx` as
  appropriate.
- Put domain screens and feature-specific logic under `src/features/<feature>/`.
- Put reusable primitives in `src/components/ui/`.
- Put reusable layout pieces in `src/components/layout/`.
- Put reusable charts, tables, and dashboard widgets in their matching `src/components/*`
  folders.
- Keep shared helpers in `src/lib/`, `src/utils/`, `src/hooks/`, `src/types/`, and
  `src/constants/`.

Preferred feature shape:

```text
src/features/<feature>/
├── api.ts
├── hooks.ts
├── types.ts
├── validation.ts
├── pages/
├── components/
└── index.ts
```

Use barrel exports where they make imports cleaner, especially at feature boundaries.

## State And Data

Use the layered API flow:

```text
Axios client -> services -> TanStack Query hooks -> components
```

- TanStack Query owns server state: fetched data, cache, mutations, invalidation, pagination,
  retries, optimistic updates, and background refetch.
- Zustand owns UI/client state only: sidebar state, theme, selected workspace, filters, modal
  visibility, command palette state, preferences, and similar local UI concerns.
- Do not duplicate API responses or server-owned data in Zustand.

## UI And Styling

- Use Tailwind CSS v4 and the existing shadcn/Radix component style.
- Reuse `src/components/ui` primitives before creating custom controls.
- Add shadcn/Radix primitives under `src/components/ui` as needed when a matching primitive is
  appropriate for the requested UI.
- Use `lucide-react` icons for app UI when an icon is needed.
- When a Figma design or implementation requires fonts or colors that are not already loaded in
  the project token system, ask the user before adding them. After approval, add them to the shared
  font/color setup instead of using repeated one-off values.
- Use the shared AdBox shadow tokens from `src/styles/index.css` (`shadow-adbox-*`) whenever they
  match the requested elevation, hover, or focus treatment.
- Preserve accessibility: labels, semantic controls, focus states, keyboard support, and useful
  aria attributes.
- Build responsive layouts from the start.
- Follow the project grid rules in `docs/grid.md`: 12 columns on desktop, 6 on tablet, 4 on large
  phones, and 1 on small phones, with clean column ratios and consistent gutters.
- For Figma implementation work, adapt generated Figma code to this project instead of pasting
  it verbatim.

## TypeScript And Code Style

- TypeScript is strict. Avoid unused locals, unused parameters, implicit `any`, and loose types.
- Use functional React components and hooks.
- Keep business logic out of presentational components when it starts to grow.
- Prefer clear types and Zod schemas at API/form boundaries.
- Do not add dependencies unless the project clearly needs them and the user agrees.
- Keep changes scoped to the task. Do not refactor unrelated files.

## Commands

- `npm run dev` starts the Vite dev server.
- `npm run build` runs `tsc -b` and creates a production build.
- `npm run lint` runs ESLint.
- `npm run preview` serves the production build locally.
- `npm run check:architecture` validates feature boundaries and runtime import cycles.
- `npm run check` runs architecture checks, ESLint, the test-file type check, the Vitest suite,
  and the production build.
- `npm run test` runs the Vitest unit/component suite once (`npm run test:watch` for watch mode).
- `npm run typecheck:test` type-checks `*.test.ts(x)` files and `src/test/` against
  `tsconfig.test.json`. Test files are excluded from `tsconfig.app.json` and `npm run build`'s
  `tsc -b` step, so this is the gate that catches type errors in tests.
- `npm run ai:codex` starts Codex in the project.
- `npm run ai:claude` starts Claude Code in the project.
- `npm run ai:check` checks shared guidance and local CLI availability without contacting models.

`npm run test:smoke` runs the Playwright browser smoke script against an already running
local server and an installed Chrome browser. It mocks all API calls. See README for overrides.

Unit and component tests live beside the code they cover as `*.test.ts`/`*.test.tsx` (Vitest +
React Testing Library, jsdom environment). Shared test setup and render helpers live in
`src/test/` (`setup.ts`, `test-utils.tsx`); import `renderWithProviders` from
`@/test/test-utils` for components that need `QueryClientProvider`/`MemoryRouter`, or
`@testing-library/react`'s plain `render` for components that don't.

## Validation Expectations

After code changes, run:

```bash
npm run build
npm run lint
npm run test
```

Add or update `*.test.ts(x)` files alongside logic you add or change (Zustand stores, validation
schemas, hooks, and interactive components are the highest-value targets). Extend the relevant
`tests/smoke/*.smoke.mjs` file for new end-to-end user flows instead of only adding unit tests.

If a command cannot be run, say why. If lint reports pre-existing warnings, call that out without
mixing them into the change unless the task asks for cleanup.
