// Raw backend shapes for Manage Users tests (Prisma JSON, before schema transforms).
export const institutionFixtures = [
  {
    id: "50000000-0000-4000-8000-000000000001", name: "University of Ghana", shortName: "UG", slug: "ug", type: "PUBLIC_UNIVERSITY", region: "Greater Accra",
    emailDomains: ["ug.edu.gh"], isActive: true, createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z",
    campuses: [{ id: "51000000-0000-4000-8000-000000000001", institutionId: "50000000-0000-4000-8000-000000000001", name: "Legon", city: "Accra" }],
  },
  {
    id: "50000000-0000-4000-8000-000000000002", name: "KNUST", shortName: "KNUST", slug: "knust", type: "PUBLIC_UNIVERSITY", region: "Ashanti",
    emailDomains: ["knust.edu.gh"], isActive: true, createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z",
    campuses: [{ id: "51000000-0000-4000-8000-000000000002", institutionId: "50000000-0000-4000-8000-000000000002", name: "Main", city: "Kumasi" }],
  },
]

export const platformUserFixtures = [
  {
    id: "60000000-0000-4000-8000-000000000001", deviceType: "iOS", emailVerified: true, isContactVerified: false, passwordChangedAt: null,
    isOAuth: false, isMachine: false, isLegal: false, isActive: true, role: "CREATOR",
    createdAt: "2026-09-01T10:00:00.000Z", updatedAt: "2026-09-20T10:00:00.000Z",
    userProfile: {
      id: "61000000-0000-4000-8000-000000000001", userId: "60000000-0000-4000-8000-000000000001", ipAddress: "102.176.0.1",
      createdAt: "2026-09-01T10:00:00.000Z", updatedAt: "2026-09-20T10:00:00.000Z", image: null, fullName: "Ama Mensah", bio: "Campus creator",
      contact: "+233200000000", email: "ama@example.com", username: "ama", dob: "2004-05-01T00:00:00.000Z", gender: "FEMALE",
      institutionId: institutionFixtures[0].id, institution: { id: institutionFixtures[0].id, slug: "ug", name: "University of Ghana" },
      campusId: institutionFixtures[0].campuses[0].id, campus: { id: institutionFixtures[0].campuses[0].id, name: "Legon", city: "Accra" },
      studentStatus: "STUDENT", level: 300, programme: "BSc Computer Science", graduationYear: 2027, verificationTier: "PENDING", verifiedAt: null,
    },
  },
  {
    id: "60000000-0000-4000-8000-000000000002", deviceType: "Android", emailVerified: null, isContactVerified: null, passwordChangedAt: null,
    isOAuth: true, isMachine: null, isLegal: null, isActive: false, role: "VIEWER",
    createdAt: "2026-08-01T10:00:00.000Z", updatedAt: "2026-08-02T10:00:00.000Z",
    userProfile: null,
  },
]

export const verificationFixtures = [
  {
    id: "70000000-0000-4000-8000-000000000001", userId: platformUserFixtures[0].id, institutionId: institutionFixtures[0].id,
    evidenceUrl: "https://files.example.com/id-card.jpg", status: "PENDING", reviewedByAdminId: null, reviewedAt: null, rejectionNote: null,
    createdAt: "2026-09-25T10:00:00.000Z", reviewedBy: null,
  },
]

export const page = <T,>(items: T[], total = items.length) => ({ items, total, page: 1, limit: 20 })

const members = (total: number, student: number, alumni: number, staff: number, verified: number) =>
  ({ total, STUDENT: student, ALUMNI: alumni, STAFF: staff, NONE: total - student - alumni - staff, verified, pending: 1 })

export const statsFixture = {
  institutionId: null,
  generatedAt: "2026-10-24T09:00:00.000Z",
  total: 120,
  newLast7Days: 6,
  newLast30Days: 31,
  status: { active: 110, suspended: 4, deactivated: 3, pendingDeletion: 2, erased: 1 },
  roles: { GUEST: 0, VIEWER: 90, CREATOR: 18, PUBLISHER: 12 },
  affiliation: { STUDENT: 60, ALUMNI: 15, STAFF: 5, NONE: 40 },
  verification: { SELF_DECLARED: 70, PENDING: 6, VERIFIED: 24 },
  badges: { campus: 22, company: 4, honour: 1, spotlight: 3 },
  institutions: [
    { id: institutionFixtures[0].id, name: "University of Ghana", shortName: "UG", slug: "ug", type: "UNIVERSITY", region: "Greater Accra", isActive: true, logoUrl: null, campusCount: 1, members: members(50, 40, 8, 2, 15) },
    { id: institutionFixtures[1].id, name: "KNUST", shortName: "KNUST", slug: "knust", type: "UNIVERSITY", region: "Ashanti", isActive: true, logoUrl: null, campusCount: 1, members: members(0, 0, 0, 0, 0) },
  ],
  campuses: null,
  withoutCampus: null,
}

