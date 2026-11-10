# AdBox Admin Dashboard

React 19, TypeScript, Vite, Tailwind CSS v4, and shadcn/Radix frontend for the AdBox administration workspace.

## Run locally

Use Node.js 22 and npm. Install the locked dependencies, then start Vite:

```bash
npm ci
npm run dev
```

The app opens at `http://127.0.0.1:5173`. API requests use `/api/v1` by default; Vite proxies `/api` to the separate backend at `http://localhost:3005`. To use a different backend, copy `.env.example` to `.env.local` and set `VITE_SUPER_ADMIN_API_URL`. Restart Vite after changing environment variables.

If port 5173 is occupied, run `npm run dev -- --port 5174` and use `http://127.0.0.1:5174`.

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
| `src/features/users/` | Manage Users: overview, people directory and full profiles, institutions, publishers & companies, verification, Gye Nyame honours |
| `src/features/content/` | User Content: videos, pictures, text posts, ads and surveys by uploader; post removal/restore and survey deactivation |
| `src/features/support/` | Support help desk on sample data: views, conversations, saved replies, internal notes |
| `src/features/rewards/` | Rewards on sample data: partners (MTN, Telecel, AT, Melcom), redemption approvals, catalog, voucher codes |
| `src/features/recruitment/` | Recruitment queue, full applicant submissions, private videos, reviews, and response drafts |
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

This checks feature boundaries and runtime import cycles, runs ESLint, type-checks `*.test.ts(x)` files, runs the Vitest unit/component suite, type-checks the application, and creates the production build. Individual commands are `npm run check:architecture`, `npm run lint`, `npm run typecheck:test`, `npm run test`, `npm run typecheck`, and `npm run build`. GitHub Actions runs the same check on pull requests and pushes to `main` or `master`.

Vitest and React Testing Library cover logic-heavy code (Zustand stores, validation schemas, hooks) and interactive components, as `*.test.ts`/`*.test.tsx` files next to the code they cover; run `npm run test` once or `npm run test:watch` while iterating. Shared setup and render helpers live in `src/test/`.

With the dev server running and Google Chrome installed, run `npm run test:smoke` for browser checks of authentication, protected routes, mobile navigation, the Dashboard, Video Management (school selection incl. search, folder create/rename, the Photos/Videos/Text upload tabs, and Posts), the six RDI screens, and CMS editing, previews, images, backups, and storage recovery. API calls are mocked and never change live content. Set `ADBOX_TEST_URL=http://127.0.0.1:4173` to check a running production preview, or `ADBOX_BROWSER_CHANNEL` to use another installed Playwright browser channel.

For focused browser checks, set `ADBOX_SMOKE_FEATURE=recruitment`,
`ADBOX_SMOKE_FEATURE=appearance`, `ADBOX_SMOKE_FEATURE=users` (Manage Users), `ADBOX_SMOKE_FEATURE=content` (User Content), `ADBOX_SMOKE_FEATURE=financials`, `ADBOX_SMOKE_FEATURE=ads`, `ADBOX_SMOKE_FEATURE=activity` (waiting-work badges and the sound setting), `ADBOX_SMOKE_FEATURE=support` or `ADBOX_SMOKE_FEATURE=rewards` alongside `ADBOX_TEST_URL` when running
`npm run test:smoke`. Appearance checks cover both themes throughout the app,
including dialogs, RDI preview synchronization, and 320–1440px layouts. Shared
authentication, shell, navigation, and logout checks still run.

## Current integrations

