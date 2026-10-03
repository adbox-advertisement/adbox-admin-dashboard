# Current handoff

Read alongside `AGENTS.md` and confirm the working tree before continuing.

## Logout moved to Settings (2026-10-03)

- Removed the Log Out form from `DashboardSidebar` (desktop and mobile sheet share
  `DashboardNavigationContent`). `SettingsPage` now has an **Account** section
  below Appearance with the same `<Form method="post" action={APP_ROUTES.logout}>`
  and "Logging out…" pending state. The `/logout` route action is unchanged.
- `SettingsPage.test.tsx` now renders through `createMemoryRouter` (needed for
  `<Form>`/`useNavigation`) and covers logging out. `app.smoke.mjs` asserts the
  dashboard has no Log Out button and logs out from Settings → Account. README updated.
- `npm run check` passed (32 files / 223 tests, clean lint, build).
  `ADBOX_TEST_URL=http://127.0.0.1:5174 npm run test:smoke` passed.

## Settings owns the theme control (2026-10-03)

- Latest request: one theme button on Settings, with room for future preferences.
  Replaced the `/settings` pending screen with a lazy authenticated feature under
  `src/features/settings/`. Its Appearance section shows the current mode and
  one keyboard-accessible **Switch to dark/light mode** button. The section/grid
  layout can accommodate additional settings when requested; only Appearance
  is implemented now.
- Removed theme buttons from dashboard/recruitment headers, candidate profiles,
  login, RDI CMS, and website/preview headers. `ThemeToggle` is mounted only by
  `SettingsPage`; `WorkspaceTheme` remains above the router, preserving app-wide
  appearance, migration, reload/sign-out persistence, and cross-tab/iframe sync.
  No changes to backend data, permissions, drafts, or the storage contract.
- Registered `settingsRoutes`, removed Settings from `pendingPages`, and updated
  README, architecture, product spec, recruitment docs, and AGENTS inventory.
  Added Settings tests for the sole control, current-mode feedback, keyboard
  use, saved preferences, and switching in both directions. Browser theme changes
  now use the real Settings button (a second tab preserves open candidate drafts),
  with assertions that other pages, profiles, login, and previews have no toggle.
- `npm run check` passed: architecture (177 source files), clean lint, test-file
  types, 32 Vitest files / 222 tests, and production build. `git diff --check`
  passed. Dev server remains `http://127.0.0.1:5174/settings`.
- Full `ADBOX_TEST_URL=http://127.0.0.1:5174 npm run test:smoke` passed with mocked
  APIs: Settings-only control, both themes throughout the app, cross-tab/iframe
  changes, recruitment reviews, dashboard, video, admin/RBAC, RDI/CMS, backups,
  responsive layouts, and dark login after logout; no runtime errors or unexpected
  API calls. The first browser attempt exposed missing auth in a synthetic new
  tab; `theme-helpers.mjs` now copies the synthetic opener session before opening
  Settings, matching a link opened in a new tab. Production auth is unchanged.
- Inspected desktop/mobile Settings screenshots in both themes at
  `/tmp/adbox-{light,dark}-settings{,-mobile}.png`. A desktop capture after rapid
  resizing had a paint artifact; refreshing at desktop size produced the correct
  image, with browser assertions confirming one main layout and Settings heading.
- Preserve existing uncommitted work and unrelated `docs/RBAC_EXTENSION_BRIEF.md`.
  No dependencies, sibling-repository edits, commits, pushes, or deployment.

## Application-wide appearance (2026-10-03)

- The latest user request replaces recruitment-only theming. `AppProviders` now
  mounts `WorkspaceTheme` above the router; there is no forced-light route or
  layout-unmount reset. Dashboard, admins, recruitment, videos, RDI/CMS and website
  previews, sign-in, loading/error pages, portals, and notifications share the
  selected appearance. Header controls are available across the app.