export const scopedStatsFixture = {
  ...statsFixture,
  institutionId: institutionFixtures[0].id,
  total: 50,
  institutions: [statsFixture.institutions[0]],
  campuses: [{ id: institutionFixtures[0].campuses[0].id, name: "Legon", city: "Accra", hallCount: 3, members: members(45, 36, 7, 2, 14) }],
  withoutCampus: members(5, 4, 1, 0, 1),
}

export const companyFixture = {
  id: "80000000-0000-4000-8000-000000000001", name: "Kofi Foods", email: "ads@kofifoods.example", phoneNumber: "+233240000000",
  bio: "Snacks for campus", logo: null, website: "https://kofifoods.example", status: "PENDING_VERIFICATION", registrationNumber: "CS123456789",
  verifiedAt: null, verifiedByAdminId: null, rejectionNote: null, size: "SMALL", businessType: "PRODUCTS",
  createdAt: "2026-09-10T10:00:00.000Z", updatedAt: "2026-09-10T10:00:00.000Z",
  _count: { publishers: 2, campaigns: 3 },
}

export const personFixture = (index: number, overrides: Record<string, unknown> = {}) => ({
  id: `60000000-0000-4000-8000-00000000010${index}`, role: "VIEWER", isActive: true, deactivationReason: null,
  userProfile: { fullName: `Person ${index}`, username: `person${index}`, image: null, studentStatus: "STUDENT", verificationTier: "VERIFIED", institution: { id: institutionFixtures[0].id, shortName: "UG" } },
  ...overrides,
})

export const companyListFixture = { ...companyFixture, owner: { ...personFixture(1, { role: "PUBLISHER" }), userProfile: { fullName: "Kofi Owner", username: "kofi", email: "kofi@example.com", image: null } } }

export const companyDetailFixture = {
  ...companyFixture,
  publishers: [
    { isOwner: true, joinedAt: "2026-09-10T10:00:00.000Z", user: companyListFixture.owner },
    { isOwner: false, joinedAt: "2026-09-12T10:00:00.000Z", user: personFixture(2, { role: "PUBLISHER" }) },
  ],
}

export const relationshipsFixture = {
  counts: { followers: 42, following: 17, requestsReceived: 2, requestsSent: 1, blocking: 1, blockedBy: 0, posts: 9, comments: 30, institutionsFollowed: 1 },
  companies: [{ id: companyFixture.id, name: "Kofi Foods", email: "ads@kofifoods.example", logo: null, status: "ACTIVE", verifiedAt: "2026-09-11T10:00:00.000Z", publisherCount: 2, campaignCount: 3, isOwner: true, joinedAt: "2026-09-10T10:00:00.000Z" }],
  institutionsFollowed: [{ id: institutionFixtures[1].id, name: "KNUST", shortName: "KNUST", followedAt: "2026-09-15T10:00:00.000Z" }],
  identities: [{ provider: "GOOGLE", email: "ama@gmail.example", createdAt: "2026-09-01T10:00:00.000Z", lastUsedAt: "2026-10-20T10:00:00.000Z" }],
  sessions: { active: 2, lastStartedAt: "2026-10-20T10:00:00.000Z" },
  consent: { policyVersion: "2026-09-01", acceptedAt: "2026-09-01T10:00:00.000Z" },
  goldBalance: 25,
  honour: { year: 2026, nominationsThisYear: 3, decisions: [] },
  spotlightPurchases: 0,
}

export const connectionsFixture = (direction = "followers") => ({
  direction,
  items: [{ user: personFixture(3), status: "ACTIVE", since: "2026-10-01T10:00:00.000Z" }],
  total: 1, page: 1, limit: 20,
})

const checks = (met: boolean) => [
  { key: "year", met: true, detail: { days: 400 } },
  { key: "verified", met: true },
  { key: "standing", met: true },
  { key: "contribution", met, detail: { posts: met ? 30 : 12, interactions: 140 } },
]

export const honourCandidateFixture = (met = true) => ({
  userId: platformUserFixtures[0].id, username: "ama", fullName: "Ama Mensah", image: null, institution: "UG",
  nominations: met ? 30 : 8, campuses: met ? 3 : 1, meetsNominationRule: met,
  eligibility: { eligible: met, checks: checks(met), upheldReports: 0 },
  campusCap: { limit: 2, granted: 0, activePeople: 250 }, currentHonour: false, decision: null,
})

export const honourPageFixture = (met = true) => ({
  year: 2026,
  rules: { minAccountDays: 365, minPosts: 24, minInteractions: 100, minEventsOrganised: 2, nominationsRequired: 25, campusesRequired: 2, campusCapPer: 100, termDays: 365 },
  items: [honourCandidateFixture(met)], total: 1, page: 1, limit: 25,
})

