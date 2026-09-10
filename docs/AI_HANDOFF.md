# Current handoff

Update this file when handing work between Claude Code and Codex. Keep current facts and
actionable next steps; replace stale task notes instead of appending a conversation log.
Confirm the working tree before relying on this snapshot.

## Current task

Added a Vitest + React Testing Library unit/component test suite (the project previously had
only the Playwright e2e smoke suite) and expanded the e2e suite to cover Dashboard and Video
Management, which previously only got a route-existence check.

## Changes

- `vitest.config.ts`, `src/test/setup.ts` (jsdom polyfills: matchMedia, ResizeObserver,
  IntersectionObserver, URL.createObjectURL, crypto.randomUUID), `src/test/test-utils.tsx`
  (`renderWithProviders` = QueryClientProvider + MemoryRouter).
- `tsconfig.app.json` now excludes `*.test.ts(x)` and `src/test/`; `tsconfig.test.json` (new)
  covers them separately via `npm run typecheck:test`, so test files never block or slow
  `npm run build`'s `tsc -b` step, and don't trip the `check:architecture` script's "UI must
  access server data through feature query/mutation hooks" rule when a test mocks an `api.ts`
  module directly.
- `package.json`: `test` (`vitest run`), `test:watch`, `typecheck:test`; `check` now runs
  architecture → lint → typecheck:test → test → build.
- `eslint.config.js`: `react-refresh/only-export-components` is off for `*.test.{ts,tsx}` and
  `src/test/**` (test helpers legitimately export non-component utilities).
- Unit/component tests added (119 tests, all passing): `src/lib/utils.test.ts`,
  `src/lib/auth-session.test.ts`, `src/features/videos/store/folder-store.test.ts`,
  `src/features/videos/data/schools.test.ts`, `src/features/rdi/cms/lib/document.test.ts`,
  `src/features/rdi/cms/lib/media.test.ts`, `src/features/rdi/cms/store.test.ts`,
  `src/features/dashboard/components/DashboardMetricCards.test.tsx`,
  `src/features/videos/components/upload/MediaUpload.test.tsx`,
  `src/features/videos/components/upload/AdboxPostPreview.test.tsx`,
  `src/features/videos/components/upload/SchoolSelection.test.tsx`,
  `src/features/videos/components/folders/UploadFolders.test.tsx`,
  `src/features/auth/pages/LoginPage.test.tsx`.
- e2e additions: `tests/smoke/dashboard.smoke.mjs` (KPI tiles/trend badges, chart, date-range
  dropdown, geography region switching, top publishers, pending approvals, earning breakdown)
  and `tests/smoke/video-management.smoke.mjs` (school search incl. GIS, tab order
  Photos/Videos/Text, folder create/rename, text+hashtag+reference live preview, Posts page),
  both wired into `tests/smoke/app.smoke.mjs`.
- `AGENTS.md` and `README.md` updated: the "no unit-test runner configured" line is gone: new
  commands documented, and `Validation Expectations` now includes `npm run test`.

## Not covered by the new unit suite (scoping decisions, not oversights)

- `readImage()` in `src/features/rdi/cms/lib/media.ts` (needs `createImageBitmap`/`FileReader`
  mocking) — the RDI e2e smoke suite already exercises real image upload end to end.
- `useCmsStore`'s cross-tab `storage` event listener and `beforeunload` handler — browser-
  integration-shaped, already covered by the e2e suite's draft-recovery checks.
- Most RDI CMS UI components (`CollectionEditor`, `ContentField`, `AssetPicker`, etc.) — the
  existing `tests/smoke/rdi-cms.smoke.mjs` already exercises these thoroughly end to end
  (undo/redo, visibility, SEO, media replacement, collection edits, backup export/import,
  corrupt-draft and storage-full recovery); adding a parallel unit layer for that surface would
  be high effort for low incremental coverage.

## Existing application work to preserve

RDI is a browser-only CMS and website UI: six editable pages, live previews, local images and
uploads, shared settings, undo/redo, local draft persistence, and backup restore. There is no
RDI API or publishing — do not add one without a new user request. See `README.md` and
`docs/ARCHITECTURE.md` for feature details.

## Validation and next steps

- `npm run check` (architecture, lint, typecheck:test, test, build) passes.
- `npm run test:smoke` passes end to end against a freshly started `npm run dev` server,
  including the two new check files.
- `npm install` added `vitest`, `@testing-library/react`, `@testing-library/jest-dom`,
  `@testing-library/user-event`, `jsdom` as devDependencies (`npm audit` reports pre-existing
  transitive vulnerabilities in dev tooling; not investigated as part of this task).
- No commits, pushes, or deployments were made by this task.
- Next step for whoever picks this up: keep adding `*.test.ts(x)` files alongside future logic
  changes (see `AGENTS.md` → Validation Expectations) rather than letting unit coverage lag
  behind the e2e suite again.
