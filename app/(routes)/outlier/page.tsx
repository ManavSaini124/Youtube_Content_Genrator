"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import type { FormEvent } from "react"
import {
  BarChart3,
  Flame,
  Gauge,
  Loader2,
  Search,
  SlidersHorizontal,
  Sparkles,
  X,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import VideoCardOut from "./_components/videoCardOut"

export type OutlierDirection = "high" | "low" | "normal"

export type VideoInfoOutlier = {
  id: string
  title: string
  thumbnail: string
  channelTitle: string
  viewCount: number
  likeCount: number
  commentCount: number
  publishedAt: string
  outlierScore: number
  engagementRate: number
  smartScore: number
  viewsPerDay: number
  isOutlier: boolean
  outlierDirection: OutlierDirection
}

type ResultFilter = "all" | "breakouts"
type ResultSort = "opportunity" | "velocity" | "views"

const searchIdeas = ["AI productivity", "Budget filmmaking", "Desk setup"]

function OutlierSkeleton() {
  return (
    <div className="outlier-grid" aria-label="Analyzing video performance">
      {Array.from({ length: 6 }).map((_, index) => (
        <div className="outlier-skeleton" key={index}>
          <Skeleton className="aspect-video w-full rounded-none" />
          <div>
            <Skeleton className="h-4 w-11/12" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      ))}
    </div>
  )
}

export default function Outlier() {
  const [query, setQuery] = useState("")
  const [searchedQuery, setSearchedQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [videoList, setVideoList] = useState<VideoInfoOutlier[]>([])
  const [error, setError] = useState("")
  const [hasSearched, setHasSearched] = useState(false)
  const [filter, setFilter] = useState<ResultFilter>("all")
  const [sort, setSort] = useState<ResultSort>("opportunity")
  const requestControllerRef = useRef<AbortController | null>(null)

  const runSearch = async (searchQuery: string) => {
    const cleanQuery = searchQuery.trim()
    if (!cleanQuery) return

    requestControllerRef.current?.abort()
    const controller = new AbortController()
    requestControllerRef.current = controller
    setLoading(true)
    setError("")
    setHasSearched(true)
    setSearchedQuery(cleanQuery)
    setFilter("all")

    try {
      const requestUrl = new URL("/api/outlier", window.location.origin)
      requestUrl.searchParams.set("query", cleanQuery)
      const response = await fetch(requestUrl, { signal: controller.signal })
      const data = await response.json()

      if (!response.ok) throw new Error(data.error || "Outlier analysis failed.")
      if (!Array.isArray(data)) throw new Error("Analysis returned an invalid response.")
      setVideoList(data)
    } catch (requestError) {
      if (requestError instanceof DOMException && requestError.name === "AbortError") return
      setVideoList([])
      setError(
        requestError instanceof Error
          ? requestError.message
          : "We could not complete this analysis. Please try again.",
      )
    } finally {
      if (requestControllerRef.current === controller) {
        setLoading(false)
        requestControllerRef.current = null
      }
    }
  }

  const onSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (loading) return
    runSearch(query)
  }

  useEffect(() => {
    return () => requestControllerRef.current?.abort()
  }, [])

  const breakoutCount = videoList.filter(
    (video) => video.outlierDirection === "high",
  ).length
  const fastestVideo = videoList.reduce<VideoInfoOutlier | null>(
    (best, video) => !best || video.viewsPerDay > best.viewsPerDay ? video : best,
    null,
  )
  const strongestVideo = videoList.reduce<VideoInfoOutlier | null>(
    (best, video) => !best || video.smartScore > best.smartScore ? video : best,
    null,
  )

  const displayedVideos = useMemo(() => {
    const filtered = filter === "breakouts"
      ? videoList.filter((video) => video.outlierDirection === "high")
      : [...videoList]

    return filtered.sort((a, b) => {
      if (sort === "velocity") return b.viewsPerDay - a.viewsPerDay
      if (sort === "views") return b.viewCount - a.viewCount
      return b.smartScore - a.smartScore
    })
  }, [filter, sort, videoList])

  return (
    <div className="dashboard-page outlier-page">
      <header className="tool-page-header">
        <p className="tool-page-eyebrow">Research tool</p>
        <h1>Find the videos breaking the pattern.</h1>
        <p className="tool-page-description">
          Compare videos within one topic to surface unusual reach, velocity, and
          engagement that may point to an underserved idea.
        </p>
      </header>

      <form
        className="tool-panel outlier-form"
        aria-labelledby="outlier-search-title"
        onSubmit={onSearch}
      >
        <div className="outlier-form__header">
          <div>
            <p className="outlier-step">01</p>
            <h2 id="outlier-search-title">Define the market</h2>
          </div>
          <span><Gauge aria-hidden="true" /> Relative performance</span>
        </div>

        <div className="outlier-field">
          <label htmlFor="outlier-query">Topic or niche</label>
          <div className="outlier-field__control">
            <Search aria-hidden="true" />
            <input
              id="outlier-query"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Example: beginner video editing"
              autoComplete="off"
              required
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery("")
                  setError("")
                }}
                aria-label="Clear search"
                title="Clear search"
              >
                <X aria-hidden="true" />
              </button>
            )}
          </div>
          <p>Keep the topic focused so every result belongs to a meaningful benchmark.</p>
        </div>

        <div className="outlier-form__footer">
          <div className="outlier-ideas" aria-label="Suggested analyses">
            <span>Try</span>
            {searchIdeas.map((idea) => (
              <button
                type="button"
                key={idea}
                disabled={loading}
                onClick={() => {
                  setQuery(idea)
                  runSearch(idea)
                }}
              >
                {idea}
              </button>
            ))}
          </div>
          <Button
            type="submit"
            disabled={loading || !query.trim()}
            className="outlier-search-button"
          >
            {loading ? <Loader2 className="animate-spin" /> : <BarChart3 />}
            {loading ? "Analyzing market..." : "Find outliers"}
          </Button>
        </div>

        {error && (
          <div className="outlier-error" role="alert">
            <p>{error}</p>
          </div>
        )}
      </form>

      <section className="tool-results outlier-results" aria-live="polite">
        <div className="outlier-results__header">
          <div>
            <p className="outlier-step">02</p>
            <h2>
              {loading
                ? "Calculating the benchmark"
                : searchedQuery
                  ? `Performance map for "${searchedQuery}"`
                  : "Outlier opportunities"}
            </h2>
            <p>
              {loading
                ? "Comparing reach, publishing velocity, and audience response."
                : videoList.length > 0
                  ? `${videoList.length} videos compared against this topic's result set.`
                  : "Run an analysis to see which videos outperform their peers."}
            </p>
          </div>
          {loading ? (
            <span className="outlier-results__status">
              <Loader2 aria-hidden="true" />
              Analyzing
            </span>
          ) : videoList.length > 0 ? (
            <span className="outlier-results__status outlier-results__status--ready">
              {breakoutCount} breakout{breakoutCount === 1 ? "" : "s"}
            </span>
          ) : null}
        </div>

        {loading ? (
          <OutlierSkeleton />
        ) : videoList.length > 0 ? (
          <>
            <div className="outlier-summary">
              <div>
                <span><Sparkles aria-hidden="true" /></span>
                <p>Breakout videos</p>
                <strong>{breakoutCount}</strong>
                <small>Statistically above the topic range</small>
              </div>
              <div>
                <span><Flame aria-hidden="true" /></span>
                <p>Fastest velocity</p>
                <strong>{fastestVideo?.viewsPerDay.toLocaleString() || "0"}</strong>
                <small>Views per day</small>
              </div>
              <div>
                <span><Gauge aria-hidden="true" /></span>
                <p>Top performance index</p>
                <strong>{strongestVideo?.smartScore.toFixed(2) || "0.00"}x</strong>
                <small>Relative opportunity signal</small>
              </div>
            </div>

            <div className="outlier-controls">
              <div className="outlier-filter" aria-label="Filter results">
                <button
                  type="button"
                  data-active={filter === "all"}
                  onClick={() => setFilter("all")}
                >
                  All videos
                </button>
                <button
                  type="button"
                  data-active={filter === "breakouts"}
                  onClick={() => setFilter("breakouts")}
                >
                  Breakouts only
                </button>
              </div>
              <label className="outlier-sort">
                <SlidersHorizontal aria-hidden="true" />
                <span className="sr-only">Sort videos</span>
                <select value={sort} onChange={(event) => setSort(event.target.value as ResultSort)}>
                  <option value="opportunity">Best opportunity</option>
                  <option value="velocity">Fastest velocity</option>
                  <option value="views">Most views</option>
                </select>
              </label>
            </div>

            {displayedVideos.length > 0 ? (
              <div className="outlier-grid">
                {displayedVideos.map((video, index) => (
                  <VideoCardOut key={video.id} video={video} rank={index + 1} />
                ))}
              </div>
            ) : (
              <div className="outlier-empty">
                <span><BarChart3 aria-hidden="true" /></span>
                <div>
                  <h3>No breakout videos in this sample</h3>
                  <p>Switch back to all videos or try a broader topic for a larger comparison set.</p>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="outlier-empty">
            <span><Gauge aria-hidden="true" /></span>
            <div>
              <h3>See the market before choosing the idea</h3>
              <p>
                Search a focused niche to rank videos by reach, velocity, engagement,
                and statistical distance from the typical result.
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
