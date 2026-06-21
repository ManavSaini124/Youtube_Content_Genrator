import type { YouTubeTrendingVideo } from "./types"

const ENGLISH_STOP_WORDS = new Set([
  "a", "about", "after", "again", "all", "also", "am", "an", "and", "any",
  "are", "as", "at", "be", "because", "been", "before", "being", "between",
  "both", "but", "by", "can", "could", "did", "do", "does", "doing", "down",
  "during", "each", "few", "for", "from", "further", "get", "gets", "getting",
  "had", "has", "have", "having", "he", "her", "here", "hers", "herself",
  "him", "himself", "his", "how", "i", "if", "in", "into", "is", "it", "its",
  "itself", "just", "me", "more", "most", "my", "myself", "no", "nor", "not",
  "now", "of", "off", "on", "once", "only", "or", "other", "our", "ours",
  "ourselves", "out", "over", "own", "same", "she", "should", "so", "some",
  "such", "than", "that", "the", "their", "theirs", "them", "themselves",
  "then", "there", "these", "they", "this", "those", "through", "to", "too",
  "under", "until", "up", "very", "was", "we", "were", "what", "when", "where",
  "which", "while", "who", "why", "will", "with", "would", "you", "your",
  "yours", "yourself", "yourselves",
])

const GENERIC_YOUTUBE_WORDS = new Set([
  "clip", "clips", "episode", "full", "hd", "live", "new", "official", "part",
  "reaction", "short", "shorts", "trailer", "video", "videos", "viral",
])

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  apos: "'",
  gt: ">",
  lt: "<",
  nbsp: " ",
  quot: "\"",
}

export function decodeHtmlEntities(value: string) {
  return value.replace(
    /&(#x?[0-9a-f]+|[a-z]+);/gi,
    (entity, code: string) => {
      const normalized = code.toLowerCase()
      if (normalized.startsWith("#x")) {
        return String.fromCodePoint(Number.parseInt(normalized.slice(2), 16))
      }
      if (normalized.startsWith("#")) {
        return String.fromCodePoint(Number.parseInt(normalized.slice(1), 10))
      }
      return NAMED_ENTITIES[normalized] ?? entity
    },
  )
}

function tokenRuns(value: string) {
  const cleaned = decodeHtmlEntities(value)
    .toLocaleLowerCase("en")
    .replace(/https?:\/\/\S+|www\.\S+/gi, " ")
    .replace(/[\u2019']/g, "")
    .replace(/[^\p{L}\p{N}+#.-]+/gu, " ")
    .replace(/(^|\s)[+.#-]+|[+.#-]+(?=\s|$)/g, " ")
    .replace(/\s+/g, " ")
    .trim()

  if (!cleaned) return []

  const runs: string[][] = []
  let current: string[] = []

  for (const token of cleaned.split(" ")) {
    const isUsefulSingleCharacter = /^\d$/u.test(token) || token === "x"
    const isRejected =
      (!isUsefulSingleCharacter && token.length < 2) ||
      ENGLISH_STOP_WORDS.has(token) ||
      GENERIC_YOUTUBE_WORDS.has(token)

    if (isRejected) {
      if (current.length > 0) runs.push(current)
      current = []
      continue
    }

    current.push(token)
  }

  if (current.length > 0) runs.push(current)
  return runs
}

export function extractPhrasesFromText(value: string) {
  const phrases = new Set<string>()

  for (const tokens of tokenRuns(value)) {
    for (let size = 1; size <= 3; size += 1) {
      for (let index = 0; index <= tokens.length - size; index += 1) {
        phrases.add(tokens.slice(index, index + size).join(" "))
      }
    }
  }

  return phrases
}

export function extractVideoPhrases(video: YouTubeTrendingVideo) {
  const phrases = new Set(extractPhrasesFromText(video.title))

  for (const tag of video.tags) {
    for (const phrase of extractPhrasesFromText(tag)) {
      phrases.add(phrase)
    }
  }

  return phrases
}

export function buildPhraseVideoIndex(videos: YouTubeTrendingVideo[]) {
  const index = new Map<string, Set<string>>()

  for (const video of videos) {
    for (const phrase of extractVideoPhrases(video)) {
      const videoIds = index.get(phrase) ?? new Set<string>()
      videoIds.add(video.id)
      index.set(phrase, videoIds)
    }
  }

  return index
}
