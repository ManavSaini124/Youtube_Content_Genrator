# Trending Keywords Feature Plan

Last researched: June 14, 2026

## Implementation Status

Updated: June 15, 2026

- Phase 1 is implemented: popular-chart collection, deterministic extraction,
  scoring, one-hour caching, stale fallback, evidence videos, filters,
  navigation, content-generator handoff, and unit tests.
- Phase 2 is implemented in code: Neon snapshot storage, measured view-delta
  velocity, acceleration and slowdown indicators, 30-day retention, and
  24-hour/7-day mini charts.
- The additive migration in `drizzle/0000_sad_hardball.sql` must be applied to
  the existing Neon database with `npm run db:migrate` before historical
  momentum can persist. Until then, the feature continues using the Phase 1
  fallback without failing the page.
- Phase 3 niche discovery and Phase 4 source upgrades remain pending.

## 1. Decision

Build the first version from the **official YouTube Data API v3** that the
project already uses through `YOUTUBE_API_KEY`.

The feature will:

1. Fetch the most popular public videos for a selected country and category.
2. Extract repeated words and short phrases from video titles and public tags.
3. Rank those phrases using freshness, video velocity, engagement, chart rank,
   and the number of different videos containing the phrase.
4. Show the videos that caused each phrase to rank.
5. Cache results so many users share one API request.

This requires no paid keyword provider and no paid AI model.

### Zero-spend rule

- Do not add a service that requires a credit card, paid subscription, or
  usage-based billing for this feature.
- Stay inside the default YouTube API quota; do not pay for quota or route
  around it with extra API projects.
- When quota is unavailable, serve a cached result or a clear unavailable
  state. Never fall back to a paid API.
- Any existing hosting, database, or workflow free tier must be treated as a
  hard limit rather than an invitation to enable paid overages.

The UI must call the output **trend signals**, **trending topics**, or
**keywords inferred from popular videos**. It must not claim that the score is
YouTube search volume, keyword difficulty, or guaranteed future performance.
The YouTube Data API does not provide those metrics.

## 2. Recommended Free Data Sources

| Source | Cost | What it provides | Decision |
| --- | --- | --- | --- |
| YouTube `videos.list` with `chart=mostPopular` | Free within API quota | Popular videos by country and category, titles, tags, publish dates, and statistics | Primary MVP source |
| YouTube `search.list` | Free, but limited to 100 calls per day by default | Recent videos matching a user-entered niche | Add later as a tightly cached "niche search" mode |
| Google Trends website | Free manual tool | Relative Google and YouTube search interest, related queries, and rising topics | Link to it for manual validation |
| Google Trends API | No dependable public access yet | Programmatic Trends data | Do not depend on it; access is limited alpha as of June 14, 2026 |
| YouTube autocomplete endpoints | Unofficial/undocumented | Query suggestions | Do not use |
| `pytrends` or scraping Google Trends | Unofficial and fragile | Scraped Trends data | Do not use |
| Paid SEO APIs | Paid or trial-limited | Search volume and competition estimates | Excluded |

### Why YouTube is the best MVP source

`videos.list` supports `chart=mostPopular`, `regionCode`, and
`videoCategoryId`. One request can return up to 50 videos and costs one unit
from the standard quota bucket. A project currently receives 10,000 standard
units per day by default.

`search.list` now has a separate default limit of 100 calls per day, with each
call costing one unit in that search bucket. This limit is shared by the whole
Google Cloud project, including the existing thumbnail search and outlier
finder. Therefore, global trending results should use `videos.list`, not
`search.list`.

## 3. MVP User Experience

Create a new `/trending-keywords` page and replace the current
`/coming-soon` link for the Trending Keywords dashboard card.

### Filters

- Country/region
- YouTube category
- Time label: "Current chart"
- Optional keyword search over the returned results

The region picker should remember the user's last choice. Do not silently
present one country as a worldwide trend.

### Results

Each keyword card or table row should show:

- Keyword or phrase
- Trend score from 0 to 100
- Status: `Hot`, `Rising`, or `Steady`
- Number of source videos
- Combined views and average views per day
- Top category
- Top three source videos
- Actions: `Use in content generator`, `Open on YouTube`, and
  `Check in Google Trends`

The page should also show:

- "Updated X minutes ago"
- Selected region and category
- A short explanation of how the score is calculated
- A notice that the results are inferred from public video metadata, not exact
  search-volume data

## 4. Data Collection

### Global/category mode

Request:

```http
GET https://www.googleapis.com/youtube/v3/videos
  ?part=snippet,statistics
  &chart=mostPopular
  &regionCode=IN
  &videoCategoryId=0
  &maxResults=50
  &key=YOUTUBE_API_KEY
```

