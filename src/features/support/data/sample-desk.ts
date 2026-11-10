import type { Agent, Customer, SavedReply, Ticket, TicketMessage, TicketPriority } from "../types"

// Sample help desk: invented people and conversations, timed relative to `now` so reply
// deadlines look live. Nothing here comes from or goes to a server.

export const ME = "agent-me"

export const agents: Agent[] = [
  { id: ME, name: "You" },
  { id: "agent-kwesi", name: "Kwesi Boateng" },
  { id: "agent-esi", name: "Esi Arthur" },
]

/** How long we have to reply, by priority (minutes after the customer last wrote). */
export const replyTargets: Record<TicketPriority, number> = { urgent: 60, high: 240, normal: 480, low: 1440 }

export const savedReplies: SavedReply[] = [
  { id: "momo-id", title: "Ask for the Mobile Money transaction ID", body: "Hi {first},\n\nThanks for letting us know. Could you send the Mobile Money transaction ID and the time you paid? We'll match it to your wallet and update you within the hour." },
  { id: "secure", title: "Account secured", body: "Hi {first},\n\nWe've signed out every device on your account and paused new sign-ins. Please set a new password from the app now, then reply here and we'll lift the pause." },
  { id: "id-photo", title: "Verification: retake the ID photo", body: "Hi {first},\n\nYour student ID photo was too blurry for us to read. Please take a new one in good light with all four corners showing, then submit it again from Profile › Verification." },
  { id: "ad-review", title: "Why an ad was not approved", body: "Hi {first},\n\nYour ad wasn't approved because {reason}. Edit the ad, then send it for review again; your held gold is returned in full if you'd rather cancel it." },
  { id: "upload", title: "Upload troubleshooting", body: "Hi {first},\n\nSorry about the failed uploads. Please update the app, keep it open until the upload finishes, and try on Wi‑Fi if you can. If it still fails, reply with your phone model and we'll look into it." },
  { id: "anything-else", title: "Close: anything else?", body: "Hi {first},\n\nThis should be sorted now. Is there anything else we can help with? If we don't hear back, we'll close this conversation in two days." },
]

const customers: Customer[] = [
  { id: "c-kofi", name: "Kofi Mensah", username: "kofi.m", email: "kofi.mensah@st.knust.edu.gh", role: "Creator", institution: "KNUST", joinedAt: "2025-09-14", emailVerified: true, campusBadge: true, goldBalance: 0 },
  { id: "c-abena", name: "Abena Owusu", username: "abena.o", email: "abena.owusu@gmail.com", role: "Viewer", institution: "University of Ghana", joinedAt: "2026-02-03", emailVerified: true, campusBadge: false, goldBalance: 40 },
  { id: "c-yaw", name: "Yaw Osei", username: "yawosei", email: "yaw.osei@st.ucc.edu.gh", role: "Viewer", institution: "University of Cape Coast", joinedAt: "2026-08-21", emailVerified: true, campusBadge: false, goldBalance: 15 },
  { id: "c-adjoa", name: "Adjoa Asante", username: "adjoa.eats", email: "hello@adjoaeats.com", role: "Publisher", institution: null, joinedAt: "2026-05-10", emailVerified: true, campusBadge: false, goldBalance: 1250 },
  { id: "c-kwame", name: "Kwame Appiah", username: "kwame.films", email: "kwame.appiah@ashesi.edu.gh", role: "Creator", institution: "Ashesi University", joinedAt: "2025-11-30", emailVerified: true, campusBadge: true, goldBalance: 310 },
  { id: "c-efua", name: "Efua Quaye", username: "efua.quaye", email: "efua.quaye@gmail.com", role: "Creator", institution: "University of Ghana", joinedAt: "2025-10-02", emailVerified: true, campusBadge: true, goldBalance: 85 },
  { id: "c-nana", name: "Nana Ama Boakye", username: "nanaama", email: "nana.boakye@upsamail.edu.gh", role: "Viewer", institution: "UPSA", joinedAt: "2026-03-18", emailVerified: false, campusBadge: false, goldBalance: 5 },
  { id: "c-selasi", name: "Selasi Agbeko", username: "selasi.a", email: "selasi.agbeko@htu.edu.gh", role: "Viewer", institution: "Ho Technical University", joinedAt: "2026-01-09", emailVerified: true, campusBadge: true, goldBalance: 0 },
  { id: "c-ama", name: "Ama Serwaa", username: "ama.serwaa", email: "ama.serwaa@st.ug.edu.gh", role: "Creator", institution: "University of Ghana", joinedAt: "2025-12-12", emailVerified: true, campusBadge: true, goldBalance: 620 },
  { id: "c-kojo", name: "Kojo Badu", username: "kojobadu", email: "kojo@badu-prints.com", role: "Publisher", institution: null, joinedAt: "2026-04-22", emailVerified: true, campusBadge: false, goldBalance: 2400 },
  { id: "c-esinam", name: "Esinam Dogbe", username: "esinam", email: "esinam.dogbe@gmail.com", role: "Viewer", institution: "University of Ghana", joinedAt: "2026-06-30", emailVerified: true, campusBadge: false, goldBalance: 0 },
  { id: "c-fiifi", name: "Fiifi Mensah", username: "fiifi.codes", email: "fiifi.mensah@st.knust.edu.gh", role: "Creator", institution: "KNUST", joinedAt: "2025-09-01", emailVerified: true, campusBadge: true, goldBalance: 95 },
]

