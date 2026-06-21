import { buildPhraseVideoIndex } from "./extract"
import type {
  TrendStatus,
  TrendingKeyword,
  YouTubeTrendingVideo,
} from "./types"

export const TREND_SCORE_WEIGHTS = {
  viewsPerHour: 0.4,
  freshness: 0.25,
  chartRank: 0.2,
  engagement: 0.15,
} as const

type VideoMetrics = {
  ageHours: number
  viewsPerHour: number
  hasMeasuredVelocity: boolean
  engagementRate: number
  rankWeight: number
  freshness: number
  contribution: number
}

function normalize(value: number, minimum: number, maximum: number) {
  if (maximum <= minimum) return maximum > 0 ? 1 : 0
  return (value - minimum) / (maximum - minimum)
}

function percentile(values: number[], percentileValue: number) {
  if (values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const index = Math.min(
    sorted.length - 1,
    Math.max(0, Math.ceil(percentileValue * sorted.length) - 1),
  )
  return sorted[index]
}

export function classifyTrendStatus(
  score: number,
  averageAgeHours: number,
  velocityChangePercent: number | null,
): TrendStatus {
  if (score >= 75) return "Hot"
  if (velocityChangePercent !== null && velocityChangePercent >= 25) {
    return "Rising faster"
  }
  if (velocityChangePercent !== null && velocityChangePercent <= -25) {
    return "Falling"
  }
  if (score >= 50 && averageAgeHours < 72) return "Rising"
  return "Steady"
}

export function scoreTrendingKeywords(
  videos: YouTubeTrendingVideo[],
  categoryNames: Record<string, string>,
  now = new Date(),
) {
  if (videos.length === 0) return []

  const nowTime = now.getTime()
  const baseMetrics = videos.map((video) => {
    const publishedTime = new Date(video.publishedAt).getTime()
    const ageHours = Number.isNaN(publishedTime)
      ? 168
      : Math.max((nowTime - publishedTime) / 3_600_000, 1)
    const hasMeasuredVelocity = Boolean(video.momentum)
    const viewsPerHour =
      video.momentum?.viewVelocity ?? video.viewCount / ageHours
    const engagementRate =
      (video.likeCount + video.commentCount) / Math.max(video.viewCount, 1)
    const rankWeight =
      1 - ((video.chartPosition - 1) / Math.max(videos.length, 1))
    const freshness = Math.exp(-ageHours / 168)

    return {
      video,
      ageHours,
      viewsPerHour,
      hasMeasuredVelocity,
      logViewsPerHour: Math.log1p(viewsPerHour),
      engagementRate,
      rankWeight,
      freshness,
    }
  })

  const logVelocityValues = baseMetrics.map((item) => item.logViewsPerHour)
  const engagementValues = baseMetrics.map((item) => item.engagementRate)
  const minLogVelocity = Math.min(...logVelocityValues)
  const maxLogVelocity = Math.max(...logVelocityValues)
  const minEngagement = Math.min(...engagementValues)
  const maxEngagement = Math.max(...engagementValues)

  const metricsByVideo = new Map<string, VideoMetrics>(
    baseMetrics.map((item) => {
      const contribution =
        TREND_SCORE_WEIGHTS.viewsPerHour *
          normalize(item.logViewsPerHour, minLogVelocity, maxLogVelocity) +
        TREND_SCORE_WEIGHTS.freshness * item.freshness +
        TREND_SCORE_WEIGHTS.chartRank * item.rankWeight +
        TREND_SCORE_WEIGHTS.engagement *
          normalize(item.engagementRate, minEngagement, maxEngagement)

      return [item.video.id, {
        ageHours: item.ageHours,
        viewsPerHour: item.viewsPerHour,
        hasMeasuredVelocity: item.hasMeasuredVelocity,
        engagementRate: item.engagementRate,
        rankWeight: item.rankWeight,
        freshness: item.freshness,
        contribution,
      }]
    }),
  )

  const videosById = new Map(videos.map((video) => [video.id, video]))
  const phraseIndex = buildPhraseVideoIndex(videos)
  const velocityValues = [...metricsByVideo.values()].map(
    (metrics) => metrics.viewsPerHour,
  )
  const breakoutVelocity = Math.max(
    percentile(velocityValues, 0.9),
    percentile(velocityValues, 0.5) * 2,
    1_000,
  )

  const candidates = [...phraseIndex.entries()].flatMap(([phrase, videoIds]) => {
    const sourceVideos = [...videoIds]
      .map((id) => videosById.get(id))
      .filter((video): video is YouTubeTrendingVideo => Boolean(video))
    const breakout =
      sourceVideos.length === 1 &&
      (metricsByVideo.get(sourceVideos[0].id)?.viewsPerHour ?? 0) >=
        breakoutVelocity

    if (sourceVideos.length < 2 && !breakout) return []

    const contributionSum = sourceVideos.reduce(
      (total, video) =>
        total + (metricsByVideo.get(video.id)?.contribution ?? 0),
      0,
    )
    const rawScore = contributionSum * Math.log1p(sourceVideos.length)

    return [{ phrase, sourceVideos, rawScore, breakout }]
  })

  if (candidates.length === 0) return []

  const rawScores = candidates.map((candidate) => candidate.rawScore)
  const minimumScore = Math.min(...rawScores)
  const maximumScore = Math.max(...rawScores)

  return candidates
    .map((candidate): TrendingKeyword => {
      const rankedVideos = [...candidate.sourceVideos].sort(
        (a, b) =>
          (metricsByVideo.get(b.id)?.contribution ?? 0) -
          (metricsByVideo.get(a.id)?.contribution ?? 0),
      )
      const trendScore = Math.round(
        normalize(candidate.rawScore, minimumScore, maximumScore) * 100,
      )
      const averageAgeHours =
        rankedVideos.reduce(
          (total, video) =>
            total + (metricsByVideo.get(video.id)?.ageHours ?? 168),
          0,
        ) / rankedVideos.length
      const measuredVideos = rankedVideos.filter(
        (video) => metricsByVideo.get(video.id)?.hasMeasuredVelocity,
      )
      const measuredViewsPerHour = measuredVideos.length > 0
        ? Math.round(
            measuredVideos.reduce(
              (total, video) =>
                total + (metricsByVideo.get(video.id)?.viewsPerHour ?? 0),
              0,
            ) / measuredVideos.length,
          )
        : null
      const velocityChanges = rankedVideos.flatMap((video) =>
        video.momentum?.velocityChangePercent === null ||
        video.momentum?.velocityChangePercent === undefined
          ? []
          : [video.momentum.velocityChangePercent],
      )
      const velocityChangePercent = velocityChanges.length > 0
        ? Math.round(
            velocityChanges.reduce((total, value) => total + value, 0) /
              velocityChanges.length,
          )
        : null
      const categoryCounts = new Map<string, number>()

      for (const video of rankedVideos) {
        categoryCounts.set(
          video.categoryId,
          (categoryCounts.get(video.categoryId) ?? 0) + 1,
        )
      }

      const topCategoryId = [...categoryCounts.entries()].sort(
        (a, b) => b[1] - a[1],
      )[0]?.[0]

      return {
        phrase: candidate.phrase,
        trendScore,
        status: classifyTrendStatus(
          trendScore,
          averageAgeHours,
          velocityChangePercent,
        ),
        sourceVideoCount: rankedVideos.length,
        combinedViews: rankedVideos.reduce(
          (total, video) => total + video.viewCount,
          0,
        ),
        averageViewsPerDay: Math.round(
          rankedVideos.reduce(
            (total, video) =>
              total +
              (metricsByVideo.get(video.id)?.viewsPerHour ?? 0) * 24,
            0,
          ) / rankedVideos.length,
        ),
        measuredViewsPerHour,
        velocityChangePercent,
        historySampleCount: 0,
        history24h: [],
        history7d: [],
        topCategory: topCategoryId
          ? categoryNames[topCategoryId] ?? `Category ${topCategoryId}`
          : "Uncategorized",
        breakout: candidate.breakout,
        videos: rankedVideos.slice(0, 3).map((video) => ({
          id: video.id,
          title: video.title,
          channelTitle: video.channelTitle,
          thumbnail: video.thumbnail,
          publishedAt: video.publishedAt,
          viewCount: video.viewCount,
        })),
      }
    })
    .sort((a, b) => b.trendScore - a.trendScore)
    .slice(0, 30)
}
