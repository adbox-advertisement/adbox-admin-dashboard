# Brief: Non-Admin User Capabilities (RBAC extension)

Implementation brief for an AI agent. Backend work happens in
`/Users/pamelanutsukpo/Desktop/adbox-backend` (NestJS + Prisma + Postgres).
Frontend work happens in `/Users/pamelanutsukpo/Desktop/adbox-admin-dashboard`
(React 19 + Vite). Read `AGENTS.md` in each repo first.

## Goal

A Super Admin creates other admin accounts today, but every signed-in admin can do
everything in Video Management. Give those created accounts scoped,
enforceable capabilities: upload without publishing, publish without touching settings,
work on one school's content without seeing another's.

## What already exists — do NOT rebuild

Read these before writing anything. The RBAC core is finished and working.

- `apps/super-admin/src/common/permission.constants.ts` — `ADMIN_PERMISSIONS` key map,
  `ADMIN_PERMISSION_DESCRIPTIONS`, and `ADMIN_PERMISSION_CATALOG`. Adding a key here is
  the only step needed to make it assignable.
- `apps/super-admin/src/rbac/permission-sync.service.ts` — reconciles the catalog into
  `AdminPermission` on every boot. Insert-only; never updates or deletes. **No data
  migration is needed for a new permission key.**
- `apps/super-admin/src/common/authorization.guard.ts` — enforces `@RequirePermissions(...)`.
  Semantics to preserve: wildcard `*` passes everything; multiple listed permissions are
  **AND**ed; roles are **OR**ed; missing principal or insufficient grants throws 403.
- `apps/super-admin/src/common/permissions.decorator.ts`, `current-admin.decorator.ts`,
  `admin-principal.ts`.
- `prisma/schema/admin.prisma` — `Admin`, `AdminRole`, `AdminPermission`, `AdminUserRole`,
  `AdminRolePermission`, `AdminUserPermission`, `AdminAuditEvent`.
- `prisma/schema/media.prisma` — `AdminMediaAsset` with `AdminMediaKind` / `AdminMediaStatus`.
- `apps/super-admin/src/media/media.controller.ts` — the reference pattern for a guarded
  controller. Copy its shape.
- Already-defined permission keys: `admins.*`, `roles.*`, `permissions.*`,
  `observability.*`, `media.read|create|update|delete`, and `rdi.cms.*`.

**The RDI CMS is out of scope for this brief.** Its `rdi.cms.*` permissions already exist and
are already enforced on the backend — leave those keys, the `rdi-cms` module, and the
dashboard's `src/features/rdi/` routes exactly as they are. This work covers media only.

Follow the existing conventions exactly: `resource.action` dotted keys, DTOs under
`<module>/dto/`, `ParseUUIDPipe` on UUID path params, `@ApiTags` / `@ApiBearerAuth('admin-jwt')`,
audit writes through `AdminAuditService`, comments only where behavior is non-obvious.

## Task 1 — Split upload from publish

`media.create` currently covers both putting a file in the library and making it public.
Those are different levels of trust. Add these keys to `ADMIN_PERMISSIONS` and to
`ADMIN_PERMISSION_DESCRIPTIONS`:

| Key | Description |
| --- | --- |
| `media.publish` | Publish an uploaded asset as a live post |
| `media.unpublish` | Take a published post off the live feed |
| `media.collection.manage` | Create, rename, and delete collections |
| `media.school.manage` | Create and edit schools |
| `analytics.read` | View dashboard metrics |
| `analytics.export` | Export metrics as CSV |
| `profile.update` | Update own name and avatar |
| `profile.password.update` | Change own password |

`media.create` keeps its current meaning (upload only) after this change. An account with
`media.create` but not `media.publish` produces a review queue — that is the intended
default for contributors.

## Task 2 — Schools and collections

The frontend has hardcoded schools in `src/features/videos/data/schools.ts`
(`ug`, `knust`, `uds`, `gh-media`, `umat`, `gis`) and a local-only `PostCollection` type.
The backend has no equivalent. Add to `prisma/schema/media.prisma`:

- `AdminSchool` — `id` (uuid), `slug` (unique, citext — seed the six slugs above),
  `name`, `initials`, `imageUrl?`, timestamps.
- `AdminMediaCollection` — `id`, `schoolId` → `AdminSchool`, `name`, `description?`,
  timestamps, `@@unique([schoolId, name])`.
- `AdminMediaAsset` — add nullable `collectionId` → `AdminMediaCollection` and index it.
  Keep it nullable so existing rows migrate cleanly.
- `AdminMediaPost` — `id`, `assetId` → `AdminMediaAsset`, `collectionId`, `title`,
  `caption`, `coverUrl?`, `mediaType` (reuse `AdminMediaKind`), `status`
  (`DRAFT | PUBLISHED | ARCHIVED`), `publishedAt?`, `publishedById?` → `Admin`,
  `createdAt`, `updatedAt`, `deletedAt?`.

Generate a migration; do not edit applied migrations.

## Task 3 — School scoping

An admin with `media.create` can currently upload into any school. Add scoping:

- New model `AdminUserSchoolScope` — `adminId` → `Admin`, `schoolId` → `AdminSchool`,
  `assignedBy?`, `assignedAt`, composite PK `([adminId, schoolId])`, cascade on admin delete.
- **An admin with zero scope rows is unscoped** — treat that as access to all schools.
  This keeps every existing account working after the migration. Do not invert this.
- Wildcard `*` holders bypass scope entirely, matching the guard's existing wildcard rule.
- Enforce in the **service layer**, not the guard: the guard answers "may this admin publish
  at all", the service answers "may this admin publish *into this school*". A scoped admin
  acting outside their schools gets 403; list endpoints filter to their schools rather than
  erroring.
