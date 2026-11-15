# The Algorithms section, in plain words

This guide explains the **Algorithms** section of the AdBox admin dashboard (sidebar → *Algorithms*,
address `/algorithms`) without technical language. Read the first part for the big picture, then use
the tour and glossary whenever a page confuses you.

The numbers below are the **built-in defaults**. The pages always show the numbers actually in use,
which can differ if someone has changed a setting.

---

## The one-minute version

- The AdBox app shows people **lists**: the Home feed, Shorts, sponsored posts (ads), Glances, and the
  Discover tab. For every list, the **backend decides which posts go in it and in what order.**
- It decides using **rules plus a few hundred numbers**. Think of the numbers as dials on a mixing
  desk: each one turns something up or down. The Algorithms section shows **every dial (243 of them)**,
  where it is set, who can turn it, and what turning it does.
- **The section mostly reads.** The sliders and calculators are practice tools and never save anything.
  Two controls make real changes, each after you confirm: the **ranked share** on the Ranked feed page
  (section 4) and **Trending overrides** (section 3).
- The most important fact: **Home does not use the "smart" ranking yet.** Today Home is a fair raffle
  where newer posts get more tickets. The smart, personal ranking (the *ranked feed*) is built and
  ready, but the app has not been switched over to it. Some of its dials already affect Discover.

---

## Three words you will see everywhere

| Word | What it means |
| --- | --- |
| **Parameter** | One of the dials: a single number, such as "a post's chance halves every 24 hours". |
| **Live** | The value the app is using right now, read from the server a moment ago. |
| **Default** | The factory setting written into the code. It is what applies when nobody has changed anything, and what the page shows when it cannot read the live value. |

---

## Where Home's posts come from today

The backend has **two separate endpoints** (addresses the app can ask for posts) that could fill Home.
It is not one endpoint with two modes: **the app decides which one to call**, and today it only ever
calls the shuffle.

```
App's Home screen ──calls──▶ GET /feed/shuffle   ← used today, every time
                             GET /feed           ← built and ready, never called
                                  ├─ ranked        (people in the "ranked share")
                                  └─ newest first  (everyone else, or if ranking fails)
```

- **`GET /feed/shuffle`** is the raffle (section 1). Shorts and the videos under a video use it too,
  each with its own list.
- **`GET /feed`** is the ranked feed (section 4). The "two ways" are inside it: **ranked** for people in
  the *ranked share* (a percentage set in super-admin), and **newest first** for everyone else. Newest
  first is also the fallback if building the ranked list fails or takes longer than 1.5 seconds, so
  nobody ever sees an error.
- A third, older endpoint, `GET /resources`, is plain newest first. The app uses it only for the posts
  on someone's profile, never for Home.

