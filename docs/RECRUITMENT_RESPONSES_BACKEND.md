# Recruitment responses — backend extension brief

Status: proposed follow-up, not an implemented API. Based on the backend code
inspected on 2026-10-03. The dashboard currently uses manual email drafts; no
emails were sent and no sibling repository code was changed during UI integration.

## Existing behavior

`RecruitmentMailerService` uses Resend for application-received receipts. It does
not send interview invitations or outcomes. `changeStatus` records a decision
event and an audit entry but has no notification call. Application detail has
no outbound message list, sender, provider ID, delivery state, or retry record.
The admin must never see “Sent” merely because a status write succeeded.

## Proposed contract

Add a dedicated permission, for example `recruitment.applications.respond`, to
the permission catalogue and seed assignments. Keep reads under existing read
access. Do not allow unauthenticated or public-user tokens on these routes.

| Endpoint (under `/api/v1`) | Proposed behavior |
| --- | --- |
| `GET /recruitment/applications/:id/messages?page=1&limit=20` | Message history with author, subject, text, timestamps, delivery status, and safe error summary |
| `POST /recruitment/applications/:id/messages` | Validate and enqueue an email to the application's stored email; require `Idempotency-Key` |
| `POST /recruitment/applications/:id/messages/:messageId/retry` | Retry a retryable failure, preserving message identity and preventing duplicate sends |
| Provider webhook | Verify the provider signature, deduplicate events, and reconcile delivery/bounce/failure state |

Example enqueue body:

```json
{
  "template": "INTERVIEW_INVITATION",
  "subject": "Interview invitation · ADBX-CR26-0001",
  "body": "The admin-reviewed plain-text message",
  "expectedApplicationStatus": "SHORTLISTED"
}
```

The server resolves the recipient; do not accept an arbitrary `to` address from
the browser. Validate reasonable subject/body limits, reject header newlines,
reject redacted/deleted records, check permission, and check status compatibility
for acceptance/decline templates. Return `202` with a message ID and `QUEUED`,
not `SENT`. A repeated idempotency key with the same payload returns the existing
message; a different payload with that key returns a conflict.

Use a `RecruitmentApplicationMessage` model with application ID, actor admin ID,
template/version, subject, body, recipient snapshot, idempotency key, provider ID,
status, created/queued/sent/delivered/failed timestamps, and a safe failure code.
Suggested states: `QUEUED`, `SENDING`, `SENT`, `DELIVERED`, `FAILED`, `BOUNCED`.
Keep status events and correspondence distinct. An internal decision reason must
never become an applicant-facing message automatically.

## Delivery and history

- Commit the message and an outbox job together. Use existing queue names and
  infrastructure from `libs/queue-names` / `libs/message-queue`; do not rely on a
  browser waiting for an email provider. Coordinate with the notification worker
  rather than creating a second inconsistent sender configuration.
- Retry transient failures with bounds/backoff and provider idempotency. Record
  permanent failures and bounces; make them visible to the reviewer.
- Distinguish provider acceptance from actual delivery. Do not infer that a
  message was read from a successful enqueue/send call.
- Audit enqueue/retry outcomes using IDs and safe metadata. Do not log message
  bodies, applicant contact details, videos, or signed URLs.
- Extend erasure/retention to message content, recipient snapshots, event note
  text, and queued deliveries. The current retention job clears applicant fields
  and internal notes but leaves decision-event notes intact; those can also
  contain personal details.
- After this API exists, replace manual draft links with a review-before-send
  flow and a correspondence timeline driven by TanStack Query. Keep the manual
  handoff clearly separate from tracked backend delivery.

## Review integrity and catalogue access

The current status service reads and validates the current stage before its
transaction, then updates by application ID without comparing the old stage.
Concurrent reviewers can race. Before coupling decisions to messages, implement
an atomic compare-and-set/version check, returning 409 when stale, and write the
event from the actual committed transition in the same transaction. The UI
already handles a conflict by invalidating/refetching application data.

Annotations currently use last-write-wins semantics. Consider an `updatedAt` or
version precondition to protect another reviewer's note. If required, add an
annotation history rather than implying status events contain every note edit.

Allow read-authorized reviewers to list campaign summaries without granting
campaign creation/closing permissions. Today `GET /recruitment/campaigns` requires
`recruitment.campaigns.manage`; this prevents the dashboard from offering a full
campaign selector to ordinary reviewers. A narrowly scoped read route or a new
`recruitment.campaigns.read` permission resolves it.

## Acceptance checks for the extension

- Unauthorized requests fail; redacted recipients cannot be messaged.
- Duplicate submissions/retries enqueue one logical message, with safe recovery
  after a network response is lost.
- Status-only actions never send mail. Sending a response is an explicit action.
- Acceptance/decline messages cannot be sent against a conflicting stage.
- Internal notes and private video URLs never enter message templates.
- Provider acceptance, delivery, failure, bounce, and retry render accurately.
- Two simultaneous review decisions cannot create incompatible status history.
- Retention and erasure clear correspondence and suppress queued delivery.
- Integration tests mock the provider; real delivery is verified separately with
  an explicitly designated test recipient.