- Preference key: `adbox-theme`. Existing `adbox-recruitment-theme` values migrate
  on first use; subsequent global choices take precedence. Defaults to light,
  survives sign-out/reload, and synchronizes across tabs and CMS preview iframes.
  Storage failures do not prevent switching in memory. No theme data is written
  into RDI drafts or any server-owned feature data.
- Older light-only components now have dark surface/text/border variants using
  existing tokens. Chart labels, date controls, account tables, CMS fields,
  website sections, and brand logos remain readable. Media and artwork retain
  their original colors. Recruitment metadata is now `compactHeader: true`,
  describing layout only. No dependencies or backend changes.
- Updated README, architecture, product spec, and recruitment documentation.
  `WorkspaceTheme.test.tsx` covers persistence, legacy migration, cross-tab updates,
  and unavailable storage. New `tests/smoke/appearance.smoke.mjs` verifies actual
  surface colors, both themes on all feature layouts, dialogs, 320–1440px layouts,
  and iframe synchronization. Existing recruitment smoke now expects the theme
  to remain active on Settings; shared smoke verifies dark login after logout.
- Final `npm run check` passed: architecture (174 files), clean lint, test types,
  31 Vitest files / 220 tests, production build. The first run overlapped Chrome
  and hit an existing five-second recruitment-test timeout; rerunning without
  Chrome passed without weakening that test. Focused appearance smoke passed with
  mocked APIs and no runtime errors. Screenshots inspected at
  `/tmp/adbox-dark-{dashboard,manage-admins-mobile,admin-dialog,rdi,rdi-website,video-management-upload,login}.png`.
- The full `ADBOX_TEST_URL=http://127.0.0.1:5174 npm run test:smoke` run also
  passed: appearance, recruitment, dashboard, video workflows, account/RBAC
  administration, six RDI screens, touch layouts, CMS editing/backup recovery,
  authentication, and logout. No runtime errors or unexpected API calls.
  Final polish also themes shared Sheet defaults and RDI's data-defined division
  panel gradients/icons; the complete `npm run check` passed again afterward.
  The expanded focused appearance suite passed on that final code, including
  all three division gradients and video-panel description colors in both themes.
  `git diff --check` passed.
- Dev server remains `http://127.0.0.1:5174/`. Preserve all existing uncommitted
  recruitment work and unrelated `docs/RBAC_EXTENSION_BRIEF.md`; no commits,
  pushes, deployments, or sibling-repository writes.

## Recruitment redesign and appearance (2026-10-03)

- Redesigned `/recruitment` with existing AdBox fonts, colors, gradients, and
  primitives: review-progress hero, actionable summary cards, stage navigation,
  campus filters, automatic search with removable filter chips, and a clearer
  candidate queue with 10/20/50 rows per page. Profiles prioritize the introduction
  video and application answers, with a direct **Go to review** action.
- Added persistent light/dark controls in the recruitment header and candidate
  profile. `WorkspaceTheme` uses the existing `next-themes` dependency and saves
  only appearance in `adbox-recruitment-theme`. Recruitment opts in via route
  metadata; other routes and sign-in retain light mode while the preference is
  preserved. Sidebar, mobile navigation, dialogs, and notifications follow the
  active theme. Sheet animations now respect reduced-motion preferences.
- Main files: `src/features/recruitment/`, new theme/header components under
  `src/components/layout/`, `src/layouts/DashboardLayout.tsx`, route metadata,
  `src/styles/index.css`, and shared sidebar/profile/sheet styling. Existing
  recruitment API, review permissions, and manual contact behavior are retained.
  No dependencies, new base colors/fonts, backend edits, or live messages.
- Updated README, `docs/RECRUITMENT.md`, architecture, and product specification.
  Expanded component tests for theme persistence/isolation, automatic search,
  filter removal, and page size. Focused browser smoke passed with both themes,
  reload/navigation, mobile menus, candidate tabs at 320–1440px, review/retry,
  history, video, contact drafts, CSV, and pagination; all API data was mocked.
  Inspected screenshots at `/tmp/adbox-recruitment-{light,dark}-desktop.png`,
  `/tmp/adbox-recruitment-{light,dark}-mobile.png`, and
  `/tmp/adbox-recruitment-dark-profile.png`.
