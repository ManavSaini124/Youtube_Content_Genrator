import Image from "next/image"
import Link from "next/link"
import {
  ArrowUpRight,
  BarChart3,
  Flame,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Zap,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import type { TrendingKeyword } from "@/lib/trending-keywords/types"
import { MomentumChart } from "./momentum-chart"

type KeywordCardProps = {
  keyword: TrendingKeyword
  rank: number
}

function formatCompact(value: number) {
  return new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value)
}

export function KeywordCard({ keyword, rank }: KeywordCardProps) {
  const youtubeUrl = keyword.videos[0]
    ? `https://www.youtube.com/watch?v=${keyword.videos[0].id}`
    : `https://www.youtube.com/results?search_query=${encodeURIComponent(keyword.phrase)}`
  const googleTrendsUrl =
    `https://trends.google.com/trends/explore?gprop=youtube&q=${encodeURIComponent(keyword.phrase)}`
  const statusIcon =
    keyword.status === "Hot"
      ? <Flame />
      : keyword.status === "Falling"
        ? <TrendingDown />
        : keyword.status === "Rising faster"
          ? <Zap />
          : <TrendingUp />

  return (
    <article className="trend-card">
      <div className="trend-card__topline">
        <span className="trend-card__rank">#{rank}</span>
        <span className="trend-card__status" data-status={keyword.status.toLowerCase()}>
          {statusIcon}
          {keyword.status}
        </span>
        {keyword.breakout && <span className="trend-card__breakout">Breakout signal</span>}
      </div>

      <div className="trend-card__heading">
        <div>
          <p>Trending topic</p>
          <h3>{keyword.phrase}</h3>
          <span>{keyword.topCategory}</span>
        </div>
        <div className="trend-card__score" aria-label={`Trend score ${keyword.trendScore} out of 100`}>
          <strong>{keyword.trendScore}</strong>
          <span>/100</span>
        </div>
      </div>

      <dl className="trend-card__metrics">
        <div>
          <dt>Source videos</dt>
          <dd>{keyword.sourceVideoCount}</dd>
        </div>
        <div>
          <dt>Combined views</dt>
          <dd>{formatCompact(keyword.combinedViews)}</dd>
        </div>
        <div>
          <dt>Avg. views/day</dt>
          <dd>{formatCompact(keyword.averageViewsPerDay)}</dd>
        </div>
      </dl>

      <div className="trend-card__momentum">
        <div className="trend-card__momentum-copy">
          <span>Measured momentum</span>
          <strong>
            {keyword.measuredViewsPerHour === null
              ? "Collecting snapshots"
              : `${formatCompact(keyword.measuredViewsPerHour)} views/hour`}
          </strong>
          <small>
            {keyword.velocityChangePercent === null
              ? "Acceleration appears after three collection points."
              : `${keyword.velocityChangePercent > 0 ? "+" : ""}${keyword.velocityChangePercent}% versus the previous interval`}
          </small>
        </div>
        <div className="trend-card__charts">
          <MomentumChart label="24 hours" points={keyword.history24h} />
          <MomentumChart label="7 days" points={keyword.history7d} />
        </div>
      </div>

      <div className="trend-card__evidence">
        <div className="trend-card__evidence-title">
          <BarChart3 aria-hidden="true" />
          <span>Evidence from the chart</span>
        </div>
        <ol>
          {keyword.videos.map((video) => (
            <li key={video.id}>
              <a
                href={`https://www.youtube.com/watch?v=${video.id}`}
                target="_blank"
                rel="noreferrer"
              >
                <Image
                  src={video.thumbnail}
                  alt=""
                  width={120}
                  height={68}
                  sizes="72px"
                />
                <span>
                  <strong>{video.title}</strong>
                  <small>{video.channelTitle} / {formatCompact(video.viewCount)} views</small>
                </span>
                <ArrowUpRight aria-hidden="true" />
              </a>
            </li>
          ))}
        </ol>
      </div>

      <div className="trend-card__actions">
        <Button asChild className="trend-card__primary-action">
          <Link href={`/ai-content-generator?topic=${encodeURIComponent(keyword.phrase)}`}>
            
            Use in content generator
          </Link>
        </Button>
        <a href={youtubeUrl} target="_blank" rel="noreferrer">
          Open on YouTube <ArrowUpRight aria-hidden="true" />
        </a>
        <a href={googleTrendsUrl} target="_blank" rel="noreferrer">
          Check in Google Trends <ArrowUpRight aria-hidden="true" />
        </a>
      </div>
    </article>
  )
}
