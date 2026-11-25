import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { CheckCircle2, Circle, Clapperboard, Eye, Globe, Hash, Images, Loader2, Lock, PartyPopper, Plus, Send, Type } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { APP_ROUTES } from "@/routes/paths"
import { AccountDialog } from "../components/AccountDialog"
import { AccountChooser, ChoiceCard, Step } from "../components/composer/ComposerBits"
import { PicturesPicker, VideoPicker } from "../components/composer/MediaPicker"
import { PhonePreview } from "../components/composer/PhonePreview"
import { GroupDialog } from "../components/GroupDialog"
import { EmptyState, Pill } from "../components/StudioBits"
import { GroupCover } from "../components/StudioCards"
import { ink, muted, panel } from "../components/tokens"
import { usePublishPost, useStudioAccess, useStudioAccounts, useStudioGroups } from "../hooks"
import { CAPTION_MAX, MAX_HASHTAGS, allHashtags } from "../lib/caption"
import { cn } from "../lib/cn"
import { composerProblems, draftKind, finalCaption, publishPercent } from "../lib/composer"
import { serverMessage } from "../lib/errors"
import { POST_KIND_LABELS, TIMING_LABELS, accountName, groupDates, groupTiming, type PostKind } from "../lib/format"
import { formatBytes, type PreparedImage, type PreparedVideo } from "../lib/media"
import { accountPath, groupPath } from "../lib/paths"
import type { PublishProgress, PublishStage } from "../lib/publish"
import type { AppPost, PostType, PostVisibility, StudioAccount, StudioGroup } from "../types"

const NO_GROUP = "none"

const STAGE_LABELS: Record<PublishStage, string> = {
  creating: "Getting the post ready…",
  uploading: "Uploading…",
  finishing: "Finishing the upload…",
  publishing: "Publishing…",
}

type Posted = { post: AppPost; account: StudioAccount; kind: PostKind; group: StudioGroup | null; visibility: PostVisibility }

/**
 * Post as one of the studio's accounts: a video (a Short when it is portrait and short), pictures
 * or words, in a group if wanted. It goes through the app's own posting, as the phone does.
 */
