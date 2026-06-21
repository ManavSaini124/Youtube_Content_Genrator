import assert from "node:assert/strict"
import test from "node:test"

import {
  attachKeywordHistory,
  attachVideoMomentum,
} from "./history"
import type {
  TrendingKeyword,
  VideoSnapshotPoint,
  YouTubeTrendingVideo,
} from "./types"

function makeVideo(
  id: string,
  title: string,
  viewCount: number,
): YouTubeTrendingVideo {
  return {
    id,
    title,
    tags: [],
    categoryId: "28",
    channelTitle: `Channel ${id}`,
    thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
    publishedAt: "2026-06-14T00:00:00.000Z",
    viewCount,
    likeCount: 100,
    commentCount: 10,
    chartPosition: 1,
  }
}

test("calculates measured velocity and acceleration from prior snapshots", () => {
  const collectedAt = new Date("2026-06-15T12:00:00.000Z")
  const history: VideoSnapshotPoint[] = [
    {
      videoId: "one",
      viewCount: 1_000,
      collectedAt: "2026-06-15T10:00:00.000Z",
    },
    {
      videoId: "one",
      viewCount: 1_200,
      collectedAt: "2026-06-15T11:00:00.000Z",
    },
  ]

  const [video] = attachVideoMomentum(
    [makeVideo("one", "AI camera workflow", 1_600)],
    history,
    collectedAt,
  )

  assert.equal(video.momentum?.viewVelocity, 400)
  assert.equal(video.momentum?.velocityChangePercent, 100)
  assert.equal(video.momentum?.sampleCount, 3)
})

test("builds phrase history from every source video, not only displayed evidence", () => {
  const collectedAt = new Date("2026-06-15T12:00:00.000Z")
  const videos = [
    makeVideo("one", "AI camera workflow", 1_600),
    makeVideo("two", "AI camera guide", 2_000),
    makeVideo("three", "AI camera setup", 3_000),
    makeVideo("four", "AI camera review", 4_000),
  ]
  const history: VideoSnapshotPoint[] = videos.map((video) => ({
    videoId: video.id,
    viewCount: video.viewCount - 100,
    collectedAt: "2026-06-15T11:00:00.000Z",
  }))
  const keyword: TrendingKeyword = {
    phrase: "ai camera",
    trendScore: 90,
    status: "Hot",
    sourceVideoCount: 4,
    combinedViews: 10_600,
    averageViewsPerDay: 1_000,
    measuredViewsPerHour: 100,
    velocityChangePercent: null,
    historySampleCount: 0,
    history24h: [],
    history7d: [],
    topCategory: "Science & Technology",
    breakout: false,
    videos: videos.slice(0, 3).map((video) => ({
      id: video.id,
      title: video.title,
      channelTitle: video.channelTitle,
      thumbnail: video.thumbnail,
      publishedAt: video.publishedAt,
      viewCount: video.viewCount,
    })),
  }

  const [withHistory] = attachKeywordHistory(
    [keyword],
    videos,
    history,
    collectedAt,
  )

  assert.equal(withHistory.history24h.length, 2)
  assert.equal(withHistory.history24h[0].combinedViews, 10_200)
  assert.equal(withHistory.history24h[1].combinedViews, 10_600)
})

