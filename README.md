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
| `src/features/rdi/` | Website CMS, local drafts and media, six website screens, and live previews |
| `src/components/` | Shared UI primitives, navigation, feedback screens |
| `src/api/`, `src/lib/` | HTTP transport, session storage, shared utilities |
| `src/assets/`, `src/styles/` | Brand/media assets and shared design tokens |
| `database/rdi-cms/` | Historical CMS schema documentation; disconnected from the frontend |
| `scripts/` | Repository validation tooling |

Read [Architecture](docs/ARCHITECTURE.md) before adding modules, [Project spec](docs/PROJECT_SPEC.md) for product requirements, and [Grid guidance](docs/grid.md) for responsive layouts.

## Claude Code and Codex

Both tools use the shared rules in `AGENTS.md`; `CLAUDE.md` imports them for Claude Code.
Start either tool from this folder:

```bash
npm run ai:codex
npm run ai:claude
```

Choose one editing session per checkout. Run `npm run ai:check` to verify local setup.
Follow [AI workflow](docs/AI_WORKFLOW.md) for installation and switching tools, and use
[the handoff](docs/AI_HANDOFF.md) to carry task progress between them.

## Validation

```bash
npm run check
```

This checks feature boundaries and runtime import cycles, runs ESLint, type-checks the application, and creates the production build. Individual commands are `npm run check:architecture`, `npm run lint`, `npm run typecheck`, and `npm run build`. GitHub Actions runs the same check on pull requests and pushes to `main` or `master`.

With the dev server running and Google Chrome installed, run `npm run test:smoke` for browser checks of authentication, protected routes, mobile navigation, the six RDI screens, and CMS editing, previews, images, backups, and storage recovery. API calls are mocked and never change live content. Set `ADBOX_TEST_URL=http://127.0.0.1:4173` to check a running production preview, or `ADBOX_BROWSER_CHANNEL` to use another installed Playwright browser channel. Folder creation, media composition, and Posts filters also need verification after changes to those workflows.

## Current integrations

- Authentication uses the configured API. The backend remains responsible for authorization.
- RDI has a browser-only CMS for Home, About, Construction, Media, Solar, and Contact. Page editing, section visibility, collections, shared settings, image selection, local image uploads, and backups work without APIs. The website uses bundled images in `public/rdi-assets/`; source URLs are recorded in `docs/references/rdi-assets.json`. The screens use the existing shared heading font; the reference site’s Poppins font has not been added. There is no remote publishing or contact submission.
- Dashboard widgets and Posts currently use local display data.
- Upload folder names and the selected folder persist in this browser. Selected files and composer drafts stay in memory and reset when the upload page is unmounted or reloaded. Upload publishing is not connected to a backend.
- Other sidebar modules show their existing pending pages. Header search and notifications await integration.

## RDI website manager

Open **RDI** in the sidebar to manage the website:

| Route | Purpose |
| --- | --- |
| `/rdi` | Search and open the six website pages |
| `/rdi/pages/:pageId` | Edit sections and collections, undo/redo, and review desktop/mobile previews |
| `/rdi/library` | Search bundled and uploaded images and edit library descriptions |
| `/rdi/settings` | Brand, shared contact details, navigation labels, footer, and backup import/export |
| `/rdi/website` | Browse the website inside AdBox; division pages use child paths |
| `/rdi/preview/:pageId` | Review the draft without the AdBox shell |

All routes use the existing administrator session guard. Drafts auto-save in `localStorage` under `adbox-rdi-cms-v1`; the editor also supports **Save draft** and Ctrl/Cmd+S. Edits update the preview and persist after reload in this browser. They do not update the public website or another device.

Use **Site settings → Export backup** to keep a portable JSON copy of content, settings, collections, and uploaded images. Import validates the document and asks before replacing the current local draft. Clearing browser data removes drafts, so keep a backup of valuable work. Storage failures display an error and keep export available.

Local image uploads accept JPG, PNG, WebP, or GIF up to 2 MB per file and 10,000 pixels per side. The draft supports up to 50 custom image records and checks an estimated 4 MiB browser storage budget before adding files; actual browser limits can differ. Uploaded assets are stored once and referenced by ID. Original images stay bundled with the application. Library descriptions help organize images; page image-description fields control accessibility text where provided.

## Build and deployment

```bash
npm run build
npm run preview
```

Deploy `dist/` to a static host. Configure SPA fallback to `index.html` for application paths such as `/video-management/upload`, while preserving real `/api/*` responses and asset paths. Serve the API at `/api/v1` behind the same origin, or set `VITE_SUPER_ADMIN_API_URL` when building and configure backend CORS for that origin.

`npm run preview` is a local build check. Database scripts under `database/rdi-cms/` are separate operational tools; frontend commands never execute them.
