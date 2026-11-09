# Current handoff

Read alongside `AGENTS.md` and confirm the working tree before continuing.

## Live activity: waiting-work badges, toasts and a chime (2026-11-08)

- Request: "shows some sort of notification to every section of the navigation if something pops up, like
  sockets with some audio". Chosen: badges count **waiting work** (from the database, shared by admins, drop as it
  is handled); a **chime made with Web Audio** (no file); `socket.io-client` added (approved).
- Backend (`adbox-backend`, branch `test`, uncommitted; docs `super-admin-api.md` "Live activity",
  `architecture.md`): `libs/redis/src/admin-activity.ts` (`admin:activity` channel, `AdminActivityPublisher`); the
  gateway publishes `{ section }` after committing an ad in review, an ad report, a post/comment/chat report, a page or
  business request (sent, or resent after changes), a publisher's company (sign-up or resubmit), a verification
  request, an honour nomination; recruitment's form too. Super-admin `src/activity/`: `GET /activity/counts` (only
  queues the admin's permissions open), Socket.IO `/admin` on path `/api/v1/socket.io` (auth: access token; session
  rechecked every minute; rooms per permission), recount after any successful super-admin write (interceptor) and
  every 30 s while anyone is connected. HTTP auth checks moved unchanged into `common/admin-session.verifier.ts`,
  shared by the guard and the socket.
- Dashboard `src/features/activity/`: `useLiveActivity()` in `DashboardLayout` (counts query, lazy-loaded socket,
  toast with View, chime, refreshes that queue's feature queries, polls every minute while the socket is down,
  renews a refused session); off on `/rdi` routes (no requests, no badges: RDI rule). Badges reach the shared sidebar
  through `components/layout/nav-badges.ts`; section totals, per-entry counts, a dot on the mobile menu buttons;
  names read "Ad Requests, 3 waiting" (aria-label). Settings → Notifications: sound on/off (`adbox-activity-sound`)
  and Play sound. Vite `/api` proxy has `ws: true`.
- Found and fixed while testing: the chime's audio context was first created on the page's first click, which
  stalled it ~0.5 s in headless Chrome (now made only when a chime plays, suspended after); super-admin subscribed
  to Redis before its clients existed (global module init order; now `onApplicationBootstrap`).
- Checks: dashboard lint, architecture, test types, build, vitest 58 files / 377 tests; smoke `activity` (new,
  `ADBOX_SMOKE_FEATURE=activity`) and the full suite passed on a preview build (`ADBOX_TEST_URL=http://127.0.0.1:4173`).
  Backend: both apps' `tsc`, Prettier and ESLint on touched files, full jest 184 suites / 2402 tests (before the last
  fixes; affected suites rerun), super-admin e2e. Live against Docker (images rebuilt): 11 socket checks (permissions,
  refusal, Vite proxy, rooms, increase/decrease, revoked session) and a real browser (toast, badge, View); temporary
  admins and the test verification request were removed.
- Known, not changed: `video-management.smoke.mjs` types the hashtag right after "Add hashtag" and sometimes loses
  the first letters (also on the code without this work, 1 in 4 alone); the dev server on 5173 sometimes drops its
  HMR socket under load and reloads the page mid-smoke. Existing `no-unsafe-*` lint errors in the backend's
  `ad-campaign.service.spec.ts` and `page-requests.service.spec.ts` predate this work.
- Docker note: `docker compose build` hung on the Docker Desktop credential helper; building with an empty
  `DOCKER_CONFIG` (anonymous pulls) worked.
- Not done: the header's Notifications bell still does nothing (could list waiting queues); the gateway → Redis
  publish was verified by unit tests and `redis-cli PUBLISH`, not by a real app user's action.

## Sidebar order (2026-11-06)

- Request: "rearrange the left navigation … just rearrange them nothing else". Only the order of `navItems` in
  `src/config/navigation.ts` changed: Dashboard, Manage Users, User Content, Ads Management, Financials, Video
  Management, RDI, Recruitment, Support, Manage Admins, Settings. Ads and Financials now sit together; RDI's entry
  is untouched and keeps its seventh place. No labels, icons, routes or children changed. ESLint on the file and
  `npm run build` passed; no test depends on the order, so the Vitest suite was not rerun.

