"use client"

import Image from "next/image"
import Link from "next/link"
import {
  ArrowUpRight,
  BarChart3,
  FileText,
  Gauge,
  ImageIcon,
  Search,
  Sparkles,
} from "lucide-react"

const features = [
  {
    id: 1,
    name: "Thumbnail generator",
    description: "Create a thumbnail from a prompt, reference image, or your own photo.",
    image: "/features/FT1.png",
    path: "/ai-thumbnail-generator",
    icon: ImageIcon,
    status: "Ready",
  },
  {
    id: 2,
    name: "Thumbnail search",
    description: "Search visual references and find a useful direction faster.",
    image: "/features/FT2.png",
    path: "/thumbnail-search",
    icon: Search,
    status: "Ready",
  },
  {
    id: 3,
    name: "Content generator",
    description: "Generate titles, descriptions, tags, and thumbnail prompts.",
    image: "/features/FT3.png",
    path: "/ai-content-generator",
    icon: FileText,
    status: "Ready",
  },
  {
    id: 4,
    name: "Outlier finder",
    description: "Inspect videos that outperform a channel's usual baseline.",
    image: "/features/FT4.png",
    path: "/outlier",
    icon: Gauge,
    status: "Ready",
  },
  {
    id: 5,
    name: "Video optimizer",
    description: "A guided optimization workflow for videos before publishing.",
    image: "/features/FT5.png",
    path: "/coming-soon",
    icon: BarChart3,
    status: "Coming soon",
  },
  {
    id: 6,
    name: "Trending keywords",
    description: "Find trend signals inferred from the current popular-video chart.",
    image: "/features/Ft6.png",
    path: "/trending-keywords",
    icon: Sparkles,
    status: "Ready",
  },
]

function FeatureList() {
  return (
    <section className="dashboard-tools">
      <div className="dashboard-tools__head">
        <div>
          <h2>Your tools</h2>
          <p>Pick the next job in your publishing workflow.</p>
        </div>
        <Link href="/billing">
          Manage plan
          <ArrowUpRight aria-hidden="true" />
        </Link>
      </div>

      <div className="dashboard-tools__grid">
        {features.map((feature) => (
          <Link
            key={feature.id}
            href={feature.path}
            className="dashboard-tool-card"
          >
            <div className="dashboard-tool-card__image">
              <Image
                src={feature.image}
                width={600}
                height={360}
                alt=""
                aria-hidden="true"
                loading="lazy"
              />
            </div>
            <div className="dashboard-tool-card__body">
              {/* <div className="dashboard-tool-card__meta">
                <feature.icon aria-hidden="true" />
                <span data-status={feature.status === "Ready" ? "ready" : "soon"}>
                  {feature.status}
                </span>
              </div> */}
              <h3 className="dashboard-tool-card__name">{feature.name}</h3>
              <p className="dashboard-tool-card__description">{feature.description}</p>
              <span className="dashboard-tool-card__action">
                {feature.status === "Ready" ? "Open tool" : "View details"}
                <ArrowUpRight aria-hidden="true" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

export default FeatureList
