"use client"

import { useEffect, useRef, useState } from "react"
import type { FormEvent } from "react"
import { GalleryThumbnails, Loader2, Search, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import ThumbnailSearchList from "./_components/thumbnail-search-list"

export type VideoInfo = {
  id: string
  title: string
  thumbnail: string
  channelTitle: string
  viewCount: string
  likeCount: string
  commentCount: string
  publishedAt: string
}

type SearchContext =
  | { type: "query"; label: string }
  | { type: "similar"; label: string; thumbnail: string; videoId: string }
  | null

const searchIdeas = [
  "Minimal desk setup",
  "AI productivity",
  "Cinematic travel",
]

export default function ThumbnailSearch() {
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [videoList, setVideoList] = useState<VideoInfo[]>([])
  const [error, setError] = useState("")
  const [hasSearched, setHasSearched] = useState(false)
  const [searchContext, setSearchContext] = useState<SearchContext>(null)
  const requestControllerRef = useRef<AbortController | null>(null)

  const runSearch = async (
    params: { query: string } | { thumbnailUrl: string; sourceTitle: string },
    context: Exclude<SearchContext, null>,
  ) => {
    const previousContext = searchContext
    requestControllerRef.current?.abort()
    const controller = new AbortController()
    requestControllerRef.current = controller

    setLoading(true)
    setError("")
    setHasSearched(true)
    setSearchContext(context)

    try {
      const requestUrl = new URL("/api/thumbnail-search", window.location.origin)
      Object.entries(params).forEach(([key, value]) => {
        requestUrl.searchParams.set(key, value)
      })
      const response = await fetch(requestUrl, { signal: controller.signal })
      const data = await response.json()

      if (!response.ok) throw new Error(data.error || "Thumbnail search failed.")
      if (!Array.isArray(data)) throw new Error("Search returned an invalid response.")
      setVideoList(data)
    } catch (requestError) {
      if (requestError instanceof DOMException && requestError.name === "AbortError") return
      if (context.type === "query") {
        setVideoList([])
      } else {
        setSearchContext(previousContext)
      }
      setError(
        requestError instanceof Error
          ? requestError.message
          : "We could not complete this search. Please try again.",
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
    const cleanQuery = query.trim()
    if (!cleanQuery || loading) return
    runSearch({ query: cleanQuery }, { type: "query", label: cleanQuery })
  }

  const searchIdea = (idea: string) => {
    setQuery(idea)
    runSearch({ query: idea }, { type: "query", label: idea })
  }

  const searchSimilarThumbnail = (video: VideoInfo) => {
    runSearch(
      { thumbnailUrl: video.thumbnail, sourceTitle: video.title },
      {
        type: "similar",
        label: video.title,
        thumbnail: video.thumbnail,
        videoId: video.id,
      },
    )
  }

  const clearSearch = () => {
    setQuery("")
    setError("")
  }

  useEffect(() => {
    return () => requestControllerRef.current?.abort()
  }, [])

  return (
    <div className="dashboard-page thumbnail-search-page">
      <header className="tool-page-header">
        <p className="tool-page-eyebrow">Research tool</p>
        <h1>Study what earns the click.</h1>
        <p className="tool-page-description">
          Search YouTube by topic, compare visual patterns, then use any result as
          the starting point for a similarity search.
        </p>
      </header>

      <form
        className="tool-panel thumbnail-search-form"
        aria-labelledby="thumbnail-search-title"
        onSubmit={onSearch}
      >
        <div className="thumbnail-search-form__header">
          <div>
            <p className="thumbnail-search-step">01</p>
            <h2 id="thumbnail-search-title">Choose a topic to explore</h2>
          </div>
          <span><GalleryThumbnails aria-hidden="true" /> YouTube research</span>
        </div>

        <div className="thumbnail-search-field">
          <label htmlFor="thumbnail-search-query">Topic or video idea</label>
          <div className="thumbnail-search-field__control">
            <Search aria-hidden="true" />
            <input
              id="thumbnail-search-query"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Example: budget filmmaking setup"
              autoComplete="off"
              required
            />
            {query && (
              <button
                type="button"
                onClick={clearSearch}
                aria-label="Clear search"
                title="Clear search"
              >
                <X aria-hidden="true" />
              </button>
            )}
          </div>
          <p>Use a focused phrase that describes the audience, topic, or visual niche.</p>
        </div>

        <div className="thumbnail-search-form__footer">
          <div className="thumbnail-search-ideas" aria-label="Suggested searches">
            <span>Try</span>
            {searchIdeas.map((idea) => (
              <button type="button" key={idea} onClick={() => searchIdea(idea)} disabled={loading}>
                {idea}
              </button>
            ))}
          </div>
          <Button
            type="submit"
            disabled={loading || !query.trim()}
            className="thumbnail-search-button"
          >
            {loading && searchContext?.type === "query" ? (
              <Loader2 className="animate-spin" />
            ) : (
              <Search />
            )}
            {loading && searchContext?.type === "query" ? "Searching..." : "Search thumbnails"}
          </Button>
        </div>

        {error && (
          <div className="thumbnail-search-error" role="alert">
            <p>{error}</p>
          </div>
        )}
      </form>

      <ThumbnailSearchList
        videoList={videoList}
        loading={loading}
        hasSearched={hasSearched}
        searchContext={searchContext}
        onSimilar={searchSimilarThumbnail}
      />
    </div>
  )
}
