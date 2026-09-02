/*
 * RDI CMS MongoDB validators and indexes.
 * Run with: mongosh "$MONGODB_URI" --file RDI-CMS-MongoDB-Schema/install.mongosh.js
 *
 * The connected database is used. The script is idempotent and applies strict/error validation.
 */

const cmsDb = db

const actorSchema = {
  bsonType: "object",
  required: ["type", "id", "displayName"],
  additionalProperties: false,
  properties: {
    type: { enum: ["user", "agent", "system"] },
    id: { bsonType: "string", minLength: 1, maxLength: 200 },
    displayName: { bsonType: "string", minLength: 1, maxLength: 200 },
  },
}

const buttonSchema = {
  bsonType: "object",
  required: ["key", "label", "href", "style"],
  additionalProperties: false,
  properties: {
    key: { bsonType: "string", pattern: "^[a-z0-9][a-z0-9-]{1,79}$" },
    label: { bsonType: "string", maxLength: 120 },
    href: { bsonType: "string", maxLength: 2048 },
    style: { enum: ["primary", "secondary", "outline", "text"] },
    external: { bsonType: "bool" },
  },
}

const mediaRefSchema = {
  bsonType: "object",
  required: ["kind", "alt"],
  additionalProperties: false,
  anyOf: [{ required: ["assetId"] }, { required: ["url"] }],
  properties: {
    kind: { enum: ["image", "video"] },
    assetId: { bsonType: "objectId" },
    url: { bsonType: "string", maxLength: 4096 },
    alt: { bsonType: "string", maxLength: 300 },
    caption: { bsonType: "string", maxLength: 500 },
    posterAssetId: { bsonType: "objectId" },
    focalPoint: {
      bsonType: "object",
      required: ["x", "y"],
      additionalProperties: false,
      properties: {
        x: { bsonType: ["double", "int", "long", "decimal"], minimum: 0, maximum: 1 },
        y: { bsonType: ["double", "int", "long", "decimal"], minimum: 0, maximum: 1 },
      },
    },
  },
}

const contentItemSchema = {
  bsonType: "object",
  required: ["key", "title", "description", "order"],
  additionalProperties: false,
  properties: {
    key: { bsonType: "string", pattern: "^[a-z0-9][a-z0-9-]{1,119}$" },
    eyebrow: { bsonType: "string", maxLength: 160 },
    title: { bsonType: "string", maxLength: 240 },
    description: { bsonType: "string", maxLength: 5000 },
    order: { bsonType: "int", minimum: 0, maximum: 10000 },
    visible: { bsonType: "bool" },
    features: {
      bsonType: "array",
      maxItems: 100,
      items: { bsonType: "string", maxLength: 1000 },
    },
    buttons: {
      bsonType: "array",
      maxItems: 4,
      items: buttonSchema,
    },
    media: mediaRefSchema,
    metadata: { bsonType: "object" },
  },
}

const blockContentSchema = {
  bsonType: "object",
  required: ["title", "description"],
  additionalProperties: false,
  properties: {
    eyebrow: { bsonType: "string", maxLength: 160 },
    title: { bsonType: "string", maxLength: 300 },
    description: { bsonType: "string", maxLength: 10000 },
    buttons: {
      bsonType: "array",
      maxItems: 4,
      items: buttonSchema,
    },
    media: mediaRefSchema,
    metadata: { bsonType: "object" },
  },
}

const blockSchema = {
  bsonType: "object",
  required: ["key", "type", "name", "visible", "order", "content", "items"],
  additionalProperties: false,
  properties: {
    key: { bsonType: "string", pattern: "^[a-z0-9][a-z0-9-]{1,119}$" },
    type: { enum: ["hero", "split", "cards", "stats", "cta"] },
    variant: { bsonType: "string", pattern: "^[a-z0-9][a-z0-9-]{1,79}$" },
    name: { bsonType: "string", minLength: 1, maxLength: 160 },
    visible: { bsonType: "bool" },
    order: { bsonType: "int", minimum: 0, maximum: 10000 },
    content: blockContentSchema,
    items: {
      bsonType: "array",
      maxItems: 250,
      items: contentItemSchema,
    },
    metadata: { bsonType: "object" },
  },
}

