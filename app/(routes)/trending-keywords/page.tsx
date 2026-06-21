"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  AlertCircle,
  BarChart3,
  Clock3,
  Info,
  Loader2,
  RefreshCw,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import type {
  TrendingKeywordsResponse,
  YouTubeCategory,
} from "@/lib/trending-keywords/types"
import { KeywordCard } from "./_components/keyword-card"
import {
  KeywordFilters,
  TREND_REGIONS,
} from "./_components/keyword-filters"

const DEFAULT_CATEGORIES: YouTubeCategory[] = [
  { id: "0", title: "All categories" },
]

function updatedLabel(generatedAt?: string) {
  if (!generatedAt) return ""
  const elapsedMinutes = Math.max(
    0,
    Math.floor((Date.now() - new Date(generatedAt).getTime()) / 60_000),
  )
  if (elapsedMinutes < 1) return "Updated just now"
  if (elapsedMinutes === 1) return "Updated 1 minute ago"
  if (elapsedMinutes < 60) return `Updated ${elapsedMinutes} minutes ago`
  const hours = Math.floor(elapsedMinutes / 60)
  return `Updated ${hours} hour${hours === 1 ? "" : "s"} ago`
}

function TrendSkeleton() {
  return (
    <div className="trend-grid" aria-label="Loading trend signals">
      {Array.from({ length: 6 }).map((_, index) => (
        <div className="trend-card trend-card--skeleton" key={index}>
          <Skeleton className="h-6 w-28" />
          <Skeleton className="h-9 w-3/4" />
          <div className="grid grid-cols-3 gap-3">
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
          </div>
          <Skeleton className="h-44 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ))}
    </div>
  )
}

export default function TrendingKeywordsPage() {
  const [region, setRegion] = useState("IN")
  const [category, setCategory] = useState("0")
  const [appliedRegion, setAppliedRegion] = useState("IN")
  const [appliedCategory, setAppliedCategory] = useState("0")
  const [search, setSearch] = useState("")
  const [data, setData] = useState<TrendingKeywordsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [ready, setReady] = useState(false)
  const [, setClockTick] = useState(0)
  const requestRef = useRef<AbortController | null>(null)

  useEffect(() => {
    const savedRegion = window.localStorage.getItem("trending-keywords-region")
    if (TREND_REGIONS.some((item) => item.code === savedRegion)) {
      setRegion(savedRegion as string)
      setAppliedRegion(savedRegion as string)
    }
    setReady(true)
  }, [])

  useEffect(() => {
    const interval = window.setInterval(
      () => setClockTick((value) => value + 1),
      60_000,
    )
    return () => window.clearInterval(interval)
  }, [])

  const loadTrends = useCallback(async () => {
    requestRef.current?.abort()
    const controller = new AbortController()
    requestRef.current = controller
    setLoading(true)
    setError("")

    try {
      const url = new URL("/api/trending-keywords", window.location.origin)
      url.searchParams.set("region", appliedRegion)
      url.searchParams.set("category", appliedCategory)
      const response = await fetch(url, {
        cache: "no-store",
        signal: controller.signal,
      })
      const payload = await response.json()

      if (!response.ok) {
        throw new Error(payload.error || "Trend signals could not be loaded.")
      }
      setData(payload as TrendingKeywordsResponse)
    } catch (requestError) {
      if (
        requestError instanceof DOMException &&
        requestError.name === "AbortError"
      ) {
        return
      }
      setData(null)
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Trend signals are temporarily unavailable.",
      )
    } finally {
      if (requestRef.current === controller) {
        setLoading(false)
        requestRef.current = null
      }
    }
  }, [appliedCategory, appliedRegion])

  useEffect(() => {
    if (!ready) return
    loadTrends()
    return () => requestRef.current?.abort()
  }, [loadTrends, ready])

  const applyFilters = () => {
    if (loading) return
    window.localStorage.setItem("trending-keywords-region", region)
    setAppliedRegion(region)
    setAppliedCategory(category)
  }

  const changeRegion = (nextRegion: string) => {
    setRegion(nextRegion)
    setCategory("0")
  }

  const displayedKeywords = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase()
    if (!normalizedSearch) return data?.keywords ?? []
    return (data?.keywords ?? []).filter((keyword) =>
      keyword.phrase.toLocaleLowerCase().includes(normalizedSearch),
    )
  }, [data, search])

  const displayedRegion = data?.region ?? appliedRegion
  const displayedCategory = data?.category ?? appliedCategory
  const regionName =
    TREND_REGIONS.find((item) => item.code === displayedRegion)?.name ??
    displayedRegion
  const categoryName =
    data?.categories.find((item) => item.id === displayedCategory)?.title ??
    (displayedCategory === "0"
      ? "All categories"
      : `Category ${displayedCategory}`)
  const hasPendingChanges =
    region !== appliedRegion || category !== appliedCategory

  return (
    <div className="dashboard-page trending-page">
      <header className="tool-page-header">
        <p className="tool-page-eyebrow">Research tool</p>
        <h1>Find the topics moving through YouTube now.</h1>
        <p className="tool-page-description">
          Explore keywords inferred from popular-video titles and public tags,
          with the source videos kept visible behind every trend signal.
        </p>
      </header>

      <KeywordFilters
        region={region}
        category={category}
        search={search}
        categories={data?.categories ?? DEFAULT_CATEGORIES}
        disabled={!ready}
        loading={loading}
        hasPendingChanges={hasPendingChanges}
        onRegionChange={changeRegion}
        onCategoryChange={setCategory}
        onSearchChange={setSearch}
        onApply={applyFilters}
      />

      <section className="tool-results trend-results" aria-live="polite">
        <div className="trend-results__header">
          <div>
            <p className="trend-step">02</p>
            <h2>Trend signals for {regionName}</h2>
            <p>
              {categoryName} / Current chart
              {data?.generatedAt ? ` / ${updatedLabel(data.generatedAt)}` : ""}
            </p>
          </div>
          {loading ? (
            <span className="trend-results__status">
              <Loader2 aria-hidden="true" />
              Refreshing chart
            </span>
          ) : data ? (
            <span className="trend-results__status trend-results__status--ready">
              <BarChart3 aria-hidden="true" />
              {data.keywords.length} topics ranked
            </span>
          ) : null}
        </div>

        {data?.warning && (
          <div className="trend-warning" role="status">
            <Clock3 aria-hidden="true" />
            <p>{data.warning}</p>
          </div>
        )}

        {data && (
          <div
            className="trend-history-notice"
            data-available={data.historyAvailable}
            role="status"
          >
            <Clock3 aria-hidden="true" />
            <p>{data.historyMessage}</p>
          </div>
        )}

        {error && (
          <div className="trend-error" role="alert">
            <AlertCircle aria-hidden="true" />
            <div>
              <h3>Trend signals are unavailable</h3>
              <p>{error}</p>
            </div>
            <Button type="button" onClick={loadTrends}>
              <RefreshCw />
              Try again
            </Button>
          </div>
        )}

        {loading ? (
          <TrendSkeleton />
        ) : displayedKeywords.length > 0 ? (
          <div className="trend-grid">
            {displayedKeywords.map((keyword, index) => (
              <KeywordCard
                keyword={keyword}
                rank={(data?.keywords.indexOf(keyword) ?? index) + 1}
                key={keyword.phrase}
              />
            ))}
          </div>
        ) : data && !error ? (
          <div className="trend-empty">
            <BarChart3 aria-hidden="true" />
            <div>
              <h3>{search ? "No topics match this filter" : "No repeatable topics found"}</h3>
              <p>
                {search
                  ? "Clear the result filter or try a broader phrase."
                  : "Try another category or region to inspect a different popular-video chart."}
              </p>
            </div>
          </div>
        ) : null}

        <aside className="trend-method">
          <Info aria-hidden="true" />
          <div>
            <h3>How the trend score works</h3>
            <p>
              The 0-100 score combines measured view growth when snapshots are
              available, freshness, engagement, chart position, and the number
              of different source videos using the phrase. Before a second
              snapshot exists, lifetime video velocity is used as a temporary
              fallback. This remains a product heuristic, not YouTube search
              volume, keyword difficulty, or a guarantee of future performance.
            </p>
          </div>
        </aside>
      </section>
    </div>
  )
}
