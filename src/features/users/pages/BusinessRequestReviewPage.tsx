import { useEffect, useRef, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { toast } from "sonner"
import { BadgeCheck, Building2, FileText, Globe, Inbox, Mail, MapPin, MessageSquareWarning, Phone, School, UserRound, UsersRound } from "lucide-react"
import { Button } from "@/components/ui/button"
import { APP_ROUTES } from "@/routes/paths"
import {
  useAdminId,
  useApproveBusinessRequest,
  useAskForBusinessRequestChanges,
  useBusinessRequest,
  useBusinessUsername,
  useClaimBusinessRequest,
  useDebouncedValue,
  useDeclineBusinessRequest,
  useUserAccess,
} from "../hooks"
import { businessDeclineReasonLabels, companySizeLabels, proofChecks, servesLine } from "../lib/business-requests"
import { cn } from "../lib/cn"
import { usersErrorMessage } from "../lib/errors"
import { formatDate } from "../lib/format"
import { sentByAccountNote, usernameFormatProblem, waitingFor } from "../lib/page-requests"
import { companyPath, userProfilePath } from "../lib/paths"
import { USER_PERMISSIONS } from "../types"
import { approveBusinessRequestSchema, type BusinessRequestDetail } from "../validation"
import { BusinessLogo, CompanySealPill } from "../components/BusinessRequestParts"
import { CheckPill, PageRequestStatusPill } from "../components/PageRequestParts"
import {
  Added, ChangesForm, ChecksSection, Cover, DecisionModes, DeclineForm, ExternalAnchor, HistorySection, NameField, NoDecision, ProofFile,
  ReviewChecklist, UsernameField, type DecisionMode,
} from "../components/RequestReview"
import { firstName, usernameHint } from "../lib/requests"
import { CompanyStatusBadge } from "../components/UserBadges"
import { BackLink, ErrorState, NoAccess, ink, muted, surface } from "../components/Surface"
import { Callout, Row, Rows, Section } from "../components/ProfileParts"

/** One business request: what they sent, the proof, AdBox's checks, and the decision. */
export function BusinessRequestReviewPage() {
  const { requestId = "" } = useParams()
  const can = useUserAccess()
  const allowed = can(USER_PERMISSIONS.companiesRead)
  const canDecide = can(USER_PERMISSIONS.companiesVerify)
  const request = useBusinessRequest(requestId, allowed)
  const adminId = useAdminId()
  const claim = useClaimBusinessRequest()
  const claimed = useRef(false)
  const [ticked, setTicked] = useState<Record<string, boolean>>({})

  const data = request.data
  // Opening a new request claims it, so two admins don't review the same one.
  useEffect(() => {
    if (!data || data.status !== "NEW" || claimed.current || !canDecide) return
    claimed.current = true
    claim.mutate(data.id, { onError: () => void request.refetch() })
  }, [data, claim, canDecide, request])

  if (!allowed) return <NoAccess permission={USER_PERMISSIONS.companiesRead} what="business requests" />

  const open = data && (data.status === "NEW" || data.status === "IN_REVIEW" || data.status === "NEEDS_CHANGES")
  const checks = data ? proofChecks(data) : []
  const proofReady = Boolean(data?.proof) && checks.every((check) => ticked[check.key])

  return <div className="flex min-w-0 flex-col gap-4 px-4 sm:px-6">
    <BackLink to={APP_ROUTES.manageUsersBusinessRequests}>All business requests</BackLink>
    {request.isError && <div className={surface}><ErrorState message={usersErrorMessage(request.error, "Could not load this request.")} onRetry={() => void request.refetch()} /></div>}
    {request.isPending && <div role="status" aria-label="Loading business request" className={cn(surface, "h-48 animate-pulse")} />}

    {data && <>
      <header className={cn(surface, "overflow-hidden")}>
        <Cover url={data.coverUrl} />
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
          <BusinessLogo name={data.name} url={data.logoUrl} size="lg" />
          <div className="min-w-0 flex-1">
            <h1 className={cn("font-heading text-h5 font-semibold", ink)}>{data.name}</h1>
            <p className={cn("text-b3", muted)}>@{data.username} · {data.categoryLabel} · {data.location}</p>
          </div>
          <div className="flex flex-col items-start gap-1 sm:items-end">
            <PageRequestStatusPill request={data} mine={Boolean(adminId) && data.reviewerId === adminId} />
            <span className={cn("text-b4", muted)}>
              {open ? `Waiting ${waitingFor(data.sentAt)} · ${data.reference}` : `${formatDate(data.decidedAt)} · ${data.reference}`}
            </span>
          </div>
        </div>
      </header>

      {data.status === "NEEDS_CHANGES" && data.note && <Callout tone="warning" icon={<MessageSquareWarning className="size-4" aria-hidden="true" />}>
        Waiting for {firstName(data.requester.name)} to change it: “{data.note}”
      </Callout>}

      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-12">
        <div className="flex min-w-0 flex-col gap-4 lg:col-span-7 xl:col-span-8">
          <Section icon={<Inbox className="size-4" aria-hidden="true" />} title="What they sent">
            <Rows>
              <Row label="Asked by" icon={<UserRound className="size-3.5" aria-hidden="true" />} multiline value={<span className="min-w-0">
                {can(USER_PERMISSIONS.read)
                  ? <Link to={userProfilePath(data.requester.id)} className="font-semibold hover:text-purple hover:underline">{data.requester.name}</Link>
                  : <span className="font-semibold">{data.requester.name}</span>}
                {data.requester.username && ` (@${data.requester.username})`}, {data.requester.role}
              </span>} />
              <Row label="Business email" value={data.email} icon={<Mail className="size-3.5" aria-hidden="true" />} />
              <Row label="Phone" value={data.phone} icon={<Phone className="size-3.5" aria-hidden="true" />}
                trailing={<span className={cn("text-b4", muted)}>{data.showPhone ? "On the profile" : "Kept private"}</span>} />
              <Row label="Website" value={data.website ? <ExternalAnchor href={data.website}>{data.website}</ExternalAnchor> : null} icon={<Globe className="size-3.5" aria-hidden="true" />} />
              <Row label="Where" value={data.location} icon={<MapPin className="size-3.5" aria-hidden="true" />} />
              <Row label="Serves" value={servesLine(data.serves) ?? "No campus in particular"} icon={<School className="size-3.5" aria-hidden="true" />} />
              <Row label="Size" value={data.size ? companySizeLabels[data.size] ?? data.size : null} icon={<UsersRound className="size-3.5" aria-hidden="true" />} />
              <Row label="About" value={data.about} multiline />
              <Row label="Logo and cover" value={<span className="flex flex-wrap gap-1.5">
                <Added done={data.hasLogo} yes="Logo added" no="No logo" />
                <Added done={data.hasCover} yes="Cover added" no="No cover" />
              </span>} />
            </Rows>
          </Section>

          <Section icon={<FileText className="size-4" aria-hidden="true" />} title="Proof">
            <div className="flex flex-col gap-4 p-4">
              <p className={cn("text-b3", ink)}>
                {data.registrationNumber
                  ? <>Registered with the Registrar-General: <span className="font-mono text-b4 font-semibold">{data.registrationNumber}</span></>
                  : "Not registered, so the proof is a photo of the shop, stall or menu."}
              </p>
              {data.proof
                ? <div className="grid grid-cols-1 gap-4 sm:grid-cols-[minmax(0,14rem)_1fr]">
                  <ProofFile file={data.proof} url={data.proofUrl} what="The proof" />
                  <ReviewChecklist legend="Your check of the proof" checks={checks} ticked={ticked}
                    onTick={(key, value) => setTicked((current) => ({ ...current, [key]: value }))} disabled={!open || !canDecide} />
                </div>
                : <div className="flex items-start gap-3">
                  <CheckPill tone="problem" label="No proof" />
                  <p className={cn("text-b3", muted)}>Nothing was attached, so it can't be approved. Ask {firstName(data.requester.name)} for one, or decline it.</p>
                </div>}
            </div>
          </Section>

          <ChecksSection checks={data.checks} />
          <HistorySection history={data.history} />
        </div>

        <aside aria-label="Decision" className="flex min-w-0 flex-col gap-4 lg:sticky lg:top-6 lg:col-span-5 xl:col-span-4">
          {open
            ? <DecisionPanel request={data} proofReady={proofReady} canDecide={canDecide} />
            : <OutcomePanel request={data} />}
        </aside>
      </div>
    </>}
  </div>
}

function DecisionPanel({ request, proofReady, canDecide }: { request: BusinessRequestDetail; proofReady: boolean; canDecide: boolean }) {
  const [mode, setMode] = useState<DecisionMode>(request.requester.isAccount ? "decline" : request.proof ? "approve" : "changes")
  const ask = useAskForBusinessRequestChanges()
  const decline = useDeclineBusinessRequest()
  const who = firstName(request.requester.name)
  if (!canDecide) return <section className={cn(surface, "p-5")}><NoDecision permission={USER_PERMISSIONS.companiesVerify} /></section>
  return <section aria-label="Decision" className={cn(surface, "flex flex-col gap-4 p-5")}>
    <h2 className={cn("text-b1 font-semibold", ink)}>Decision</h2>
    <DecisionModes mode={mode} onChange={setMode} />
    {mode === "approve" && <ApproveForm request={request} proofReady={proofReady} />}
    {mode === "changes" && <ChangesForm who={who} waiting={request.status === "NEEDS_CHANGES"}
      placeholder="e.g. The certificate is cut off. Please send a photo of the whole page."
      onSend={(note) => ask.mutateAsync({ id: request.id, input: { note } })} />}
    {mode === "decline" && <DeclineForm who={who} name={request.name} labels={businessDeclineReasonLabels}
      placeholder="e.g. This business already has an account, @akos.waakye. Ask its owner to add you."
      onDecline={(input) => decline.mutateAsync({ id: request.id, input })} />}
  </section>
}

function ApproveForm({ request, proofReady }: { request: BusinessRequestDetail; proofReady: boolean }) {
  const approve = useApproveBusinessRequest()
  const [username, setUsername] = useState(request.username)
  const [name, setName] = useState(request.name)
  const [error, setError] = useState("")
  const cleaned = username.trim().toLowerCase().replace(/^@/, "")
  // Ask the server once typing pauses; it also knows whether the requested one was taken since.
  const asked = useDebouncedValue(cleaned)
  const check = useBusinessUsername(request.id, asked, !usernameFormatProblem(asked))
  const { error: usernameError, hint } = usernameHint({
    cleaned, requested: request.username, formatProblem: usernameFormatProblem(cleaned),
    answer: asked === cleaned ? check.data : undefined, failed: check.isError,
  })
  const who = firstName(request.requester.name)
  const blocked = request.requester.isAccount

  function confirm() {
    if (approve.isPending || blocked) return
    const parsed = approveBusinessRequestSchema.safeParse({ username: cleaned, name })
    if (!parsed.success) { setError(parsed.error.issues[0].message); return }
    if (usernameError) { setError(usernameError); return }
    setError("")
    approve.mutate({ id: request.id, input: parsed.data }, {
      onSuccess: (done) => toast.success(`@${done.account?.username ?? done.username} approved`, { description: `${who} can switch to it from their profile.` }),
      onError: (cause) => setError(usersErrorMessage(cause, "Could not approve. Try again.")),
    })
  }

  return <div className="flex flex-col gap-4">
    <UsernameField label="Account username" value={username} onChange={(value) => { setUsername(value); setError("") }} error={usernameError} hint={hint} />
    <NameField label="Business name" value={name} onChange={(value) => { setName(value); setError("") }} />
    <dl className="grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-2 text-b3">
      <dt className={muted}>Account</dt><dd className={cn("font-semibold", ink)}>Its own, a publisher</dd>
      <dt className={muted}>Badge</dt><dd><CompanySealPill /></dd>
      <dt className={muted}>Run by</dt><dd className={cn("font-semibold", ink)}>{request.requester.name} · owner</dd>
    </dl>
    <p className={cn("text-b3", muted)}>
      {who} switches to it from their own account, with no password. They're told in the app; no email is sent.
    </p>
    {(blocked || !proofReady) && <p className="text-b4 text-warning-700 dark:text-warning-300">
      {blocked ? sentByAccountNote : request.proof ? "Tick all three proof checks first." : "No proof, so it can't be approved. Ask for changes."}
    </p>}
    {error && <p role="alert" className="text-b3 text-destructive">{error}</p>}
    <Button type="button" disabled={blocked || !proofReady || approve.isPending} className="h-11 cursor-pointer rounded-full bg-[image:var(--gradient-purple)] text-white hover:opacity-90" onClick={confirm}>
      <BadgeCheck className="size-4" aria-hidden="true" />{approve.isPending ? "Approving…" : "Approve and create the account"}
    </Button>
  </div>
}

/** A decided request: what happened, instead of the decision controls. */
function OutcomePanel({ request }: { request: BusinessRequestDetail }) {
  const approved = request.status === "APPROVED"
  const can = useUserAccess()
  const handle = request.account?.username ?? request.username
  return <section className={cn(surface, "flex flex-col gap-3 p-5")}>
    <h2 className={cn("text-b1 font-semibold", ink)}>{approved ? "Approved" : "Declined"}</h2>
    {approved
      ? <>
        <p className={cn("text-b3", ink)}>@{handle} is a business account with the verified company seal. {request.requester.name} runs it as its owner.</p>
        <div className="flex flex-wrap items-center gap-2">
          <CompanySealPill />
          {/* Only worth saying once the company has moved on from approval (suspended, say). */}
          {request.company?.status && request.company.status !== "ACTIVE" && <CompanyStatusBadge status={request.company.status} />}
        </div>
        <div className="flex flex-wrap gap-2">
          {request.account && can(USER_PERMISSIONS.read) && <Button asChild variant="outline" className="h-9 rounded-full px-3">
            <Link to={userProfilePath(request.account.userId)}><UserRound className="size-4" aria-hidden="true" />Open the account</Link>
          </Button>}
          {request.company && <Button asChild variant="outline" className="h-9 rounded-full px-3">
            <Link to={companyPath(request.company.id)}><Building2 className="size-4" aria-hidden="true" />Open the company</Link>
          </Button>}
        </div>
      </>
      : <>
        {request.declineReason && <p className={cn("text-b3 font-semibold", ink)}>{businessDeclineReasonLabels[request.declineReason]}</p>}
        {request.note && <p className={cn("text-b3", muted)}>“{request.note}”</p>}
        <p className={cn("text-b4", muted)}>They can send a new request.</p>
      </>}
    <p className={cn("text-b4", muted)}>{formatDate(request.decidedAt, "d MMM yyyy, HH:mm")}</p>
  </section>
}
