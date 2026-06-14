import OpenAI from "openai"
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

const YOUTUBE_SEARCH_URL = "https://www.googleapis.com/youtube/v3/search"
const YOUTUBE_VIDEOS_URL = "https://www.googleapis.com/youtube/v3/videos"

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status })
}

function cleanVisionKeywords(value: string) {
  return value
    .replace(/```(?:json)?/gi, "")
    .replace(/```/g, "")
    .split(/[,\n]/)
    .map((tag) => tag.replace(/^[-*\d.)\s]+/, "").trim())
    .filter(Boolean)
    .slice(0, 5)
}

async function getVisualSearchQuery(thumbnailUrl: string, fallbackQuery: string) {
  const apiKey = process.env.OPEN_ROUTER_API_KEY?.trim()
  const visionModel = process.env.THUMBNAIL_VISION_MODEL?.trim()
  if (!apiKey || !visionModel) return fallbackQuery

  try {
    const openrouter = new OpenAI({
      apiKey,
      baseURL: "https://openrouter.ai/api/v1",
    })
    const completion = await openrouter.chat.completions.create({
      model: visionModel,
      messages: [{
        role: "user",
        content: [
          {
            type: "text",
            text: "Return exactly five short YouTube search phrases that describe this thumbnail's topic, subject, and visual concept. Use comma-separated phrases only.",
          },
          {
            type: "image_url",
            image_url: { url: thumbnailUrl },
          },
        ],
      }],
    })

    const keywords = cleanVisionKeywords(
      completion.choices[0]?.message?.content || "",
    )
    return keywords.length > 0 ? keywords.join(" ") : fallbackQuery
  } catch (error) {
    console.warn("Thumbnail vision analysis failed; using the video title instead.", error)
    return fallbackQuery
  }
}

function youtubeErrorMessage(payload: YouTubeErrorPayload, fallback: string) {
  const reason = payload.error?.errors?.[0]?.reason

  if (reason === "quotaExceeded" || reason === "dailyLimitExceeded") {
    return "YouTube search quota has been reached. Try again after the quota resets."
  }
  if (reason === "keyInvalid" || reason === "accessNotConfigured") {
    return "YouTube search is not configured correctly. Check the YouTube API key."
  }

  return payload.error?.message || fallback
}

export async function GET(req: NextRequest) {
  const youtubeApiKey = process.env.YOUTUBE_API_KEY?.trim()
  if (!youtubeApiKey) {
    return jsonError("YouTube search is not configured. Add YOUTUBE_API_KEY.", 503)
  }

  const { searchParams } = new URL(req.url)
  const thumbnailUrl = searchParams.get("thumbnailUrl")?.trim()
  const sourceTitle = searchParams.get("sourceTitle")?.trim() || ""
  let query = searchParams.get("query")?.trim() || ""

  if (thumbnailUrl) {
    try {
      const parsedThumbnailUrl = new URL(thumbnailUrl)
      if (!["http:", "https:"].includes(parsedThumbnailUrl.protocol)) {
        return jsonError("The thumbnail URL is not valid.", 400)
      }
    } catch {
      return jsonError("The thumbnail URL is not valid.", 400)
    }

    query = await getVisualSearchQuery(thumbnailUrl, sourceTitle)
  }

  if (!query) return jsonError("Enter a topic before searching.", 400)

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

    const results = (videosData.items || []).flatMap((item) => {
      const thumbnail =
        item.snippet?.thumbnails?.high?.url ||
        item.snippet?.thumbnails?.medium?.url ||
        item.snippet?.thumbnails?.default?.url

      if (!thumbnail || !item.snippet?.title) return []

      return [{
        id: item.id,
        title: item.snippet.title,
        thumbnail,
        channelTitle: item.snippet.channelTitle || "Unknown channel",
        viewCount: item.statistics?.viewCount || "0",
        likeCount: item.statistics?.likeCount || "0",
        commentCount: item.statistics?.commentCount || "0",
        publishedAt: item.snippet.publishedAt || "",
      }]
    })

    return NextResponse.json(results)
  } catch (error) {
    console.error("Thumbnail search route failed:", error)
    return jsonError("Thumbnail search is temporarily unavailable. Please try again.", 502)
  }
}