- Authentication uses the configured API. The backend remains responsible for authorization.
- **Support** at `/support` is a help desk on **sample data** (no support API exists yet): figures for what needs a reply, views (needs reply, mine, unassigned, high priority, waiting on customer, resolved), search and topics, conversations with reply deadlines, internal notes, saved replies, send & resolve, status/priority/assignee, customer details, and J/K/R/`/` shortcuts. Replies and changes stay in the tab until reload; nothing is sent. Replace `src/features/support/api.ts` with real requests to connect it.
- **Rewards** at `/rewards` runs on **sample data** (no rewards API exists yet). People spend gold bars on airtime, data bundles and shopping vouchers from partners (MTN, Telecel, AT, Melcom); each request holds the gold until an admin decides. Sidebar: **Overview** (how a redemption works, what's waiting, gold redeemed, delivered by partner, vouchers low on codes), **Redemption requests** (waiting oldest first with automatic checks: account age, shared or unverified phone, monthly limit, stock, paused partner; approve one, approve every all-clear request, or reject with a reason and the gold goes back; retry or refund failed deliveries; filters in the address, e.g. `?status=all&partner=p-mtn&open=r-2060`), **Rewards catalog** (price in bars against the store rate, monthly limit, stock, on/off) and **Partners** (settlement this month at face value less the partner's discount, voucher code batches with **Add codes**, contact, pause). Top-ups "land" after 2.5 s; voucher approvals issue the next code. Partner names are real; contacts, people and figures are invented. Replace `src/features/rewards/api.ts` with real requests to connect it.
- **Recruitment** at `/recruitment` uses the existing Super Admin recruitment API for all submitted answers, private introduction videos, campaign/stage/campus filters, counts, paginated search, ratings, notes, decisions, history, and CSV. It refreshes queue/statistics every minute. Access follows recruitment permissions; no mock applicants appear in the production interface. Contact offers editable email drafts. The backend currently sends submission receipts only; decisions do not automatically notify applicants. See [Recruitment administration](docs/RECRUITMENT.md) and [Response backend brief](docs/RECRUITMENT_RESPONSES_BACKEND.md).
- **Light mode / Dark mode** applies throughout the application: dashboard, admin management, recruitment, videos, RDI/CMS and previews, sign-in, and loading/error screens. Use the single button under **Settings → Appearance** to switch themes. It saves the `adbox-theme` preference through navigation and sign-out and synchronizes across tabs. Existing recruitment theme preferences migrate automatically. AdBox branding and media retain their colors.
- **Log Out** lives under **Settings → Account**; the sidebar no longer has a logout button.
- Recruitment search updates as you type; the pipeline's stages filter the list, each candidate shows its next step, and page sizes are 10/20/50.
- **Manage Users** (`/manage-users`, with sidebar sub-pages) covers everything about platform accounts. **Overview** breaks people down by account role (viewer, creator, publisher), campus affiliation (student, alumni, faculty & staff), verification, badges and account status, and every figure links to a filtered list. **People** is a server-filtered directory (role, affiliation, verification, badge, status, institution; filters live in the URL) that opens a full **profile page** with Profile, Connections (followers, following, blocks), Publishing (companies), Badges & honours, and Account & sign-in tabs, plus edit, badge management and suspend/reactivate. **Institutions** lists members per institution and opens campus breakdowns and member lists. **Companies** lists advertiser companies with owners and publishers; each opens a page to approve or reject it. **Verification** is the student-ID review queue, **Business requests** and **Page requests** the queues for accounts people run, and **Honours** the Gye Nyame nomination review. The sidebar groups them as Directory and To review, and Overview starts with what waits in each queue. Needs the super-admin `platform-users` stats/relationships/connections endpoints from the backend. There is no create- or delete-user endpoint.
- **User Content** (sidebar, `/user-content`) lists videos, pictures, text posts and surveys with their uploaders: totals, top uploaders, a per-uploader view (also reachable from a Manage Users profile) that also shows that person's ads, media previews and engagement, and the Reports queue. Admins with `user.content.moderate` can remove or restore posts and deactivate or reactivate surveys. Everyone's ads are in Ads Management. Needs the `user-content` super-admin endpoints from the backend.
- Both **Manage Admins** tabs use that same Super Admin API. Admins can be created with a password and multiple roles; profile names, role assignments, direct permissions and active status persist to the backend. Deactivation revokes sessions; reactivation restores sign-in. Role creation, editing, deletion and permission replacement are also connected. Create a role using an identifier such as `CONTENT_MANAGER`, then save its permissions in the next dialog. System roles are read-only. Admin email is read-only after creation; photo/telephone/notification fields and permission-definition CRUD are not supported by this UI.
- RDI has a browser-only CMS for Home, About, Construction, Media, Solar, and Contact. Page editing, section visibility, collections, shared settings, image selection, local image uploads, and backups work without APIs. The website uses bundled images in `public/rdi-assets/`; source URLs are recorded in `docs/references/rdi-assets.json`. The screens use the existing shared heading font; the reference site’s Poppins font has not been added. There is no remote publishing or contact submission.
- Dashboard widgets and Posts currently use local display data.
- Upload folder names and the selected folder persist in this browser. Selected files and composer drafts stay in memory and reset when the upload page is unmounted or reloaded. Upload publishing is not connected to a backend.
- **Settings** at `/settings` currently provides Appearance; its section layout can accommodate future preferences.
- Other unfinished sidebar modules show their existing pending pages. Header search and notifications await integration.

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

### Vercel

`vercel.json` sets the build (`npm ci`, `npm run build`, output `dist/`), sends every application path to `index.html` so links such as `/rewards/requests` open on refresh (real files such as `/assets/*` and `/rdi-assets/*` are served first), and caches the hashed files in `/assets/` for a year.

In the Vercel project:

- **Node.js version:** 22, as in CI.
- **Environment variable** `VITE_SUPER_ADMIN_API_URL=https://admin-api.adboxgh.com/api/v1`. Vite writes it into the bundle at build time, so set it before the first build and redeploy after changing it. Without it the dashboard calls `/api/v1` on Vercel and every request fails.
- **Domain:** a custom domain such as `admin.adboxgh.com`. The API accepts one dashboard origin, so `*.vercel.app` preview links cannot sign in.
- Don't proxy `/api` through a Vercel rewrite: the admin API only answers allowlisted IP addresses, and Vercel's change.

On the API server (`adbox-backend`, `deploy/ec2/README.md`):

- `SUPER_ADMIN_CORS_ORIGIN` must be the dashboard's exact origin (for example `https://admin.adboxgh.com`), then `pm2 restart super-admin --update-env`. It also sets the origin of the live-activity socket.
- The admin's browser calls the API directly, so each admin's own IP address must be in `/etc/nginx/adbox-admin-allow.conf`. Anyone else can open the dashboard but can't sign in; the browser usually reports that as a CORS or network error, because Nginx's refusal carries no CORS headers.
- The API must be on HTTPS: a page served over HTTPS can't call a plain-HTTP API.
- Support and Rewards run on sample data. Anyone signed in sees their "Sample data" banners and invented records until those features get real services.