export function StudioCreatePage() {
  const access = useStudioAccess()
  const [params] = useSearchParams()
  const accounts = useStudioAccounts({ state: "active", limit: 100 }, access.read)
  const groups = useStudioGroups({ state: "active", limit: 100 }, access.read)
  const publish = usePublishPost()
  const ids = { caption: useId(), captionHint: useId() }

  const [chosenAccount, setChosenAccount] = useState<string | null>(params.get("account"))
  const [type, setType] = useState<PostType>("VIDEO")
  const [images, setImages] = useState<PreparedImage[]>([])
  const [video, setVideo] = useState<PreparedVideo | null>(null)
  const [caption, setCaption] = useState("")
  const [groupId, setGroupId] = useState<string | null>(params.get("group"))
  const [visibility, setVisibility] = useState<PostVisibility>("PUBLIC")
  const [progress, setProgress] = useState<PublishProgress | null>(null)
  const [failure, setFailure] = useState<string | null>(null)
  const [posted, setPosted] = useState<Posted | null>(null)
  const [dialog, setDialog] = useState<"account" | "group" | "preview" | null>(null)

  const activeAccounts = accounts.data?.items ?? []
  // With a single account there is nothing to choose.
  const accountId = chosenAccount ?? (activeAccounts.length === 1 ? activeAccounts[0].id : null)
  const account = activeAccounts.find((item) => item.id === accountId) ?? null
  const group = groups.data?.items.find((item) => item.id === groupId) ?? null

  const draft = { accountId: account?.id ?? null, type, caption, images, video, groupHashtag: group?.hashtag ?? null }
  const problems = composerProblems(draft)
  const kind = draftKind(draft)
  const captionToPost = finalCaption(draft)
  const hashtags = allHashtags(captionToPost)
  const busy = progress !== null

  // Previews live in memory: let go of each when it leaves the composer, and of all on the way out.
  const liveUrls = useRef(new Set<string>())
  useEffect(() => {
    const current = new Set([...images.map((image) => image.url), ...(video ? [video.url] : [])])
    for (const url of liveUrls.current) if (!current.has(url)) URL.revokeObjectURL(url)
    liveUrls.current = current
  }, [images, video])
  useEffect(() => {
    const urls = liveUrls
    return () => { for (const url of urls.current) URL.revokeObjectURL(url) }
  }, [])

  // Leaving mid-upload would lose the post.
  useEffect(() => {
    if (!busy) return
    const warn = (event: BeforeUnloadEvent) => event.preventDefault()
    window.addEventListener("beforeunload", warn)
    return () => window.removeEventListener("beforeunload", warn)
  }, [busy])

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (problems.length > 0 || !account || busy) return
    setFailure(null)
    setProgress({ stage: "creating", sent: 0, total: 0 })
    try {
      const post = await publish.mutateAsync({
        accountId: account.id,
        draft: { type, caption: captionToPost, visibility, images: type === "IMAGE" ? images : [], video: type === "VIDEO" ? video : null },
        onProgress: setProgress,
      })
      setPosted({ post, account, kind, group, visibility })
    } catch (error) {
      setFailure(serverMessage(error, "The post couldn't be made."))
    } finally {
      setProgress(null)
    }
  }

  const postAnother = () => {
    setPosted(null)
    setImages([])
    setVideo(null)
    setCaption("")
  }

  if (!access.loading && !access.post) return <EmptyState icon={Send} title="Posting isn't open to you">Posting from the studio needs the studio.post permission. An admin who manages roles can add it.</EmptyState>

  const preview = <PhonePreview account={account} type={type} short={kind === "SHORT"} caption={captionToPost} images={images} video={video} visibility={visibility} />

  if (posted) return <PostedPanel posted={posted} preview={preview} onAgain={postAnother} />

  const hasMedia = type !== "TEXT"
  const steps = { account: 1, kind: 2, media: 3, caption: hasMedia ? 4 : 3, group: hasMedia ? 5 : 4 }
  return <div className="flex flex-col gap-6">
    <section aria-labelledby="create-title" className="studio-aurora video-reveal rounded-[28px] px-6 py-7 sm:px-8 sm:py-9">
      <p className="studio-glass inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold text-white/90"><Send className="size-3.5" aria-hidden="true" />Create</p>
      <h2 id="create-title" className="mt-3 font-heading text-h5 font-bold text-white sm:text-h4">Make a post</h2>
      <p className="mt-1.5 max-w-2xl text-b3 leading-5 text-white/80 md:text-b2">It goes out from the account you choose, like anyone's post in the app, and records that you made it.</p>
    </section>

    <div className="grid grid-cols-1 gap-8 xl:grid-cols-12">
      <form onSubmit={(event) => void submit(event)} aria-label="New post" className="flex min-w-0 flex-col gap-5 xl:col-span-7 2xl:col-span-8">
        <fieldset disabled={busy} className="flex min-w-0 flex-col gap-5">
          <Step number={steps.account} id="step-account" title="Post as" description="Every account here is a regular profile in the app.">
            <AccountChooser accounts={activeAccounts} value={accountId} onChange={setChosenAccount} loading={accounts.isPending}
              onCreate={access.manageAccounts ? () => setDialog("account") : undefined} />
          </Step>

          <Step number={steps.kind} id="step-kind" title="What are you posting?">
            <fieldset className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <legend className="sr-only">Kind of post</legend>
              <ChoiceCard name="studio-kind" value="VIDEO" checked={type === "VIDEO"} onChange={setType} icon={Clapperboard} title="Video or Short" description="Portrait and up to 90 seconds becomes a Short." />
              <ChoiceCard name="studio-kind" value="IMAGE" checked={type === "IMAGE"} onChange={setType} icon={Images} title="Pictures" description="Up to 10, swiped through." />
              <ChoiceCard name="studio-kind" value="TEXT" checked={type === "TEXT"} onChange={setType} icon={Type} title="Text" description="Words only." />
            </fieldset>
          </Step>

          {type === "VIDEO" && <Step number={steps.media} id="step-media" title={kind === "SHORT" ? "Your Short" : "Your video"}>
            <VideoPicker video={video} onChange={setVideo} />
          </Step>}
          {type === "IMAGE" && <Step number={steps.media} id="step-media" title="Your pictures" description="Drag in a few, then put them in order.">
            <PicturesPicker images={images} onChange={setImages} />
          </Step>}

          <Step number={steps.caption} id="step-caption" title={type === "TEXT" ? "What's on your mind?" : "Caption"} description="Hashtags (#LikeThis) file the post under them in the app.">
            <label htmlFor={ids.caption} className="sr-only">{type === "TEXT" ? "Post text" : "Caption"}</label>
            <Textarea id={ids.caption} value={caption} onChange={(event) => setCaption(event.target.value)} rows={type === "TEXT" ? 8 : 5} aria-describedby={ids.captionHint}
              placeholder={type === "TEXT" ? "Write something worth reading…" : "Say what it's about. #HallWeek"} className="rounded-2xl text-b2 leading-6" />
            <div id={ids.captionHint} className={cn("mt-2 flex flex-wrap items-center justify-between gap-2 text-b4", muted)}>
              <span className="flex flex-wrap gap-1.5">
                {hashtags.length === 0 ? "No hashtags yet."
                  : hashtags.map((tag, index) => <Pill key={tag} tone={index < MAX_HASHTAGS ? "purple" : "danger"}>#{tag}</Pill>)}
              </span>
              <span className="tabular-nums">
                <span className={cn(hashtags.length > MAX_HASHTAGS && "font-semibold text-destructive")}>{hashtags.length}/{MAX_HASHTAGS} hashtags</span>
                {" · "}
                <span className={cn(captionToPost.length > CAPTION_MAX && "font-semibold text-destructive")}>{captionToPost.length.toLocaleString()}/{CAPTION_MAX.toLocaleString()}</span>
              </span>
            </div>
          </Step>

          <Step number={steps.group} id="step-group" title="Group and who sees it" description="A group adds its hashtag, so the post shows with the rest of the group."
            aside={access.manageGroups ? <Button type="button" variant="outline" className="h-9 cursor-pointer rounded-full" onClick={() => setDialog("group")}><Plus className="size-4" aria-hidden="true" />New group</Button> : undefined}>
            <div className="flex flex-col gap-4">
              {/* Radix reports "" when its hidden native select briefly lacks an option still
                  loading (a group named in the address); no option here is empty, so that's ignored. */}
              <Select value={group?.id ?? NO_GROUP} onValueChange={(value) => { if (value) setGroupId(value === NO_GROUP ? null : value) }}>
                <SelectTrigger aria-label="Group" className="h-11 rounded-2xl"><SelectValue /></SelectTrigger>
                <SelectContent className="video-management-ui">
                  <SelectItem value={NO_GROUP}>No group</SelectItem>
                  {groups.data?.items.map((item) => <SelectItem key={item.id} value={item.id}>#{item.hashtag} · {item.name}</SelectItem>)}
                </SelectContent>
              </Select>
              {group && <div className="video-reveal flex items-center gap-4 rounded-2xl border border-grey-200 p-3 dark:border-border">
                <GroupCover group={group} className="aspect-[4/3] w-28 shrink-0 rounded-xl [&_p]:text-b3" />
                <div className="min-w-0 text-b3 leading-5">
                  <p className={cn("font-semibold", ink)}>{group.name}</p>
                  <p className={muted}>{[groupDates(group), groupTiming(group) !== "OPEN" ? TIMING_LABELS[groupTiming(group)] : null].filter(Boolean).join(" · ") || "Open, no dates"}</p>
                  <p className={cn("mt-1", muted)}><strong className="font-semibold text-purple dark:text-royal-300">#{group.hashtag}</strong> is added at the end of the caption.</p>
                  {groupTiming(group) === "ENDED" && <p className="mt-1 text-warning-700 dark:text-warning-300">This group has ended. Posts still join it.</p>}
                </div>
              </div>}
              <fieldset className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <legend className="sr-only">Who sees it</legend>
                <ChoiceCard name="studio-visibility" value="PUBLIC" checked={visibility === "PUBLIC"} onChange={setVisibility} icon={Globe} title="Everyone" description="In feeds, its group and search." />
                <ChoiceCard name="studio-visibility" value="PRIVATE" checked={visibility === "PRIVATE"} onChange={setVisibility} icon={Lock} title="Only the account" description="Kept on the profile, out of feeds." />
              </fieldset>
            </div>
          </Step>
        </fieldset>

        <section aria-label="Post it" className={cn(panel, "sticky bottom-4 z-10 flex flex-col gap-4 p-5 shadow-adbox-large sm:p-6")}>
          {progress ? <PublishBar progress={progress} />
            : problems.length > 0 ? <ul aria-label="Before posting" className="flex flex-col gap-1.5 text-b3">
              {problems.map((problem) => <li key={problem} className={cn("flex items-start gap-2", muted)}><Circle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />{problem}</li>)}
            </ul>
            : <p className="flex items-center gap-2 text-b3 font-semibold text-success-700 dark:text-success-300"><CheckCircle2 className="size-5" aria-hidden="true" />Ready: a {POST_KIND_LABELS[kind].toLowerCase()} from {account ? accountName(account) : "the account"}.</p>}
          {failure && <p role="alert" className="rounded-2xl bg-error-500/10 px-4 py-3 text-b3 text-error-700 dark:text-error-300">{failure}</p>}
          <div className="flex flex-wrap items-center justify-end gap-2">
            <Button type="button" variant="outline" className="h-11 cursor-pointer rounded-full xl:hidden" onClick={() => setDialog("preview")}><Eye className="size-4" aria-hidden="true" />Preview</Button>
            <Button type="submit" disabled={problems.length > 0 || busy} className="h-11 min-w-36 cursor-pointer rounded-full bg-[image:var(--gradient-purple)] px-6 text-white shadow-adbox-medium hover:opacity-90">
              {busy ? <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden="true" /> : <Send className="size-4" aria-hidden="true" />}
              {busy ? "Posting…" : visibility === "PRIVATE" ? "Post privately" : `Post ${POST_KIND_LABELS[kind].toLowerCase()}`}
            </Button>
          </div>
        </section>
      </form>

      <aside aria-label="Preview" className="hidden xl:col-span-5 xl:block 2xl:col-span-4">
        <div className="sticky top-6">{preview}</div>
      </aside>
    </div>

    <AccountDialog open={dialog === "account"} onOpenChange={(open) => setDialog(open ? "account" : null)} onSaved={(saved) => setChosenAccount(saved.id)} />
    <GroupDialog open={dialog === "group"} onOpenChange={(open) => setDialog(open ? "group" : null)} onSaved={(saved) => setGroupId(saved.id)} />
    <Dialog open={dialog === "preview"} onOpenChange={(open) => setDialog(open ? "preview" : null)}>
      <DialogContent className="video-management-ui max-h-[94vh] max-w-sm overflow-y-auto">
        <DialogTitle>Preview</DialogTitle>
        <DialogDescription className="sr-only">The post roughly as it shows in the app.</DialogDescription>
        {preview}
      </DialogContent>
    </Dialog>
  </div>
}

function PublishBar({ progress }: { progress: PublishProgress }) {
  const percent = publishPercent(progress)
  return <div aria-live="polite" className="flex flex-col gap-2">
    <div className="flex flex-wrap items-center justify-between gap-2 text-b3">
      <span className={cn("font-semibold", ink)}>{STAGE_LABELS[progress.stage]}</span>
      {progress.stage === "uploading" && progress.total > 0 && <span className={cn("tabular-nums", muted)}>{formatBytes(progress.sent)} of {formatBytes(progress.total)}</span>}
    </div>
    <div role="progressbar" aria-label="Posting" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent} className="h-2.5 overflow-hidden rounded-full bg-grey-100 dark:bg-muted">
      <div className="h-full rounded-full bg-[image:var(--gradient-purple)] transition-[width] duration-300" style={{ width: `${percent}%` }} />
    </div>
    <p className={cn("text-b4", muted)}>Keep this page open until it's done.</p>
  </div>
}

function PostedPanel({ posted, preview, onAgain }: { posted: Posted; preview: ReactNode; onAgain: () => void }) {
  const name = accountName(posted.account)
  const processing = posted.post.visibility === "PROCESSING"
  // Take the reader to the news: focus moves to the heading, which also brings it into view.
  const heading = useRef<HTMLHeadingElement>(null)
  useEffect(() => heading.current?.focus(), [])
  return <div className="grid grid-cols-1 gap-8 xl:grid-cols-12">
    <section aria-labelledby="posted-title" className="studio-aurora video-reveal flex flex-col justify-center rounded-[32px] px-6 py-10 sm:px-10 xl:col-span-7 2xl:col-span-8">
      <span className="studio-glass flex size-16 items-center justify-center rounded-3xl text-white"><PartyPopper className="size-8" aria-hidden="true" /></span>
      <h2 id="posted-title" ref={heading} tabIndex={-1} className="mt-5 font-heading outline-none text-h4 font-bold text-white sm:text-[2.5rem] sm:leading-[3rem]">Posted as {name}</h2>
      <p role="status" className="mt-3 max-w-xl text-b2 leading-6 text-white/85">
        {processing ? `Your ${POST_KIND_LABELS[posted.kind].toLowerCase()} is processing. It goes live in the app by itself once it's ready, usually within a few minutes.`
          : posted.visibility === "PRIVATE" ? "It's on the account's profile, out of feeds."
          : "It's live in the app now."}
        {posted.group && <> It's in <Link to={groupPath(posted.group.id)} className="font-semibold underline underline-offset-4">#{posted.group.hashtag}</Link>.</>}
      </p>
      <div className="mt-7 flex flex-wrap gap-2">
        <Button type="button" onClick={onAgain} className="h-11 cursor-pointer rounded-full bg-white px-5 font-semibold text-royal-900 hover:bg-white/90"><Send className="size-4" aria-hidden="true" />Post another</Button>
        <Button asChild variant="outline" className="h-11 cursor-pointer rounded-full border-white/30 bg-white/10 px-5 text-white hover:bg-white/20 hover:text-white">
          <Link to={`${APP_ROUTES.videoPosts}?account=${encodeURIComponent(posted.account.id)}`}><Hash className="size-4" aria-hidden="true" />See its posts</Link>
        </Button>
        <Button asChild variant="outline" className="h-11 cursor-pointer rounded-full border-white/30 bg-white/10 px-5 text-white hover:bg-white/20 hover:text-white">
          <Link to={accountPath(posted.account.id)}>Open {name}</Link>
        </Button>
      </div>
    </section>
    <aside aria-label="What was posted" className="xl:col-span-5 2xl:col-span-4">{preview}</aside>
  </div>
}