Useful fields:

- `id`
- `snippet.title`
- `snippet.tags`
- `snippet.categoryId`
- `snippet.channelId`
- `snippet.channelTitle`
- `snippet.publishedAt`
- `snippet.thumbnails`
- `statistics.viewCount`
- `statistics.likeCount`
- `statistics.commentCount`

Load category names with `videoCategories.list` and cache them for at least
24 hours. That endpoint also costs one standard quota unit.

### Optional niche mode

After the MVP is stable, allow a user to enter a seed such as
`personal finance`:

1. Call `search.list` once with `type=video`, a recent `publishedAfter`,
   `order=viewCount`, and no more than 25 results.
2. Call `videos.list` once with the returned IDs to get statistics and tags.
3. Cache the result by normalized seed, region, and time window for at least
   six hours.
4. Rate-limit each signed-in user.

Do not add autocomplete scraping to generate seeds.

## 5. Keyword Extraction

Use deterministic TypeScript code. No LLM is required.

### Normalization

1. Decode entities and lowercase text.
2. Remove URLs, punctuation, emoji-only tokens, and repeated whitespace.
3. Preserve useful terms such as `AI`, model names, product names, numbers,
   and year values.
4. Remove language-specific stop words and generic YouTube phrases such as
   `official`, `video`, `new`, `full`, `shorts`, and `episode`.
5. Generate unigrams, bigrams, and trigrams.
6. Reject phrases that occur in only one video unless their velocity is
   exceptionally high.
7. Count a phrase only once per source video so repeated title/tag usage
   cannot inflate it.

Start with English stop words. Add Hindi and other language packs only when
the selected region needs them; otherwise the ranking will be biased toward
English-language videos.

### Initial scoring

For every source video, calculate:

```text
ageHours       = max(hoursSincePublished, 1)
viewsPerHour   = viewCount / ageHours
engagementRate = (likeCount + commentCount) / max(viewCount, 1)
rankWeight     = 1 - ((chartPosition - 1) / totalVideos)
freshness      = exp(-ageHours / 168)
```

Calculate a contribution for each phrase:

```text
videoContribution =
  0.40 * normalizedLogViewsPerHour +
  0.25 * freshness +
  0.20 * rankWeight +
  0.15 * normalizedEngagementRate

phraseRawScore =
  sum(videoContribution from unique source videos) *
  log(1 + uniqueSourceVideoCount)
```

Normalize all `phraseRawScore` values in the current result set to a 0-100
`trendScore`.

This is a product heuristic, not a metric supplied by YouTube. Keep the
weights in one exported configuration object so they are easy to tune.

### Rising status

Without historical snapshots, use:

- `Hot`: score at or above 75
- `Rising`: score at or above 50 and average source age under 72 hours
- `Steady`: everything else

After snapshots are implemented, replace this approximation with real view
growth between collection times.

## 6. API Design

Create:

```text
GET /api/trending-keywords?region=IN&category=0
```

Suggested response:

```json
{
  "region": "IN",
  "category": "0",
  "generatedAt": "2026-06-14T12:00:00.000Z",
  "source": "youtube-most-popular",
  "method": "inferred-from-public-video-metadata",
  "keywords": [
    {
      "phrase": "example topic",
      "trendScore": 87,
      "status": "Hot",
      "sourceVideoCount": 6,
      "combinedViews": 12500000,
      "averageViewsPerDay": 420000,
      "videos": [
        {
          "id": "youtube-video-id",
          "title": "Source video title",
          "channelTitle": "Channel",
          "thumbnail": "https://...",
          "publishedAt": "2026-06-13T10:00:00.000Z",
          "viewCount": 2400000
        }
      ]
    }
  ]
}
```

Validate `region` against a small allowlist initially and validate `category`
as a numeric string. Never accept a user-provided API key or expose
`YOUTUBE_API_KEY` to the browser.

## 7. Caching and Quota Budget

Use server-side caching keyed by:

```text
trending-keywords:{region}:{category}
```

MVP cache lifetime: one hour.

Example budget for two regions refreshed every hour:

```text
2 regions x 24 refreshes = 48 videos.list calls/day
1 cached category refresh = 1 videoCategories.list call/day
Total = about 49 of 10,000 standard units/day
```

User traffic should read the cached result and must not cause one YouTube API
request per page view.

Add:

- Request timeout
- Graceful stale-cache fallback
- Clear handling for missing key, invalid region, unavailable chart, and quota
  errors
- Structured server logs without the API key

## 8. Historical Momentum

Phase 1 can work without a database. Phase 2 should store short-lived
snapshots in the existing Neon database so the app can measure actual
momentum.

Suggested table:

