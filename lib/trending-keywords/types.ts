export type TrendStatus =
  | "Hot"
  | "Rising faster"
  | "Rising"
  | "Steady"
  | "Falling"

export type TrendHistoryPoint = {
  collectedAt: string
  combinedViews: number
}

export type VideoSnapshotPoint = {
  videoId: string
  viewCount: number
  collectedAt: string
}

export type VideoMomentum = {
  viewVelocity: number
  velocityChangePercent: number | null
  sampleCount: number
}

export type YouTubeTrendingVideo = {
  id: string
  title: string
  tags: string[]
  categoryId: string
  channelTitle: string
  thumbnail: string
  publishedAt: string
  viewCount: number
  likeCount: number
  commentCount: number
  chartPosition: number
  momentum?: VideoMomentum
}

export type TrendSourceVideo = {
  id: string
  title: string
  channelTitle: string
  thumbnail: string
  publishedAt: string
  viewCount: number
}

export type TrendingKeyword = {
  phrase: string
  trendScore: number
  status: TrendStatus
  sourceVideoCount: number
  combinedViews: number
  averageViewsPerDay: number
  measuredViewsPerHour: number | null
  velocityChangePercent: number | null
  historySampleCount: number
  history24h: TrendHistoryPoint[]
  history7d: TrendHistoryPoint[]
  topCategory: string
  breakout: boolean
  videos: TrendSourceVideo[]
}

export type YouTubeCategory = {
  id: string
  title: string
}

export type TrendingKeywordsResponse = {
  region: string
  category: string
  generatedAt: string
  source: "youtube-most-popular"
  method: "inferred-from-public-video-metadata"
  isStale: boolean
  historyAvailable: boolean
  historyMessage: string
  warning?: string
  categories: YouTubeCategory[]
  keywords: TrendingKeyword[]
}
