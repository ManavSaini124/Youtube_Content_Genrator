import { NextRequest, NextResponse } from "next/server"

import {
  attachKeywordHistory,
  attachVideoMomentum,
} from "@/lib/trending-keywords/history"
import { scoreTrendingKeywords } from "@/lib/trending-keywords/score"
import {
  loadVideoSnapshotHistory,
  storeVideoSnapshots,
} from "@/lib/trending-keywords/snapshots"
import type {
  TrendingKeywordsResponse,
  VideoSnapshotPoint,
  YouTubeCategory,
  YouTubeTrendingVideo,
} from "@/lib/trending-keywords/types"

const YOUTUBE_VIDEOS_URL = "https://www.googleapis.com/youtube/v3/videos"
const YOUTUBE_CATEGORIES_URL =
  "https://www.googleapis.com/youtube/v3/videoCategories"
const REQUEST_TIMEOUT_MS = 8_000
const RESULT_TTL_MS = 60 * 60 * 1000
const RESULT_STALE_TTL_MS = 24 * 60 * 60 * 1000
const CATEGORY_TTL_MS = 24 * 60 * 60 * 1000

const SUPPORTED_REGIONS = new Set(["AU", "CA", "GB", "IN", "US"])

const FALLBACK_CATEGORIES: YouTubeCategory[] = [
  { id: "0", title: "All categories" },
  { id: "1", title: "Film & Animation" },
  { id: "2", title: "Autos & Vehicles" },
  { id: "10", title: "Music" },
  { id: "15", title: "Pets & Animals" },
  { id: "17", title: "Sports" },
  { id: "20", title: "Gaming" },
  { id: "22", title: "People & Blogs" },
  { id: "23", title: "Comedy" },
  { id: "24", title: "Entertainment" },
  { id: "25", title: "News & Politics" },
  { id: "26", title: "Howto & Style" },
  { id: "27", title: "Education" },
  { id: "28", title: "Science & Technology" },
]

type CacheEntry<T> = {
  value: T
  freshUntil: number
  staleUntil: number
}

type YouTubeErrorPayload = {
  error?: {
    message?: string
    errors?: Array<{ reason?: string }>
  }
}

type YouTubeVideoItem = {
  id?: string
  snippet?: {
    title?: string
    tags?: string[]
    categoryId?: string
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

class YouTubeApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message)
  }
}

const resultCache = new Map<string, CacheEntry<TrendingKeywordsResponse>>()
const categoryCache = new Map<string, CacheEntry<YouTubeCategory[]>>()
const pendingRequests = new Map<string, Promise<TrendingKeywordsResponse>>()

function responseHeaders() {
  return {
    "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
  }
}

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status })
}

function parseCount(value?: string) {
  const count = Number(value ?? 0)
  return Number.isFinite(count) && count >= 0 ? count : 0
}

function getYouTubeError(payload: YouTubeErrorPayload, fallback: string) {
  const reason = payload.error?.errors?.[0]?.reason

  if (reason === "quotaExceeded" || reason === "dailyLimitExceeded") {
    return new YouTubeApiError(
      "YouTube API quota is unavailable. Cached trend signals will return when available.",
      503,
    )
  }
  if (reason === "keyInvalid" || reason === "accessNotConfigured") {
    return new YouTubeApiError(
      "Trending keywords is not configured correctly. Check YOUTUBE_API_KEY.",
      503,
    )
  }

  return new YouTubeApiError(payload.error?.message || fallback, 502)
}

async function fetchYouTubeJson<T>(url: URL) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  try {
    const response = await fetch(url, {
      cache: "no-store",
      signal: controller.signal,
    })
    const payload = await response.json() as T & YouTubeErrorPayload

    if (!response.ok) {
      throw getYouTubeError(payload, "YouTube data could not be loaded.")
    }

    return payload
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new YouTubeApiError("YouTube took too long to respond.", 504)
    }
    throw error
  } finally {
    clearTimeout(timeout)
  }
}

async function getCategories(region: string, apiKey: string) {
  const now = Date.now()
  const cached = categoryCache.get(region)
  if (cached && cached.freshUntil > now) return cached.value

  try {
    const url = new URL(YOUTUBE_CATEGORIES_URL)
    url.search = new URLSearchParams({
      part: "snippet",
      regionCode: region,
      key: apiKey,
    }).toString()

    const payload = await fetchYouTubeJson<{
      items?: Array<{
        id?: string
        snippet?: { title?: string; assignable?: boolean }
      }>
    }>(url)
    const categories = [
      FALLBACK_CATEGORIES[0],
      ...(payload.items ?? []).flatMap((item) =>
        item.id && item.snippet?.title && item.snippet.assignable !== false
          ? [{ id: item.id, title: item.snippet.title }]
          : [],
      ),
    ]

    categoryCache.set(region, {
      value: categories,
      freshUntil: now + CATEGORY_TTL_MS,
      staleUntil: now + CATEGORY_TTL_MS,
    })
    return categories
  } catch (error) {
    if (cached) return cached.value
    console.warn("Trending keywords category lookup failed; using defaults.", {
      region,
      error: error instanceof Error ? error.message : "Unknown error",
    })
    return FALLBACK_CATEGORIES
  }
}

