import type { Candidate, CandidateStats, ViewerAffinity } from "../lib/ranking"
import type { CandidateSource, MediaType } from "../types"

// Invented posts for the ranked feed's playground: one viewer's candidates, chosen so that every
// rule has something to do (a repeated author, a run of videos, a quote beside its original, new
// posts still finding an audience, a post people hide, an old viral post). Not real data.

export type SamplePost = {
  id: string
  title: string
  author: string
  authorId: string
  mediaType: MediaType
  ageHours: number
  quotes?: string
  sources: CandidateSource[]
  stats: Partial<CandidateStats>
  affinity: Partial<ViewerAffinity>
}

export const SAMPLE_VIEWER = "A student who follows three of these accounts, shares a campus with four and has interests in common with three."

export const SAMPLE_POSTS: SamplePost[] = [
  { id: "food-fair", title: "Food fair photos", author: "Campus kitchen", authorId: "kitchen", mediaType: "IMAGE", ageHours: 3, sources: ["recent", "campus", "interest"],
    stats: { impressions: 140, likes: 26, comments: 5, shares: 2, bookmarks: 3 }, affinity: { sameCampus: true, sharedInterests: 1 } },
  { id: "timetable", title: "Exam timetable thread", author: "Students' council", authorId: "council", mediaType: "TEXT", ageHours: 20, sources: ["recent", "following", "trending"],
    stats: { impressions: 1800, likes: 120, comments: 64, shares: 41, bookmarks: 95, hides: 2 }, affinity: { followsAuthor: true, sameInstitution: true } },
  { id: "dance-1", title: "Dance challenge", author: "Dance society", authorId: "dance", mediaType: "VIDEO", ageHours: 30, sources: ["recent", "trending"],
    stats: { impressions: 3200, viewers: 2600, completions: 1100, likes: 410, comments: 38, shares: 66, bookmarks: 20, hides: 12 }, affinity: {} },
  { id: "dance-2", title: "Dance challenge, part 2", author: "Dance society", authorId: "dance", mediaType: "VIDEO", ageHours: 9, sources: ["recent"],
    stats: { impressions: 600, viewers: 520, completions: 210, likes: 70, comments: 9, shares: 8, bookmarks: 4 }, affinity: {} },
  { id: "first-video", title: "A new creator's first video", author: "New creator", authorId: "newcomer", mediaType: "VIDEO", ageHours: 5, sources: ["recent"],
    stats: { impressions: 45, viewers: 30, completions: 18, likes: 9, comments: 2, shares: 1 }, affinity: {} },
  { id: "library-quote", title: "Quote: “Library open all night”", author: "Library", authorId: "library", mediaType: "TEXT", ageHours: 2, quotes: "timetable", sources: ["recent", "following"],
    stats: { impressions: 90, likes: 15, comments: 3, shares: 1, bookmarks: 6 }, affinity: { followsAuthor: true, sameInstitution: true } },
  { id: "hackathon", title: "Hackathon sign-ups", author: "Tech club", authorId: "tech", mediaType: "IMAGE", ageHours: 14, sources: ["recent", "interest"],
    stats: { impressions: 700, likes: 58, comments: 12, shares: 19, bookmarks: 30 }, affinity: { sharedInterests: 3 } },
  { id: "meme", title: "Last week's viral meme", author: "Meme page", authorId: "memes", mediaType: "IMAGE", ageHours: 144, sources: ["recent"],
    stats: { impressions: 12000, likes: 2600, comments: 300, shares: 900, bookmarks: 150, hides: 40 }, affinity: {} },
  { id: "rant", title: "A rant people keep hiding", author: "Night owl", authorId: "owl", mediaType: "TEXT", ageHours: 4, sources: ["recent", "campus"],
    stats: { impressions: 400, likes: 10, comments: 30, hides: 60 }, affinity: { sameCampus: true } },
  { id: "weekend", title: "A friend's weekend update", author: "A friend", authorId: "friend", mediaType: "TEXT", ageHours: 10, sources: ["recent", "following", "campus"],
    stats: { impressions: 60, likes: 8, comments: 3 }, affinity: { followsAuthor: true, sameCampus: true } },
  { id: "radio", title: "Campus radio clip", author: "Campus radio", authorId: "radio", mediaType: "VIDEO", ageHours: 26, sources: ["recent", "campus"],
    stats: { impressions: 900, viewers: 700, completions: 260, likes: 80, comments: 6, shares: 12 }, affinity: { sameCampus: true } },
  { id: "sports", title: "Weekend sports highlights", author: "Sports desk", authorId: "sports", mediaType: "VIDEO", ageHours: 40, sources: ["recent", "interest", "trending"],
    stats: { impressions: 1500, viewers: 1300, completions: 500, likes: 160, comments: 14, shares: 30, bookmarks: 10 }, affinity: { sharedInterests: 2 } },
]

const noStats: CandidateStats = { impressions: 0, likes: 0, comments: 0, shares: 0, bookmarks: 0, completions: 0, viewers: 0, hides: 0 }
const noTies: ViewerAffinity = { followsAuthor: false, sameCampus: false, sameInstitution: false, sharedInterests: 0 }

/** The samples as the ranker's candidates, aged from `now`. */
export function sampleCandidates(now: Date): Candidate[] {
  return SAMPLE_POSTS.map((post) => ({
    id: post.id,
    authorId: post.authorId,
    mediaType: post.mediaType,
    createdAt: new Date(now.getTime() - post.ageHours * 60 * 60 * 1000),
    quotedResourceId: post.quotes ?? null,
    sources: post.sources,
    stats: { ...noStats, ...post.stats },
    affinity: { ...noTies, ...post.affinity },
  }))
}

export const sampleById = new Map(SAMPLE_POSTS.map((post) => [post.id, post]))
