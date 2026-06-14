import Link from "next/link"
import {
  ArrowRight,
  Check,
  CircleDollarSign,
  Clock3,
  ShieldCheck,
  Sparkles,
} from "lucide-react"

type Plan = {
  name: string
  description: string
  price: string
  period: string
  label: string
  features: string[]
  featured?: boolean
}

const plans: Plan[] = [
  {
    name: "Basic",
    description: "A practical starting point for exploring the creator workspace.",
    price: "$0",
    period: "forever",
    label: "Available now",
    features: [
      "10 video ideas each month",
      "Basic titles and descriptions",
      "Limited keyword suggestions",
    ],
  },
  {
    name: "Pro",
    description: "More room to create, research, and refine every upload.",
    price: "$20",
    period: "per month",
    label: "Preview",
    featured: true,
    features: [
      "Everything in Basic",
      "100 video ideas each month",
      "SEO-focused titles and descriptions",
      "Thumbnail suggestions",
      "Priority generation",
    ],
  },
  {
    name: "Enterprise",
    description: "Expanded capacity for teams running a larger content operation.",
    price: "$1,000",
    period: "per month",
    label: "Planned",
    features: [
      "Everything in Pro",
      "Unlimited video ideas",
      "Advanced keyword and trend analysis",
      "Dedicated support",
      "Custom integrations",
    ],
  },
]

export default function BillingPage() {
  return (
    <div className="dashboard-page billing-page">
      <header className="tool-page-header">
        <p className="tool-page-eyebrow">Workspace billing</p>
        <h1>Choose the pace that fits your channel.</h1>
        <p className="tool-page-description">
          Start with the included tools, then compare the expanded plans being
          prepared for growing creator workflows.
        </p>
      </header>

      <section className="billing-overview" aria-labelledby="billing-overview-title">
        <div className="billing-overview__copy">
          <div className="billing-overview__eyebrow">
            <Sparkles aria-hidden="true" />
            <span>Basic access</span>
          </div>
          <h2 id="billing-overview-title">Your workspace is ready to use.</h2>
          <p>
            No payment method is required for the Basic plan. Paid billing is
            not connected yet, so you will not be charged from this page.
          </p>
        </div>

        <div className="billing-overview__plan" aria-label="Current access">
          <div>
            <span>Current access</span>
            <strong>Basic</strong>
          </div>
          <div>
            <strong>$0</strong>
            <span>forever</span>
          </div>
        </div>

        <Link className="billing-overview__action" href="/dashboard">
          Open workspace
          <ArrowRight aria-hidden="true" />
        </Link>
      </section>

      <section className="billing-plans" aria-labelledby="billing-plans-title">
        <div className="billing-section-heading">
          <div>
            <p>Plan comparison</p>
            <h2 id="billing-plans-title">Find your working rhythm</h2>
          </div>
          <p>
            Paid plan details are previews and may change before checkout
            becomes available.
          </p>
        </div>

        <div className="billing-plan-grid">
          {plans.map((plan) => (
            <article
              className={`billing-plan${plan.featured ? " billing-plan--featured" : ""}`}
              key={plan.name}
            >
              <div className="billing-plan__topline">
                <span>{plan.label}</span>
                {plan.featured ? <Sparkles aria-hidden="true" /> : null}
              </div>

              <div className="billing-plan__intro">
                <h3>{plan.name}</h3>
                <p>{plan.description}</p>
              </div>

              <div className="billing-plan__price">
                <strong>{plan.price}</strong>
                <span>{plan.period}</span>
              </div>

              <ul className="billing-plan__features">
                {plan.features.map((feature) => (
                  <li key={feature}>
                    <span aria-hidden="true">
                      <Check />
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>

              {plan.name === "Basic" ? (
                <Link className="billing-plan__button" href="/dashboard">
                  Continue with Basic
                  <ArrowRight aria-hidden="true" />
                </Link>
              ) : (
                <button
                  className="billing-plan__button billing-plan__button--disabled"
                  type="button"
                  disabled
                >
                  <Clock3 aria-hidden="true" />
                  Coming soon
                </button>
              )}
            </article>
          ))}
        </div>
      </section>

      <aside className="billing-notice" aria-labelledby="billing-notice-title">
        <span className="billing-notice__icon" aria-hidden="true">
          <ShieldCheck />
        </span>
        <div>
          <p>Billing status</p>
          <h2 id="billing-notice-title">Paid checkout is still in preview.</h2>
          <p>
            The product does not currently process payments or activate paid
            subscriptions. Plan availability will be shown here when a secure
            billing provider is connected.
          </p>
        </div>
        <CircleDollarSign aria-hidden="true" className="billing-notice__mark" />
      </aside>
    </div>
  )
}
