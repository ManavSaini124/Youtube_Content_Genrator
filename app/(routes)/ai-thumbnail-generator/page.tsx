"use client"

import { useEffect, useRef, useState } from "react"
import type { ChangeEvent, FormEvent } from "react"
import Image from "next/image"
import {
  ArrowUpRight,
  ImagePlus,
  Loader2,
  Sparkles,
  Upload,
  UserRound,
  X,
} from "lucide-react"
import axios from "axios"

import { Button } from "@/components/ui/button"
import ThumbnailList from "./_components/ThumbnailList"

type UploadKind = "reference" | "portrait"

type UploadFieldProps = {
  accept: string
  description: string
  icon: typeof ImagePlus
  id: string
  label: string
  preview: string
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
  onRemove: () => void
}

function UploadField({
  accept,
  description,
  icon: Icon,
  id,
  label,
  preview,
  onChange,
  onRemove,
}: UploadFieldProps) {
  return (
    <div className="thumbnail-upload">
      <div className="thumbnail-upload__heading">
        <div>
          <label htmlFor={id}>{label}</label>
          <p>{description}</p>
        </div>
        <span>Optional</span>
      </div>

      {preview ? (
        <div className="thumbnail-upload__preview">
          {/* Blob URLs are local-only, so next/image optimization does not apply. */}
          <img src={preview} alt={`${label} preview`} />
          <button type="button" onClick={onRemove} aria-label={`Remove ${label.toLowerCase()}`}>
            <X aria-hidden="true" />
          </button>
        </div>
      ) : (
        <label className="thumbnail-upload__dropzone" htmlFor={id}>
          <span className="thumbnail-upload__icon">
            <Icon aria-hidden="true" />
          </span>
          <span>
            <strong>Choose an image</strong>
            <small>JPG or PNG</small>
          </span>
          <Upload aria-hidden="true" />
        </label>
      )}

      <input
        id={id}
        className="sr-only"
        type="file"
        accept={accept}
        onChange={onChange}
      />
    </div>
  )
}