- Final `npm run check` passed: architecture (174 source files), clean lint,
  test type checking, 31 Vitest files / 218 tests, and production build.
  An initial full-suite run hit the default one-second candidate-load test
  timeout; its async wait now allows three seconds for permission/queue loading
  under concurrent workers. The subsequent complete check passed.
- Dev server remains `http://127.0.0.1:5174/recruitment`. Live backend integration
  was not rechecked. The prior full-smoke video-caption failure below remains
  unrelated; this task ran the focused recruitment browser suite.

## Recruitment review workspace (2026-10-03)

- Added **Recruitment** at `/recruitment` under `src/features/recruitment/`.
  Inspected the Desktop `adbox-recruitment` form and current `adbox-backend`
  controllers/services/DTOs/schema. Both sibling repositories contain existing
  uncommitted work and were read only; no migrations, messages, or live mutations.
- Uses the existing authenticated Super Admin API for server-paginated search,
  campaign/institution/stage filters, overview counts, campus distribution,
  all 14 answers, on-demand private video, rating/internal notes, permitted
  decisions, reviewer history, and CSV. Queue/stats refresh every minute.
  Read/review/export/campaign controls follow current-admin permissions. No
  production mock data, dependencies, font/color changes, or browser persistence.
- Contact provides editable manual email drafts. Current backend sends submission
  receipts only: status changes do not notify applicants. Documented missing
  tracked response APIs, delivery jobs, campaign-read access, retention gaps,
  and concurrent-status-write protection in `docs/RECRUITMENT_RESPONSES_BACKEND.md`.
  `docs/RECRUITMENT.md` maps every submitted field and documents API/UI behavior.
  README, architecture, project spec, and AGENTS module inventory were updated.
- Validation: final `npm run check` passed (171 application source files; clean
  lint, test types, 30 Vitest files / 214 tests, production build). The focused browser
  run passed using `ADBOX_TEST_URL=http://127.0.0.1:5174
  ADBOX_SMOKE_FEATURE=recruitment npm run test:smoke`: review/retry/history,
  video access, drafts, export scope, pagination/filtering, reload persistence,
  320–1440px layouts, auth/navigation/logout; no runtime errors. Synthetic preview
  screenshots inspected at `/tmp/adbox-recruitment-{desktop,profile,mobile}.png`.
- Full browser run stopped in untouched `tests/smoke/video-management.smoke.mjs:50`
  (caption typed as `#csGH` instead of `#RoboticsGH`), before recruitment ran.
  Added the focused smoke option and made the auth fixture return 401 for a
  transient request without a token during logout. No video code changed.
- Live authenticated backend/application/video/email delivery was not exercised.
  The backend must be running with recruitment routes, seeded permissions, and
  the database used by the live public form. Existing redacted data stays removed.
- Dev server: `http://127.0.0.1:5174/`; `npm run dev -- --port 5174`.
  Preserve unrelated untracked `docs/RBAC_EXTENSION_BRIEF.md`. No commits,
  pushes, deployments, or sibling-repository edits.

## Dev server update (2026-10-03)

- Port 5173 was occupied. At the user's request, started Vite with
  `npm run dev -- --port 5174` at `http://127.0.0.1:5174/`.
- Vite reported ready and an HTTP check returned 200 OK. `git diff --check`
  passed. Application code and the default port configuration are unchanged.
  No build, lint, or tests were needed for this server-only task.
- Preserve the existing untracked `docs/RBAC_EXTENSION_BRIEF.md`.

## Current state — Both Manage Admins tabs integrated (2026-09-14)