// Business requests, as super-admin's `/business-requests` sends them.
const businessBase = {
  reference: "BR-0001", category: "FOOD", categoryLabel: "Food & drinks",
  about: "Waakye, wele and boiled eggs by the Legon gate, from 6am.", location: "East Legon, Accra",
  serves: { institution: "University of Ghana", school: "UG", campus: "Legon" },
  email: "abena.mensah@example.com", phone: "+233241234567", showPhone: true, website: null, size: "SOLO",
  registrationNumber: "BN123456789", hasLogo: true, hasCover: true, logoUrl: "https://cdn.example.com/logo.png",
  proof: { name: "certificate.jpg", sizeKb: 412 },
  requester: { id: "60000000-0000-4000-8000-000000000001", name: "Abena Mensah", username: "abena.mensah", role: "Owner", joinedAt: "2025-01-10T10:00:00.000Z", emailVerified: true, upheldReports: 0 },
  sentAt: "2026-11-02T10:00:00.000Z", status: "NEW", reviewer: null, reviewerId: null,
  checks: [
    { tone: "ok", text: "Registered: BN123456789. Check it against the certificate." },
    { tone: "look", short: "Similar name", text: "Similar accounts: @akos." },
    { tone: "ok", text: "Abena Mensah: on AdBox 1 year 9 months, email verified, no upheld reports." },
  ],
  note: null, declineReason: null, decidedAt: null, account: null, company: null,
}

export const businessRequestFixtures = [
  { ...businessBase, id: "90000000-0000-4000-8000-000000000001", name: "Auntie Akos' Waakye", username: "akos.waakye" },
  {
    ...businessBase, id: "90000000-0000-4000-8000-000000000002", reference: "BR-0002", name: "Kofi Prints", username: "kofi.prints",
    category: "SERVICES", categoryLabel: "Services", registrationNumber: null, proof: null, hasCover: false, logoUrl: null, serves: null,
    requester: { ...businessBase.requester, id: "60000000-0000-4000-8000-000000000002", name: "Kofi Boateng", username: "kofi.b", joinedAt: "2026-10-20T10:00:00.000Z" },
    sentAt: "2026-11-01T09:00:00.000Z",
    checks: [
      { tone: "look", short: "Not registered", text: "Not registered with the Registrar-General: the proof is a photo of the shop, stall or menu." },
      { tone: "problem", short: "No proof", text: "No proof is attached. Ask for one before approving." },
      { tone: "problem", short: "New account", text: "Kofi Boateng: on AdBox 2 weeks, email verified, no upheld reports." },
    ],
  },
]

export const businessDetail = (request: typeof businessRequestFixtures[number], extra: Record<string, unknown> = {}) => ({
  ...request,
  coverUrl: request.hasCover ? "https://cdn.example.com/cover.png" : null,
  proofUrl: request.proof ? "https://s3.example.com/proof?signed" : null,
  history: [{ at: request.sentAt, text: `Sent by @${request.requester.username}` }],
  ...extra,
})

// Page requests, as super-admin's `/page-requests` sends them.
const pageBase = {
  kind: "CHURCH", detail: "Catholic", institutionId: "50000000-0000-4000-8000-000000000001", institution: "University of Ghana", school: "UG", campus: "Legon",
  about: "Mass, fellowship and service for Catholic students at Legon.", email: "csu.legon@st.ug.edu.gh", phone: "+233241234567",
  hasLogo: true, hasCover: false, logoUrl: "https://cdn.example.com/csu.png", letter: { name: "letter.jpg", sizeKb: 284 },
  requester: { id: "60000000-0000-4000-8000-000000000001", name: "Kwame Asante", username: "kwame.asante", role: "President", joinedAt: "2025-08-15T12:00:00.000Z", emailVerified: true, badge: "Student badge (University of Ghana)", upheldReports: 0 },
  sentAt: "2026-11-02T10:42:00.000Z", status: "NEW", reviewer: null, reviewerId: null,
  checks: [
    { tone: "ok", text: "No page for this group at the University of Ghana yet." },
    { tone: "look", short: "Similar name", text: "Similar name: @ugcatholics, a personal account, not a page." },
  ],
  note: null, declineReason: null, decidedAt: null, page: null,
}

export const pageRequestFixtures = [
  { ...pageBase, id: "91000000-0000-4000-8000-000000000001", reference: "PR-0001", name: "Catholic Students' Union (CSU)", username: "ug.csu" },
  {
    ...pageBase, id: "91000000-0000-4000-8000-000000000002", reference: "PR-0002", name: "Methodist Students' Union", username: "ug.msu",
    kind: "CHURCH", detail: "Methodist", letter: null, logoUrl: null, hasLogo: false,
    requester: { ...pageBase.requester, id: "60000000-0000-4000-8000-000000000002", name: "Yaw Boateng", username: "yaw.boateng", badge: null, emailVerified: false, joinedAt: "2026-10-12T10:00:00.000Z" },
    sentAt: "2026-11-01T08:50:00.000Z",
    checks: [
      { tone: "problem", short: "No letter", text: "No letter of proof was attached." },
      { tone: "problem", short: "new account", text: "Yaw Boateng: on AdBox 3 weeks, email not verified, no campus badge." },
    ],
  },
]

export const pageDetail = (request: typeof pageRequestFixtures[number], extra: Record<string, unknown> = {}) => ({
  ...request,
  coverUrl: null,
  letterUrl: request.letter ? "https://s3.example.com/letter?signed" : null,
  history: [{ at: request.sentAt, text: `Sent by @${request.requester.username}` }],
  ...extra,
})
