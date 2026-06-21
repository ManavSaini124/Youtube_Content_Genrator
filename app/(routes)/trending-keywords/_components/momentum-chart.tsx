import type { TrendHistoryPoint } from "@/lib/trending-keywords/types"

type MomentumChartProps = {
  label: string
  points: TrendHistoryPoint[]
}

function chartPoints(points: TrendHistoryPoint[]) {
  if (points.length === 0) return ""
  const values = points.map((point) => point.combinedViews)
  const minimum = Math.min(...values)
  const maximum = Math.max(...values)
  const range = Math.max(maximum - minimum, 1)

  return points
    .map((point, index) => {
      const x = points.length === 1 ? 50 : (index / (points.length - 1)) * 100
      const y = 30 - ((point.combinedViews - minimum) / range) * 26
      return `${x},${y}`
    })
    .join(" ")
}

export function MomentumChart({ label, points }: MomentumChartProps) {
  const polyline = chartPoints(points)
  const hasHistory = points.length >= 2

  return (
    <div className="trend-momentum-chart">
      <div>
        <span>{label}</span>
        <small>{hasHistory ? `${points.length} snapshots` : "Collecting"}</small>
      </div>
      <svg
        viewBox="0 0 100 32"
        role="img"
        aria-label={
          hasHistory
            ? `${label} combined view history`
            : `${label} history needs another snapshot`
        }
        preserveAspectRatio="none"
      >
        <path d="M0 30 H100" />
        {polyline && <polyline points={polyline} />}
      </svg>
    </div>
  )
}