```text
trending_video_snapshots
- id
- video_id
- region_code
- category_id
- title
- tags_json
- view_count (bigint)
- like_count (bigint)
- comment_count (bigint)
- published_at
- collected_at
```

On each cache refresh, store one snapshot per returned video. Compare the
newest snapshot with the previous snapshot:

```text
viewVelocity = (currentViews - previousViews) / hoursBetweenSnapshots
```

Delete snapshots after 30 days unless a later compliance review establishes a
different retention rule. Do not store thumbnails or audiovisual content;
store thumbnail URLs only when needed for the current UI.

No background scheduler is required initially. A cache miss can refresh data
and write the next snapshot. This keeps the feature deployable without adding
another paid service.

## 9. Repository Changes

Expected files:

```text
app/(routes)/trending-keywords/page.tsx
app/(routes)/trending-keywords/_components/keyword-card.tsx
app/(routes)/trending-keywords/_components/keyword-filters.tsx
app/api/trending-keywords/route.ts
lib/trending-keywords/extract.ts
lib/trending-keywords/score.ts
lib/trending-keywords/types.ts
```

Also update:

- `app/_components/AppSidebar.tsx`
- `app/(routes)/dashboard/_components/FeatureList.tsx`
- `README.md`
- `configs/schema.ts` only when snapshot history is added

Reuse the existing visual system, error states, loading skeletons, and
`YOUTUBE_API_KEY` configuration.

## 10. Delivery Plan

### Phase 1: useful free MVP

- Add the page, sidebar item, and dashboard route.
- Fetch `mostPopular` videos by region and category.
- Extract and score one-to-three-word phrases.
- Add one-hour server caching and stale fallback.
- Show evidence videos for every keyword.
- Add unit tests for extraction, stop words, duplicate handling, and scoring.

### Phase 2: real momentum

- Store short-lived video-stat snapshots in Neon.
- Add view-delta velocity to the score.
- Add `Rising faster` and `Falling` indicators.
- Add a 24-hour and 7-day mini chart.

### Phase 3: niche discovery

- Add the optional seed query using `search.list`.
- Add per-user rate limits and six-hour seed caching.
- Add a direct handoff to the content generator with the selected phrase.

### Phase 4: future source upgrades

- Apply for Google Trends API alpha access.
- If access is approved and its terms fit the product, use Trends as a second
  signal rather than replacing YouTube evidence.
- Revisit language-aware tokenization for the most-used regions.

## 11. Acceptance Criteria

- The feature works without a paid API or paid AI call.
- A cached global/category request normally consumes one standard YouTube API
  unit.
- Every displayed phrase has at least two evidence videos, except a clearly
  marked breakout phrase.
- Changing region or category changes the evidence set.
- The UI never labels the internal score as search volume or keyword
  difficulty.
- API failures return a useful error and stale data when available.
- The API key remains server-only.
- Extraction and scoring tests pass.
- Results remain usable on mobile.

## 12. Risks and Guardrails

### Not true search-volume data

Popular-video metadata measures content momentum, not the number of people
typing a phrase into YouTube search. Describe the feature accurately.

### Regional and language bias

One global stop-word list will produce poor results. Region, category, and
language must be visible inputs.

### News and entertainment dominance

The all-category chart may be dominated by music, sports, or breaking news.
Category filters are required, not optional polish.

### Quota sharing

The same API project powers existing YouTube features. Track the standard and
search quota buckets separately and cache all repeatable queries.

### API policy compliance

Use only documented YouTube API endpoints. YouTube's developer policies
prohibit undocumented APIs and place restrictions on aggregation, storage,
presentation, privacy disclosures, and quota circumvention. Before a public
launch, review the final implementation against the current policies and make
the privacy policy disclose the use of YouTube API Services. Keep source video
links visible and avoid presenting derived scores as official YouTube data.

## 13. Official References

- YouTube `videos.list` (`mostPopular`, region/category filters, one-unit
  cost): https://developers.google.com/youtube/v3/docs/videos/list
- YouTube quota calculator and current default quota buckets:
  https://developers.google.com/youtube/v3/determine_quota_cost
- YouTube `search.list` and its 100-calls-per-day default:
  https://developers.google.com/youtube/v3/docs/search/list
- YouTube video categories:
  https://developers.google.com/youtube/v3/docs/videoCategories/list
- YouTube developer policies:
  https://developers.google.com/youtube/terms/developer-policies
- Google Trends guidance and keyword research:
  https://developers.google.com/search/docs/monitor-debug/trends-start
- Google Trends API alpha status:
  https://developers.google.com/search/apis/trends
- Google Trends data limitations:
  https://support.google.com/trends/answer/4365533