const seoSchema = {
  bsonType: "object",
  required: ["title", "description", "noIndex"],
  additionalProperties: false,
  properties: {
    title: { bsonType: "string", maxLength: 70 },
    description: { bsonType: "string", maxLength: 180 },
    canonicalUrl: { bsonType: "string", maxLength: 2048 },
    noIndex: { bsonType: "bool" },
    socialImage: mediaRefSchema,
  },
}

const pageContentSchema = {
  bsonType: "object",
  required: ["seo", "blocks"],
  additionalProperties: false,
  properties: {
    seo: seoSchema,
    blocks: {
      bsonType: "array",
      maxItems: 250,
      items: blockSchema,
    },
  },
}

const footerLinkSchema = {
  bsonType: "object",
  required: ["key", "label", "href", "order", "visible"],
  additionalProperties: false,
  properties: {
    key: { bsonType: "string", pattern: "^[a-z0-9][a-z0-9-]{1,79}$" },
    label: { bsonType: "string", maxLength: 160 },
    href: { bsonType: "string", maxLength: 2048 },
    order: { bsonType: "int", minimum: 0, maximum: 10000 },
    visible: { bsonType: "bool" },
    external: { bsonType: "bool" },
  },
}

const siteSettingsSchema = {
  bsonType: "object",
  required: ["branding", "navigation", "footer"],
  additionalProperties: false,
  properties: {
    branding: {
      bsonType: "object",
      required: ["siteName"],
      additionalProperties: false,
      properties: {
        siteName: { bsonType: "string", minLength: 1, maxLength: 160 },
        logoAssetId: { bsonType: "objectId" },
        markAssetId: { bsonType: "objectId" },
      },
    },
    navigation: {
      bsonType: "array",
      maxItems: 100,
      items: {
        bsonType: "object",
        required: ["key", "label", "href", "pageKey", "order", "visible"],
        additionalProperties: false,
        properties: {
          key: { bsonType: "string", pattern: "^[a-z0-9][a-z0-9-]{1,79}$" },
          label: { bsonType: "string", maxLength: 160 },
          href: { bsonType: "string", maxLength: 2048 },
          pageKey: { bsonType: "string", pattern: "^[a-z0-9][a-z0-9-]{1,79}$" },
          order: { bsonType: "int", minimum: 0, maximum: 10000 },
          visible: { bsonType: "bool" },
          external: { bsonType: "bool" },
        },
      },
    },
    footer: {
      bsonType: "object",
      required: ["description", "columns", "contact", "socialLinks", "copyright"],
      additionalProperties: false,
      properties: {
        description: { bsonType: "string", maxLength: 1000 },
        columns: {
          bsonType: "array",
          maxItems: 12,
          items: {
            bsonType: "object",
            required: ["key", "heading", "order", "links"],
            additionalProperties: false,
            properties: {
              key: { bsonType: "string", pattern: "^[a-z0-9][a-z0-9-]{1,79}$" },
              heading: { bsonType: "string", maxLength: 160 },
              order: { bsonType: "int", minimum: 0, maximum: 10000 },
              links: { bsonType: "array", maxItems: 100, items: footerLinkSchema },
            },
          },
        },
        contact: {
          bsonType: "object",
          required: ["heading", "address", "phone", "email"],
          additionalProperties: false,
          properties: {
            heading: { bsonType: "string", maxLength: 160 },
            address: { bsonType: "string", maxLength: 1000 },
            phone: { bsonType: "string", maxLength: 80 },
            email: { bsonType: "string", maxLength: 320 },
          },
        },
        socialLinks: {
          bsonType: "array",
          maxItems: 30,
          items: {
            bsonType: "object",
            required: ["key", "label", "href", "order", "visible"],
            additionalProperties: false,
            properties: {
              key: { bsonType: "string", pattern: "^[a-z0-9][a-z0-9-]{1,79}$" },
              label: { bsonType: "string", maxLength: 100 },
              href: { bsonType: "string", maxLength: 2048 },
              order: { bsonType: "int", minimum: 0, maximum: 10000 },
              visible: { bsonType: "bool" },
            },
          },
        },
        copyright: { bsonType: "string", maxLength: 500 },
      },
    },
  },
}

