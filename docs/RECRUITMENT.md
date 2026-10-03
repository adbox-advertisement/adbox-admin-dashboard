# Recruitment administration

Implemented at `/recruitment`, accessible through **Recruitment** in the dashboard
sidebar. This feature reads the same Super Admin service used by the public
`adbox-recruitment` form. It does not import browser drafts from that app.
Only successfully submitted live applications stored by the backend appear here;
mock-mode submissions, unfinished forms, and unclaimed uploads do not.

## Source of truth

Implementation was checked against these Desktop repositories on 2026-10-03:

- `adbox-recruitment/src/features/application/{questions,schema}.ts`: all 14
  questions, validation, and field labels.
- `adbox-recruitment/src/services/api.ts`: video registration/upload and public
  application submission contracts.
- `adbox-backend/apps/super-admin/src/recruitment/admin/`: implemented list,
  detail, statistics, CSV, annotations, and decision handlers.
- `adbox-backend/apps/super-admin/src/recruitment/{dto,recruitment-status.ts}`:
  request limits and permitted status transitions.
- `adbox-backend/prisma/schema/recruitment.prisma`: stored applications, private
  video metadata, campaigns, and append-only status events.
- `adbox-backend/apps/super-admin/src/recruitment/email/` and
  `public/recruitment-submission.service.ts`: receipt email behavior.

The backend's older `docs/recruitment-api.md` is an implementation brief, not a
complete description of current code. In particular, receipt email is now
implemented using Resend even though that brief calls it out of scope. Both
sibling repositories had unrelated uncommitted work; they were inspected only.

## What an administrator sees

The AdBox welcome panel shows review progress (the share of applications moved
beyond SUBMITTED) and a **Review new applications** shortcut. Summary cards for
all applicants, new applications, shortlisted, and accepted candidates also act
as filters. Every backend stage remains accessible in the queue's scrollable
stage bar. A side panel shows institution coverage and review guidance.

Overview counts follow the campaign filter; text search, institution, and stage
narrow the queue without redefining totals. The queue is server-paginated,
10 per page by default, with 20/50 options, newest first. Search matches name,
email, or reference as the admin types (300ms debounce); Enter/search submits
immediately. Filter chips can be removed individually. Changing filters or page
size returns to page one. Queue/statistics refresh every minute while the page
is active, and **Refresh** requests an immediate update.

Open a candidate for four tabs: **Application**, **Review**, **Contact**, and
**History**. Data stays in TanStack Query and component memory, without local
storage or Zustand copies. Review/contact drafts survive tab changes while the
profile remains open; closing the profile discards unsaved drafts.

## Light and dark appearance

Use **Settings → Appearance** to change the application theme with its single
button. Recruitment pages and profiles inherit this preference. The installed
`next-themes` package saves only the appearance choice
under the application-wide `adbox-theme` key in localStorage. The default is light.
The choice survives reloads, navigation, and sign-out, and synchronizes across tabs.
Existing recruitment-only preferences are migrated automatically.
Candidate data and review drafts are not stored alongside it.

Both appearances cover navigation, account display, mobile menu, candidate list,
profile tabs, review forms, video containers, exports, dropdown portals, errors,
and success notifications. Shared AdBox fonts and existing purple/blue/cyan and
neutral tokens supply the palette; dark surfaces use mixes of existing tokens.
Sheets respect reduced-motion preferences. The profile has a **Go to review**
shortcut, and the introduction video appears first on smaller screens.

`WorkspaceTheme` is mounted in `AppProviders` above the router. Every application
section shares the preference, including sign-in, RDI/CMS, and website previews.
`compactHeader: true` in recruitment route metadata selects its header layout.

| Applicant submission | Admin presentation |
| --- | --- |
| `fullName` | Identity header and applicant details |
| `institution` (public slug) | Resolved institution name/short name, campus breakdown/filter |
| `programme` | Programme and year of study |
| `phone` | WhatsApp number in details and Contact |
| `email` | Email address in details and Contact; searchable |
| `campusReach` | Full campus reach answer |
| `motivation` | Full motivation answer |
| `experience` | Full student organising experience |
| `availability` | Weekly hours and available days, verbatim |
| `otherRoles` | Other commitments; blank remains explicitly optional |
| `phoneModel` | Phone model and operating system |
| `paymentAnswer` | Full answer to the payment scenario |
| `comfortable` | Yes/No, including an explicit No; API stores a boolean |
| `honesty` | Honest-reporting agreement, Yes/No |
| Uploaded video | On-demand private playback, filename, format, duration, size |
| Campaign/submission receipt | Campaign title, reference, submitted timestamp |

Applicant answers are read-only. The detail also shows rating, internal note,
reviewer, last review date, status, and timestamped decision history. Technical
fields such as idempotency keys, submission IP hashes, storage keys, and checksums
are stripped from the frontend's validated model. The backend's `campusId` is
accepted as nullable metadata; the current public form collects an institution,
not a separate campus selection.

## Vetting workflow

