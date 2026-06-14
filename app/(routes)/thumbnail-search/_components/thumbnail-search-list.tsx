"use client"

import Image from "next/image"
import { GalleryThumbnails, Loader2, SearchX } from "lucide-react"

import { Skeleton } from "@/components/ui/skeleton"
import type { VideoInfo } from "../page"
import VideoCard from "./video-card"

type SearchContext =
  | { type: "query"; label: string }
  | { type: "similar"; label: string; thumbnail: string; videoId: string }
  | null

type Props = {
  videoList: VideoInfo[]
  loading: boolean
  hasSearched: boolean
  searchContext: SearchContext
  onSimilar: (video: VideoInfo) => void
}

function ResultsSkeleton() {
  return (
    <div className="thumbnail-search-grid" aria-label="Loading thumbnail results">
      {Array.from({ length: 6 }).map((_, index) => (
        <div className="thumbnail-search-skeleton" key={index}>
          <Skeleton className="aspect-video w-full rounded-none" />
          <div>
            <Skeleton className="h-4 w-11/12" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-2/5" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      ))}
    </div>
  )
}

export default function ThumbnailSearchList({
  videoList,
  loading,
  hasSearched,
  searchContext,
  onSimilar,
}: Props) {
  const similarityLoading =
    loading && searchContext?.type === "similar" && videoList.length > 0
  const resultLabel = searchContext?.type === "similar"
    ? "Visually similar thumbnails"
    : searchContext?.label
      ? `Results for "${searchContext.label}"`
      : "Thumbnail results"

  return (
    <section className="tool-results thumbnail-search-results" aria-live="polite">
      <div className="thumbnail-search-results__header">
        <div>
          <p className="thumbnail-search-step">02</p>
          <h2>{loading ? "Finding strong references" : resultLabel}</h2>
          <p>
            {loading
              ? "Reviewing relevant videos and gathering their performance signals."
              : videoList.length > 0
                ? `${videoList.length} references ready to compare.`
                : "Search results will appear here."}
          </p>
        </div>

        {loading ? (
          <span className="thumbnail-search-results__status">
            <Loader2 aria-hidden="true" />
            Searching
          </span>
        ) : videoList.length > 0 ? (
          <span className="thumbnail-search-results__status thumbnail-search-results__status--ready">
            {videoList.length} found
          </span>
        ) : null}
      </div>

      {searchContext?.type === "similar" && (
        <div className="thumbnail-search-source">
          <div className="thumbnail-search-source__image">
            <Image src={searchContext.thumbnail} fill sizes="96px" alt="" />
          </div>
          <div>
            <span>{loading ? "Searching from this visual" : "Visual search source"}</span>
            <p>{searchContext.label}</p>
          </div>
        </div>
      )}

      {loading && !similarityLoading ? (
        <ResultsSkeleton />
      ) : videoList.length > 0 ? (
        <div className="thumbnail-search-grid" aria-busy={similarityLoading}>
          {videoList.map((video) => (
            <VideoCard
              key={video.id}
              video={video}
              onSimilar={onSimilar}
              similarLoading={
                searchContext?.type === "similar" && searchContext.videoId === video.id
              }
              searchDisabled={loading}
            />
          ))}
        </div>
      ) : hasSearched ? (
        <div className="thumbnail-search-empty">
          <span><SearchX aria-hidden="true" /></span>
          <div>
            <h3>No matching videos found</h3>
            <p>Try a broader phrase, remove niche terms, or search from another thumbnail.</p>
          </div>
        </div>
      ) : (
        <div className="thumbnail-search-empty">
          <span><GalleryThumbnails aria-hidden="true" /></span>
          <div>
            <h3>Build your reference board</h3>
            <p>
              Start with a topic above. Each result can open on YouTube or become the
              source for a new visual similarity search.
            </p>
          </div>
        </div>
      )}
    </section>
  )
}
