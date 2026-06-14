import { NextRequest, NextResponse } from "next/server"

type YouTubeSearchItem = {
  id?: { videoId?: string }
}

type YouTubeVideoItem = {
  id: string
  snippet?: {
    title?: string
    channelTitle?: string
    publishedAt?: string
    thumbnails?: {
      high?: { url?: string }
      medium?: { url?: string }
      default?: { url?: string }
    }
  }
  statistics?: {
    viewCount?: string
    likeCount?: string
    commentCount?: string
  }
}

type YouTubeErrorPayload = {
  error?: {
    message?: string
    errors?: Array<{ reason?: string }>
  }
}

type ScoredVideo = {
  id: string
  title: string
  thumbnail: string
  channelTitle: string
  viewCount: number
  likeCount: number
  commentCount: number
  publishedAt: string
  viewsPerDay: number
  engagementRate: number
}

const YOUTUBE_SEARCH_URL = "https://www.googleapis.com/youtube/v3/search"
const YOUTUBE_VIDEOS_URL = "https://www.googleapis.com/youtube/v3/videos"

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status })
}

function youtubeErrorMessage(payload: YouTubeErrorPayload, fallback: string) {
  const reason = payload.error?.errors?.[0]?.reason
  if (reason === "quotaExceeded" || reason === "dailyLimitExceeded") {
    return "YouTube search quota has been reached. Try again after the quota resets."
  }
  if (reason === "keyInvalid" || reason === "accessNotConfigured") {
    return "YouTube analysis is not configured correctly. Check the YouTube API key."
  }
  return payload.error?.message || fallback
}

function calculateIQR(values: number[]) {
  if (values.length === 0) {
    return { iqr: 0, lowerBound: 0, upperBound: 0 }
  }

  const sorted = [...values].sort((a, b) => a - b)
  const q1 = sorted[Math.floor(sorted.length / 4)] ?? sorted[0]
  const q3 = sorted[Math.floor((sorted.length * 3) / 4)] ?? sorted[sorted.length - 1]
  const iqr = q3 - q1
  return {
    iqr,
    lowerBound: q1 - 1.5 * iqr,
    upperBound: q3 + 1.5 * iqr,
  }
}

export async function GET(req: NextRequest) {
  const youtubeApiKey = process.env.YOUTUBE_API_KEY?.trim()
  if (!youtubeApiKey) {
    return jsonError("YouTube analysis is not configured. Add YOUTUBE_API_KEY.", 503)
  }

  const query = new URL(req.url).searchParams.get("query")?.trim()
  if (!query) return jsonError("Enter a topic before analyzing.", 400)

  try {
    const searchUrl = new URL(YOUTUBE_SEARCH_URL)
    searchUrl.search = new URLSearchParams({
      part: "snippet",
      q: query,
      type: "video",
      videoDuration: "medium",
      maxResults: "20",
      key: youtubeApiKey,
    }).toString()

    const searchResponse = await fetch(searchUrl, { cache: "no-store" })
    const searchData = await searchResponse.json() as {
      items?: YouTubeSearchItem[]
    } & YouTubeErrorPayload

    if (!searchResponse.ok) {
      return jsonError(
        youtubeErrorMessage(searchData, "YouTube search failed."),
        searchResponse.status === 403 ? 503 : 502,
      )
    }

    const videoIds = (searchData.items || [])
      .map((item) => item.id?.videoId)
      .filter((id): id is string => Boolean(id))

    if (videoIds.length === 0) return NextResponse.json([])

    const videosUrl = new URL(YOUTUBE_VIDEOS_URL)
    videosUrl.search = new URLSearchParams({
      part: "snippet,statistics",
      id: videoIds.join(","),
      key: youtubeApiKey,
    }).toString()

    const videosResponse = await fetch(videosUrl, { cache: "no-store" })
    const videosData = await videosResponse.json() as {
      items?: YouTubeVideoItem[]
    } & YouTubeErrorPayload

    if (!videosResponse.ok) {
      return jsonError(
        youtubeErrorMessage(videosData, "YouTube video details could not be loaded."),
        videosResponse.status === 403 ? 503 : 502,
      )
    }

    const now = Date.now()
    const videos: ScoredVideo[] = (videosData.items || []).flatMap((item) => {
      const thumbnail =
        item.snippet?.thumbnails?.high?.url ||
        item.snippet?.thumbnails?.medium?.url ||
        item.snippet?.thumbnails?.default?.url
      const publishedAt = item.snippet?.publishedAt

      if (!thumbnail || !publishedAt || !item.snippet?.title) return []

      const viewCount = Number(item.statistics?.viewCount || 0)
      const likeCount = Number(item.statistics?.likeCount || 0)
      const commentCount = Number(item.statistics?.commentCount || 0)
      const publishTime = new Date(publishedAt).getTime()
      const ageInDays = Number.isNaN(publishTime)
        ? 1
        : Math.max((now - publishTime) / 86_400_000, 1)

      return [{
        id: item.id,
        title: item.snippet.title,
        thumbnail,
        channelTitle: item.snippet.channelTitle || "Unknown channel",
        viewCount,
        likeCount,
        commentCount,
        publishedAt,
        viewsPerDay: viewCount / ageInDays,
        engagementRate:
          viewCount > 0 ? ((likeCount + commentCount) / viewCount) * 100 : 0,
      }]
    })

    if (videos.length === 0) return NextResponse.json([])

    const viewCounts = videos.map((video) => video.viewCount)
    const { iqr, lowerBound, upperBound } = calculateIQR(viewCounts)
    const averageViews =
      viewCounts.reduce((total, value) => total + value, 0) / viewCounts.length
    const maxViewsPerDay = Math.max(...videos.map((video) => video.viewsPerDay), 1)
    const maxEngagementRate = Math.max(
      ...videos.map((video) => video.engagementRate),
      1,
    )

    const results = videos
      .map((video) => {
        const outlierDirection =
          video.viewCount > upperBound
            ? "high"
            : video.viewCount < lowerBound
              ? "low"
              : "normal"
        const outlierScore =
          iqr <= 0
            ? 0
            : outlierDirection === "high"
              ? (video.viewCount - upperBound) / iqr
              : outlierDirection === "low"
                ? (lowerBound - video.viewCount) / iqr
                : 0
        const viewsPerDayNorm = video.viewsPerDay / maxViewsPerDay
        const engagementRateNorm = video.engagementRate / maxEngagementRate
        const smartScore =
          (video.viewCount / Math.max(averageViews, 1)) * 0.5 +
          viewsPerDayNorm * 0.3 +
          engagementRateNorm * 0.2

        return {
          ...video,
          viewsPerDay: Math.round(video.viewsPerDay),
          engagementRate: Number(video.engagementRate.toFixed(2)),
          smartScore: Number(smartScore.toFixed(3)),
          isOutlier: outlierDirection !== "normal",
          outlierDirection,
          outlierScore: Number(outlierScore.toFixed(2)),
        }
      })
      .sort((a, b) => b.smartScore - a.smartScore)

    return NextResponse.json(results)
  } catch (error) {
    console.error("Outlier analysis route failed:", error)
    return jsonError("Outlier analysis is temporarily unavailable. Please try again.", 502)
  }
}
