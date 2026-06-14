"use client"

import { useState } from "react"
import Image from "next/image"
import {
  ArrowUpRight,
  Check,
  Copy,
  FileText,
  Hash,
  ImageIcon,
  Lightbulb,
  Loader2,
  Type,
} from "lucide-react"

import { Skeleton } from "@/components/ui/skeleton"
import type { Content } from "../page"

type Props = {
  content: Content | null
  loading: boolean
}

type CopyButtonProps = {
  copied: boolean
  label: string
  onClick: () => void
}

function CopyButton({ copied, label, onClick }: CopyButtonProps) {
  return (
    <button className="content-copy-button" type="button" onClick={onClick}>
      {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
      {copied ? "Copied" : label}
    </button>
  )
}

export default function ContentDisplay({ content, loading }: Props) {
  const [copiedKey, setCopiedKey] = useState("")

  const copyText = async (key: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value)
      setCopiedKey(key)
      window.setTimeout(() => {
        setCopiedKey((currentKey) => (currentKey === key ? "" : currentKey))
      }, 1600)
    } catch (copyError) {
      console.error("Unable to copy generated content:", copyError)
    }
  }

  if (loading) {
    return (
      <section className="tool-results content-results" aria-live="polite">
        <div className="content-results__heading">
          <div>
            <p className="content-step">02</p>
            <h2>Building your content kit</h2>
            <p>Writing the copy, scoring title options, and preparing the visual direction.</p>
          </div>
          <span className="content-results__status">
            <Loader2 aria-hidden="true" />
            Generating
          </span>
        </div>

        <div className="content-loading-grid" aria-label="Loading generated content">
          <div className="content-loading-card content-loading-card--wide">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-4/5" />
          </div>
          <div className="content-loading-card">
            <Skeleton className="aspect-video w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          <div className="content-loading-card content-loading-card--wide">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </section>
    )
  }

  if (!content) {
    return (
      <section className="tool-results content-results" aria-live="polite">
        <div className="content-results__empty">
          <span><Lightbulb aria-hidden="true" /></span>
          <div>
            <p className="content-step">02</p>
            <h2>Your content kit will appear here</h2>
            <p>
              Add a focused video idea above. The result will include the copy and
              visual direction needed to move into production.
            </p>
          </div>
        </div>
      </section>
    )
  }

  const generated = content.content
  const allTitles = generated.titles.map((item) => item.title).join("\n")
  const allTags = generated.tags.join(", ")
  const allPrompts = generated.image_prompts
    .map((item) => `${item.heading}\n${item.prompt}`)
    .join("\n\n")

  return (
    <section className="tool-results content-results" aria-live="polite">
      <div className="content-results__heading">
        <div>
          <p className="content-step">02</p>
          <h2>Your content kit</h2>
          <p>Review, copy, and refine each part before publishing.</p>
        </div>
        <span className="content-results__status content-results__status--ready">
          <Check aria-hidden="true" />
          Ready
        </span>
      </div>

      <div className="content-results__layout">
        <div className="content-results__main">
          <article className="content-result-card content-titles">
            <div className="content-result-card__header">
              <div>
                <span className="content-result-card__icon"><Type aria-hidden="true" /></span>
                <div>
                  <p>Ranked options</p>
                  <h3>Video titles</h3>
                </div>
              </div>
              <CopyButton
                copied={copiedKey === "titles"}
                label="Copy all"
                onClick={() => copyText("titles", allTitles)}
              />
            </div>

            <ol className="content-title-list">
              {generated.titles.map((title, index) => (
                <li key={`${title.title}-${index}`}>
                  <span className="content-title-list__index">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h4>{title.title}</h4>
                    <span className="content-title-list__score">
                      SEO score <strong>{title.seo_score}</strong>
                    </span>
                  </div>
                  <CopyButton
                    copied={copiedKey === `title-${index}`}
                    label="Copy"
                    onClick={() => copyText(`title-${index}`, title.title)}
                  />
                </li>
              ))}
            </ol>
          </article>

          <article className="content-result-card content-description">
            <div className="content-result-card__header">
              <div>
                <span className="content-result-card__icon"><FileText aria-hidden="true" /></span>
                <div>
                  <p>Publish-ready copy</p>
                  <h3>Description</h3>
                </div>
              </div>
              <CopyButton
                copied={copiedKey === "description"}
                label="Copy"
                onClick={() => copyText("description", generated.description)}
              />
            </div>
            <p className="content-description__copy">{generated.description}</p>
          </article>

          <article className="content-result-card content-tags">
            <div className="content-result-card__header">
              <div>
                <span className="content-result-card__icon"><Hash aria-hidden="true" /></span>
                <div>
                  <p>Search vocabulary</p>
                  <h3>Suggested tags</h3>
                </div>
              </div>
              <CopyButton
                copied={copiedKey === "tags"}
                label="Copy all"
                onClick={() => copyText("tags", allTags)}
              />
            </div>
            <div className="content-tag-list">
              {generated.tags.map((tag, index) => (
                <span key={`${tag}-${index}`}>{tag}</span>
              ))}
            </div>
          </article>

          <article className="content-result-card content-prompts">
            <div className="content-result-card__header">
              <div>
                <span className="content-result-card__icon"><ImageIcon aria-hidden="true" /></span>
                <div>
                  <p>Alternative directions</p>
                  <h3>Thumbnail prompts</h3>
                </div>
              </div>
              <CopyButton
                copied={copiedKey === "prompts"}
                label="Copy all"
                onClick={() => copyText("prompts", allPrompts)}
              />
            </div>
            <div className="content-prompt-list">
              {generated.image_prompts.map((prompt, index) => (
                <div key={`${prompt.heading}-${index}`}>
                  <div>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <h4>{prompt.heading}</h4>
                  </div>
                  <p>{prompt.prompt}</p>
                  <CopyButton
                    copied={copiedKey === `prompt-${index}`}
                    label="Copy prompt"
                    onClick={() => copyText(`prompt-${index}`, prompt.prompt)}
                  />
                </div>
              ))}
            </div>
          </article>
        </div>

        <aside className="content-visual">
          <div className="content-visual__header">
            <div>
              <p>Generated visual</p>
              <h3>Thumbnail direction</h3>
            </div>
            <ImageIcon aria-hidden="true" />
          </div>
          {content.thumbnailUrl ? (
            <a href={content.thumbnailUrl} target="_blank" rel="noreferrer">
              <div className="content-visual__image">
                <Image
                  src={content.thumbnailUrl}
                  fill
                  sizes="(min-width: 1024px) 30vw, 100vw"
                  alt={`Generated thumbnail for: ${content.userInput}`}
                />
              </div>
              <span>
                Open full size
                <ArrowUpRight aria-hidden="true" />
              </span>
            </a>
          ) : (
            <div className="content-visual__missing">
              <ImageIcon aria-hidden="true" />
              <p>The copy is ready, but no thumbnail image was returned.</p>
            </div>
          )}
          <div className="content-visual__brief">
            <span>Original brief</span>
            <p>{content.userInput}</p>
          </div>
        </aside>
      </div>
    </section>
  )
}
