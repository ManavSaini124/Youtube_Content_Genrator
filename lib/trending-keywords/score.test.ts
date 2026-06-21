import assert from "node:assert/strict"
import test from "node:test"

import {
  classifyTrendStatus,
  scoreTrendingKeywords,
  TREND_SCORE_WEIGHTS,
} from "./score"
import type { YouTubeTrendingVideo } from "./types"

function makeVideo(
  id: string,
  title: string,
  chartPosition: number,
  viewCount: number,
): YouTubeTrendingVideo {
  return {
    id,
    title,
    tags: [],
    categoryId: "28",
    channelTitle: `Channel ${id}`,
    thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
    publishedAt: "2026-06-13T12:00:00.000Z",
    viewCount,
    likeCount: Math.round(viewCount * 0.05),
    commentCount: Math.round(viewCount * 0.005),
    chartPosition,
  }
}

test("keeps scoring weights explicit and balanced", () => {
  const total = Object.values(TREND_SCORE_WEIGHTS).reduce(
    (sum, value) => sum + value,
    0,
  )
  assert.equal(total, 1)
})

test("classifies measured acceleration and slowdown", () => {
  assert.equal(classifyTrendStatus(60, 24, 40), "Rising faster")
  assert.equal(classifyTrendStatus(60, 24, -40), "Falling")
  assert.equal(classifyTrendStatus(80, 24, -40), "Hot")
})

test("ranks repeated phrases and includes evidence videos", () => {
  const results = scoreTrendingKeywords(
    [
      makeVideo("one", "AI camera workflow", 1, 1_000_000),
      makeVideo("two", "AI camera guide", 2, 800_000),
      makeVideo("three", "Budget lighting setup", 3, 100_000),
    ],
    { "28": "Science & Technology" },
    new Date("2026-06-14T12:00:00.000Z"),
  )

  const ai = results.find((result) => result.phrase === "ai camera")
  assert.ok(ai)
  assert.equal(ai.sourceVideoCount, 2)
  assert.equal(ai.videos.length, 2)
  assert.equal(ai.topCategory, "Science & Technology")
})

test("rejects ordinary one-video phrases but marks exceptional velocity breakouts", () => {
  const results = scoreTrendingKeywords(
    [
      makeVideo("one", "Quantum battery discovery", 1, 10_000_000),
      makeVideo("two", "Home studio lighting", 2, 100_000),
      makeVideo("three", "Home studio audio", 3, 90_000),
    ],
    { "28": "Science & Technology" },
    new Date("2026-06-14T12:00:00.000Z"),
  )

  const breakout = results.find((result) => result.phrase === "quantum battery")
  const ordinarySingleton = results.find((result) => result.phrase === "lighting")

  assert.equal(breakout?.breakout, true)
  assert.equal(ordinarySingleton, undefined)
})