## Ads Management, Advertisers Payment, ads in bars (2026-11-05)

- Request (owner): redesign ads and payments — Phase 1 "fair and safe". Ads are paid in **gold bars only**: the
  budget is held when an ad is made, views are charged per 1,000, the rest goes back; new people's ads and anything
  with words or pictures of its own wait for AdBox's review; three reports pause an ad. Backend
  `adbox-backend/docs/ad-delivery.md`, `docs/super-admin-api.md` "Ads".
- New feature `src/features/ads/` (own `components/AdsBits.tsx`: features may not share UI). Routes replace the
  pending pages: **Ads Management** (`/ads-management`: stage tiles linking the queue and reports, search, format,
  stage chips with counts, every ad), **Ad Requests** (PENDING_REVIEW oldest first, with "Waiting …", account age,
  unverified email), **Reported Ads** (reasons counted, "Paused by reports"). Each row opens `AdDetailSheet`:
  creative, who runs it (made-up page/business emails never shown), who sees it, gold (held at start, charged,
  still held or returned, price, views it buys), delivery with views by day, review history, reports; actions by
  permission and stage — Approve/Refuse (`ads.review`), Pause/Resume/Stop/Dismiss/Uphold (`ads.manage`). Refuse,
  Stop and Uphold ask for a reason (5–300) with AdBox's common reasons (betting, alcohol, loans, forex/crypto, paid
  essays, misleading, bad link); Stop can return every bar. Actions use `mutateAsync`: the list refetch can remove
  the ad and close the sheet before per-call callbacks would run (found live: the approval saved but no toast).
- **Financials › Advertisers Payment** (`payments.read`): paid-in totals, status chips with counts, search by buyer
  or Paystack reference, each purchase (bundle or "Exact top-up", channel, reference, failure reason).
- **Gold & pricing**: ad fields now in bars — least/most a day, bars per 1,000 views (with its cedi value), fewest
  people an ad may target, frequency cap; the example says what a plan holds, buys and reaches, or that the
  audience is too small. `lib/gold-settings.ts` mirrors the backend (`viewsForBars`).
- **User Content › Ads** parses the new shape (bars; no start or end while in review: "Starts when approved").
- Tests: `ads/pages/AdsPages.test.tsx` (8), `financials/pages/AdvertisersPaymentPage.test.tsx` (2), Gold & pricing
  (7), content (43). Smoke `tests/smoke/ads.smoke.mjs` (`ADBOX_SMOKE_FEATURE=ads`, and in the full run): overview
  filters, pause, a refusal with a reason, dismissed reports, payments, dark mode, no overflow 320–1440 — passed;
  `financials` and `content` smokes passed. The route loop in `app.smoke.mjs` no longer visits these pages (they
  call the API). Lint, architecture, app and test types clean. Full vitest run (load average ~50): 345 of 353;
  seven were 5 s timeouts in untouched Recruitment, User Content and Manage Users files and one the ads overview's
  first wait (the file now allows 5 s, `configure({ asyncUtilTimeout })`); every one of those files passes alone.
- Live against the local super-admin (temporary admin with `ads.*` and `payments.read`, removed): a real new
  person's two ads — one approved (running 3 days), one refused with "Betting is not allowed in ads." (all 1,500
  bars back); after three real reports paused the approved one, Dismiss ran it again; payments showed GHS 2,485.77
  paid in; no console errors or failed calls, no overflow at 390/320, dark mode drawn. Dev server on
  `http://localhost:5173`.

## Financials › Gold & pricing (2026-11-04)