export default function AiThumbnailGenerator() {
  const [brief, setBrief] = useState("")
  const [referenceImage, setReferenceImage] = useState<File | null>(null)
  const [portraitImage, setPortraitImage] = useState<File | null>(null)
  const [referencePreview, setReferencePreview] = useState("")
  const [portraitPreview, setPortraitPreview] = useState("")
  const [loading, setLoading] = useState(false)
  const [outputUrl, setOutputUrl] = useState("")
  const [eventId, setEventId] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [historyVersion, setHistoryVersion] = useState(0)

  const isGenerating = useRef(false)
  const pollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pollAbortRef = useRef<AbortController | null>(null)

  const updateUpload = (kind: UploadKind, event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!["image/jpeg", "image/png"].includes(file.type)) {
      setError("Please upload a JPG or PNG image.")
      event.target.value = ""
      return
    }

    setError("")
    const previewUrl = URL.createObjectURL(file)

    if (kind === "reference") {
      if (referencePreview) URL.revokeObjectURL(referencePreview)
      setReferenceImage(file)
      setReferencePreview(previewUrl)
    } else {
      if (portraitPreview) URL.revokeObjectURL(portraitPreview)
      setPortraitImage(file)
      setPortraitPreview(previewUrl)
    }
  }

  const removeUpload = (kind: UploadKind) => {
    if (kind === "reference") {
      if (referencePreview) URL.revokeObjectURL(referencePreview)
      setReferenceImage(null)
      setReferencePreview("")
    } else {
      if (portraitPreview) URL.revokeObjectURL(portraitPreview)
      setPortraitImage(null)
      setPortraitPreview("")
    }
  }

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isGenerating.current || loading || !brief.trim()) return

    isGenerating.current = true
    setLoading(true)
    setError("")
    setOutputUrl("")
    setEventId(null)

    try {
      const formData = new FormData()
      formData.append("userInput", brief.trim())
      if (referenceImage) formData.append("referenceImage", referenceImage)
      if (portraitImage) formData.append("userImage", portraitImage)

      const result = await axios.post("/api/generate-thumbnail", formData)
      if (!result.data.runId) throw new Error("The generation job did not start.")
      setEventId(result.data.runId)
    } catch (requestError) {
      console.error("Thumbnail generation failed:", requestError)
      setError("We could not start this thumbnail. Check your connection and try again.")
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
          const output = status.output?.[0]
          const thumbnailUrl = output?.thumbnailUrl || output
          if (!thumbnailUrl) {
            finishWithError("The job finished without an image. Please try again.")
            return
          }
          setOutputUrl(thumbnailUrl)
          setLoading(false)
          setHistoryVersion((version) => version + 1)
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
        console.error("Error polling thumbnail run status:", pollError)
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

  useEffect(() => {
    return () => {
      if (referencePreview) URL.revokeObjectURL(referencePreview)
      if (portraitPreview) URL.revokeObjectURL(portraitPreview)
    }
  }, [referencePreview, portraitPreview])

  return (
    <div className="dashboard-page thumbnail-page">
      <header className="tool-page-header">
        <p className="tool-page-eyebrow">Creator tool</p>
        <h1>Make the click feel inevitable.</h1>
        <p className="tool-page-description">
          Describe the video, add optional visual references, and generate a polished
          YouTube thumbnail built around one clear idea.
        </p>
      </header>

      <div className="thumbnail-workbench">
        <form
          className="tool-panel thumbnail-form"
          aria-labelledby="thumbnail-brief-title"
          onSubmit={onSubmit}
        >
          <div className="thumbnail-form__intro">
            <div>
              <p className="thumbnail-step">01</p>
              <h2 id="thumbnail-brief-title">Build your creative brief</h2>
            </div>
            <p>Lead with the subject, emotion, and any words that must appear.</p>
          </div>

          <div className="thumbnail-field">
            <label htmlFor="thumbnail-brief">Video idea</label>
            <textarea
              id="thumbnail-brief"
              value={brief}
              onChange={(event) => setBrief(event.target.value)}
              placeholder="Example: A dramatic before-and-after desk setup, warm lighting, surprised expression, text: $50 vs $5,000"
              maxLength={600}
              required
            />
            <div className="thumbnail-field__meta">
              <span>Be specific about mood, subject, composition, and text.</span>
              <span>{brief.length}/600</span>
            </div>
          </div>

          <div className="thumbnail-assets">
            <UploadField
              id="reference-image"
              label="Style reference"
              description="Guide the composition or visual mood."
              icon={ImagePlus}
              preview={referencePreview}
              accept=".jpg,.jpeg,.png"
              onChange={(event) => updateUpload("reference", event)}
              onRemove={() => removeUpload("reference")}
            />
            <UploadField
              id="portrait-image"
              label="Creator portrait"
              description="Place yourself or another subject in the frame."
              icon={UserRound}
              preview={portraitPreview}
              accept=".jpg,.jpeg,.png"
              onChange={(event) => updateUpload("portrait", event)}
              onRemove={() => removeUpload("portrait")}
            />
          </div>

          {error && (
            <div className="thumbnail-error" role="alert">
              <p>{error}</p>
            </div>
          )}

          <div className="thumbnail-form__footer">
            <p>Generation usually takes a minute or two.</p>
            <Button
              type="submit"
              disabled={loading || !brief.trim()}
              className="thumbnail-generate-button"
            >
              {loading ? <Loader2 className="animate-spin" /> : <Sparkles />}
              {loading ? "Creating thumbnail..." : "Generate thumbnail"}
            </Button>
          </div>
        </form>

        <section className="thumbnail-preview" aria-live="polite" aria-labelledby="preview-title">
          <div className="thumbnail-preview__header">
            <div>
              <p className="thumbnail-step">02</p>
              <h2 id="preview-title">Generation preview</h2>
            </div>
            <span>16:9 output</span>
          </div>

          <div className="thumbnail-preview__canvas">
            {loading ? (
              <div className="thumbnail-preview__state">
                <span className="thumbnail-preview__loader">
                  <Loader2 aria-hidden="true" />
                </span>
                <strong>Composing your thumbnail</strong>
                <p>We are shaping the subject, hierarchy, and final details.</p>
              </div>
            ) : outputUrl ? (
              <>
                <Image
                  src={outputUrl}
                  fill
                  sizes="(min-width: 1024px) 45vw, 100vw"
                  alt={`Generated thumbnail for: ${brief}`}
                  className="thumbnail-preview__image"
                  priority
                />
                <a
                  className="thumbnail-preview__open"
                  href={outputUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open full size
                  <ArrowUpRight aria-hidden="true" />
                </a>
              </>
            ) : (
              <div className="thumbnail-preview__state">
                <span className="thumbnail-preview__placeholder">
                  <ImagePlus aria-hidden="true" />
                </span>
                <strong>Your next thumbnail starts here</strong>
                <p>Complete the creative brief, then generate to see the final frame.</p>
              </div>
            )}
          </div>

          <div className="thumbnail-preview__notes">
            <span>Clear focal point</span>
            <span>High contrast</span>
            <span>Mobile readable</span>
          </div>
        </section>
      </div>

      <ThumbnailList refreshKey={historyVersion} />
    </div>
  )
}
