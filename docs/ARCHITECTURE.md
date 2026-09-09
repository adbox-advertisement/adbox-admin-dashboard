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
            ├── videos/          Upload, folders, Posts
            └── rdi/             CMS services, editor, website preview

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

Protected routes share `DashboardLayout` and recheck the local session on navigation. Route metadata supplies the title and optional workspace layout. RDI keeps its editor toolbar; Video Management provides a nested Upload/Posts layout. The sidebar persists across page changes and uses `src/config/navigation.ts` for labels and groups.

Initial navigation has a loading screen. Page changes have an accessible loading indicator. Route errors have a recovery screen; unknown URLs return a not-found screen. Backend authorization is required independently of browser route guards.

## Server and client state

```text
API response → feature API service → TanStack Query hook → page / component
User input → component state or feature UI store
```

`src/api/client.ts` owns the configured Axios instance, timeout, authorization header, and single-flight token refresh. `src/lib/auth-session.ts` validates session records and retains the existing session-storage key. Authentication endpoint errors do not trigger token refresh. Logout clears the session and Query cache, including when the server logout request fails.

Feature API services contain endpoints and transport mappings. Hooks own queries, mutations, invalidation, and loading state. RDI query cancellation passes through to Axios. Editable RDI content is a local working copy; saved CMS responses remain in TanStack Query.

Video folders currently represent local authoring groups. The feature store persists folder metadata and selection; it does not store API responses. File objects, object URLs, and unfinished composer text stay in mounted upload components. Do not treat these as durable server content. A future upload API should use services and Query hooks, while keeping selection, dialogs, and filters in client state.

## Feature organization

- **Auth:** the API validates returned sessions; mutation hooks drive the sign-in form.
- **Dashboard:** `components/` renders widgets; `data/` holds current display datasets. Keep dashboard-specific charts here until another feature needs them.
- **Videos:** `components/upload/` handles school selection and media composition; `components/folders/` handles folder creation and selection; `components/posts/` renders collections and details; `components/shared/` holds media preview and header components. Filters live in `hooks/`, browser metadata in `store/`, models in `types/`, and fixture content in `data/`.
- **RDI:** `api/` contains services, response types, and mappings; `hooks/` separates server mutations from editor state/actions; `components/editor/` contains form controls; `components/preview/` renders website pages; `components/shared/` renders media without editor dependencies. Reviewed page templates are split under `data/pages/`; they are not a server persistence layer.

## Adding a feature

1. Add its domain page and components under `src/features/<name>/`. Start with the smallest useful structure.
2. Add API services and Query hooks if it needs server data. Validate external data at service/form boundaries.
3. Add paths in `src/routes/paths.ts`, lazy routes in the feature's `routes.ts`, and export those routes from its `index.ts`.
4. Register the routes in `src/routes/router.ts` under the appropriate layout and guard.
5. Add navigation in `src/config/navigation.ts`; remove the corresponding pending definition when replacing a planned module.
6. Reuse shared controls and design tokens. Follow the responsive rules in `grid.md`.
7. Run `npm run check` and verify the affected user flow in the browser.

## Production integration boundaries

The organization and build checks are ready to support continued development. Full product readiness still depends on connecting dashboard data, upload publishing, Posts, header actions, and pending business modules to their services. The RDI CMS backend is separate; its database reference files are in `database/rdi-cms/` and are never run by frontend setup or CI.