- Expose `PUT /admins/:id/schools` with body `{ schoolIds: string[] }`, guarded by a new
  `admins.schools.assign` permission, returning the full updated admin. Mirror
  `PUT /admins/:id/roles` — full replacement, empty array clears.
- Include `schools: Array<{ school: { id, slug, name } }>` on the admin payload and a flat
  `schools: string[]` (slugs) on `GET /auth/me`.

## Task 4 — Endpoints

All under the existing `/api/v1` prefix, JWT-guarded, following `media.controller.ts`.

```
GET    /schools                          media.read
POST   /schools                          media.school.manage
PATCH  /schools/:id                      media.school.manage

GET    /collections?schoolId=            media.read          (scope-filtered)
POST   /collections                      media.collection.manage
PATCH  /collections/:id                  media.collection.manage
DELETE /collections/:id                  media.collection.manage

GET    /posts?collectionId=&status=      media.read          (scope-filtered)
GET    /posts/:id                        media.read
POST   /posts                            media.create        (always created as DRAFT)
PATCH  /posts/:id                        media.update
POST   /posts/:id/publish                media.publish
POST   /posts/:id/unpublish              media.unpublish
DELETE /posts/:id                        media.delete        (soft delete)

PUT    /admins/:id/schools               admins.schools.assign
PATCH  /auth/me                          profile.update
POST   /auth/me/password                 profile.password.update
```

`POST /posts` must **not** accept a `status` field — publishing is only reachable through
the publish endpoint, so `media.publish` cannot be bypassed. Audit every publish, unpublish,
delete, and scope change.

## Task 5 — Seed role presets

Add a `prisma/seeds/admin-roles.seed.ts` alongside `onboarding-interests.seed.ts` and wire it
into `prisma/seed.ts`. Idempotent upserts by role name; skip any role already marked
`isSystem`; never downgrade an existing role's grants on re-run.

| Role | Permissions |
| --- | --- |
| `CONTENT_MANAGER` | all `media.*`, `analytics.read` |
| `MEDIA_UPLOADER` | `media.read`, `media.create`, `analytics.read`, `profile.*` |
| `EDITOR` | `media.read`, `media.update`, `media.publish`, `media.unpublish` |
| `ANALYST` | `analytics.read`, `analytics.export`, `media.read` |
| `AUDITOR` | every `*.read` key, including `rdi.cms.read`, plus `observability.audits.read` |

Role names must satisfy the frontend's `^[A-Z][A-Z0-9_]{1,63}$` validation.

## Task 6 — Frontend enforcement

The dashboard already reads effective permissions from `/auth/me` (`currentAdminSchema` in
`src/features/auth/validation.ts` carries `permissions: string[]`) and gates the admin screens.
Extend the same mechanism — do not invent a second one.

- Add a typed permission catalogue constant mirroring the backend keys; import it instead of
  writing string literals inline.
- Gate the Video Management routes in `src/features/videos/routes.ts` and hide the matching
  sidebar entries. Leave `src/features/rdi/routes.ts` untouched.
- Hide the publish control when the account lacks `media.publish`; show the asset as a
  pending submission instead.
- Filter the school picker in `VideoUploadPage` to the account's scoped schools.
- Replace the hardcoded `uploadSchools` with data from `GET /schools`, keeping the bundled
  images as fallbacks keyed by slug.
- Treat all of this as UI affordance only. The server stays authoritative.

## Contract requirements the frontend depends on

Breaking any of these breaks the dashboard's Zod parsing at runtime:

- IDs are **UUID v4** strings — `src/features/admins/validation.ts` uses `z.uuidv4()`.
- Timestamps are **ISO 8601** strings.
- Nullable strings may be `null`; the frontend transforms them to `""`. Do not omit the key.
- Relations serialize **wrapped**: `roles: [{ role: {...} }]`,
  `permissions: [{ permission: {...} }]`. Follow that shape for `schools`.
- Error statuses the UI already maps in `src/features/admins/lib/errors.ts`:
  400 (with `message` as string or string array), 403, 404, 409. Reuse them; do not
  introduce new status codes for these conditions.
- Mutations return the **full updated resource**, not `204`, so the cache can be primed.
- `PUT` collection endpoints are full replacements: the empty array clears all assignments.

## Constraints

- Do not weaken `AuthorizationGuard`, the wildcard rule, or the AND/OR semantics.
- Do not change existing permission keys or their meanings — only add.
- Do not delete or rewrite applied migrations.
- Do not touch the RDI CMS: no changes to `rdi.cms.*` keys, the backend `rdi-cms` module, or
  `src/features/rdi/` in the dashboard. Adding CMS role grants later is a follow-up task.
- Do not add dependencies without asking.
- Do not commit, push, or deploy.
- `database/rdi-cms/` in the dashboard repo is historical and disconnected. Leave it alone.

## Definition of done

Backend: `npm run lint`, `npm run test`, `npm run build`. Unit tests for the scope check
(unscoped admin, scoped admin in-school, scoped admin out-of-school, wildcard holder) and
for the seed's idempotency. Update `docs/super-admin-api.md`.

Frontend: `npm run check` (architecture, lint, test type-check, Vitest, build). Component
tests for the gated controls. Extend `tests/smoke/*.smoke.mjs` for the
upload-without-publish flow. Update `docs/AI_HANDOFF.md` with what was done, files touched,
checks actually run, and what is left.

Work backend-first and report the delivered endpoint list before starting the frontend, so
the contract can be confirmed against this document.