The user confirmed **both tabs, including admin accounts**. Continued from the
uncommitted roles/permissions integration and connected the Admin tab using the
contracts in `/Users/pamelanutsukpo/Desktop/adbox-backend/apps/super-admin/src/`.
The backend was inspected only. No dependencies, commits, pushes or deployments.

- `src/features/admins/api.ts`, `validation.ts`, `hooks.ts`, and `lib/errors.ts`
  handle the authenticated Super Admin API through Axios → TanStack Query → UI.
  Raw responses and nested assignments are validated. Both mock stores/catalogs
  have been removed; no account or RBAC responses live in Zustand.
- Roles: `GET /roles`, `GET /permissions`, `POST /roles`, `PATCH /roles/:id`,
  `DELETE /roles/:id`, `PUT /roles/:id/permissions`. Metadata and permissions
  save separately. Create opens permission selection for authorized accounts;
  cancelling selection leaves the created role saved. Empty sets clear assignments.
  System roles are read-only and wildcard assignment is excluded from role editing.
- Admins: `GET /admins`, `GET /admins/:id`, `POST /admins`, `PATCH /admins/:id`,
  `PUT /admins/:id/roles`, `PUT /admins/:id/permissions`. Account actions fetch
  current details before initializing forms. Create supports optional names, email,
  a 5–128 character password and multiple initial role IDs in one POST. Passwords
  are stripped from responses and the create mutation is reset/garbage-collected.
- `AdminFormDialog`, `AdminRowMenu`, `AdminAccessDialog`, `AdminStatusDialog`,
  `RolesPicker`, and `AdminsTable` provide profile editing, multiple roles, direct
  permissions, deactivation/reactivation, live filters/status/counts and CSV export.
  Email is read-only after creation. The active form no longer offers photo,
  telephone or notification fields; the backend cannot save them. The old
  `AdminAvatarPicker` component/tests remain unused, with existing assets untouched.
- Role/direct-permission saves replace complete sets and preserve input after a
  failure. Clearing direct permissions keeps role-derived permissions. The backend
  permits wildcard direct assignments, which are labeled “All permissions (*)”.
  Own role/direct-permission changes and own deactivation are blocked in the UI.
  There is no admin deletion endpoint: the old Remove action is now Deactivate,
  with Reactivate for inactive accounts.
- Mutations invalidate account lists/details, roles/catalogs and the current profile
  so both tabs stay current. Auth retains effective permissions from `/auth/me` for
  controls and clears previous queries at sign-in. Backend authorization remains
  authoritative. README and architecture documentation reflect both tabs.

## Checks actually run

- `npm run check` passed on the final code: architecture (153 source files), clean
  ESLint, test-file type checking, Vitest (27 files / 198 tests), production build.
  Old local-store tests were replaced by API and component integration coverage.
- `npm run test:smoke` passed against the running local server with all APIs mocked.
  Checks cover account creation/reload persistence, password/email errors, profile
  editing, role and direct-permission replacement, failed saves and retries,
  deactivate/reactivate, own-access restrictions, new roles becoming assignable,
  role deletion updating account assignments, and layouts down to 320px.
  Existing auth, Dashboard, Video Management and RDI/CMS checks also passed with
  no runtime errors or unexpected API requests.
- `git diff --check` passed. Live authenticated backend requests were not exercised.

## Remaining boundaries and prior context

- Permission-definition creation/editing/deletion has no UI integration. All existing
  role-management flows and the supported admin-account operations are connected.
- Uses existing `VITE_SUPER_ADMIN_API_URL` or `/api/v1` through the Vite proxy to
  `localhost:3005`. No backend setup, migrations or live account mutations were run.
- RDI remains a browser-only CMS/website; preserve drafts, images, backups and
  previews. No RDI APIs, uploads, publishing or contact delivery were added.
- The user previously deleted AdBox Studio; do not recreate it without a new request.
  `output/campus-creator-casting-call/` remains unrelated prior work.