- **One exchange rate** (asked: "make bars per cedi follow the store's base rate automatically … I want the exchange
  to make sense"; chosen: one rate for everything). "Bars per cedi" is the exchange rate: a bundle is a price and a
  bonus, its bars the price at the rate plus the bonus (no "Base bars" field; the dialog says "At GHS 1 = 50 bars,
  GHS 9.99 is 500 bars; with the 10% bonus, buyers get 550 bars"). Changing the rate shows what each bundle becomes
  before saving (`reprice-preview`), the server reprices them in the same write, and the bundles are read again.
  The table's rate column is "Per cedi, with bonus". `lib/gold-settings.ts` mirrors `bundleBaseBars` /
  `bundleTotalBars`. Tests 7; smoke covers the preview and repricing.

- Request (owner): super-admin sets every number gold touches — the store, Spotlight, ads (and how audience size
  limits reach), and the least and most a survey may pay. Backend `adbox-backend/docs/gold-wallet.md` "Settings",
  `docs/super-admin-api.md` "Gold economy".
- New feature `src/features/financials/` (own `components/Surface.tsx` and `lib/errors.ts`: the architecture check
  forbids reaching into Manage Users). Route `/financials/gold-pricing` (`APP_ROUTES.goldPricing`), first child of
  Financials in the sidebar; the other Financials pages are still pending.
- One page, `pages/GoldPricingPage.tsx`:
  - **Gold**: bars per cedi (prices ads), daily reward.
  - **Survey rewards**: least/most per response (the creator types any whole number between), least/most total,
    three formats from, any formats from, and a one-line summary.
  - **Ads**: daily budget least/most, lengths on offer (chips, add/remove, up to 8), people per cedi low/high,
    impressions per cedi, frequency cap; beside them the people each audience holds now (Everyone · Students ·
    Alumni, from the server) and a worked example (GHS 30 × 7 days: cost, reach held to the audience).
  - Each field shows its default when changed from it and a "Changed" mark; problems are shown on the field
    before saving (`lib/gold-settings.ts` mirrors the backend's rules) and the server's `problems` after. A sticky
    bar saves only what changed (`PATCH /gold-settings`) or discards.
  - **Gold store**: bundles table (price, bars with bonus, bars per cedi, sold, on/off sale); add/edit dialog that
    shows what buyers get; the total is the server's.
  - **Spotlight**: plans (days, price in bars, label, on sale, bought) with add/edit, on super-admin's existing
    `/spotlight-plans`.
- Permissions `gold.settings.read` (view) and `gold.settings.manage` (change); Spotlight needs
  `spotlight.plans.manage`. A reader sees everything disabled; no permission shows the usual no-access state.
  Backend role presets: `FINANCE` (new) and `AUDITOR` (read).
- Tests: `pages/GoldPricingPage.test.tsx` (6); smoke `tests/smoke/financials.smoke.mjs` (in the full run, or
  `ADBOX_SMOKE_FEATURE=financials`): saves a widened survey range and a new ad length (only the changes sent),
  catches a broken pair, audience-capped reach, a bundle edit, dark mode, no overflow 320–1440 — passed. Lint,
  architecture, test types and build clean. Full `npm test`: 48 of
  51 files pass; User Content, Recruitment and Manage Users hit 5 s timeouts under load and pass alone (34/34).
- Live against the local super-admin (temporary admin with `gold.settings.*` and `spotlight.plans.manage`,
  removed): the page loads real values and audience sizes; changing the daily reward to 60 and back saved both
  times; a broken survey pair disabled Save; the bundle dialog opened; no console errors or failed calls on the
  page; no overflow at 390 or 320; dark mode checked. The dev server must be on `http://localhost:5173`
  (super-admin's `SUPER_ADMIN_CORS_ORIGIN`).

## Who runs a page or business, in Manage Users (2026-11-04)

- Request: the dashboard did not show who runs a company or page (backend `adbox-backend/docs/business-accounts.md`,
  "People": pages and businesses are run by people who switch to them from their own accounts).
- A person's **Publishing** tab: "Run by N people" (owners first, Owner/Editor, Invited or "since …") when the
  account is a page or business, and "Pages and businesses they run" (Page/Business, role) for a person; the
  "Not publishing for any company" empty state is not shown for a page run by people. **Company** page: "Who runs
  its account" when it was asked for from someone's account. Shared lists in `components/RunAccounts.tsx`.
- Made-up addresses (`…@accounts.adbox.invalid`, pages, businesses and erased accounts) are never shown as real:
  hidden in the profile header, and the Email row says "None: nobody signs in to it by email"
  (`isPlaceholderEmail` in `lib/format.ts`).
- Data: `relationshipsSchema` gains `runBy`/`runs`, `companyDetailSchema` gains `runBy` — all default to empty
  for an older server. `personFixture` is exported from `src/test/users-fixtures.ts`.
- Backend (super-admin, uncommitted): relationships and company detail return them; container rebuilt.
- Checks: `pages/RunAccounts.test.tsx` (5); users feature 70 passed; lint, test types and build clean; users smoke
  passed. The full `npm run check` had 3 timeouts just over 5 s in User Content and Recruitment while the machine
  was busy; those two files pass on their own (23/23) and were not touched. Live with a temporary admin
  (removed): `@ug.legonhall` shows Adwoa Owusu as owner, Adwoa shows the page she runs, Abena's Kitchen's company
  shows Abena; no errors; 390px has no overflow.

## Page requests are real; pages are run like businesses (2026-11-03)

- Request (owner): campus pages work like business accounts — run by the requester from their own account,
  no password, no emailed login. Backend `adbox-backend/docs/group-pages.md` §14.
- Page requests now use super-admin's `/page-requests` (the in-memory `page-requests-api.ts` and the sample
  queue are deleted). Gated by `page_requests.read` / `page_requests.review` (new in `USER_PERMISSIONS`), not
  the companies permissions. Queue: server counts, search, pagination, logo, "In review · you" from
  `reviewerId`. Review: the letter (a photo inline, a PDF in a new tab; link refreshed every 4 minutes) with the
  four letter checks gating Approve; approve with the server's username check; "Run by {requester} · owner";
  **no email preview and no "email the login"** — approving creates the page account and the requester is told
  in the app. Outcome links to the page's account.
- Shared by both reviews: `components/RequestReview.tsx` (decision tabs, proof file, checklist, checks,
  history, username/name fields, ask-for-changes and decline forms) and `lib/requests.ts` (`firstName`,
  `isPicture`, `usernameHint`). `validation.ts` shares the request query, counts, username check, changes and
  decline schemas. `lib/page-requests.ts` keeps only labels and helpers (`letterChecks(name)` is a function).
- Tests: `pages/PageRequests.test.tsx` (5, mocked API), `lib/page-requests.test.ts` (helpers, `usernameHint`),
  an API contract test; smoke reviews and approves a page request through mocked routes.
- Checks: `npm run check` passed (331 tests, build); users smoke passed. Live: akosua.frimpong's request
  (PR-0002, photo of a letter) reviewed in the real dashboard with a temporary admin (removed): claimed, letter
  loaded, a taken username flagged, approved as `@ug.drama`; the page's account opened; no console errors or
  failed calls; 390px has no overflow.
- Next: member management (add an editor, hand over) needs backend routes; the company page has no "Ask for
  changes" yet.

## Business requests review, live (2026-11-03)

- Request: a review screen for business requests (mobile app: someone asks for a business account from
  their own; approving makes it its own account with a verified company, run by them). Built on the Page
  requests review below, but on super-admin's real `/business-requests` (backend `docs/business-accounts.md`,
  `docs/super-admin-api.md`).
- Manage Users › **Business requests** (`/manage-users/business-requests`, sidebar child after Publishers &
  Companies, open count in the section nav). Queue: status chips with server counts, debounced server search
  (name, username, registration number, requester), pagination; logo, category, location/campus served,
  requester and account age, worst check, waiting, status ("In review · you" from `reviewerId`). Review
  `/manage-users/business-requests/:id`: cover, what they sent (requester links to the profile), proof
  (number or "not registered"; a photo shown inline, a PDF opened in a new tab; the 5-minute presigned link is
  refetched every 4 minutes) with three reviewer checks gating Approve, AdBox's checks, history. Opening a NEW
  request claims it. Approve (username checked by `GET :id/username-available` as typed; name), Ask for
  changes (note; not offered again while it waits), Decline (business reason labels, optional note, an empty
  note is not sent). Decided: outcome with Open the account / Open the company. Permissions:
  `companies.read` / `companies.verify`.
- Files: `pages/BusinessRequestsPage.tsx`, `pages/BusinessRequestReviewPage.tsx`,
  `components/BusinessRequestParts.tsx`, `lib/business-requests.ts`; sections in `api.ts`, `hooks.ts`,
  `validation.ts`; `usernameFormatProblem` split out of `usernameProblem`; `PageRequestStatusPill` takes
  `mine`; `companySizeLabels` now shared with `CompanyDetailPage`. Tests: `pages/BusinessRequests.test.tsx` (5),
  3 contract tests in `api.test.ts`, fixtures in `src/test/users-fixtures.ts`; `manage-users.smoke.mjs`
  reviews and approves one.
- Backend (super-admin, uncommitted): the username route, `reviewerId` and `logoUrl` on every item; container
  rebuilt and recreated.
- Checks: `npm run check` passed (330 tests, build). `ADBOX_TEST_URL=http://127.0.0.1:5179
  ADBOX_SMOKE_FEATURE=users npm run test:smoke` passed. Live against the local backend with a temporary admin
  (removed): a real request (BR-0003, photo proof) was claimed, a taken username flagged, approved; the company
  page opened; no console errors or failed calls; light, dark and 390px checked.
- Next: Page requests are still sample data although super-admin has `/page-requests`; the company page has no
  "Ask for changes" though the backend supports `NEEDS_CHANGES`.

## Page requests (group pages), sample data (2026-10-31)

- Request: the admin side of the mobile app's group pages (official pages for faculties, halls, churches,
  clubs), as designed in `adbox-mobile-mvp/docs/design/group-pages/` (AdminQueue, AdminReview), with **no
  endpoints**. Backend plan: `adbox-backend/docs/group-pages.md`.
- Manage Users › **Page requests** (`/manage-users/page-requests`, sidebar child, section nav with the open
  count): status chips with counts (All open · New · In review · Needs changes · Approved · Declined), search,
  table oldest first (group, place, requester and account age, worst automatic check, waiting, status).
  Review page `/manage-users/page-requests/:id`: what they sent, proof (a drawn sample letter, 4 checks the
  reviewer must tick before Approve), automatic checks, history; decision panel Approve (username, name,
  Staff & faculty, email preview: username and a set-password link, no password) / Ask for changes (note) /
  Decline (reason, optional note); decided requests show the outcome. Opening a NEW request claims it.
- Data: `lib/page-requests.ts` (types, 16 sample requests, helpers) served by `page-requests-api.ts`, an
  in-memory stand-in with the call shapes a real service would have (hooks in `hooks.ts`, schemas in
  `validation.ts`). Decisions last until reload; both pages say "Sample data". Gated by `companies.read` /
  `companies.verify` until the backend adds `page_requests.*`.
- New `lib/cn.ts` in the users feature: the content feature's font-size-aware `cn` (the shared one drops
  `text-b*` sizes next to a colour); only the new files use it.
