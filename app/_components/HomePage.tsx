"use client"

import Image from "next/image"
import Link from "next/link"
import { useClerk, useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import {
  ArrowRight,
  BarChart3,
  Check,
  FileText,
  ImageIcon,
  Menu,
  Search,
  Sparkles,
  X,
} from "lucide-react"
import { useState } from "react"

const workflow = [
  {
    label: "Plan",
    title: "Turn one topic into a complete video brief.",
    description:
      "Generate title options, descriptions, tags, thumbnail prompts, and a ready-to-use visual direction from a single idea.",
    image: "/AiContentGenerator.png",
    alt: "AI content generator showing generated tags, a thumbnail, and thumbnail prompts",
  },
  {
    label: "Create",
    title: "Build the thumbnail without leaving your workflow.",
    description:
      "Start from a prompt, add a reference image or your own photo, then keep every generated option together for review.",
    image: "/AiThumbnailGenrator.png",
    alt: "AI thumbnail generator with prompt controls and a generated thumbnail",
  },
  {
    label: "Review",
    title: "Keep every creator tool in one focused workspace.",
    description:
      "Move between content generation, thumbnail search, outlier analysis, optimization, and billing from the same dashboard.",
    image: "/Dashboard.png",
    alt: "Creator dashboard with navigation and AI tool cards",
  },
]

const tools = [
  {
    icon: FileText,
    title: "Content generator",
    description: "Titles, descriptions, tags, and thumbnail prompts from one topic.",
    href: "/ai-content-generator",
  },
  {
    icon: ImageIcon,
    title: "Thumbnail generator",
    description: "Prompt-led image generation with reference and user image inputs.",
    href: "/ai-thumbnail-generator",
  },
  {
    icon: Search,
    title: "Thumbnail search",
    description: "Find visual references before you commit to a direction.",
    href: "/thumbnail-search",
  },
  {
    icon: BarChart3,
    title: "Outlier analysis",
    description: "Study videos that perform beyond a channel's usual baseline.",
    href: "/outlier",
  },
]

function BrandMark() {
  return (
    <Link className="home-brand" href="/" aria-label="Imagine and Build home">
      <span className="home-brand__mark" aria-hidden="true">
        <span />
        <span />
      </span>
      <span>Imagine &amp; Build</span>
    </Link>
  )
}

function PrimaryAction({ compact = false }: { compact?: boolean }) {
  const { isLoaded, isSignedIn } = useUser()
  const { openSignUp } = useClerk()
  const router = useRouter()
  const className = compact ? "home-button home-button--compact" : "home-button"

  const handleClick = () => {
    if (!isLoaded) return

    if (isSignedIn) {
      router.push("/dashboard")
      return
    }

    openSignUp({
      fallbackRedirectUrl: "/dashboard",
      signInFallbackRedirectUrl: "/dashboard",
    })
  }

  return (
    <button
      className={className}
      type="button"
      disabled={!isLoaded}
      onClick={handleClick}
    >
      {isSignedIn ? "Open dashboard" : "Start free"}
      <ArrowRight aria-hidden="true" />
    </button>
  )
}

function SignInAction() {
  const { isLoaded } = useUser()
  const { openSignIn } = useClerk()

  const handleClick = () => {
    if (!isLoaded) return

    openSignIn({
      fallbackRedirectUrl: "/dashboard",
      signUpFallbackRedirectUrl: "/dashboard",
    })
  }

  return (
    <button
      className="home-link-button"
      type="button"
      disabled={!isLoaded}
      onClick={handleClick}
    >
      Sign in
    </button>
  )
}

function ProtectedToolLink({
  href,
  children,
}: {
  href: string
  children: React.ReactNode
}) {
  const { isLoaded, isSignedIn } = useUser()
  const { openSignIn } = useClerk()
  const router = useRouter()

  const handleClick = () => {
    if (!isLoaded) return

    if (isSignedIn) {
      router.push(href)
      return
    }

    openSignIn({ fallbackRedirectUrl: href })
  }

  return (
    <button
      className="home-tool-row"
      type="button"
      disabled={!isLoaded}
      onClick={handleClick}
    >
      {children}
    </button>
  )
}

function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const { isSignedIn } = useUser()

  return (
    <header className="home-header">
      <div className="home-shell home-header__inner">
        <BrandMark />

        <nav className="home-nav" aria-label="Primary navigation">
          <a href="#workflow">How it works</a>
          <a href="#tools">Tools</a>
          <a href="#pricing">Pricing</a>
        </nav>

        <div className="home-header__actions">
          {!isSignedIn && <SignInAction />}
          <PrimaryAction compact />
        </div>

        <button
          className="home-menu-button"
          type="button"
          aria-label={isOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={isOpen}
          onClick={() => setIsOpen((open) => !open)}
        >
          {isOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </button>
      </div>

      {isOpen && (
        <div className="home-mobile-menu">
          <nav aria-label="Mobile navigation">
            <a href="#workflow" onClick={() => setIsOpen(false)}>How it works</a>
            <a href="#tools" onClick={() => setIsOpen(false)}>Tools</a>
            <a href="#pricing" onClick={() => setIsOpen(false)}>Pricing</a>
          </nav>
          <PrimaryAction />
        </div>
      )}
    </header>
  )
}

function Hero() {
  return (
    <section className="home-hero">
      <div className="home-shell home-hero__grid">
        <div className="home-hero__copy">
          <p className="home-kicker">
            <Sparkles aria-hidden="true" />
            A practical AI workspace for YouTube
          </p>
          <h1>From video idea to publish-ready package.</h1>
          <p className="home-hero__lede">
            Plan the content, generate the copy, shape the thumbnail, and study
            what is already working without stitching together five different tools.
          </p>
          <div className="home-hero__actions">
            <PrimaryAction />
            <a className="home-text-link" href="#workflow">
              See the workflow
              <ArrowRight aria-hidden="true" />
            </a>
          </div>
          <p className="home-hero__note">Free plan available. Sign in with Clerk.</p>
        </div>

        <figure className="home-product-shot home-product-shot--hero">
          <Image
            src="/Dashboard.png"
            alt="Imagine and Build dashboard with YouTube creator tools"
            width={1875}
            height={865}
            priority
            sizes="(min-width: 960px) 58vw, 100vw"
          />
          <figcaption>
            <span>One home for the full workflow</span>
            Content, thumbnails, research, and analysis
          </figcaption>
        </figure>
      </div>
    </section>
  )
}

function Workflow() {
  return (
    <section className="home-section" id="workflow">
      <div className="home-shell">
        <div className="home-section__head">
          <h2>See the work, not a list of promises.</h2>
          <p>
            The product is organized around the way a video actually gets made:
            decide what to say, create the visual, then review the whole system.
          </p>
        </div>

        <div className="home-workflow">
          {workflow.map((step, index) => (
            <article className="home-workflow__item" key={step.title}>
              <div className="home-workflow__copy">
                <p className="home-step-label">
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  {step.label}
                </p>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
              <figure className="home-product-shot">
                <Image
                  src={step.image}
                  alt={step.alt}
                  width={1876}
                  height={870}
                  loading="lazy"
                  sizes="(min-width: 960px) 62vw, 100vw"
                />
              </figure>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function Tools() {
  return (
    <section className="home-section home-section--muted" id="tools">
      <div className="home-shell home-tools">
        <div className="home-tools__intro">
          <p className="home-kicker">What is inside</p>
          <h2>A smaller toolset with a clearer job.</h2>
          <p>
            Each tool supports a specific decision in the creator workflow,
            instead of adding another dashboard to manage.
          </p>
        </div>

        <div className="home-tools__list">
          {tools.map((tool) => (
            <ProtectedToolLink href={tool.href} key={tool.title}>
              <tool.icon aria-hidden="true" />
              <div>
                <h3>{tool.title}</h3>
                <p>{tool.description}</p>
              </div>
              <ArrowRight aria-hidden="true" />
            </ProtectedToolLink>
          ))}
        </div>
      </div>
    </section>
  )
}

function Pricing() {
  return (
    <section className="home-section" id="pricing">
      <div className="home-shell home-pricing">
        <div className="home-pricing__copy">
          <p className="home-kicker">Simple starting point</p>
          <h2>Try the workflow before paying for more volume.</h2>
          <p>
            The Basic plan includes a limited monthly allowance. Pro raises the
            generation limits and adds thumbnail suggestions and faster processing.
          </p>
          <Link className="home-text-link" href="/billing">
            Compare all plans
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>

        <div className="home-price-card">
          <p className="home-price-card__label">Basic</p>
          <p className="home-price-card__price">$0 <span>forever</span></p>
          <ul>
            <li><Check aria-hidden="true" />10 video ideas per month</li>
            <li><Check aria-hidden="true" />Basic titles and descriptions</li>
            <li><Check aria-hidden="true" />Limited keyword suggestions</li>
          </ul>
          <PrimaryAction />
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="home-footer">
      <div className="home-shell">
        <p className="home-footer__statement">
          Make the next video easier to start.
        </p>
        <div className="home-footer__meta">
          <BrandMark />
          <div className="home-footer__links">
            <a href="#tools">Tools</a>
            <Link href="/billing">Pricing</Link>
            <a href="https://github.com/ManavSaini124" rel="noreferrer" target="_blank">
              GitHub
            </a>
          </div>
          <p>© {new Date().getFullYear()} Imagine &amp; Build</p>
        </div>
      </div>
    </footer>
  )
}

export function HomePage() {
  return (
    <main className="home-page">
      <Header />
      <Hero />
      <Workflow />
      <Tools />
      <Pricing />
      <Footer />
    </main>
  )
}
