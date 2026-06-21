"use client"

import { useUser } from "@clerk/nextjs"
import { ArrowRight, FileText, ImageIcon, Sparkles } from "lucide-react"
import Link from "next/link"

const WelcomeBanner = () => {
  const { user } = useUser()
  const firstName = user?.firstName || "Creator"

  return (
    <section className="dashboard-welcome">
      <div className="dashboard-welcome__copy">
        <p className="dashboard-eyebrow">
          {/* <Sparkles aria-hidden="true" /> */}
          Creator workspace
        </p>
        <h1>Welcome back, {firstName}.</h1>
        <p>
          Start with the idea or the thumbnail. The rest of your creator tools
          stay close when you need them.
        </p>
        <div className="dashboard-welcome__actions">
          <Link className="dashboard-primary-action" href="/ai-content-generator">
            <FileText aria-hidden="true" />
            Generate content
            <ArrowRight aria-hidden="true" />
          </Link>
          <Link className="dashboard-secondary-action" href="/ai-thumbnail-generator">
            <ImageIcon aria-hidden="true" />
            Create thumbnail
          </Link>
        </div>
      </div>

      <div className="dashboard-welcome__guide">
        <p>Quick start</p>
        <ol>
          <li><span>1</span>Choose a video topic</li>
          <li><span>2</span>Generate the content package</li>
          <li><span>3</span>Create and review the thumbnail</li>
        </ol>
      </div>
    </section>
  )
}

export default WelcomeBanner