- Checks: `npm run check` (architecture, lint, test types, build) passed; the Vitest suite passes, but with
  the Flutter suite running alongside, nine tests in four files (recruitment, content, users) hit the 5 s
  timeout; the page-request file now allows 15 s. `ADBOX_SMOKE_FEATURE=users npm run test:smoke` passed
  (new page-requests steps, no overflow 320–1440). Screenshots checked light/dark, desktop and 390px.
- Next: wire to the backend once `docs/group-pages.md` is built (its §12 lists the swaps).

## Dashboard theme matches the mobile app (2026-10-25)

- Source: `adbox-mobile-mvp/lib/ui/core/theme/app_colors.dart` (`AppColors`, `AppThemePalette`). The app
  replaced magenta/violet/cyan and multicolour gradients with one Royal Indigo scale, neutral surfaces and
  flat fills. `src/styles/index.css` now has `--adbox-royal-50…950` (`royal-*` utilities). Old names
  resolve like the app's: purple → royal-600 (500 in dark), blue → 700, cyan → 400. Gradients are flat
  indigo (the header panel is a 900→700 fade, charcoal in dark). Shadows are neutral. Light surfaces and
  text use `AppThemePalette.light` (canvas `#f4f5f7`, border `#dce0e5`, text `#17191d`/`#555c66`). Dark
  mode uses the charcoal palette (`#0d0f12`/`#191d22`/`#20252b`, border `#2c323a`). Grey/error/warning/
  success scales were already identical.
