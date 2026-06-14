"use client"

import Image from "next/image"
import {
  ArrowUpRight,
  CalendarDays,
  Eye,
  Flame,
  Gauge,
  MessageCircle,
  ThumbsUp,
} from "lucide-react"

import type { VideoInfoOutlier } from "../page"

type Props = {
  video: VideoInfoOutlier
  rank: number
}

const compactNumber = new Intl.NumberFormat("en", {
  notation: "compact",
  maximumFractionDigits: 1,
})

const shortDate = new Intl.DateTimeFormat("en", {
  month: "short",
  year: "numeric",
})

function formatDate(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? "Unknown date" : shortDate.format(date)
}

export default function VideoCardOut({ video, rank }: Props) {
  const breakout = video.outlierDirection === "high"

  return (
    <article className="outlier-card" data-breakout={breakout}>
      <a
        className="outlier-card__media"
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
        <span className="outlier-card__rank">#{rank}</span>
        {breakout && (
          <span className="outlier-card__badge">
            <Flame aria-hidden="true" />
            Breakout
          </span>
        )}
        <span className="outlier-card__open">
          View on YouTube
          <ArrowUpRight aria-hidden="true" />
        </span>
      </a>

      <div className="outlier-card__body">
        <div className="outlier-card__title">
          <h3>{video.title}</h3>
          <p>{video.channelTitle}</p>
        </div>

        <div className="outlier-card__signal">
          <div>
            <span>Performance index</span>
            <strong>{video.smartScore.toFixed(2)}x</strong>
          </div>
          <div className="outlier-card__meter" aria-hidden="true">
            <span style={{ transform: `scaleX(${Math.min(video.smartScore / 3, 1)})` }} />
          </div>
          <p>
            {breakout
              ? `${video.outlierScore.toFixed(2)} IQR above the expected range`
              : video.outlierDirection === "low"
                ? `${video.outlierScore.toFixed(2)} IQR below the expected range`
                : "Within the expected topic range"}
          </p>
        </div>

        <dl className="outlier-card__metrics">
          <div>
            <dt><Eye aria-hidden="true" /> Views</dt>
            <dd>{compactNumber.format(video.viewCount)}</dd>
          </div>
          <div>
            <dt><Flame aria-hidden="true" /> Daily</dt>
            <dd>{compactNumber.format(video.viewsPerDay)}</dd>
          </div>
          <div>
            <dt><Gauge aria-hidden="true" /> Engagement</dt>
            <dd>{video.engagementRate.toFixed(2)}%</dd>
          </div>
          <div>
            <dt><CalendarDays aria-hidden="true" /> Published</dt>
            <dd>{formatDate(video.publishedAt)}</dd>
          </div>
        </dl>

        <div className="outlier-card__social">
          <span><ThumbsUp aria-hidden="true" /> {compactNumber.format(video.likeCount)}</span>
          <span><MessageCircle aria-hidden="true" /> {compactNumber.format(video.commentCount)}</span>
        </div>
      </div>
    </article>
  )
}
