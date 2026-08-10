# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Current state

AdBox is an enterprise-grade **Online Ads Management Dashboard** (React 19 + Vite + TypeScript).
The full product/architecture brief lives in [`docs/PROJECT_SPEC.md`](docs/PROJECT_SPEC.md) — read
it before making structural decisions.

**Current status:** dependencies for the full stack are installed and the empty **feature-first**
folder structure is scaffolded under `src/` (each leaf dir holds a `.gitkeep`). `src/App.tsx` /
`src/main.tsx` are still the default Vite counter demo — application code has not been written yet.

Intended architecture (see the spec): layered API stack
(`Axios client → services → TanStack Query hooks → components`); server state owned by
TanStack Query, UI/client state by Zustand (never duplicate server data in Zustand).

Scaffolded directories:
- `src/app/` — app shell, providers, router
- `src/api/` — Axios client + resource services
- `src/components/{ui,layout,dashboard,charts,tables}/`
- `src/features/{auth,dashboard,campaigns,adsets,ads,audiences,billing,analytics}/`
- `src/{hooks,lib,services,store,types,utils,constants,layouts,routes,styles}/`

Installed but **not yet wired**: Tailwind v4 (`@tailwindcss/vite`), the `@/*` path alias,
TanStack Query/Table/Virtual, React Router v7, Radix/shadcn primitives, Zustand, Zod, RHF, etc.
Wire these up as features are built.

## Commands

- `npm run dev` — start the Vite dev server with HMR
- `npm run build` — type-check the whole project (`tsc -b`) then produce a production build (`vite build`)
- `npm run lint` — run ESLint over the repo
- `npm run preview` — serve the production build locally

There is no test runner configured yet.

## Configuration notes

- **TypeScript is strict** (`tsconfig.app.json`): `strict`, `noUnusedLocals`, `noUnusedParameters`,
  `noFallthroughCasesInSwitch`, and `noUncheckedSideEffectImports` are all on. `noEmit` is set —
  Vite handles emitting; `tsc` is used only for type-checking. `moduleResolution` is `bundler` with
  `allowImportingTsExtensions`.
- TypeScript uses **project references** (`tsconfig.json` → `tsconfig.app.json` for `src`,
  `tsconfig.node.json` for build tooling). `npm run build` relies on `tsc -b`.
- ESLint (`eslint.config.js`) is flat-config based, extending `@eslint/js` recommended and
  `typescript-eslint` recommended, plus `react-hooks` and `react-refresh` plugins. `dist` is ignored.
- The React plugin uses Babel for Fast Refresh (`@vitejs/plugin-react`).
