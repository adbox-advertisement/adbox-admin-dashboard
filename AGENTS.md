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
Auth, Dashboard, Manage Users, User Content, Recommendations, Ads, Financials, Manage Admins, Recruitment, Rewards, Settings, Support, Video Management, and RDI own their lazy routes under `src/features/`.
Read `docs/ARCHITECTURE.md` for module ownership, data integration status, and extension steps.

Key wiring that spans several files:

- `src/routes/paths.ts` defines stable URLs; each feature's `routes.ts` owns its lazy pages;
  `src/routes/router.ts` composes public, protected, pending, and not-found routes. Protected
  routes share `DashboardLayout`. Sidebar labels/groups come from `src/config/navigation.ts`;
  unbuilt modules live in `src/config/pending-pages.ts` until they get a feature directory.
- Each feature's `index.ts` is its public API (route definitions, no eager page imports). Use
  relative imports inside a feature and `@/features/<name>` outside it. Shared code must not
  import features or the app shell, and UI must not import API services directly;
  `npm run check:architecture` enforces this.
- Theme is app-wide: one `next-themes` provider (`WorkspaceTheme` in `AppProviders`), stored as
  `adbox-theme`, toggled only from Settings → Appearance.
- Dev API: requests go to `/api/v1`; Vite proxies `/api` to `http://localhost:3005`. Point the proxy
  elsewhere with `ADBOX_API_PROXY_TARGET`, or call an API directly with `VITE_SUPER_ADMIN_API_URL`,
  in `.env.local` (see `.env.example`). Sign-in needs that backend.

RDI is a browser-only CMS and website UI. Its authentication uses the existing API independently.
It is protected by the RDI rule below.

## RDI Is Off-Limits Unless Explicitly Requested

This rule applies to every agent and every task in this repository, and it overrides any broader
instruction. **Do not change any part of RDI unless the user's current request explicitly names
RDI and asks for that change.** Work on any other part of the dashboard must leave RDI exactly as
it was: its code, appearance, behaviour, data and tests.

- A request counts as explicit only when it names RDI (for example "change the RDI home page").
  General requests do not count, even when they could seem to include RDI: "redesign the app",
  "update every page", "clean up", "fix lint", "rename X everywhere", "upgrade dependencies",
  "apply the new font/colours" and similar.
- Permission covers only the RDI change that was asked for, in that request. It does not carry
  over to later tasks or sessions, and it does not allow other RDI edits along the way.
- Without that permission, do not create, edit, move, rename, delete, reformat or refactor these:
  - `src/features/rdi/` (all of it: `cms/`, `components/`, `config/`, `data/`, `layouts/`, `lib/`,
    `pages/`, `styles/`, `routes.ts`, `types.ts`, `index.ts`)
  - `public/rdi-assets/`, `src/assets/rdi-logo.svg`, `src/assets/brand/rdi-mark.svg`,
    `docs/references/rdi-assets.json`
  - `tests/smoke/rdi.smoke.mjs`, `tests/smoke/rdi-cms.smoke.mjs`
  - `database/rdi-cms/` (also never run these scripts; they are disconnected from the frontend)
- These shared files contain RDI wiring. You may edit them for other work, but keep their RDI parts
  exactly as they are:
  - `src/routes/router.ts`: the `rdiRoutes` / `rdiPreviewRoutes` import and their use
  - `src/routes/paths.ts`: the `rdi` path
  - `src/config/navigation.ts`: the `rdiMark` import and the RDI sidebar entry
  - `src/styles/index.css`: the `.rdi-cms`, `.rdi-cms-dialog`, `.rdi-website` and `.rdi-theme` rules
    (RDI's pinned fonts and its pinned pre-Royal-Indigo colours) and the fonts loaded for them
    (DM Sans, Inter, Outfit). When you change a shared colour token, add its previous value to the
    RDI colour block so RDI keeps looking the same.
  - `tests/smoke/app.smoke.mjs`: the RDI imports, checks and bundle assertions
- RDI renders through shared code: `src/styles/index.css` tokens, `src/components/ui/`, `src/lib/`,
  the theme provider, the router, the build config and dependencies. Before changing any of these, make sure RDI's look and
  behaviour stay the same, for example by scoping the change away from `.rdi-*`. If you can't,
  stop and ask the user first.
- Never clear, migrate or rewrite RDI's browser data (local drafts, backups, bundled images,
  previews). Do not add RDI APIs, remote uploads, publishing or contact delivery.
- If a check (lint, types, tests, smoke, build) fails only in RDI, report it and leave it unfixed.
  Exclude RDI from bulk edits, such as search-and-replace, codemods or `eslint --fix`, by
  narrowing their paths.
- When in doubt whether something touches RDI, treat it as RDI and ask.

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

- Single test file: `npx vitest run src/features/settings/pages/SettingsPage.test.tsx`
  (filter by name with `-t "<test name>"`).

`npm run test:smoke` runs the Playwright browser smoke script against an already running
local server and an installed Chrome browser. It mocks all API calls. Point it at another server
with `ADBOX_TEST_URL=http://127.0.0.1:5174`, and narrow it with
`ADBOX_SMOKE_FEATURE=recruitment`, `ADBOX_SMOKE_FEATURE=appearance`, `ADBOX_SMOKE_FEATURE=users`, `ADBOX_SMOKE_FEATURE=content`, `ADBOX_SMOKE_FEATURE=support`, `ADBOX_SMOKE_FEATURE=rewards`, `ADBOX_SMOKE_FEATURE=admins` or `ADBOX_SMOKE_FEATURE=recommendations`. See README for overrides.

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
