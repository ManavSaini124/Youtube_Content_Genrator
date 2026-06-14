"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { ArrowUpRight, Images } from "lucide-react"
import axios from "axios"

import { Skeleton } from "@/components/ui/skeleton"

type Thumbnail = {
  id: number
  thumbnailUrl: string
  refImage: string
  userInput: string
}

type ThumbnailListProps = {
  refreshKey?: number
}

export default function ThumbnailList({ refreshKey = 0 }: ThumbnailListProps) {
  const [thumbnails, setThumbnails] = useState<Thumbnail[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const controller = new AbortController()

    const loadThumbnails = async () => {
      try {
        setLoading(true)
        setError("")
        const result = await axios.get("/api/generate-thumbnail", {
          signal: controller.signal,
        })
        setThumbnails(result.data)
      } catch (requestError) {
        if (axios.isCancel(requestError)) return
        console.error("Error fetching thumbnails:", requestError)
        setError("Your previous thumbnails could not be loaded.")
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }

    loadThumbnails()
    return () => controller.abort()
  }, [refreshKey])

  return (
    <section className="tool-results thumbnail-history" aria-live="polite">
      <div className="thumbnail-history__header">
        <div>
          <p className="tool-page-eyebrow">Your library</p>
          <h2>Recent thumbnails</h2>
          <p>Revisit earlier concepts or open a full-resolution image.</p>
        </div>
        {!loading && thumbnails.length > 0 && (
          <span>{thumbnails.length} saved</span>
        )}
      </div>

      {error && <p className="thumbnail-history__error">{error}</p>}

      {loading ? (
        <div className="thumbnail-history__grid" aria-label="Loading saved thumbnails">
          {Array.from({ length: 3 }).map((_, index) => (
            <div className="thumbnail-history__skeleton" key={index}>
              <Skeleton className="aspect-video w-full rounded-none" />
              <div>
                <Skeleton className="h-3 w-5/6" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : thumbnails.length === 0 && !error ? (
        <div className="thumbnail-history__empty">
          <span><Images aria-hidden="true" /></span>
          <div>
            <h3>No thumbnails yet</h3>
            <p>Your generated work will collect here automatically.</p>
          </div>
        </div>
      ) : (
        <div className="thumbnail-history__grid">
          {thumbnails.map((thumbnail) =>
            thumbnail.thumbnailUrl ? (
              <a
                className="thumbnail-history__card"
                key={thumbnail.id}
                href={thumbnail.thumbnailUrl}
                target="_blank"
                rel="noreferrer"
              >
                <div className="thumbnail-history__image">
                  <Image
                    src={thumbnail.thumbnailUrl}
                    fill
                    sizes="(min-width: 1024px) 30vw, (min-width: 640px) 50vw, 100vw"
                    alt={thumbnail.userInput || "Generated YouTube thumbnail"}
                  />
                </div>
                <div className="thumbnail-history__body">
                  <p>{thumbnail.userInput || "Generated thumbnail"}</p>
                  <ArrowUpRight aria-hidden="true" />
                </div>
              </a>
            ) : null,
          )}
        </div>
      )}
    </section>
  )
}