1. Read the submission, watch the introduction, and evaluate the applicant's
   experience, campus access, availability, and explanation of AdBox.
2. Set a 1–5 rating and save an internal note (up to 2,000 characters). Notes can
   be cleared. The current API cannot clear an existing rating to null.
3. Choose an allowed next stage and optionally record a decision note. A
   rejection requires a nonblank reason. Notes are internal, not applicant mail.
4. Use Contact to personalise a separate response, then open/copy the draft into
   an email app. Sending happens in that email app.

```text
SUBMITTED → UNDER_REVIEW → SHORTLISTED → INTERVIEWED → ACCEPTED
     Each nonterminal stage also allows REJECTED or WITHDRAWN.
```

ACCEPTED, REJECTED, and WITHDRAWN are final. The UI explicitly labels final
decisions, prevents skipped stages, and offers no reopen action. The backend
checks transitions independently. A failed write preserves entered notes and
invalidates list/detail/statistics queries to reconcile an ambiguous response.
403/404/409/422 and generic connection failures have visible recovery messages.

## API and permissions

All paths below are relative to the configured Super Admin base URL, normally
`/api/v1`, proxied to `localhost:3005` in local development. No extra environment
variables or dependencies were added. The existing JWT refresh transport is used.

| Method/path | Purpose | Required permission |
| --- | --- | --- |
| `GET /recruitment/applications` | Paginated/searchable queue | `recruitment.applications.read` |
| `GET /recruitment/applications/stats` | Counts by status and institution | `recruitment.applications.read` |
| `GET /recruitment/applications/:id` | All answers and decision history | `recruitment.applications.read` |
| `GET /recruitment/applications/:id/video-url` | Audited 300-second viewing URL | `recruitment.applications.read` |
| `PATCH /recruitment/applications/:id` | `{ internalNote, rating? }` | `recruitment.applications.review` |
| `POST /recruitment/applications/:id/status` | `{ status, note }` | `recruitment.applications.review` |
| `GET /recruitment/applications/export` | Backend-generated CSV | `recruitment.applications.export` |
| `GET /recruitment/campaigns?includeInactive=true` | Campaign filter including previous drives | `recruitment.campaigns.manage` |

The wildcard permission is supported. Accounts without read permission do not
request application data. Read-only accounts can view answers/history/video but
cannot annotate, decide, or use response-draft controls. Campaign management
permission currently gates even the backend's campaign list; reviewers lacking
it see all campaigns and each row's campaign, without a campaign selector.
This is a backend permission limitation, not an empty campaign catalogue.

CSV supports campaign, institution, and status filters only. The download dialog
explains that search is excluded, that the backend caps exports at 10,000 rows,
and that full essays/videos are not columns. The server owns CSV escaping and
audit logging. No client-side export fabricates additional rows or video URLs.

Video URLs are requested only on **Watch introduction**, expire in component
memory, and can be renewed after expiry or playback failure. They are neither
persisted nor included in response drafts or exports. `redactedAt` explains why
identity, answers, and video are unavailable; contact/review controls and history
note text are suppressed for those records. The default backend retention window
is 365 days, configurable by the backend. Previously removed data cannot be
recovered through the dashboard.

## Responses and remaining backend work

The backend sends an application-received email after a successful new submission
when Resend is configured. Reserved test domains and missing configuration skip
delivery; email failure does not undo the application. Idempotent submission
replays do not resend receipts. There is no receipt delivery status in the admin
detail response.

**Changing a review stage does not email, WhatsApp, or notify the applicant.**
The existing status service only updates the database, writes a status event,
and records an audit entry. There is no response-send endpoint, conversation
store, interview scheduler, public status lookup, or delivery webhook integration.
Contact therefore provides editable follow-up/interview/acceptance/decline drafts,
clearly labeled as manual, without reporting them as sent.

See [Recruitment response backend brief](RECRUITMENT_RESPONSES_BACKEND.md) for the
concrete proposed backend contract and reliability work needed before replacing
manual email drafts with tracked delivery. Campaign creation/editing and permanent
erasure endpoints exist in the backend but are not exposed by this review feature.

## Verification

Unit/component coverage lives beside the feature; synthetic fixtures live in
`src/test/recruitment-fixtures.ts`. Browser coverage is
`tests/smoke/recruitment.smoke.mjs`, included in `npm run test:smoke`.
It checks answers, video authorization on demand, failed-save retry, ratings,
status/history, manual drafts, CSV filter scope, live search, removable filters,
stage shortcuts, pagination/page sizes, campus filtering, reload persistence,
theme persistence across routes, mobile navigation, and both appearances at
320–1440px. All API/browser fixtures are synthetic;
production UI never substitutes mock candidates when requests fail.

Run `npm run check`, then `ADBOX_TEST_URL=http://127.0.0.1:5174 npm run test:smoke`
with the dev server running on 5174. Live verification additionally requires an
authenticated admin with the listed permissions and the recruitment-enabled
backend pointed at the same database used by the live public recruitment form.