const draftSiteSchema = {
  bsonType: "object",
  required: ["version", "settings", "updatedAt", "updatedBy"],
  additionalProperties: false,
  properties: {
    version: { bsonType: ["int", "long"], minimum: 1 },
    settings: siteSettingsSchema,
    checksum: { bsonType: "string", pattern: "^[a-f0-9]{64}$" },
    updatedAt: { bsonType: "date" },
    updatedBy: actorSchema,
  },
}

const publishedSiteSchema = {
  bsonType: "object",
  required: ["version", "sourceDraftVersion", "settings", "publishedAt", "publishedBy"],
  additionalProperties: false,
  properties: {
    version: { bsonType: ["int", "long"], minimum: 1 },
    sourceDraftVersion: { bsonType: ["int", "long"], minimum: 1 },
    settings: siteSettingsSchema,
    checksum: { bsonType: "string", pattern: "^[a-f0-9]{64}$" },
    publishedAt: { bsonType: "date" },
    publishedBy: actorSchema,
  },
}

const draftPageSchema = {
  bsonType: "object",
  required: ["version", "content", "updatedAt", "updatedBy"],
  additionalProperties: false,
  properties: {
    version: { bsonType: ["int", "long"], minimum: 1 },
    content: pageContentSchema,
    checksum: { bsonType: "string", pattern: "^[a-f0-9]{64}$" },
    updatedAt: { bsonType: "date" },
    updatedBy: actorSchema,
  },
}

const publishedPageSchema = {
  bsonType: "object",
  required: ["version", "sourceDraftVersion", "content", "publishedAt", "publishedBy"],
  additionalProperties: false,
  properties: {
    version: { bsonType: ["int", "long"], minimum: 1 },
    sourceDraftVersion: { bsonType: ["int", "long"], minimum: 1 },
    content: pageContentSchema,
    checksum: { bsonType: "string", pattern: "^[a-f0-9]{64}$" },
    publishedAt: { bsonType: "date" },
    publishedBy: actorSchema,
  },
}

const siteDocumentSchema = {
  bsonType: "object",
  required: ["schemaVersion", "key", "domain", "displayName", "status", "defaultLocale", "locales", "draft", "createdAt", "updatedAt", "createdBy", "updatedBy"],
  additionalProperties: false,
  properties: {
    _id: { bsonType: "objectId" },
    schemaVersion: { bsonType: "int", minimum: 1 },
    key: { bsonType: "string", pattern: "^[a-z0-9][a-z0-9-]{1,79}$" },
    domain: { bsonType: "string", minLength: 3, maxLength: 253 },
    displayName: { bsonType: "string", minLength: 1, maxLength: 160 },
    status: { enum: ["active", "maintenance", "archived"] },
    defaultLocale: { bsonType: "string", pattern: "^[a-z]{2}(-[A-Z]{2})?$" },
    locales: { bsonType: "array", minItems: 1, maxItems: 20, uniqueItems: true, items: { bsonType: "string", pattern: "^[a-z]{2}(-[A-Z]{2})?$" } },
    draft: draftSiteSchema,
    published: publishedSiteSchema,
    createdAt: { bsonType: "date" },
    updatedAt: { bsonType: "date" },
    createdBy: actorSchema,
    updatedBy: actorSchema,
    archivedAt: { bsonType: "date" },
  },
}

