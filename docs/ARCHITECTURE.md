# Application architecture

AdBox uses feature-first modules with a shared application shell. Only implemented modules have source directories. Planned modules remain in `src/config/pending-pages.ts` until they have their own behavior.

## Ownership and dependencies

```text
main.tsx
└── app/                         App + providers + QueryClient
    └── routes/                  Guards, public paths, router composition
        ├── layouts/             Shared authenticated shell
        └── features/
            ├── auth/            API, mutation hooks, login page
            ├── dashboard/       Widgets, charts, display datasets
            ├── admins/          Admin accounts, roles and permission assignments
            ├── videos/          Upload, folders, Posts
            └── rdi/             Website CMS, local drafts, website screens and previews

components/{ui,layout,feedback}/  Shared controls, navigation, page feedback
config/                          Navigation, pending pages, environment
api/                             Axios transport and session refresh
lib/                             Session storage and shared helpers
assets/{brand,dashboard,posts,schools}/
styles/                          Shared typography, colors, shadows
```

Each feature exposes its supported public API through `index.ts`. These entry points export route definitions without eagerly importing page components. Inside a feature, use relative imports. Outside it, use `@/features/<name>`; avoid reaching into private files. Shared controls and helpers must not import domain features or the application shell.

Small features use `api.ts`, `hooks.ts`, and `types.ts`. Split these into directories when responsibilities grow. Do not add empty service, hook, or store files just to match a template.

`npm run check:architecture` checks static imports, re-exports, and literal dynamic imports against these boundaries, prevents UI from directly importing API services, and detects runtime import cycles. Type-only imports do not create runtime cycles. TypeScript checks unresolved source imports during the build.

## Routing and navigation

`src/routes/paths.ts` defines stable URLs. Feature `routes.ts` files own their pages and lazy imports. `src/routes/router.ts` composes public, protected, pending, and not-found routes.

Protected routes share `DashboardLayout` and recheck the local session on navigation. Route metadata supplies the title and optional workspace layout. RDI provides lazy CMS pages at `/rdi`, a nested website layout at `/rdi/website`, and separately guarded standalone previews at `/rdi/preview/:pageId`. The previews render without `DashboardLayout` and also power the editor iframe. Video Management provides a nested Upload/Posts layout. The sidebar persists across page changes and uses `src/config/navigation.ts` for labels and groups.

Initial navigation has a loading screen. Page changes have an accessible loading indicator. Route errors have a recovery screen; unknown URLs return a not-found screen. Backend authorization is required independently of browser route guards.

## Server and client state

```text
API response → feature API service → TanStack Query hook → page / component
User input → component state or feature UI store
```

`src/api/client.ts` owns the configured Axios instance, timeout, authorization header, and single-flight token refresh. `src/lib/auth-session.ts` validates session records and retains the existing session-storage key. Authentication actions do not trigger token refresh; the protected `GET /auth/me` profile request does. Logout clears the session and Query cache, including when the server logout request fails.

The authenticated dashboard header displays the current email and assigned roles from `GET /auth/me`. Auth validates this response, including effective permissions used by feature controls, and keeps it in TanStack Query, separately from session tokens. A successful sign-in removes previous queries so account and RBAC data cannot carry over between accounts. `DashboardLayout` supplies the auth-owned profile component through the shared header's account slot, with loading and retry states; RDI workspace routes do not mount it or request profile data.

Manage Admins' **Manage Roles and permissions** tab uses the configured Super Admin API: `GET /roles`, `GET /permissions`, `POST /roles`, `PATCH /roles/:id`, `DELETE /roles/:id`, and `PUT /roles/:id/permissions`. `admins/api.ts` validates raw responses and maps nested role/permission assignments; `admins/hooks.ts` owns account, role and catalog queries and mutations. No account or RBAC responses are stored in Zustand. Mutations invalidate account lists/details, roles, permission catalogs and current account permissions, including after an ambiguous failed response, so both tabs stay current.

Role metadata and permission assignments have separate save actions because the backend provides separate writes. Creating a role opens its permission editor when the account can assign and read permissions; cancelling that editor leaves the saved role with no permissions. Names follow the backend's uppercase identifier format, descriptions are optional, and an empty `permissionIds` array clears the complete assignment set. System roles are read-only in this UI and the wildcard permission is never offered for assignment through role editing. Controls use effective permissions from `GET /auth/me`; the backend independently enforces authorization.

The **Admin** tab uses `GET /admins`, `GET /admins/:id`, `POST /admins`, `PATCH /admins/:id`, `PUT /admins/:id/roles`, and `PUT /admins/:id/permissions`. It displays all assigned roles and active status, and filters by live role IDs. Account details are fetched on opening an action before initializing editable fields or a replacement assignment set. Create accepts optional names, email, a 5–128 character password and optional initial role IDs in one request. Passwords stay in the create form/request, are stripped from parsed responses, and the create mutation is reset after success with immediate cache garbage collection when unobserved.