async function loadTrendingKeywords(
  region: string,
  category: string,
  apiKey: string,
) {
  const collectedAt = new Date()
  const categories = await getCategories(region, apiKey)
  const categoryNames = Object.fromEntries(
    categories.map((item) => [item.id, item.title]),
  )
  const url = new URL(YOUTUBE_VIDEOS_URL)
  const params = new URLSearchParams({
    part: "snippet,statistics",
    chart: "mostPopular",
    regionCode: region,
    maxResults: "50",
    key: apiKey,
  })
  if (category !== "0") params.set("videoCategoryId", category)
  url.search = params.toString()

  const payload = await fetchYouTubeJson<{ items?: YouTubeVideoItem[] }>(url)
  const videos: YouTubeTrendingVideo[] = (payload.items ?? []).flatMap(
    (item, index) => {
      const thumbnail =
        item.snippet?.thumbnails?.high?.url ||
        item.snippet?.thumbnails?.medium?.url ||
        item.snippet?.thumbnails?.default?.url

      if (
        !item.id ||
        !item.snippet?.title ||
        !item.snippet.publishedAt ||
        !thumbnail
      ) {
        return []
      }

      return [{
        id: item.id,
        title: item.snippet.title,
        tags: item.snippet.tags ?? [],
        categoryId: item.snippet.categoryId ?? "0",
        channelTitle: item.snippet.channelTitle ?? "Unknown channel",
        thumbnail,
        publishedAt: item.snippet.publishedAt,
        viewCount: parseCount(item.statistics?.viewCount),
        likeCount: parseCount(item.statistics?.likeCount),
        commentCount: parseCount(item.statistics?.commentCount),
        chartPosition: index + 1,
      }]
    },
  )

  if (videos.length === 0) {
    throw new YouTubeApiError(
      "No popular-video chart is available for this region and category.",
      404,
    )
  }

  let snapshotHistory: VideoSnapshotPoint[] = []
  let historyAvailable = false
  let historyMessage =
    "Historical momentum is unavailable; using lifetime video velocity."

  try {
    snapshotHistory = await loadVideoSnapshotHistory(
      videos,
      region,
      category,
      collectedAt,
    )
    historyAvailable = true
    historyMessage = snapshotHistory.length > 0
      ? "Measured momentum uses saved view-count snapshots from the last seven days."
      : "First snapshot collected. Measured momentum will appear after the next chart refresh."
  } catch (error) {
    console.warn("Trending snapshot history could not be loaded.", {
      region,
      category,
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }

  const videosWithMomentum = attachVideoMomentum(
    videos,
    snapshotHistory,
    collectedAt,
  )
  const keywords = attachKeywordHistory(
    scoreTrendingKeywords(videosWithMomentum, categoryNames, collectedAt),
    videosWithMomentum,
    snapshotHistory,
    collectedAt,
  )

  try {
    await storeVideoSnapshots(videos, region, category, collectedAt)
  } catch (error) {
    console.warn("Trending snapshots could not be stored.", {
      region,
      category,
      error: error instanceof Error ? error.message : "Unknown error",
    })
    if (historyAvailable) {
      historyMessage =
        "Using saved momentum history, but the latest snapshot could not be stored."
    }
  }

  return {
    region,
    category,
    generatedAt: collectedAt.toISOString(),
    source: "youtube-most-popular",
    method: "inferred-from-public-video-metadata",
    isStale: false,
    historyAvailable,
    historyMessage,
    categories,
    keywords,
  } satisfies TrendingKeywordsResponse
}

export async function GET(request: NextRequest) {
  const searchParams = new URL(request.url).searchParams
  const region = (searchParams.get("region") || "IN").trim().toUpperCase()
  const category = (searchParams.get("category") || "0").trim()

  if (!SUPPORTED_REGIONS.has(region)) {
    return jsonError("Choose a supported region.", 400)
  }
  if (!/^\d+$/.test(category)) {
    return jsonError("Category must be a numeric YouTube category ID.", 400)
  }

  const cacheKey = `trending-keywords:${region}:${category}`
  const now = Date.now()
  const cached = resultCache.get(cacheKey)
  if (cached && cached.freshUntil > now) {
    return NextResponse.json(cached.value, { headers: responseHeaders() })
  }

  const apiKey = process.env.YOUTUBE_API_KEY?.trim()
  if (!apiKey) {
    if (cached && cached.staleUntil > now) {
      return NextResponse.json({
        ...cached.value,
        isStale: true,
        warning: "Live YouTube data is unavailable; showing the last cached result.",
      }, { headers: responseHeaders() })
    }
    return jsonError(
      "Trending keywords is not configured. Add YOUTUBE_API_KEY.",
      503,
    )
  }

  try {
    let pending = pendingRequests.get(cacheKey)
    if (!pending) {
      pending = loadTrendingKeywords(region, category, apiKey)
      pendingRequests.set(cacheKey, pending)
    }

    const value = await pending
    resultCache.set(cacheKey, {
      value,
      freshUntil: now + RESULT_TTL_MS,
      staleUntil: now + RESULT_STALE_TTL_MS,
    })

    return NextResponse.json(value, { headers: responseHeaders() })
  } catch (error) {
    console.error("Trending keywords refresh failed.", {
      region,
      category,
      error: error instanceof Error ? error.message : "Unknown error",
    })

    if (cached && cached.staleUntil > now) {
      return NextResponse.json({
        ...cached.value,
        isStale: true,
        warning: "Live YouTube data is unavailable; showing the last cached result.",
      }, { headers: responseHeaders() })
    }

    const status = error instanceof YouTubeApiError ? error.status : 502
    const message =
      error instanceof Error
        ? error.message
        : "Trending keywords is temporarily unavailable."
    return jsonError(message, status)
  } finally {
    pendingRequests.delete(cacheKey)
  }
}
