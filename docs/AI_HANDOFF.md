# Current handoff

Read alongside `AGENTS.md` and confirm the working tree before continuing.

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
