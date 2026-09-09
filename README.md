# AdBox Admin Dashboard

React 19, TypeScript, Vite, Tailwind CSS v4, and shadcn/Radix frontend for the AdBox administration workspace.

## Run locally

Use Node.js 22 and npm. Install the locked dependencies, then start Vite:

```bash
npm ci
npm run dev
```

The app opens at `http://127.0.0.1:5173`. API requests use `/api/v1` by default; Vite proxies `/api` to the separate backend at `http://localhost:3005`. To use a different backend, copy `.env.example` to `.env.local` and set `VITE_SUPER_ADMIN_API_URL`. Restart Vite after changing environment variables.

All `VITE_*` values are public browser configuration. Keep credentials out of environment files committed to the repository. Sign-in requires an available backend and a valid administrator account.

## Project structure

| Location | Responsibility |
| --- | --- |
| `src/app/` | App entry, providers, QueryClient configuration |
| `src/routes/` | Router composition, route guards, paths, route metadata |
| `src/layouts/` | Shared authenticated page shell |
| `src/config/` | Navigation, environment values, planned page definitions |
| `src/features/auth/` | Sign-in and session API operations |
| `src/features/dashboard/` | Dashboard widgets and display datasets |
| `src/features/videos/` | School selection, upload folders, media composers, post collections |
| `src/features/rdi/` | CMS API, content editor, website previews, page templates |
| `src/components/` | Shared UI primitives, navigation, feedback screens |
| `src/api/`, `src/lib/` | HTTP transport, session storage, shared utilities |
| `src/assets/`, `src/styles/` | Brand/media assets and shared design tokens |
| `database/rdi-cms/` | CMS schema documentation and database installation reference |
| `scripts/` | Repository validation tooling |

Read [Architecture](docs/ARCHITECTURE.md) before adding modules, [Project spec](docs/PROJECT_SPEC.md) for product requirements, and [Grid guidance](docs/grid.md) for responsive layouts.

## Validation

```bash
npm run check
```

This checks feature boundaries and runtime import cycles, runs ESLint, type-checks the application, and creates the production build. Individual commands are `npm run check:architecture`, `npm run lint`, `npm run typecheck`, and `npm run build`. GitHub Actions runs the same check on pull requests and pushes to `main` or `master`.

With the dev server running and Google Chrome installed, run `npm run test:smoke` for browser checks of authentication, protected routes, mobile navigation, the CMS editor, and session refresh. API calls are mocked and never change live content. Set `ADBOX_TEST_URL=http://127.0.0.1:4173` to check a running production preview, or `ADBOX_BROWSER_CHANNEL` to use another installed Playwright browser channel. Folder creation, media composition, and Posts filters also need verification after changes to those workflows.

## Current integrations

- Authentication and RDI CMS use the configured API. The backend remains responsible for authorization.
- Dashboard widgets and Posts currently use local display data.
- Upload folder names and the selected folder persist in this browser. Selected files and composer drafts stay in memory and reset when the upload page is unmounted or reloaded. Upload publishing is not connected to a backend.
- Other sidebar modules show their existing pending pages. Header search and notifications await integration.

## Build and deployment

```bash
npm run build
npm run preview
```

Deploy `dist/` to a static host. Configure SPA fallback to `index.html` for application paths such as `/video-management/upload`, while preserving real `/api/*` responses and asset paths. Serve the API at `/api/v1` behind the same origin, or set `VITE_SUPER_ADMIN_API_URL` when building and configure backend CORS for that origin.

`npm run preview` is a local build check. Database scripts under `database/rdi-cms/` are separate operational tools; frontend commands never execute them.
