import { describe, expect, it } from "vitest"
import { areaOf, effectiveAccess, groupByArea, isSensitive, permissionLabel, roleKey, roleTitle } from "./catalog"
import { access, accessLockReason, type Viewer } from "./access"

const permission = (key: string, description = "") => ({ id: key, key, description })

describe("permission catalogue", () => {
  it("names permissions in words, exactly for access and from the key elsewhere", () => {
    expect(permissionLabel("admins.roles.assign")).toBe("Give admins roles")
    expect(permissionLabel("roles.permissions.assign")).toBe("Change what a role allows")
    expect(permissionLabel("*")).toBe("Everything")
    expect(permissionLabel("ads.review")).toBe("Review ads")
    expect(permissionLabel("user.content.moderate")).toBe("Moderate user content")
    expect(permissionLabel("page_requests.read")).toBe("View page requests")
    expect(permissionLabel("platform.users.badges")).toBe("Set badges for platform users")
    expect(permissionLabel("rdi.cms.publish")).toBe("Publish RDI CMS")
    expect(permissionLabel("something")).toBe("Something")
  })

  it("groups permissions by area in a fixed order and leaves the wildcard out", () => {
    const groups = groupByArea([permission("ads.read"), permission("*"), permission("admins.read"), permission("media.read"), permission("new.thing.read")])
    expect(groups.map((group) => group.area.id)).toEqual(["access", "content", "money", "other"])
    expect(areaOf("gold.settings.manage")).toBe("money")
    expect(areaOf("feed.ranking.read")).toBe("discover")
  })

  it("marks permissions that change access as sensitive, but not reading them", () => {
    expect(isSensitive("*")).toBe(true)
    expect(isSensitive("admins.roles.assign")).toBe(true)
    expect(isSensitive("roles.create")).toBe(true)
    expect(isSensitive("admins.read")).toBe(false)
    expect(isSensitive("ads.manage")).toBe(false)
  })

  it("turns role keys into titles and typed names into keys", () => {
    expect(roleTitle("SUPER_ADMIN")).toBe("Super Admin")
    expect(roleTitle("CONTENT_MANAGER")).toBe("Content manager")
    expect(roleKey(" Support lead ")).toBe("SUPPORT_LEAD")
    expect(roleKey("Ads & money - reviewer")).toBe("ADS_MONEY_REVIEWER")
    expect(roleKey(roleTitle("ADS_REVIEWER"))).toBe("ADS_REVIEWER")
  })

  it("adds up what an admin can do and where each permission comes from", () => {
    const roles = [
      { id: "r-ads", name: "ADS_REVIEWER", description: "", isSystem: false, updatedAt: "", permissions: [permission("ads.read"), permission("ads.review")] },
      { id: "r-fin", name: "FINANCE", description: "", isSystem: false, updatedAt: "", permissions: [permission("ads.read"), permission("payments.read")] },
    ]
    const admin = { roles: [{ id: "r-ads", name: "ADS_REVIEWER", isSystem: false }, { id: "r-fin", name: "FINANCE", isSystem: false }], permissions: [permission("analytics.read")] }
    const result = effectiveAccess(admin, roles)
    expect(result.everything).toBe(false)
    expect(result.grants.map((grant) => grant.key).sort()).toEqual(["ads.read", "ads.review", "analytics.read", "payments.read"])
    expect(result.grants.find((grant) => grant.key === "ads.read")?.sources).toHaveLength(2)
    expect(result.grants.find((grant) => grant.key === "analytics.read")?.sources).toEqual([{ kind: "direct" }])
    expect(effectiveAccess({ roles: [{ id: "s", name: "SUPER_ADMIN", isSystem: true }], permissions: [] }, []).everything).toBe(true)
    expect(effectiveAccess({ roles: [], permissions: [permission("*")] }, []).everything).toBe(true)
  })
})

describe("who can change what", () => {
  const viewer = (isSuperAdmin: boolean, permissions: string[] = ["*"]): Viewer => ({ id: "me", isSuperAdmin, can: (key) => permissions.includes("*") || permissions.includes(key) })
  const someone = { id: "them", roles: [{ id: "r", name: "AUDITOR", isSystem: false }] }
  const aSuperAdmin = { id: "them", roles: [{ id: "s", name: "SUPER_ADMIN", isSystem: true }] }
  const me = { id: "me", roles: [{ id: "s", name: "SUPER_ADMIN", isSystem: true }] }

  it("keeps every access change to a Super Admin, whatever else the viewer holds", () => {
    const powerful = viewer(false)
    expect(access.changeRoles(powerful, someone)).toBe(false)
    expect(access.changeExtraPermissions(powerful, someone)).toBe(false)
    expect(access.changeStatus(powerful, someone)).toBe(false)
    expect(access.createRole(powerful)).toBe(false)
    expect(access.changeRolePermissions(powerful, { isSystem: false })).toBe(false)
    expect(access.deleteRole(powerful, { isSystem: false })).toBe(false)
    expect(access.giveNewAdminRoles(powerful)).toBe(false)
    // Ordinary changes still follow the permissions.
    expect(access.addAdmin(powerful)).toBe(true)
    expect(access.editName(powerful, someone)).toBe(true)
    expect(access.editName(powerful, aSuperAdmin)).toBe(false)
    expect(access.addAdmin(viewer(false, ["admins.read"]))).toBe(false)
  })

  it("lets a Super Admin change others, never themselves, and never the built-in role", () => {
    const superAdmin = viewer(true)
    expect(access.changeRoles(superAdmin, someone)).toBe(true)
    expect(access.changeStatus(superAdmin, aSuperAdmin)).toBe(true)
    expect(access.changeRoles(superAdmin, me)).toBe(false)
    expect(access.changeStatus(superAdmin, me)).toBe(false)
    expect(access.editRole(superAdmin, { isSystem: true })).toBe(false)
    expect(access.deleteRole(superAdmin, { isSystem: false })).toBe(true)
    expect(accessLockReason(superAdmin, me)).toMatch(/your account/)
    expect(accessLockReason(viewer(false), someone)).toMatch(/Only a Super Admin/)
    expect(accessLockReason(superAdmin, someone)).toBeNull()
  })
})