Profile editing changes names only; email is read-only. Role and direct-permission replacement have separate dialogs and support empty sets. Direct permissions are additive to role-derived access; clearing direct permissions keeps assigned roles. The direct-permission picker supports the backend's wildcard assignment, while the permission picker for role editing excludes it. The UI prevents changing the current admin's own roles/direct permissions or deactivating their account, matching backend restrictions. Deactivate/reactivate uses `PATCH` with `isActive`; there is no account-delete endpoint. Photo upload, telephone and notification controls were removed from the active form because the backend does not support them. Permission-definition creation/editing/deletion remains outside this integration.

Feature API services contain endpoints and transport mappings. Hooks own queries, mutations, invalidation, and loading state. RDI has no API services or Query hooks. Its Zustand store owns local authoring drafts, save state, and undo/redo history; this is browser content, not a duplicate of server state. The document is validated with Zod when read from storage, restored from a backup, or received by a preview. Storage errors remain visible and preserve the in-memory draft for export.

Video folders currently represent local authoring groups. The feature store persists folder metadata and selection; it does not store API responses. File objects, object URLs, and unfinished composer text stay in mounted upload components. Do not treat these as durable server content. A future upload API should use services and Query hooks, while keeping selection, dialogs, and filters in client state.

## Feature organization

- **Auth:** the API validates returned sessions and the current-admin profile; mutation hooks drive sign-in, and a Query hook supplies the header's email and roles.
- **Admins:** `api.ts`, `hooks.ts`, and `validation.ts` own backend account/RBAC integration. Components render account and role tables, profile/status/assignment dialogs, loading/retry states and CSV exports. Both old mock stores and catalogs have been removed; only form input, filters, selections and dialog visibility remain in component state.
- **Dashboard:** `components/` renders widgets; `data/` holds current display datasets. Keep dashboard-specific charts here until another feature needs them.
- **Videos:** `components/upload/` handles school selection and media composition; `components/folders/` handles folder creation and selection; `components/posts/` renders collections and details; `components/shared/` holds media preview and header components. Filters live in `hooks/`, browser metadata in `store/`, models in `types/`, and fixture content in `data/`.
- **RDI website:** `pages/` contains Home, About, Construction, Media, Solar, and Contact. `layouts/` supplies the shared website layout; `components/` groups division-specific UI and shared website controls. Static defaults live in `data/`, local images in `public/rdi-assets/`, and scoped styles in `styles/website.css`. Container queries respond to available width. Tabs, filters, project dialogs, and form feedback use component state. The contact form never transmits messages.
- **RDI CMS:** `cms/pages/` owns the page overview, editor, media library, and site settings. Reusable editor controls live in `cms/components/`. `cms/catalog.ts` and `cms/data/` describe editable sections, field defaults, collections, and assets. Website components read draft overrides through `useCmsText` and `useCmsCollection`; `CmsSection` controls visibility without adding layout wrappers. Shared contact settings use `useWebsiteContact`. The versioned draft and undo/redo history live in `cms/store.ts`, with validation/export in `cms/lib/document.ts` and image handling in `cms/lib/media.ts`. Uploaded image data is stored once and referenced from content by asset ID. Original assets are never deleted through the UI.

The CMS preview uses the same website components as the standalone website. Parent and iframe exchange validated drafts through `postMessage`, checking both origin and window identity. Storage events refresh saved drafts in other tabs; pending local changes are preserved. No preview or CMS interaction issues API requests. Backup export includes default content plus local changes, and import requires confirmation before replacing a draft. Schema version changes must include a deliberate migration or a clearly reported incompatibility.

## Adding a feature

1. Add its domain page and components under `src/features/<name>/`. Start with the smallest useful structure.
2. Add API services and Query hooks if it needs server data. Validate external data at service/form boundaries.
3. Add paths in `src/routes/paths.ts`, lazy routes in the feature's `routes.ts`, and export those routes from its `index.ts`.
4. Register the routes in `src/routes/router.ts` under the appropriate layout and guard.
5. Add navigation in `src/config/navigation.ts`; remove the corresponding pending definition when replacing a planned module.
6. Reuse shared controls and design tokens. Follow the responsive rules in `grid.md`.
7. Run `npm run check` and verify the affected user flow in the browser.

## Production integration boundaries

The organization and build checks are ready to support continued development. Full product readiness still depends on connecting dashboard data, upload publishing, Posts, header actions, and pending business modules to their services. RDI intentionally remains a local CMS and website UI: there is no remote storage, collaboration, publishing, or contact delivery. Historical CMS database reference files are retained in `database/rdi-cms/`, are disconnected from runtime code, and are never run by frontend setup or CI.