**Switching Home to the ranked feed** is a change in the mobile app, not the backend: Home would call
`GET /feed` instead of `GET /feed/shuffle` (in the app's `lib/data/repositories/remote_feed_repository.dart`).
After that, the ranked share decides who gets ranked and who gets newest first; setting it to 50% would
let you compare the two. Until then, changing the ranked feed's settings won't change Home: they only
affect Discover's Explore and the *Top* tab on topic pages.

---

## How a list gets made

Every list goes through the same four steps. These are the four columns on the **Overview** page.

```
  The phone asks             The backend works it out                  The phone shows
  ──────────────             ────────────────────────                  ───────────────
  "Give me Home"   ───▶   1. Who is in?       Which posts may appear at all
                          2. How is each one   How likely or how good each one is
                             scored?
                          3. In what order?    The final order, with tidy-up rules     ───▶   the list
                          4. What to remember? So you don't see repeats next time
```

---

## 1. Home, Shorts and videos: a raffle

**What the app uses today** for Home, for Shorts, and for the videos under a video you opened.

Imagine every post gets **raffle tickets**, and each page is drawn from the hat:

- A post published **just now** gets **100 tickets**.
- Its tickets **halve every 24 hours**: 50 tickets at one day old, 25 at two days, and so on.
- No post ever drops below **3 tickets**, so old posts still come up now and then. A post reaches
  that floor at about **5 days** old.
- Posts by **Spotlight** members (a paid boost) get **double tickets**, except anonymous posts, because
  extra tickets would give away who wrote them.

**Example.** Three posts: A (just posted, 100 tickets), B (a day old, 50 tickets) and C (a week old,
3 tickets). For the first spot, A wins about **65%** of the time, B about **33%** and C about **2%**.
So new posts usually lead, but the order is **different every visit**.

**No repeats.** The app opens a *session* when you start using it. Within a session, nothing you have
been shown on a list is shown again; the server remembers for 24 hours. If you leave the app for
**more than 30 minutes**, your next visit starts a fresh session, and older posts can come round again.

**New posts.** About once a minute the app asks "anything new since my last refresh?". If there is,
a **dot** appears on Home. Refreshing puts those new posts **first, newest first**, ahead of the raffle.

**Page sizes.** Home loads 20 posts at a time, Shorts 10, and the videos under a video 6. A *Short* is a
portrait video of 90 seconds or less.

**Who can appear:** public posts (and your own, on your own Home); not ads; nothing you hid; nobody you
blocked or who blocked you; nobody whose account is switched off or suspended. Anonymous posts that
are under review after reports are seen only by their author until a moderator decides.

> **Who can change these numbers?** Only developers, with a new release of the backend. None of the
> super-admin settings affect Home today.

**Glances** (the row of circles at the top of Home) are not scored. Your own come first, then people
with something you haven't seen (people you follow first), then people you've seen in full. Each
Glance disappears after 24 hours.

---

## 2. Sponsored posts (ads in Home)

These are ads that people paid for with **gold bars**. They come from a separate request and are mixed
into Home by the app.

**Who is shown an ad?** All of these must be true:

1. The ad is running (inside its start and end dates) and the advertiser's account is active.
2. It is aimed at you: everyone, or only students, or only alumni. If the ad names schools or
   campuses, you must be at one of them.
3. It is not your own ad, nor one from an account you help run, and you haven't tapped *Not interested*.
4. You have seen it **fewer than 3 times today** (the *frequency cap*).
5. It still has budget, and it is behind its pace for the time of day (see below).

**Spreading the budget through the day (pacing).** An ad's daily budget buys a number of views. The
price is **1,250 bars per 1,000 views**, so 1,500 bars a day buys **1,200 views a day**. The server
spreads them evenly through the day, plus a small **10% head start** so a quiet morning doesn't leave
the ad behind. By 6:00 in the morning (a quarter of the day) the ad may have had 300 + 120 =
**420 views**. If it is ahead of that, it waits.

**Which ad first?** A bit of luck, weighted towards ads that are furthest behind their pace, so no
ad is starved.

**Where ads appear.** Each time Home loads, the app asks for **3 ads** and puts them at the **4th,
13th and 22nd** places, only where there are posts around them.

**When does a view count (and cost the advertiser)?** When the ad has been half on screen for about a
second, the server actually served it to that person today, the person is a real active user (not the
advertiser), and the daily cap and the budget aren't used up.

> **Who can change these numbers?** The frequency cap, the price and the budget limits are **Gold
> settings**, changed in *Financials › Gold & pricing*. The rest are written in code.

---

## 3. Discover

### Trending: "what's heating up"

Every **5 minutes** a background job looks at the activity of the **last 24 hours** for hashtags,
institutions, campuses, people, halls and events. That means posts, likes, comments, shares, follows,
searches and so on. It compares that with **an ordinary day over the past week**.

A subject trends when it does well on three things, multiplied together:

| Ingredient | In plain words |
| --- | --- |
| **Momentum** | Is it growing faster than it normally does? The last few hours count most. |
| **Breadth** | Are *many different people* involved, not one very busy person? |
| **Quality** | Are people hiding or reporting it? If so, it is pushed down. |

Each kind of subject also has a **multiplier** to keep things balanced (for example, events get a small
boost).

To appear at all, a subject needs **enough different people**. A hashtag needs 3 people for a campus's
list but 10 for the nationwide list. It also needs **enough recent activity**. The final list (up to 50)
is tidied so the top 10 isn't all one kind and similar topics aren't side by side.

An **↑ arrow** means at least 10% above an ordinary day; **↓** means at least 10% below.

Admins can also **pin**, **boost**, **dampen**, **hide** or **feature** a subject. Featured ones are
marked *Featured* in the app. That's done on **Algorithms › Trending overrides** (section 6).

> **About the calculator on the Discover page:** it can say "150% above an ordinary day" and still show
> a *momentum* below 1. That's expected. The recent hours are "faded" (older hours count less) while
> the ordinary day is not. Scores are only used to compare subjects with each other, so it doesn't matter.

### Explore: "a little out of your usual"

A grid of good posts you probably wouldn't meet otherwise. Posts come from three pools of the
**last 14 days**:

- the **200 best** by quality;
- a **few (3) posts about each trending subject**;
- up to **50 brand-new posts** still waiting for their first audience.

Each post is scored on **quality × freshness × novelty**. *Novelty* is lower for authors and topics you
already engage with a lot. Posts about something trending score **1.5 times** as much, and a small
random wiggle (±15%) makes every visit a fresh mix. In the grid, an author appears **at most once in any
8 tiles**. A **survey** sits on the **3rd tile**, then after every 6 posts.

*Surprise me* picks one good post (better than average) and won't repeat your last 50 picks in a day.

> **Important:** Explore's *quality* and *freshness* use the **ranked feed's** settings (section 4). So
> changing those settings changes Explore today, even though Home doesn't use the ranked feed yet.

### People to follow

Suggestions come from five reasons: *featured*, *friends of friends*, *same campus*, *rising creators*
and *shared interests*. Each person gets a score made of:

- **35%** how close they are to you (same campus counts most, then same institution, then same region)
- **25%** mutual follows (people you follow who follow them; 10 mutual follows counts as full)
- **20%** shared interests
- **20%** how well their recent posts do

You won't see more than **3 suggestions in a row for the same reason**. Suggestions are refreshed every
15 minutes.

### Search

Best match first: an exact name beats a name that *starts with* your words, which beats *every word
found*, which beats a *typo match*. Results get a boost for being **popular** and for being **near
you**: same campus ×1.5, same institution ×1.3, same region ×1.1. Posts also fade with age, halving
every 14 days. Search is written in code.

### Topic pages

A hashtag's, place's or person's page has two tabs. **Top** ranks the best posts of the last 14 days
using the **ranked feed's** quality × freshness. **New** is simply newest first.

---

## 4. The ranked feed: the "smart" Home that isn't switched on yet

This is the personal ranking built for Home. The app doesn't use it yet. When it does, each person's
Home is ordered by how much **they** are likely to value each post. It asks four questions about every
post and **multiplies** the answers:

| Question | Name on the page | How it is worked out (defaults) |
| --- | --- | --- |
| Is it good? | **Quality** | Engagement per view. A share counts like 5 likes, a comment 3, a save 3, a finished video watch 2; each hide *takes away* 10. New posts start from an average guess, so two lucky likes can't make a post look amazing. |
| Is it for you? | **Relevance** | Starts at 1. +1.5 if you follow the author, +0.6 if same campus (or +0.3 if same institution only), +0.2 per shared interest (up to 3). |
| Is it new? | **Freshness** | Halves every 24 hours for text and pictures, every 48 hours for videos. |
| Is it new and still waiting for an audience? | **Exploration** | ×1.3 while a post has fewer than 200 views, so new posts and new creators get a fair first chance. |

Because the parts are **multiplied**, a post needs some of each: if one part is close to zero (for
example a post that everybody hides), the whole score is close to zero.

**Example.** For one student:

| | A friend's picture | A stranger's viral video |
| --- | --- | --- |
| Age | 12 hours | 3 days |
| Activity | 100 views, 10 likes, 2 comments, 1 share | 5,000 views, 600 likes, 100 comments, 80 shares, 50 saves, 1,500 finished watches, 20 hides |
| Quality | 0.17 | 0.84 |
| Relevance | 2.5 (you follow them) | 1 |
| Freshness | 0.71 | 0.35 |
| Exploration | ×1.3 (under 200 views) | ×1 |
| **Score** | **0.40** | **0.30** |

The friend's post comes first. The video is "better" in general, but the friend's post is **for you**,
**newer**, and **still finding its audience**.

**Where the posts come from.** Up to 200 of the newest posts, 150 from accounts you follow (last 14
days), 100 from your campus (14 days), 100 from people with your interests (14 days) and 100 of the
most liked (7 days). Your own posts, blocked people, posts you hid, and posts you saw in the last 7 days
are left out.

**Tidying the order.** Like a DJ who won't play the same artist twice in a row, the list is then tidied:

- at most **1 post by the same person in any 5 posts** in a row;
- at most **3 videos in a row**;
- a quote is never **right next to** the post it quotes;
- at least **one new post in every 10**.

If the rules can't all be met, they are relaxed one at a time rather than leaving gaps.

**Safety.** One list holds up to 200 posts and stays the same for 30 minutes while you scroll. If
building it takes longer than 1.5 seconds, or anything goes wrong, the person simply gets newest-first
instead. Nobody sees an error.

**Ranked share.** A percentage of people get the ranked feed and the rest get newest first. Each person
always stays in the same group, which makes fair comparisons possible. 0% switches it off for everyone.
Admins allowed to manage the feed ranking can change it on the **Ranked feed** page (*Change the ranked
share*): pick a share, add a note if you like, and confirm. That saves a new version that changes only the
share. Remember it changes nothing people see until the app calls the ranked feed.

**Versions.** Every change is saved as a new numbered **version** (version 1, 2, 3…). Only one is
**live**. Switching back to an older version is a **rollback**. If no version is live, the built-in
defaults are used.

> **It already matters today:** the quality weights, hide penalty, starting guess, half-lives, the
> new-post limit and the explore window also score **Explore** and the **Top** tab of topic pages.

---

## 5. Who can change what, and how fast

| Group of settings | Where it's changed | How fast the app feels it |
| --- | --- | --- |
| **Feed ranking policy** (the ranked feed) | Super-admin, saved as a numbered version. The ranked share has a control on *Algorithms › Ranked feed*; the other settings are changed through the super-admin API for now. | Within 30 seconds |
| **Discover policy** (trending, Explore, people) | Super-admin, saved as a numbered version (also no editing screen yet) | Within 30 seconds; trending lists at the next 5-minute run |
| **Trending overrides** (what trends where) | *Algorithms › Trending overrides* | Within about 30 seconds; each ends within 30 days |
| **Gold settings** (ads) | *Financials › Gold & pricing* | About 15 seconds; ads already running keep their terms |
| **Server setting** | A developer changes the server's configuration | After the server restarts |
| **Backend code** | A developer | After a backend release |
| **Mobile app** | A developer | After an app release, and people updating |

---

## 6. A tour of the pages

**Overview**
- *Top cards:* which version of each settings group is live, or "built-in defaults" if none.
- *"From the request to the screen":* one row per list in the app, one column per step
  (who is in → scored → ordered → remembered). The little pills are dials: **click any of them** to open
  a panel explaining it. On a phone, tap *Show the four stages* to expand a row.
- *"Who can change what":* the six groups above. Click one to see all its dials.

**Home & videos**: the raffle. A chart shows how a post's chance drops with age, with an ordinary
author and a Spotlight author side by side. It also covers the three lists, a session step by step,
who can appear, and how Glances are ordered.

**Sponsored posts**: who is shown an ad, how the ad order is chosen, a phone picture showing where
ads land (4th, 13th, 22nd), and a pacing chart. Use the budget buttons to see how fast an ad with that
budget may be shown through the day.

**Top trends** (under *In the app*): the 10 subjects at the top of Trending in the app right now, in the
app's order and drawn the way the app draws them: the two-digit rank, a **flame** beside each (the app
itself burns one beside the top 3 only), the title, its category and *Featured* if an admin placed it, and
the count the app prints ("2.4k posts today"). Choose **Nationwide** or an institution, the two kinds of
list the app reads. Choose a trend to see **everything about it**: how it looks in the app (and on its
poster), how many people are taking part and how many posts there are in the last 24 hours, how that
compares with an ordinary day, **why it ranks where it does** (the place it earned when the list was
computed, its score broken into momentum, breadth, quality and the kind's weight, and the two rules it had
to pass), any admin override with its reason and end date, the subject itself (a person's username and
verification, an event's dates, place and people going, an institution's region) and links to their
profile, institution or top post. **All side by side** compares the 10 in one table. The page re-reads
every minute and changes nothing; *Refresh* reads it now. If a list hasn't been computed yet, the app
shows a fallback (this week's most-posted hashtags here, plus anything pinned or featured), and the page
says so.

**Trending overrides** (under *Manage*): choose a list (Nationwide, a region, an institution or a campus)
and see it as last computed, with the subjects that **just missed** and why. Every override in force or
scheduled is listed with its reason and end date. With permission you can **Add an override**: pick a
hashtag, institution, campus, person, hall or event (from the list or by searching); choose **Pin** (a
chosen place, marked Featured), **Feature** (added at a place, 4th by default), **Boost** (score up to ×3),
**Dampen** (score down to ×0.25) or **Suppress** (removed from this list); give a reason and a length of
up to 30 days. A list takes at most 3 pins and 2 features at a time, one override per subject. **End now**
stops an override early. Changes show in the app within about 30 seconds.

**Discover**: the trending recipe with a **calculator**. Type in made-up activity and see the score and
whether the subject would trend. Then tables of what each signal is worth, how many people each list
needs, Explore's grid layout, people-to-follow weights, search and topic pages.

**Ranked feed**: the live version and its history (what each version changed), the nine steps of
building a list, the score, and **"Try a change"**: twelve made-up posts for one made-up student.
Move a slider and watch the order change. Arrows show which posts moved, and notes explain why (for
example "held back by author spacing"). *Back to live* resets everything. Nothing is saved.
If you're allowed to manage the feed ranking, *The policy in force* also has **Change the ranked share**,
the one control in this section that saves something (after asking you to confirm).

**All parameters**: every dial in one list (243). Search by name or effect, filter by area, by who
controls it, or by whether the app feels it, and **Download CSV** for a spreadsheet.

---

## 7. What the badges and symbols mean

| You see | It means |
| --- | --- |
| Green **Live** | This value was just read from the server. It is what the app uses. |
| Grey **Defaults shown** with a lock | You don't have permission to read the live value, so the factory default is shown. |
| Amber **Couldn't load** | The server didn't answer, so the factory default is shown. Use *Retry*. |
| Green **In the app** | People feel this dial today. |
| Purple **In the app through Discover** | A ranked-feed dial that today only changes Discover (Explore, topic pages). |
| Grey **Not in the app yet** | Only matters once the app switches Home to the ranked feed. |
| A small **purple dot** next to a value | Someone changed it from the factory default. |
| Icons on a pill | Who controls the dial: sliders = feed ranking policy, compass = Discover policy, coins = Gold settings, server = server setting, `</>` = backend code, phone = mobile app. |
| An underlined number in a sentence | Click it to open that dial's explanation. |

---

## 8. Common questions

**Can I break anything on these pages?**
Almost nothing is saved. The sliders and the calculator are practice tools. The two real changes are the
**ranked share** and **Trending overrides**. Both ask you to confirm, an older ranking version can always
be made live again, and any override can be ended at once.

**I changed a ranking setting and Home looks the same. Why?**
Home still uses the raffle, which only looks at a post's age (and Spotlight). Ranking settings affect
Explore and topic *Top* tabs today, and will affect Home once the app is switched to the ranked feed.
That switch is a job for the mobile developers.

**Why do I see "Defaults shown"?**
Reading the live settings needs the permissions `feed.ranking.read`, `discover.read` and
`gold.settings.read`. Ask a Super Admin to grant them.

**How do I actually change a setting?**
Ad numbers: *Financials › Gold & pricing*. The ranked share: *Algorithms › Ranked feed*. What trends
where: *Algorithms › Trending overrides*. Other ranking and Discover settings: through the super-admin API
for now. Everything else: ask a developer.

**How do I see what's trending in the app right now, and why?**
*Algorithms › Top trends*. It shows exactly what the app shows (overrides included) and, for each trend,
its numbers, its score and any override. To change what trends, use *Trending overrides*.

**Why isn't the most popular post at the top?**
Popularity is only one of four parts. Newness and "is it for you" count too, and the tidy-up rules
spread authors and videos out.

**What's the difference between the raffle and the ranked feed?**
The raffle treats everyone the same and only cares how new a post is. The ranked feed is personal: it
uses who you follow, your campus, your interests and how well each post is doing.

---

## 9. Glossary

| Term | Meaning |
| --- | --- |
| **Algorithm** | The recipe the backend follows to choose and order posts. |
| **Endpoint** | An address on the server that the app asks for data, such as `GET /feed/shuffle`. |
| **Feed** | A scrolling list of posts, like Home. |
| **Parameter (dial)** | One number in the recipe. |
| **Policy** | A saved group of settings (feed ranking or Discover). |
| **Version** | One saved state of a policy. Numbered, never edited; a new change makes a new version. |
| **Rollback** | Making an older version live again. |
| **Default** | The factory value written in the code. |
| **Half-life** | How long until something counts half as much. A 24-hour half-life means half after a day, a quarter after two days. |
| **Impression / view** | One time a post or ad appeared on someone's screen (at least half visible for a moment). |
| **Engagement** | Likes, comments, shares, saves and finished video watches. |
| **Session** | One visit to the app. It ends after more than 30 minutes away. |
| **Spotlight** | A paid boost for a member's posts. |
| **Frequency cap** | The most times one person sees the same ad in a day. |
| **Pacing** | Spreading an ad's views evenly across the day. |
| **Price per 1,000 views (CPM)** | What advertisers pay, in gold bars, for every 1,000 counted views. |
| **Scope** | Which list you're looking at in Discover: nationwide, a region, an institution or a campus. |
| **Momentum / breadth** | For trending: growing faster than normal / involving many different people. |
| **Novelty** | For Explore: how new an author or topic is *to you*. |
| **Rerank (tidy-up rules)** | The rules applied after scoring to keep the list varied. |
| **Ranked share** | The percentage of people who get the ranked feed instead of newest first. |