type Draft = Omit<Ticket, "createdAt" | "updatedAt" | "replyDueAt" | "messages" | "unread"> & {
  unread?: boolean
  /** [minutes ago, author, body, extras] oldest first. */
  thread: Array<[number, "customer" | "agent", string, { agentId?: string; internal?: boolean; attachments?: TicketMessage["attachments"] }?]>
}

const drafts: Draft[] = [
  { id: "t-1048", reference: "SUP-1048", subject: "Paid for 500 gold bars but my wallet still shows 0", category: "gold", priority: "urgent", status: "open", channel: "in-app", customerId: "c-kofi", assigneeId: ME, unread: true, thread: [
    [50, "customer", "I bought the 500 gold bar bundle with MTN MoMo about an hour ago. The money left my wallet but AdBox still shows 0 gold. I need it to boost my post before the event tonight.", { attachments: [{ name: "momo-receipt.jpg", sizeKb: 184 }] }],
  ] },
  { id: "t-1047", reference: "SUP-1047", subject: "Someone signed in to my account from another phone", category: "account", priority: "urgent", status: "open", channel: "email", customerId: "c-abena", assigneeId: null, unread: true, thread: [
    [130, "customer", "I got a notification that my account signed in on a Tecno phone in Kumasi. I'm in Accra and I don't own that phone. Please help, my DMs have private things in them."],
  ] },
  { id: "t-1046", reference: "SUP-1046", subject: "Student ID verification stuck on pending for a week", category: "verification", priority: "high", status: "open", channel: "in-app", customerId: "c-yaw", assigneeId: ME, thread: [
    [180, "customer", "I submitted my UCC student ID last Monday and it still says pending. My friends who applied after me already have the campus badge."],
  ] },
  { id: "t-1045", reference: "SUP-1045", subject: "My ad was rejected and I don't know why", category: "ads", priority: "normal", status: "open", channel: "email", customerId: "c-adjoa", assigneeId: "agent-kwesi", thread: [
    [300, "customer", "My jollof promo ad for Adjoa Eats was rejected this morning. There was no reason in the app. The same picture is on my page already.", { attachments: [{ name: "ad-preview.png", sizeKb: 642 }] }],
    [280, "agent", "Checked the review: the ad text says “cheapest in Accra”, which we can't verify. Suggest she rewords it.", { agentId: "agent-kwesi", internal: true }],
  ] },
  { id: "t-1044", reference: "SUP-1044", subject: "Video upload keeps failing at 99%", category: "app", priority: "normal", status: "open", channel: "in-app", customerId: "c-kwame", assigneeId: null, thread: [
    [360, "customer", "Every time I upload my short film (about 2 minutes) it gets to 99% and then says “Upload failed”. Tried three times on campus Wi‑Fi."],
  ] },
  { id: "t-1043", reference: "SUP-1043", subject: "A page is posting my photos without permission", category: "safety", priority: "high", status: "open", channel: "in-app", customerId: "c-efua", assigneeId: ME, unread: true, thread: [
    [420, "customer", "A page called @legon.crushes posted two of my pictures with comments about me. I reported it in the app but they're still up."],
    [380, "agent", "I'm sorry this happened, Efua. I've asked our safety team to review the page now. Could you send links to the two posts so we can act on them directly?", { agentId: ME }],
    [60, "customer", "Here they are. There's a third one now as well.", { attachments: [{ name: "post-links.txt", sizeKb: 1 }] }],
  ] },
  { id: "t-1042", reference: "SUP-1042", subject: "Withdrawal to MTN MoMo not received", category: "gold", priority: "high", status: "pending", channel: "in-app", customerId: "c-ama", assigneeId: ME, thread: [
    [1500, "customer", "I withdrew GH₵ 120 from my creator earnings on Friday and it hasn't arrived."],
    [1420, "agent", "Hi Ama, thanks for your patience. Could you confirm the MoMo number the withdrawal went to? It shows as 024•••• 6612 on our side.", { agentId: ME }],
  ] },
  { id: "t-1041", reference: "SUP-1041", subject: "How do I switch to my business account?", category: "account", priority: "low", status: "pending", channel: "email", customerId: "c-kojo", assigneeId: "agent-esi", thread: [
    [1700, "customer", "Our business account Badu Prints was approved. Where do I find it?"],
    [1640, "agent", "Congratulations! Tap your profile picture at the top of the app, then choose Badu Prints from the list. Does it show up for you?", { agentId: "agent-esi" }],
  ] },
  { id: "t-1040", reference: "SUP-1040", subject: "Campus badge disappeared after I changed my programme", category: "verification", priority: "normal", status: "open", channel: "in-app", customerId: "c-selasi", assigneeId: ME, thread: [
    [1200, "customer", "I updated my programme from HND to BTech and now my HTU badge is gone. I'm still a student there."],
  ] },
  { id: "t-1039", reference: "SUP-1039", subject: "Survey responses aren't showing up", category: "app", priority: "low", status: "open", channel: "email", customerId: "c-fiifi", assigneeId: null, thread: [
    [540, "customer", "I ran a survey on my post yesterday. It says 34 responses but the results page is empty."],
  ] },
  { id: "t-1034", reference: "SUP-1034", subject: "App closes when I open Discover on iPhone 11", category: "app", priority: "high", status: "open", channel: "in-app", customerId: "c-esinam", assigneeId: "agent-kwesi", thread: [
    [245, "customer", "Since the update, the app closes as soon as I tap Discover. Everything else works. iPhone 11, iOS 17."],
  ] },
  { id: "t-1035", reference: "SUP-1035", subject: "Ad budget not returned after I stopped my ad", category: "ads", priority: "normal", status: "pending", channel: "email", customerId: "c-adjoa", assigneeId: "agent-kwesi", thread: [
    [2900, "customer", "I stopped my weekend ad on Saturday with 3 days left. The gold hasn't come back."],
    [2800, "agent", "Hi Adjoa, the unspent gold returns within a minute of stopping, and I can see 720 bars returned on Saturday at 14:02. Could you check your wallet history and let us know if it's there?", { agentId: "agent-kwesi" }],
  ] },
  { id: "t-1038", reference: "SUP-1038", subject: "Spotlight purchase charged twice", category: "gold", priority: "high", status: "resolved", channel: "in-app", customerId: "c-kwame", assigneeId: "agent-kwesi", satisfaction: 5, thread: [
    [3100, "customer", "I bought Spotlight for a week and 300 gold was taken twice."],
    [3050, "agent", "You're right, the second charge was a duplicate. I've returned the 300 gold to your wallet. Sorry about that!", { agentId: "agent-kwesi" }],
    [3000, "customer", "Got it, thank you!"],
  ] },
  { id: "t-1037", reference: "SUP-1037", subject: "Reported comment is still visible", category: "safety", priority: "normal", status: "resolved", channel: "in-app", customerId: "c-nana", assigneeId: ME, satisfaction: 4, thread: [
    [4400, "customer", "I reported an insulting comment on my post two days ago and it's still there."],
    [4300, "agent", "Thanks for reporting it, Nana. We've removed the comment and warned the account that posted it.", { agentId: ME }],
  ] },
  { id: "t-1036", reference: "SUP-1036", subject: "Can't sign in with Google", category: "account", priority: "normal", status: "resolved", channel: "email", customerId: "c-fiifi", assigneeId: "agent-esi", thread: [
    [4600, "customer", "Sign in with Google just spins and nothing happens."],
    [4500, "agent", "A fix went out in version 2.4.1. Please update the app and try again.", { agentId: "agent-esi" }],
    [4380, "customer", "Updated and it works now. Thanks."],
  ] },
  { id: "t-1033", reference: "SUP-1033", subject: "Please delete my account and my data", category: "account", priority: "normal", status: "resolved", channel: "email", customerId: "c-esinam", assigneeId: ME, satisfaction: 5, thread: [
    [7300, "customer", "I'd like my old account and everything in it deleted."],
    [7200, "agent", "Done: your account is scheduled for deletion and will be erased after the 30-day grace period. Signing in before then cancels it.", { agentId: ME }],
  ] },
]

const minutesAgo = (now: number, minutes: number) => new Date(now - minutes * 60_000).toISOString()

/** A fresh copy of the sample desk, as of `now`. */
export function buildSampleDesk(now = Date.now()) {
  const tickets: Ticket[] = drafts.map(({ thread, unread, ...draft }) => {
    const messages: TicketMessage[] = thread.map(([ago, author, body, extras], index) => ({
      id: `${draft.id}-m${index + 1}`, author, body, internal: extras?.internal ?? false,
      agentId: extras?.agentId, attachments: extras?.attachments, createdAt: minutesAgo(now, ago),
    }))
    const lastCustomer = [...messages].reverse().find((message) => message.author === "customer")
    const replyDueAt = draft.status === "open" && lastCustomer
      ? new Date(new Date(lastCustomer.createdAt).getTime() + replyTargets[draft.priority] * 60_000).toISOString()
      : null
    return {
      ...draft, messages, replyDueAt, unread: unread ?? false,
      createdAt: messages[0].createdAt, updatedAt: messages[messages.length - 1].createdAt,
    }
  })
  return { tickets, customers: customers.map((customer) => ({ ...customer })) }
}