- RDI is unchanged: a block at the end of `index.css` pins every changed token to its previous value
  inside `.rdi-cms`, `.rdi-cms-dialog`, `.rdi-website` and the new `.rdi-theme`. With the user's explicit
  permission, `rdi-theme` was added to RDI's two `SelectContent`s (`cms/components/ContentField.tsx`,
  `cms/pages/CmsEditorPage.tsx`), whose lists render outside those scopes. No other RDI edits.
  Verified: 24 RDI captures (CMS, website pages, preview, dropdown; light and dark) are pixel-identical
  to before within the viewport. Below the fold only the dashboard background behind them differs.
- `appearance.smoke.mjs` expects the new muted text colour. `npm run check` passed (311 tests, build).
  The full `npm run test:smoke` passed, including all RDI suites.
- Not changed: brand logos/SVG icons, and `#6432ed` in `features/dashboard/data/approvals.ts` (mock data).

## User Content redesign (2026-10-25)

- Request: total redesign of User Content (modern, easy to use), sub-pages allowed. Frontend only; no
  backend changes. The report endpoints already existed in the backend and the running container.
- `src/features/content/` is now `UserContentLayout` plus sub-pages: Overview (moderation-queue card,
  figures, content mix, top creators, latest uploads), Posts (all formats, type chips, live/removed,
  grid/list, URL filters) with a post detail page, Ads (cards with campaign progress, side-sheet
  details), Surveys (cards), and Reports (new: post/comment and message queues, detail pages with
  the reported content or chat transcript, resolve/dismiss with optional removal and a note). Sidebar has
  User Content children; the section nav shows the open-report count. `?userId=` scope and old `?tab=`
  links still work. Replaced `UserContentPage`, `PostsPanel`, `AdsPanel`, `SurveysPanel`,
  `PostDetailDialog` (the feature folder was never committed, so the old files are not in Git).
