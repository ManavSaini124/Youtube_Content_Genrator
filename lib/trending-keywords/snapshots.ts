import { db } from "@/configs/db"
import { trendingVideoSnapshots } from "@/configs/schema"
import { and, asc, eq, gte, inArray, lt } from "drizzle-orm"

import type {
  VideoSnapshotPoint,
  YouTubeTrendingVideo,
} from "./types"

const RETENTION_MS = 30 * 24 * 60 * 60 * 1000
const HISTORY_WINDOW_MS = 7 * 24 * 60 * 60 * 1000

export async function loadVideoSnapshotHistory(
  videos: YouTubeTrendingVideo[],
  region: string,
  category: string,
  collectedAt: Date,
) {
  if (videos.length === 0) return []

  const rows = await db
    .select({
      videoId: trendingVideoSnapshots.videoId,
      viewCount: trendingVideoSnapshots.viewCount,
      collectedAt: trendingVideoSnapshots.collectedAt,
    })
    .from(trendingVideoSnapshots)
    .where(and(
      eq(trendingVideoSnapshots.regionCode, region),
      eq(trendingVideoSnapshots.categoryId, category),
      inArray(
        trendingVideoSnapshots.videoId,
        videos.map((video) => video.id),
      ),
      gte(
        trendingVideoSnapshots.collectedAt,
        new Date(collectedAt.getTime() - HISTORY_WINDOW_MS),
      ),
    ))
    .orderBy(asc(trendingVideoSnapshots.collectedAt))

  return rows.map((row): VideoSnapshotPoint => ({
    videoId: row.videoId,
    viewCount: row.viewCount,
    collectedAt: row.collectedAt.toISOString(),
  }))
}

export async function storeVideoSnapshots(
  videos: YouTubeTrendingVideo[],
  region: string,
  category: string,
  collectedAt: Date,
) {
  if (videos.length === 0) return

  await db.insert(trendingVideoSnapshots).values(
    videos.map((video) => ({
      videoId: video.id,
      regionCode: region,
      categoryId: category,
      title: video.title,
      tagsJson: video.tags,
      viewCount: video.viewCount,
      likeCount: video.likeCount,
      commentCount: video.commentCount,
      publishedAt: new Date(video.publishedAt),
      collectedAt,
    })),
  )

  await db
    .delete(trendingVideoSnapshots)
    .where(
      lt(
        trendingVideoSnapshots.collectedAt,
        new Date(collectedAt.getTime() - RETENTION_MS),
      ),
    )
}

