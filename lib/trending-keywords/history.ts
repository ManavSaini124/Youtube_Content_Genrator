import { extractVideoPhrases } from "./extract"
import type {
  TrendHistoryPoint,
  TrendingKeyword,
  VideoMomentum,
  VideoSnapshotPoint,
  YouTubeTrendingVideo,
} from "./types"

const HOUR_MS = 60 * 60 * 1000
const DAY_MS = 24 * HOUR_MS

function calculateVelocity(
  newer: VideoSnapshotPoint,
  older: VideoSnapshotPoint,
) {
  const elapsedHours = Math.max(
    (new Date(newer.collectedAt).getTime() -
      new Date(older.collectedAt).getTime()) / HOUR_MS,
    1 / 60,
  )
  return Math.max(0, newer.viewCount - older.viewCount) / elapsedHours
}

export function attachVideoMomentum(
  videos: YouTubeTrendingVideo[],
  history: VideoSnapshotPoint[],
  collectedAt: Date,
) {
  const historyByVideo = new Map<string, VideoSnapshotPoint[]>()

  for (const point of history) {
    const points = historyByVideo.get(point.videoId) ?? []
    points.push(point)
    historyByVideo.set(point.videoId, points)
  }

  return videos.map((video) => {
    const currentPoint: VideoSnapshotPoint = {
      videoId: video.id,
      viewCount: video.viewCount,
      collectedAt: collectedAt.toISOString(),
    }
    const previousPoints = [...(historyByVideo.get(video.id) ?? [])]
      .filter(
        (point) =>
          new Date(point.collectedAt).getTime() < collectedAt.getTime(),
      )
      .sort(
        (a, b) =>
          new Date(b.collectedAt).getTime() -
          new Date(a.collectedAt).getTime(),
      )

    if (previousPoints.length === 0) return video

    const currentVelocity = calculateVelocity(currentPoint, previousPoints[0])
    let velocityChangePercent: number | null = null

    if (previousPoints.length >= 2) {
      const previousVelocity = calculateVelocity(
        previousPoints[0],
        previousPoints[1],
      )
      velocityChangePercent =
        previousVelocity > 0
          ? ((currentVelocity - previousVelocity) / previousVelocity) * 100
          : currentVelocity > 0
            ? 100
            : 0
    }

    const momentum: VideoMomentum = {
      viewVelocity: currentVelocity,
      velocityChangePercent,
      sampleCount: previousPoints.length + 1,
    }

    return { ...video, momentum }
  })
}

function aggregateHistory(
  videoIds: Set<string>,
  history: VideoSnapshotPoint[],
  currentVideos: YouTubeTrendingVideo[],
  collectedAt: Date,
) {
  const totals = new Map<string, number>()

  for (const point of history) {
    if (!videoIds.has(point.videoId)) continue
    totals.set(
      point.collectedAt,
      (totals.get(point.collectedAt) ?? 0) + point.viewCount,
    )
  }

  const currentTotal = currentVideos
    .filter((video) => videoIds.has(video.id))
    .reduce((total, video) => total + video.viewCount, 0)
  totals.set(collectedAt.toISOString(), currentTotal)

  return [...totals.entries()]
    .map(([pointCollectedAt, combinedViews]) => ({
      collectedAt: pointCollectedAt,
      combinedViews,
    }))
    .sort(
      (a, b) =>
        new Date(a.collectedAt).getTime() -
        new Date(b.collectedAt).getTime(),
    )
}

function pointsSince(
  points: TrendHistoryPoint[],
  collectedAt: Date,
  durationMs: number,
) {
  const threshold = collectedAt.getTime() - durationMs
  return points.filter(
    (point) => new Date(point.collectedAt).getTime() >= threshold,
  )
}

export function attachKeywordHistory(
  keywords: TrendingKeyword[],
  videos: YouTubeTrendingVideo[],
  history: VideoSnapshotPoint[],
  collectedAt: Date,
) {
  return keywords.map((keyword) => {
    const videoIds = new Set(
      videos
        .filter((video) => extractVideoPhrases(video).has(keyword.phrase))
        .map((video) => video.id),
    )
    const points = aggregateHistory(videoIds, history, videos, collectedAt)

    return {
      ...keyword,
      historySampleCount: points.length,
      history24h: pointsSince(points, collectedAt, DAY_MS),
      history7d: pointsSince(points, collectedAt, 7 * DAY_MS),
    }
  })
}