- Found: the shared `cn` (`src/lib/utils.ts`) treats `text-h*`/`text-b*` as colours, so with a
  `text-grey-*`/`text-muted-*` class the size is dropped app-wide (e.g. Manage Users stat values,
  sidebar sub-items). Fixing it globally changes sizes across the app, so it was left alone, and the content feature uses
  `lib/cn.ts`. Needs a user decision before a global fix.
- Checks: `npm run check` passed (46 files / 311 tests, build). Smoke runs with `ADBOX_SMOKE_FEATURE=content`
  (new option, rewritten `user-content.smoke.mjs`) and `=users` both passed against `127.0.0.1:5173`.
  The shared route sweep was flaky once (`/video-management/upload` overflow at 320; it passed on rerun).
  Screenshots were checked with mocked data: desktop light, plus 390px in light and dark. Not checked
  with a real admin login or real report data.

## Dashboard font matches the mobile app (2026-10-24)

- The mobile app (`adbox-mobile-mvp`, `AppTypography`) uses Manrope only. All five dashboard font
  tokens in `src/styles/index.css` (`--adbox-font-heading|sans|body|caption|chart`) are now Manrope;
  the Google Fonts import adds weight 800, as in the mobile app.
- The user asked that nothing change on RDI. No RDI file is modified: `index.css` restores the old
  values (Outfit headings, Inter captions/website body, DM Sans charts) under `.rdi-cms`,
  `.rdi-cms-dialog` and `.rdi-website`, so those fonts stay loaded.
- Checks: `npm run check` passed (44 files / 292 tests, build), and the appearance smoke suite passed.
  Computed fonts were confirmed in the browser: Manrope on dashboard pages, while RDI CMS and website
  keep Outfit headings and the website keeps Inter body text.

## Manage Users redesign (2026-10-24)

- Request: total redesign of Manage Users covering everything about platform users (student/alumni/
  faculty affiliation, viewer/creator/publisher roles and their relationships), with sub-pages. The user
  chose to extend the backend too, with all four section groups.
