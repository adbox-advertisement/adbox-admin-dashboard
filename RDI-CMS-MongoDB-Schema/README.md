# RDI CMS MongoDB Schema

Production-oriented MongoDB design for the RichDad Investments CMS in AdBox.

This package lives inside `adbox-admin-dashboard` on the Desktop and contains:

- `install.mongosh.js`: executable MongoDB collection validators and indexes.
- `agent-contract.json`: machine-readable API and safety contract for AI agents.
- `README.md`: architecture, endpoint, publishing, and operational guidance.

The database stores content and media metadata only. Authentication, administrator accounts,
and permissions remain owned by the AdBox identity service.

## Core decisions

- One site document contains global navigation, branding, and footer settings.
- One page document contains both its current draft and published snapshot.
- Page blocks and their items are embedded because a page is fetched and published as one unit.
- Images and videos are stored in object storage; MongoDB stores asset metadata and URLs only.
- Immutable revision documents provide history and rollback data.
- Every mutation uses optimistic concurrency through `baseVersion`.
- Publishing copies a validated draft into the published snapshot atomically.
- AI agents propose RFC 6902 JSON Patch operations. They do not write directly to MongoDB.
- Stable semantic keys such as `home-hero` are API identifiers and must not be regenerated.

## Collections

| Collection | Purpose | Primary access pattern |
| --- | --- | --- |
| `rdi_cms_sites` | Site-wide draft/published navigation, branding, and footer | Load by `key` or `domain` |
| `rdi_cms_pages` | Page metadata and embedded draft/published blocks | Load by `siteId + key` or `siteId + slug` |
| `rdi_cms_assets` | Image/video metadata, storage keys, variants, and lifecycle state | Load by `_id`, checksum, or storage key |
| `rdi_cms_revisions` | Immutable site/page snapshots for history and rollback | List by `entityId + revision` |
| `rdi_cms_publish_jobs` | Publish/deployment lifecycle and failure details | Poll by `_id` or idempotency key |
| `rdi_cms_audit_events` | Append-only record of CMS mutations | Query by entity, actor, or request ID |
| `rdi_cms_agent_operations` | AI proposals, approval state, patches, and validation output | Query by operation ID or idempotency key |

## Site and page lifecycle

`rdi_cms_sites` and `rdi_cms_pages` each have a `draft` and optional `published` object.

```text
Edit request
  -> validate baseVersion
  -> apply JSON Patch to draft
  -> validate complete document
  -> increment draft.version
  -> write revision + audit event

Publish request
  -> validate latest draft
  -> copy draft.content/settings into published
  -> increment published.version
  -> write revision + publish job + audit event
```

Draft and published versions are independent monotonically increasing integers. Never reset or
reuse a version number. API responses should return an `ETag` such as `"draft:17"`.

## Content structure

Pages use the same concepts as the current React CMS:

```text
PageContent
  blocks[]
    key          stable semantic identifier, for example home-hero
    type         hero | split | cards | stats | cta
    variant      optional visual/semantic specialization
    name         administrator-facing section name
    visible      controls rendering
    order        deterministic integer ordering
    content      eyebrow, title, description, buttons, and media
    items[]      card/stat/form/FAQ/process entries
```

The `variant` field represents specialized live-site layouts without changing the base editor
type. Examples include `division-cards`, `contact-form`, `faq`, `solar-solutions`, and
`project-gallery`.

Every block and item must have a stable `key`. AI agents and API clients address content by key,
not by array index. The API resolves semantic keys to JSON Patch paths before applying mutations.

## Media policy

- Upload bytes directly to S3, Cloudflare R2, Cloudinary, or another object store using a signed URL.
- Store the resulting metadata in `rdi_cms_assets`.
- Store `assetId` in a block/item media reference.
- A remote `url` is accepted for imported Unsplash or existing RDI media.
- Validate MIME type, byte size, dimensions, duration, and SHA-256 checksum server-side.
- Do not put base64 images or videos into MongoDB page documents.
- An asset cannot become `ready` until malware scanning and metadata extraction succeed.
- Prevent deletion while an asset is referenced by a draft or published page.

## Recommended API endpoints

All mutating endpoints require authentication, authorization, request IDs, idempotency keys, and
server-side validation. The exact machine-readable definitions are in `agent-contract.json`.

