import assert from "node:assert/strict"
import test from "node:test"

import {
  buildPhraseVideoIndex,
  decodeHtmlEntities,
  extractPhrasesFromText,
} from "./extract"
import type { YouTubeTrendingVideo } from "./types"

function video(id: string, title: string, tags: string[] = []): YouTubeTrendingVideo {
  return {
    id,
    title,
    tags,
    categoryId: "28",
    channelTitle: "Test channel",
    thumbnail: "https://i.ytimg.com/vi/test/hqdefault.jpg",
    publishedAt: "2026-06-14T00:00:00.000Z",
    viewCount: 1000,
    likeCount: 50,
    commentCount: 10,
    chartPosition: 1,
  }
}

test("decodes entities and extracts one-to-three-word phrases", () => {
  assert.equal(decodeHtmlEntities("AI &amp; Robotics"), "AI & Robotics")
  const phrases = extractPhrasesFromText("AI &amp; robotics future 2026")

  assert.ok(phrases.has("ai"))
  assert.ok(phrases.has("ai robotics"))
  assert.ok(phrases.has("ai robotics future"))
  assert.ok(phrases.has("2026"))
})

test("removes stop words and generic YouTube wording", () => {
  const phrases = extractPhrasesFromText("The official full video about AI tools")

  assert.ok(phrases.has("ai tools"))
  assert.equal(phrases.has("official"), false)
  assert.equal(phrases.has("the"), false)
  assert.equal(phrases.has("video"), false)
})

test("counts a phrase once per video across title and repeated tags", () => {
  const index = buildPhraseVideoIndex([
    video("one", "AI tools explained", ["AI tools", "AI tools"]),
    video("two", "Best AI tools"),
  ])

  assert.deepEqual([...index.get("ai tools") ?? []].sort(), ["one", "two"])
})