const pageDocumentSchema = {
  bsonType: "object",
  required: ["schemaVersion", "siteId", "key", "name", "navigationLabel", "slug", "status", "draft", "createdAt", "updatedAt", "createdBy", "updatedBy"],
  additionalProperties: false,
  properties: {
    _id: { bsonType: "objectId" },
    schemaVersion: { bsonType: "int", minimum: 1 },
    siteId: { bsonType: "objectId" },
    key: { bsonType: "string", pattern: "^[a-z0-9][a-z0-9-]{1,79}$" },
    name: { bsonType: "string", minLength: 1, maxLength: 160 },
    navigationLabel: { bsonType: "string", minLength: 1, maxLength: 100 },
    slug: { bsonType: "string", pattern: "^/" , maxLength: 500 },
    status: { enum: ["active", "archived"] },
    draft: draftPageSchema,
    published: publishedPageSchema,
    createdAt: { bsonType: "date" },
    updatedAt: { bsonType: "date" },
    createdBy: actorSchema,
    updatedBy: actorSchema,
    archivedAt: { bsonType: "date" },
  },
}

const assetDocumentSchema = {
  bsonType: "object",
  required: ["schemaVersion", "siteId", "kind", "status", "storage", "fileName", "mimeType", "byteSize", "sha256", "alt", "createdAt", "updatedAt", "createdBy"],
  additionalProperties: false,
  properties: {
    _id: { bsonType: "objectId" },
    schemaVersion: { bsonType: "int", minimum: 1 },
    siteId: { bsonType: "objectId" },
    kind: { enum: ["image", "video"] },
    status: { enum: ["uploading", "processing", "ready", "failed", "archived"] },
    storage: {
      bsonType: "object",
      required: ["provider", "bucket", "key"],
      additionalProperties: false,
      properties: {
        provider: { enum: ["s3", "r2", "cloudinary", "external"] },
        bucket: { bsonType: "string", maxLength: 255 },
        key: { bsonType: "string", minLength: 1, maxLength: 1024 },
        publicUrl: { bsonType: "string", maxLength: 4096 },
      },
    },
    fileName: { bsonType: "string", minLength: 1, maxLength: 500 },
    mimeType: { bsonType: "string", pattern: "^(image|video)/" },
    byteSize: { bsonType: ["int", "long"], minimum: 1, maximum: 10737418240 },
    sha256: { bsonType: "string", pattern: "^[a-f0-9]{64}$" },
    alt: { bsonType: "string", maxLength: 300 },
    caption: { bsonType: "string", maxLength: 1000 },
    width: { bsonType: "int", minimum: 1 },
    height: { bsonType: "int", minimum: 1 },
    durationMs: { bsonType: ["int", "long"], minimum: 0 },
    variants: {
      bsonType: "array",
      maxItems: 50,
      items: {
        bsonType: "object",
        required: ["key", "url", "mimeType", "byteSize"],
        additionalProperties: false,
        properties: {
          key: { bsonType: "string", maxLength: 100 },
          url: { bsonType: "string", maxLength: 4096 },
          mimeType: { bsonType: "string", maxLength: 100 },
          byteSize: { bsonType: ["int", "long"], minimum: 1 },
          width: { bsonType: "int", minimum: 1 },
          height: { bsonType: "int", minimum: 1 },
        },
      },
    },
    processingError: { bsonType: "string", maxLength: 5000 },
    createdAt: { bsonType: "date" },
    updatedAt: { bsonType: "date" },
    createdBy: actorSchema,
    archivedAt: { bsonType: "date" },
  },
}

