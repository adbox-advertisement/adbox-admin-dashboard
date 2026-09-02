# AGENTS.md

Project guidance for Codex and other coding agents working in this repository.

## Project Context

AdBox is an enterprise-grade Online Ads Management Dashboard built with React 19, Vite,
TypeScript, Tailwind CSS v4, and shadcn/Radix primitives.

Before making structural decisions, read `docs/PROJECT_SPEC.md`. It is the product and
architecture source of truth. Before making layout decisions, read `docs/grid.md` and use it as
the responsive grid guidance.

Current implementation note: the login screen is implemented under `src/features/auth/` and
`src/App.tsx` currently renders that auth feature page.

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

There is no test runner configured yet.

## Validation Expectations

After code changes, run:

```bash
npm run build
npm run lint
```

If a command cannot be run, say why. If lint reports pre-existing warnings, call that out without
mixing them into the change unless the task asks for cleanup.