```text
GET    /api/v1/cms/sites/{siteKey}?view=draft|published
PATCH  /api/v1/cms/sites/{siteKey}/draft
POST   /api/v1/cms/sites/{siteKey}/publish

GET    /api/v1/cms/sites/{siteKey}/pages?view=draft|published
GET    /api/v1/cms/sites/{siteKey}/pages/{pageKey}?view=draft|published
PATCH  /api/v1/cms/sites/{siteKey}/pages/{pageKey}/draft
POST   /api/v1/cms/sites/{siteKey}/pages/{pageKey}/publish
GET    /api/v1/cms/sites/{siteKey}/pages/{pageKey}/revisions
POST   /api/v1/cms/sites/{siteKey}/pages/{pageKey}/rollback

POST   /api/v1/cms/assets/upload-intents
POST   /api/v1/cms/assets/{assetId}/complete
GET    /api/v1/cms/assets/{assetId}
DELETE /api/v1/cms/assets/{assetId}

POST   /api/v1/cms/agent-operations
GET    /api/v1/cms/agent-operations/{operationId}
POST   /api/v1/cms/agent-operations/{operationId}/approve
POST   /api/v1/cms/agent-operations/{operationId}/apply
POST   /api/v1/cms/agent-operations/{operationId}/reject
```

### Draft patch request

```json
{
  "baseVersion": 17,
  "idempotencyKey": "cms-home-title-2026-09-02-001",
  "operations": [
    {
      "op": "test",
      "path": "/blocksByKey/home-hero/content/title",
      "value": "Welcome to RichDad Investments"
    },
    {
      "op": "replace",
      "path": "/blocksByKey/home-hero/content/title",
      "value": "Welcome to RichDad Investments"
    }
  ],
  "changeSummary": "Confirm the current homepage title"
}
```

The public API may expose semantic `blocksByKey` and `itemsByKey` paths. The service translates
them into safe internal array paths after checking key uniqueness.

### Conflict response

Return HTTP `409` when `baseVersion` is stale:

```json
{
  "code": "CMS_VERSION_CONFLICT",
  "message": "The draft changed after this operation was prepared.",
  "expectedVersion": 17,
  "currentVersion": 18,
  "requestId": "req_01J..."
}
```

## AI-agent workflow

1. Read the site/page draft and retain its `version` and `ETag`.
2. Use stable page, block, and item keys to select the smallest possible scope.
3. Create a `test` operation for the expected current value.
4. Add only the required `replace`, `add`, `remove`, or `move` operations.
5. Submit an agent operation with a unique idempotency key and short change summary.
6. The API validates schema, permissions, URLs, text limits, references, and version.
7. A human approves material changes unless the agent has an explicitly scoped auto-apply grant.
8. Apply the approved operation transactionally and write a revision and audit event.
9. Re-read the draft to verify the resulting version and content.
10. Publishing remains a separate permission and operation.

AI output must never contain MongoDB credentials, raw database commands, or unrestricted filter
objects. The API builds all MongoDB filters itself from validated site/page keys.

## Security and production requirements

- Use MongoDB Atlas or a replica set so multi-document transactions are available.
- Enable TLS, encryption at rest, automated backups, point-in-time recovery, and alerting.
- Give the API a least-privilege database user; AI agents receive API tokens, not DB users.
- Validate every request again at the service boundary even though collection validators exist.
- Sanitize rich text before storage and again before rendering.
- Restrict external media hosts or proxy imported media through the asset pipeline.
- Rate-limit mutations and AI proposal creation.
- Use structured logs containing `requestId`, `actor.id`, entity identifiers, and result status.
- Redact secrets, auth headers, personal data, and upload signatures from audit payloads.
- Run publish and asset processing through idempotent background jobs.
- Monitor document size and reject page drafts before they approach MongoDB's 16 MB limit.

## Installing validators and indexes

Review the collection names and retention policy, then run:

```bash
mongosh "$MONGODB_URI" --file RDI-CMS-MongoDB-Schema/install.mongosh.js
```

The script is idempotent. It creates missing collections and uses `collMod` for existing ones.
Run it first in a staging database and back up production before changing validators.

## Application-layer transaction boundary

For a draft update, one transaction should:

1. Match the page/site by `_id` and `draft.version`.
2. Apply the validated update and increment the version.
3. Insert the immutable revision.
4. Insert the audit event.
5. Mark the related AI operation as applied when applicable.

If the version match updates zero documents, abort with `CMS_VERSION_CONFLICT`. Never silently
overwrite a newer draft.