const revisionDocumentSchema = {
  bsonType: "object",
  required: ["schemaVersion", "siteId", "entityType", "entityId", "revision", "contentVersion", "view", "source", "snapshot", "changeSummary", "createdAt", "createdBy"],
  additionalProperties: false,
  properties: {
    _id: { bsonType: "objectId" },
    schemaVersion: { bsonType: "int", minimum: 1 },
    siteId: { bsonType: "objectId" },
    entityType: { enum: ["site", "page"] },
    entityId: { bsonType: "objectId" },
    revision: { bsonType: ["int", "long"], minimum: 1 },
    contentVersion: { bsonType: ["int", "long"], minimum: 1 },
    view: { enum: ["draft", "published"] },
    source: { enum: ["human", "agent", "import", "publish", "rollback", "system"] },
    snapshot: { bsonType: "object" },
    checksum: { bsonType: "string", pattern: "^[a-f0-9]{64}$" },
    changeSummary: { bsonType: "string", minLength: 1, maxLength: 1000 },
    requestId: { bsonType: "string", maxLength: 200 },
    agentOperationId: { bsonType: "objectId" },
    createdAt: { bsonType: "date" },
    createdBy: actorSchema,
  },
}

const publishJobDocumentSchema = {
  bsonType: "object",
  required: ["schemaVersion", "siteId", "scope", "status", "idempotencyKey", "requestedAt", "requestedBy", "attempts"],
  additionalProperties: false,
  properties: {
    _id: { bsonType: "objectId" },
    schemaVersion: { bsonType: "int", minimum: 1 },
    siteId: { bsonType: "objectId" },
    scope: { enum: ["site", "page", "all"] },
    pageId: { bsonType: "objectId" },
    sourceDraftVersion: { bsonType: ["int", "long"], minimum: 1 },
    status: { enum: ["queued", "validating", "publishing", "succeeded", "failed", "cancelled"] },
    idempotencyKey: { bsonType: "string", minLength: 8, maxLength: 200 },
    requestId: { bsonType: "string", maxLength: 200 },
    attempts: { bsonType: "int", minimum: 0, maximum: 20 },
    error: {
      bsonType: "object",
      additionalProperties: false,
      properties: {
        code: { bsonType: "string", maxLength: 100 },
        message: { bsonType: "string", maxLength: 5000 },
        retryable: { bsonType: "bool" },
      },
    },
    requestedAt: { bsonType: "date" },
    requestedBy: actorSchema,
    startedAt: { bsonType: "date" },
    completedAt: { bsonType: "date" },
  },
}

const auditEventDocumentSchema = {
  bsonType: "object",
  required: ["schemaVersion", "siteId", "action", "target", "actor", "requestId", "outcome", "createdAt"],
  additionalProperties: false,
  properties: {
    _id: { bsonType: "objectId" },
    schemaVersion: { bsonType: "int", minimum: 1 },
    siteId: { bsonType: "objectId" },
    action: { bsonType: "string", minLength: 1, maxLength: 160 },
    target: {
      bsonType: "object",
      required: ["entityType", "entityId"],
      additionalProperties: false,
      properties: {
        entityType: { enum: ["site", "page", "block", "item", "asset", "revision", "publishJob", "agentOperation"] },
        entityId: { bsonType: "string", minLength: 1, maxLength: 200 },
        pageId: { bsonType: "objectId" },
        blockKey: { bsonType: "string", maxLength: 120 },
        itemKey: { bsonType: "string", maxLength: 120 },
      },
    },
    actor: actorSchema,
    requestId: { bsonType: "string", minLength: 1, maxLength: 200 },
    idempotencyKey: { bsonType: "string", maxLength: 200 },
    outcome: { enum: ["succeeded", "failed", "denied"] },
    baseVersion: { bsonType: ["int", "long"], minimum: 1 },
    resultVersion: { bsonType: ["int", "long"], minimum: 1 },
    changeSummary: { bsonType: "string", maxLength: 1000 },
    metadata: { bsonType: "object" },
    createdAt: { bsonType: "date" },
  },
}

const patchOperationSchema = {
  bsonType: "object",
  required: ["op", "path"],
  additionalProperties: false,
  properties: {
    op: { enum: ["test", "add", "replace", "remove", "move"] },
    path: { bsonType: "string", minLength: 1, maxLength: 1000 },
    from: { bsonType: "string", maxLength: 1000 },
    value: {},
  },
}

