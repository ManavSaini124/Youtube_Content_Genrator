"use client"

import { useEffect, useRef, useState } from "react"
import type { FormEvent } from "react"
import { FileText, Loader2, Sparkles } from "lucide-react"
import axios from "axios"

import { Button } from "@/components/ui/button"
import ContentDisplay from "./_components/Content-display"

export type GeneratedTitle = {
  seo_score: number
  title: string
}

export type ImagePrompt = {
  heading: string
  prompt: string
}

export type GeneratedContent = {
  description: string
  image_prompts: ImagePrompt[]
  tags: string[]
  titles: GeneratedTitle[]
}

export type Content = {
  id: string
  thumbnailUrl: string
  content: GeneratedContent
  userInput: string
  createdAt: string
}

export default function AiContentGenerator() {
  const [brief, setBrief] = useState("")
  const [loading, setLoading] = useState(false)
  const [content, setContent] = useState<Content | null>(null)
  const [error, setError] = useState("")
  const [eventId, setEventId] = useState<string | null>(null)

  const isGenerating = useRef(false)
  const pollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pollAbortRef = useRef<AbortController | null>(null)

  const onGenerate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isGenerating.current || loading || !brief.trim()) return

    isGenerating.current = true
    setLoading(true)
    setError("")
    setContent(null)
    setEventId(null)

    try {
      const result = await axios.post("/api/ai-content-generator", {
        userInput: brief.trim(),
      })

      if (!result.data.runId) throw new Error("The generation job did not start.")
      setEventId(result.data.runId)
    } catch (requestError) {
      console.error("Error starting content generation:", requestError)
      setError("We could not start your content kit. Check your connection and try again.")
      setLoading(false)
      isGenerating.current = false
    }
  }

  useEffect(() => {
    if (!eventId) return
    let active = true

    const finishWithError = (message: string) => {
      if (!active) return
      setError(message)
      setLoading(false)
      isGenerating.current = false
    }

    const pollRunStatus = async () => {
      pollAbortRef.current = new AbortController()

      try {
        const response = await fetch(`/api/run-status?id=${eventId}`, {
          signal: pollAbortRef.current.signal,
        })
        const data = await response.json()
        if (!response.ok) throw new Error(data.error || "Failed to fetch run status")

        const status = data.status?.[0]
        if (status?.status === "Completed") {
          if (!active) return
          const generatedContent = status.output?.[0]
          if (!generatedContent?.content) {
            finishWithError("The job finished without content. Please try again.")
            return
          }

          setContent(generatedContent)
          setLoading(false)
          isGenerating.current = false
          return
        }

        if (status?.status === "Cancelled" || status?.status === "Failed") {
          finishWithError("This generation did not complete. Please try again.")
          return
        }

        if (active) pollTimeoutRef.current = setTimeout(pollRunStatus, 1000)
      } catch (pollError) {
        if (!active || (pollError instanceof DOMException && pollError.name === "AbortError")) {
          return
        }
        console.error("Error fetching content run status:", pollError)
        finishWithError("We lost contact with the generation job. Please try again.")
      }
    }

    pollRunStatus()

    return () => {
      active = false
      pollAbortRef.current?.abort()
      if (pollTimeoutRef.current) clearTimeout(pollTimeoutRef.current)
    }
  }, [eventId])

  return (
    <div className="dashboard-page content-page">
      <header className="tool-page-header">
        <p className="tool-page-eyebrow">Creator tool</p>
        <h1>Turn one idea into a launch-ready video.</h1>
        <p className="tool-page-description">
          Start with a clear topic and get ranked titles, a polished description,
          search tags, thumbnail directions, and a generated visual.
        </p>
      </header>

      <form
        className="tool-panel content-brief"
        aria-labelledby="content-brief-title"
        onSubmit={onGenerate}
      >
        <div className="content-brief__header">
          <div>
            <p className="content-step">01</p>
            <h2 id="content-brief-title">Set the creative direction</h2>
          </div>
          <div className="content-brief__deliverables" aria-label="Generated deliverables">
            <span><FileText aria-hidden="true" /> Titles</span>
            <span>Description</span>
            <span>Tags</span>
            <span>Thumbnail</span>
          </div>
        </div>

        <div className="content-field">
          <label htmlFor="content-idea">Video idea</label>
          <textarea
            id="content-idea"
            value={brief}
            onChange={(event) => setBrief(event.target.value)}
            placeholder="Example: A practical beginner's guide to building a cinematic home studio on a small budget"
            maxLength={800}
            required
          />
          <div className="content-field__meta">
            <span>Include the audience, angle, desired outcome, and tone when relevant.</span>
            <span>{brief.length}/800</span>
          </div>
        </div>

        {error && (
          <div className="content-error" role="alert">
            <p>{error}</p>
          </div>
        )}

        <div className="content-brief__footer">
          <p>Generation may take a minute while the copy and thumbnail are prepared.</p>
          <Button
            type="submit"
            disabled={loading || !brief.trim()}
            className="content-generate-button"
          >
            {loading ? <Loader2 className="animate-spin" /> : <Sparkles />}
            {loading ? "Building content kit..." : "Generate content kit"}
          </Button>
        </div>
      </form>

      <ContentDisplay content={content} loading={loading} />
    </div>
  )
}
