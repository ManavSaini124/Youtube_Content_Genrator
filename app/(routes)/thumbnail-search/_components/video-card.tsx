"use client"

import Image from "next/image"
import {
  ArrowUpRight,
  CalendarDays,
  Eye,
  Loader2,
  MessageCircle,
  ScanSearch,
  ThumbsUp,
} from "lucide-react"

import type { VideoInfo } from "../page"

type Props = {
  video: VideoInfo
  onSimilar: (video: VideoInfo) => void
  similarLoading: boolean
  searchDisabled: boolean
}

const compactNumber = new Intl.NumberFormat("en", {
  notation: "compact",
  maximumFractionDigits: 1,
})

const shortDate = new Intl.DateTimeFormat("en", {
  month: "short",
  year: "numeric",
})

function formatCount(value: string) {
  const count = Number(value)
  return Number.isFinite(count) ? compactNumber.format(count) : "0"
}

function formatDate(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? "Unknown date" : shortDate.format(date)
}

export default function VideoCard({
  video,
  onSimilar,
  similarLoading,
  searchDisabled,
}: Props) {
  return (
    <article className="thumbnail-search-card">
      <a
        className="thumbnail-search-card__media"
        href={`https://www.youtube.com/watch?v=${video.id}`}
        target="_blank"
        rel="noreferrer"
        aria-label={`Open ${video.title} on YouTube`}
      >
        <Image
          src={video.thumbnail}
          alt=""
          fill
          sizes="(min-width: 1024px) 30vw, (min-width: 640px) 50vw, 100vw"
        />
        <span>
          View on YouTube
          <ArrowUpRight aria-hidden="true" />
        </span>
      </a>

      <div className="thumbnail-search-card__body">
        <div>
          <h3>{video.title}</h3>
          <p>{video.channelTitle}</p>
        </div>

        <dl className="thumbnail-search-card__metrics">
          <div title="Views">
            <dt><Eye aria-hidden="true" /><span className="sr-only">Views</span></dt>
            <dd>{formatCount(video.viewCount)}</dd>
          </div>
          <div title="Likes">
            <dt><ThumbsUp aria-hidden="true" /><span className="sr-only">Likes</span></dt>
            <dd>{formatCount(video.likeCount)}</dd>
          </div>
          {video.commentCount && (
            <div title="Comments">
              <dt><MessageCircle aria-hidden="true" /><span className="sr-only">Comments</span></dt>
              <dd>{formatCount(video.commentCount)}</dd>
            </div>
          )}
          <div title="Published">
            <dt><CalendarDays aria-hidden="true" /><span className="sr-only">Published</span></dt>
            <dd>{formatDate(video.publishedAt)}</dd>
          </div>
        </dl>

        <button
          className="thumbnail-search-card__similar"
          type="button"
          onClick={() => onSimilar(video)}
          disabled={searchDisabled}
        >
          {similarLoading ? <Loader2 aria-hidden="true" /> : <ScanSearch aria-hidden="true" />}
          {similarLoading ? "Finding similar..." : "Find similar thumbnails"}
        </button>
      </div>
    </article>
  )
}
