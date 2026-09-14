# Current handoff

Read this alongside `AGENTS.md` and confirm the working tree before continuing.

## Current state — AdBox Studio removed

The standalone AdBox Studio experiment has been **deleted by the user**. Do not recreate it
without a new request.

- `output/adbox-studio/` (the built HTML, `source/`, `build.mjs`, `verify.mjs`, README and
  downloaded institution artwork) is gone. `output/` now holds only
  `campus-creator-casting-call/`.
- `/Users/pamelanutsukpo/Desktop/adbox-studio.html` and the dated build backup are gone.
  Only the supplied original remains, untouched, at
  `/Users/pamelanutsukpo/Desktop/adbox-studio-original-2026-09-12.html`.
- Nothing in `src/`, `tests/` or the build config ever referenced the studio, so its removal
  does not affect the dashboard. Confirmed by search: no `adbox-studio` references remain in
  any source, test, config or HTML file.

Everything the studio work touched lived under `output/` and on the Desktop. The dashboard,
auth profile implementation and RDI were never modified by it.

## Checks actually run

- `npm run check` passes end to end on the current tree:
  - `check:architecture` — feature boundaries, API layering and runtime imports, 151 files.
  - `lint` — ESLint clean, no warnings.
  - `typecheck:test` — `tsc -p tsconfig.test.json` clean.
  - `test` — Vitest: 25 files, 199 tests passed.
  - `build` — `tsc -b && vite build` succeeded.
- `index.html` now points the favicon at `src/assets/brand/mainlogo.svg` (a user change).
  The asset exists and Vite emits it as `dist/assets/mainlogo-*.svg`; verified in
  `dist/index.html`.
- `tests/smoke/*.smoke.mjs` were not run this round — they need a running local server and an
  installed Chrome. Run `npm run test:smoke` against `npm run dev` if you need that coverage.
- No commits, pushes or deployments.

## Work in progress to preserve

- Dashboard header displays current email and readable roles from `GET /auth/me` through
  Axios → auth API → TanStack Query → `CurrentAdminProfile`; no profile in Zustand/session
  storage. It includes loading/retry/unassigned states, wraps long email/multiple roles,
  clears previous profile cache at login, and supports token refresh on protected `/auth/me`.
  Relevant files: `src/features/auth/`, `src/api/client.ts`, `DashboardLayout.tsx`,
  `DashboardHeader.tsx`, associated tests, smoke scripts and `docs/ARCHITECTURE.md`.
  Prior full `npm run check`, mocked browser smoke and responsive account checks passed.
  Live authenticated `/auth/me` was not exercised.
- The modified files under `src/features/admins/` predate these tasks. Preserve them.
- Untracked and in progress: `src/features/auth/validation.ts`, `src/features/auth/components/`,
  and the new `*.test.ts(x)` files for `src/api/client.ts` and the auth API/hooks.
- RDI remains a browser-only CMS/website with local drafts, images, backups and previews.
  Do not add APIs, publishing or contact delivery without a new request.
- `output/campus-creator-casting-call/` holds the earlier editable DOCX, matching PDF and
  editing notes: Arial Rounded headings, Trebuchet MS body, 30 placeholders. Original Desktop
  PDF unchanged. PDF rendered locally because Word automation failed; native Word pagination
  not verified. Confirm programme details and replace placeholders before release.