- **Backend** (`adbox-backend`, uncommitted; the worktree was clean before): `apps/super-admin/src/
  platform-users/` gains list filters `role`, `affiliation` (incl. `NONE`), `campusId`, `badge`, split
  `status` (`suspended` is now AdBox-only; `deactivated|pending_deletion|erased` are the owner's), search
  by name/phone/exact id, follower/following/company counts; new `GET stats`, `GET :id/relationships`,
  `GET :id/connections`. Profile images/logos are returned as CDN URLs (StorageModule imported).
  `companies` list/detail now include owner, publishers and counts. No schema changes or migrations.
  Docs: `docs/super-admin-api.md`. Specs: new `platform-users-directory.spec.ts`; 22 user specs pass, `tsc`
  0 errors, ESLint clean. All new queries ran against the local DB via a throwaway script (removed).
  Super-admin container rebuilt with `--no-deps` and healthy; the api-gateway container was stopped at
  the user's request.
- **Frontend** (`src/features/users/`): `ManageUsersLayout` with sub-pages Overview, People (+ full
  profile page with Profile/Connections/Publishing/Badges & honours/Account tabs), Institutions (+ detail
  with campus breakdown and members), Publishers & Companies (+ detail, approve/reject), Verification,
  Honours (Gye Nyame review, override needs a note). Badge management dialog uses `PATCH :id/badges`.
  Replaced `ManageUsersPage`, `UsersTable`, `UserProfileSheet`. Sidebar now has Manage Users children;
  `DashboardSidebar` matches nested child paths. User Content links to the new profile route; `?user=`
  still redirects.
- Colour: brand blue/purple/cyan failed the CVD check for categories, so breakdowns use single-hue bars
  with labelled counts. No new colours, fonts or dependencies.
- Checks: `npm run check` passed (232 files, 44 test files / 292 tests, build). `ADBOX_TEST_URL=
  http://127.0.0.1:5173 ADBOX_SMOKE_FEATURE=users npm run test:smoke` passed (new `users` option). The
  full smoke run stops in untouched `video-management.smoke.mjs` ("Choose a folder" heading). Screenshots
  were checked in light/dark at desktop and mobile with mocked data. Not verified with a real admin login.
- Remaining: live check with real admin credentials; consider an honours renewal flow and
  admin ad cancellation (both need backend work).

## User Content video playback fix (2026-10-06)

- Cause: the database stores media as S3 keys, and the mobile API maps them to CloudFront itself.
  My `user-content` endpoints returned the raw keys, so the frontend rejected them as unsafe
  URLs. Processed videos are also HLS, which Chrome can't play without a player library.
- Backend (`apps/super-admin/src/user-content/`): new `user-content.media.ts` mirrors the gateway's
  rules. Every media key becomes a CloudFront URL (images, thumbnails, survey covers, uploader avatars).
  Videos return `hlsUrl` (the master once COMPLETED, otherwise the lowest rendition) and `mp4Url`
  (the uploaded original, only if fully uploaded MP4). Raw `videoUrl`/`s3Key` are no longer returned.
  `StorageModule` is imported. The specs (11) pass, `tsc` has 0 errors, and lint is clean. I rebuilt
  the container with `--no-deps`, and it is healthy.
- Frontend: `components/VideoPlayer.tsx` and `lib/playback.ts` play HLS natively in Safari and the MP4
  original elsewhere, fall back on an error, and explain when only HLS exists in a non-Safari browser.
  Full non-Safari HLS support would need `hls.js` (a new dependency the user hasn't approved).
- Checks: `npm run check` passed (41 files / 266 tests), and the smoke suite passed. I haven't verified
  playback with real data (that needs an admin login).

## User Content 404 fix (2026-10-06)

- The "item no longer exists" error came from the Docker `super-admin` container, which still
  ran an image built before the `user-content` endpoints existed (`Cannot GET /api/v1/user-content/...`).
  I confirmed the DB had no pending migrations (31 migrations on disk and 31 applied) and rebuilt only that
  service with `docker compose up -d --build --no-deps super-admin`. It is healthy, and all `/user-content/*`
  routes now return 401 without a token. I have not verified them with real data.
- Frontend: `contentErrorMessage`/`usersErrorMessage` now report a missing server route
  ("doesn't support this yet… rebuild or redeploy") separately from a deleted record.
  Test: `src/features/content/lib/errors.test.ts`.

## User Content page + backend endpoints (2026-10-05)

- User asked for resources (videos, pictures, ads, surveys) by uploader in a new sidebar
  tab, with backend endpoints added and moderation (view + moderate).
- **Backend** (`/Users/pamelanutsukpo/Desktop/adbox-backend`, uncommitted, scoped to new
  files): `apps/super-admin/src/user-content/` (module, controller, service, DTOs, spec),
  permissions `user.content.read` / `user.content.moderate` in `common/permission.constants.ts`
  (synced to the database on startup), module registered in `super-admin.module.ts`, docs in
  `docs/super-admin-api.md`. No schema or migration changes. The backend worktree has other people's
  uncommitted work (gold wallet, posts, surveys, `resources.prisma`). I did not touch it.
  `AdCampaign` currently exists only in that uncommitted gold-wallet work.
  Checks: `npm run build:super-admin`, `tsc -p apps/super-admin/tsconfig.app.json` (0 errors),
  ESLint on the changed files, and jest for user-content/rbac/common (106 passed).
- **Frontend**: `src/features/content/` with route `/user-content` and a "User Content" sidebar
  item after Manage Users. It has totals, top uploaders, a `?userId=` uploader filter, and
  Videos/Pictures (gallery), Text, Ads (table plus a read-only detail view), and Surveys tabs.
  Moderators can remove/restore posts (optional reason, audited) and deactivate/reactivate surveys.
  `Pagination` moved to `src/components/ui/pagination.tsx` (`pageRange` is in `src/lib/pagination.ts`).
  Manage Users now deep-links profiles via `?user=` and has a "View uploads" button.
- Not done: admin ad cancellation (needs the gold-ledger refund moved into a shared lib) and
  live testing against a running backend (all frontend checks used mocked APIs).
- Checks: `npm run check` passed (39 files / 260 tests, clean lint, build), and
  `ADBOX_TEST_URL=http://127.0.0.1:5181 npm run test:smoke` passed, including the new
  `tests/smoke/user-content.smoke.mjs`.

## Manage Users integrated (2026-10-05)

- Replaced the `/manage-users` pending page with `src/features/users/` (Axios → TanStack
  Query → UI, Zod-validated). Backend contracts read from
  `adbox-backend/apps/super-admin/src/{platform-users,verification,institutions}` (read only).
- **All users** tab: 5 summary counts (via `limit=1` totals), debounced server search,
  status/verification/institution filters, 20-per-page pagination, row actions.
  **Profile drawer**: contact & sign-in, personal, education, account (ID copy, IP, dates),
  suspended/pending callouts, Edit and Suspend/Reactivate. Edit sends only changed fields
  (API cannot clear fields). **Verification requests** tab: status filter, evidence links
  (http(s) only), Approve / Reject (note 3–500 chars), reviewer + note history.
- Permissions gate tabs/actions (`platform.users.*`, `verification.*`, `institutions.read`).
- Backend gaps: no create/delete user, no per-user verification history filter, no
  last-login/activity data, verification list lacks user details (resolved per row).
- Tests: `validation.test.ts`, `api.test.ts`, `pages/ManageUsersPage.test.tsx`; fixtures in
  `src/test/users-fixtures.ts`; smoke in `tests/smoke/manage-users.smoke.mjs` (removed
  `/manage-users` from the pending-route loop). `npm run check` passed (35 files / 242 tests,
  clean lint, build). `ADBOX_TEST_URL=http://127.0.0.1:5181 npm run test:smoke` passed.
- Also earlier this session: added a header to `CLAUDE.md` and wiring/single-test notes to
  `AGENTS.md`. No commits.

## Recruitment advert script (2026-10-03)

- Added `docs/RECRUITMENT_ADVERT_SCRIPT.md`: a 60s director's script (plus 30s/15s
  cuts) for the campus rep recruitment video. Any-gender lead, 6 scenes with locations,
  dialogue, performance notes, and right/wrong checks. Facts come from the Desktop Rep
  Recruitment Pack and Rep Playbook. Placeholders ([WHAT REPS GET], [HOURS], etc.)
  stay unfilled until the launch lead approves them. Linked from `docs/RECRUITMENT.md`.
  HTML/CSS version: `docs/recruitment-advert/{index.html,styles.css}` (AdBox colours/fonts,
  light/dark, print styles, no overflow at 375px or 1440px). Docs only; no app code changes.

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