const agentOperationDocumentSchema = {
  bsonType: "object",
  required: ["schemaVersion", "siteId", "agent", "goal", "scope", "baseVersion", "operations", "changeSummary", "status", "idempotencyKey", "validation", "createdAt", "updatedAt", "requestedBy"],
  additionalProperties: false,
  properties: {
    _id: { bsonType: "objectId" },
    schemaVersion: { bsonType: "int", minimum: 1 },
    siteId: { bsonType: "objectId" },
    agent: {
      bsonType: "object",
      required: ["id", "name", "provider", "model"],
      additionalProperties: false,
      properties: {
        id: { bsonType: "string", minLength: 1, maxLength: 200 },
        name: { bsonType: "string", minLength: 1, maxLength: 200 },
        provider: { bsonType: "string", minLength: 1, maxLength: 100 },
        model: { bsonType: "string", minLength: 1, maxLength: 200 },
      },
    },
    goal: { bsonType: "string", minLength: 1, maxLength: 5000 },
    scope: {
      bsonType: "object",
      required: ["entityType", "entityId"],
      additionalProperties: false,
      properties: {
        entityType: { enum: ["site", "page"] },
        entityId: { bsonType: "objectId" },
        pageKey: { bsonType: "string", maxLength: 80 },
        blockKeys: { bsonType: "array", maxItems: 250, uniqueItems: true, items: { bsonType: "string", maxLength: 120 } },
      },
    },
    baseVersion: { bsonType: ["int", "long"], minimum: 1 },
    operations: { bsonType: "array", minItems: 1, maxItems: 500, items: patchOperationSchema },
    changeSummary: { bsonType: "string", minLength: 1, maxLength: 1000 },
    status: { enum: ["proposed", "validating", "approval_required", "approved", "applying", "applied", "rejected", "failed", "expired"] },
    idempotencyKey: { bsonType: "string", minLength: 8, maxLength: 200 },
    validation: {
      bsonType: "object",
      required: ["valid", "errors", "warnings"],
      additionalProperties: false,
      properties: {
        valid: { bsonType: "bool" },
        errors: { bsonType: "array", maxItems: 500, items: { bsonType: "string", maxLength: 2000 } },
        warnings: { bsonType: "array", maxItems: 500, items: { bsonType: "string", maxLength: 2000 } },
      },
    },
    resultVersion: { bsonType: ["int", "long"], minimum: 1 },
    resultRevisionId: { bsonType: "objectId" },
    rejectionReason: { bsonType: "string", maxLength: 2000 },
    failure: {
      bsonType: "object",
      additionalProperties: false,
      properties: {
        code: { bsonType: "string", maxLength: 100 },
        message: { bsonType: "string", maxLength: 5000 },
      },
    },
    requestId: { bsonType: "string", maxLength: 200 },
    createdAt: { bsonType: "date" },
    updatedAt: { bsonType: "date" },
    expiresAt: { bsonType: "date" },
    requestedBy: actorSchema,
    approvedAt: { bsonType: "date" },
    approvedBy: actorSchema,
    appliedAt: { bsonType: "date" },
  },
}

function applyCollection(name, schema) {
  const validator = { $jsonSchema: schema }
  const exists = cmsDb.getCollectionNames().includes(name)

  if (exists) {
    const result = cmsDb.runCommand({
      collMod: name,
      validator,
      validationLevel: "strict",
      validationAction: "error",
    })
    if (!result.ok) throw new Error(`Could not update validator for ${name}`)
  } else {
    cmsDb.createCollection(name, {
      validator,
      validationLevel: "strict",
      validationAction: "error",
    })
  }
}

applyCollection("rdi_cms_sites", siteDocumentSchema)
applyCollection("rdi_cms_pages", pageDocumentSchema)
applyCollection("rdi_cms_assets", assetDocumentSchema)
applyCollection("rdi_cms_revisions", revisionDocumentSchema)
applyCollection("rdi_cms_publish_jobs", publishJobDocumentSchema)
applyCollection("rdi_cms_audit_events", auditEventDocumentSchema)
applyCollection("rdi_cms_agent_operations", agentOperationDocumentSchema)

