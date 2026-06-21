"use client"

import type { FormEvent } from "react"
import { Loader2, Search, SlidersHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import type { YouTubeCategory } from "@/lib/trending-keywords/types"

export const TREND_REGIONS = [
  { code: "IN", name: "India" },
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
  { code: "CA", name: "Canada" },
  { code: "AU", name: "Australia" },
] as const

type KeywordFiltersProps = {
  region: string
  category: string
  search: string
  categories: YouTubeCategory[]
  disabled: boolean
  loading: boolean
  hasPendingChanges: boolean
  onRegionChange: (value: string) => void
  onCategoryChange: (value: string) => void
  onSearchChange: (value: string) => void
  onApply: () => void
}

export function KeywordFilters({
  region,
  category,
  search,
  categories,
  disabled,
  loading,
  hasPendingChanges,
  onRegionChange,
  onCategoryChange,
  onSearchChange,
  onApply,
}: KeywordFiltersProps) {
  const submitFilters = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onApply()
  }

  return (
    <form
      className="tool-panel trend-filters"
      aria-labelledby="trend-filter-title"
      onSubmit={submitFilters}
    >
      <div className="trend-filters__header">
        <div>
          <p className="trend-step">01</p>
          <h2 id="trend-filter-title">Set the chart context</h2>
        </div>
        <span>Current chart</span>
      </div>

      <div className="trend-filters__grid">
        <label>
          <span>Country or region</span>
          <select
            value={region}
            disabled={disabled}
            onChange={(event) => onRegionChange(event.target.value)}
          >
            {TREND_REGIONS.map((item) => (
              <option value={item.code} key={item.code}>{item.name}</option>
            ))}
          </select>
        </label>

        <label>
          <span>YouTube category</span>
          <select
            value={category}
            disabled={disabled}
            onChange={(event) => onCategoryChange(event.target.value)}
          >
            {categories.map((item) => (
              <option value={item.id} key={item.id}>{item.title}</option>
            ))}
          </select>
        </label>

        <label className="trend-filters__search">
          <span>Filter returned topics</span>
          <div>
            <Search aria-hidden="true" />
            <input
              type="search"
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search these results"
              autoComplete="off"
            />
          </div>
        </label>
      </div>

      <div className="trend-filters__footer">
        <p>
          {hasPendingChanges
            ? "Apply the selected chart filters to refresh the evidence set."
            : "The displayed chart matches these region and category filters."}
        </p>
        <Button
          type="submit"
          disabled={disabled || loading || !hasPendingChanges}
          className="trend-filter-button"
        >
          {loading ? <Loader2 className="animate-spin" /> : <SlidersHorizontal />}
          {loading
            ? "Loading chart..."
            : hasPendingChanges
              ? "Apply filters"
              : "Filters applied"}
        </Button>
      </div>
    </form>
  )
}