cmsDb.rdi_cms_sites.createIndex({ key: 1 }, { unique: true, name: "uq_site_key" })
cmsDb.rdi_cms_sites.createIndex({ domain: 1 }, { unique: true, name: "uq_site_domain" })
cmsDb.rdi_cms_sites.createIndex({ status: 1, updatedAt: -1 }, { name: "ix_site_status_updated" })

cmsDb.rdi_cms_pages.createIndex({ siteId: 1, key: 1 }, { unique: true, name: "uq_page_site_key" })
cmsDb.rdi_cms_pages.createIndex({ siteId: 1, slug: 1 }, { unique: true, name: "uq_page_site_slug" })
cmsDb.rdi_cms_pages.createIndex({ siteId: 1, status: 1, updatedAt: -1 }, { name: "ix_page_site_status_updated" })
cmsDb.rdi_cms_pages.createIndex({ siteId: 1, "draft.updatedAt": -1 }, { name: "ix_page_site_draft_updated" })

cmsDb.rdi_cms_assets.createIndex({ siteId: 1, "storage.provider": 1, "storage.bucket": 1, "storage.key": 1 }, { unique: true, name: "uq_asset_storage_key" })
cmsDb.rdi_cms_assets.createIndex({ siteId: 1, sha256: 1 }, { name: "ix_asset_site_checksum" })
cmsDb.rdi_cms_assets.createIndex({ siteId: 1, status: 1, createdAt: -1 }, { name: "ix_asset_site_status_created" })

cmsDb.rdi_cms_revisions.createIndex({ entityId: 1, revision: 1 }, { unique: true, name: "uq_revision_entity_number" })
cmsDb.rdi_cms_revisions.createIndex({ siteId: 1, entityType: 1, entityId: 1, createdAt: -1 }, { name: "ix_revision_entity_created" })
cmsDb.rdi_cms_revisions.createIndex({ requestId: 1 }, { name: "ix_revision_request", sparse: true })

cmsDb.rdi_cms_publish_jobs.createIndex({ siteId: 1, idempotencyKey: 1 }, { unique: true, name: "uq_publish_idempotency" })
cmsDb.rdi_cms_publish_jobs.createIndex({ status: 1, requestedAt: 1 }, { name: "ix_publish_worker_queue" })
cmsDb.rdi_cms_publish_jobs.createIndex({ pageId: 1, requestedAt: -1 }, { name: "ix_publish_page_requested", sparse: true })

cmsDb.rdi_cms_audit_events.createIndex({ siteId: 1, createdAt: -1 }, { name: "ix_audit_site_created" })
cmsDb.rdi_cms_audit_events.createIndex({ "target.entityType": 1, "target.entityId": 1, createdAt: -1 }, { name: "ix_audit_target_created" })
cmsDb.rdi_cms_audit_events.createIndex({ "actor.id": 1, createdAt: -1 }, { name: "ix_audit_actor_created" })
cmsDb.rdi_cms_audit_events.createIndex({ requestId: 1 }, { name: "ix_audit_request" })

cmsDb.rdi_cms_agent_operations.createIndex({ siteId: 1, idempotencyKey: 1 }, { unique: true, name: "uq_agent_operation_idempotency" })
cmsDb.rdi_cms_agent_operations.createIndex({ "scope.entityId": 1, status: 1, createdAt: -1 }, { name: "ix_agent_scope_status_created" })
cmsDb.rdi_cms_agent_operations.createIndex({ "agent.id": 1, createdAt: -1 }, { name: "ix_agent_identity_created" })
cmsDb.rdi_cms_agent_operations.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0, name: "ttl_agent_operation_expiry" })

print("RDI CMS MongoDB validators and indexes are installed.")
