# Imagine & Build Design System

This document is the design contract for every page in the application. Use it
when creating or updating routes so the product feels like one coherent creator
workspace instead of a collection of separate tools.

## 1. Design Direction

The product uses a **warm studio** visual language:

- Warm off-white backgrounds instead of cold gray or pure white.
- Dark ink typography with one restrained burnt-orange accent.
- Editorial, confident headings and quiet supporting copy.
- Thin borders, soft shadows, and rounded surfaces.
- Functional layouts with generous space and minimal decoration.
- Fast, subtle interaction feedback.

The interface should feel focused, capable, and calm. Avoid loud gradients,
glowing backgrounds, excessive blur, floating decoration, or a different color
theme for each feature.

## 2. Source Of Truth

Use the existing system in this order:

1. `tokens.css` for color, type, spacing, radius, duration, and easing tokens.
2. `app/globals.css` for shared dashboard shell and component classes.
3. `components/ui/*` for reusable controls.
4. Page-level Tailwind classes only for layout or truly page-specific needs.

Do not introduce new hard-coded colors when a token already describes the role.
New shared patterns belong in `app/globals.css`, not repeated across pages.

## 3. Page Anatomy

All authenticated routes already render inside:

```tsx
<DashboardProvider>
  <AppSidebar />
  <main className="dashboard-main">
    <AppHeader />
    <div className="dashboard-content">{children}</div>
  </main>
</DashboardProvider>
```

Every tool page should use this structure inside `dashboard-content`:

```tsx
<div className="dashboard-page">
  <section className="tool-page-header">
    <p className="tool-page-eyebrow">Creator tool</p>
    <h1>Page title</h1>
    <p className="tool-page-description">
      One concise sentence explaining the result this tool creates.
    </p>
  </section>

  <section className="tool-panel" aria-labelledby="input-title">
    {/* Primary form or action */}
  </section>

  <section className="tool-results" aria-live="polite">
    {/* Empty, loading, error, or success state */}
  </section>
</div>
```

Page flow must stay consistent:

1. Header and short description.
2. Primary input or action panel.
3. Optional supporting controls.
4. Results or generated output.

Do not repeat the sticky app header inside the page. A page title is content;
the app header is navigation context.

## 4. Layout

- Main content width is controlled by `.dashboard-content`; do not add another
  full-page `max-w-* mx-auto` wrapper.
- Use a single-column mobile layout first.
- Use `var(--space-3xl)` between major page sections.
- Use `var(--space-xl)` inside primary panels and cards.
- Use `var(--space-md)` or `var(--space-lg)` between related controls.
- Keep reading text near `60ch` and descriptions near `58ch`.
- Form-focused panels should usually be no wider than `48rem`.
- Result grids use one column on mobile, two from `40rem`, and three from
  `64rem` unless the content requires a different ratio.

Preferred responsive page padding is already provided:

| Viewport | Horizontal padding |
| --- | --- |
| Mobile | `var(--space-md)` |
| Tablet | `var(--space-xl)` |
| Desktop | `var(--space-2xl)` |

## 5. Color

Use semantic tokens, not page-specific palettes.

| Role | Token |
| --- | --- |
| App background | `--color-paper` |
| Raised surface | `--color-paper-strong` |
| Muted surface | `--color-paper-muted` |
| Primary text | `--color-ink` |
| Supporting text | `--color-ink-soft` |
| Quiet metadata | `--color-muted` |
| Borders | `--color-rule` |
| Strong borders | `--color-rule-strong` |
| Primary action | `--color-accent` |
| Primary action hover | `--color-accent-hover` |
| Accent tint | `--color-accent-soft` |
| Success | `--color-success` |
| Focus ring | `--color-focus` |

The orange accent is for primary actions, active navigation, selected states,
small icons, and useful emphasis. It should not color every heading or surface.

Use the dark surface (`--color-dark-surface`) only for one high-emphasis area,
such as a welcome banner or generation preview. Do not alternate dark and light
cards without a clear hierarchy.

## 6. Typography

- Page title: display font, `clamp(2.25rem, 6vw, 3.75rem)`, weight `700`,
  line-height around `1.04`, letter-spacing `-0.035em`.
- Section title: `var(--text-2xl)`, weight `700`, line-height `1.1`.
- Card title: `var(--text-xl)`, weight `700`.
- Body: `var(--text-base)`, line-height `1.6`.
- Large description: `var(--text-md)`, `--color-ink-soft`.
- Label: `var(--text-sm)`, weight `600`.
- Eyebrow: `var(--text-xs)`, weight `700`, uppercase, `0.08em` tracking.

Use sentence case for headings, buttons, labels, and navigation. Keep titles
short and concrete. Avoid all-caps text except small eyebrows and metadata.

Use gradient text only for rare marketing emphasis. Tool-page headings should
normally use `--color-ink`.

## 7. Surfaces

### Primary panel

```css
border: var(--rule-hair) solid var(--color-rule);
border-radius: var(--radius-lg);
background: var(--color-paper-strong);
box-shadow: 0 12px 32px color-mix(in oklch, var(--color-ink) 5%, transparent);
```

### Muted panel

Use `--color-paper-muted` with a standard border and little or no shadow.

### High-emphasis panel

Use `--color-dark-surface`, `--color-dark-ink`, and `--color-dark-muted`.
Reserve it for the most important area on the page.

Use these radii consistently:

- Controls and buttons: `--radius-sm`.
- Form groups and compact cards: `--radius-md`.
- Primary cards and media: `--radius-lg`.
- Large hero or welcome surface: `--radius-xl`.

## 8. Controls

All controls must have a visible label. Placeholders are examples, not labels.

Inputs and textareas:

- Minimum height: `48px`.
- Background: `--color-paper-strong` or `--color-paper-muted`.
- Border: `--color-rule`; use `--color-accent` on focus.
- Radius: `--radius-sm` or `--radius-md`.
- Text: `--color-ink`; placeholder: `--color-muted`.
- Focus: `2px` outline using `--color-focus`, offset by `2px`.
- Textareas should start at a useful height and resize vertically.

Primary buttons:

- Minimum height: `48px`.
- Burnt-orange background and white text.
- One leading Lucide icon when it improves recognition.
- Label should describe the action: `Generate`, `Search`, `Upload`, `Save`.
- Loading replaces the icon with a spinner but keeps the button width stable.
- Disabled state uses reduced opacity and cannot be clicked.
- Pressed state uses `transform: scale(0.97)`.

Secondary buttons use a transparent or paper background with a standard border.
Destructive actions must not use the primary orange treatment.

Use Lucide icons throughout. Standard sizes are `16px` inside buttons and
`20px` for standalone actions. Icon-only controls require an `aria-label` and
tooltip or `title`.

## 9. States

Every asynchronous page must intentionally support:

| State | Treatment |
| --- | --- |
| Empty | Quiet explanation and the next useful action |
| Loading | Skeleton matching final layout, or spinner plus specific status text |
| Success | Result content with clear follow-up actions |
| Error | Plain-language message near the failed action and a retry path |
| Disabled | Reduced opacity, no pointer events, reason apparent from context |

Do not flash an empty result grid before data loads. Preserve the result area
when practical so the page does not jump vertically.

Progress indicators must communicate real progress when available. If progress
is estimated, use an indeterminate treatment or label it as preparation rather
than presenting a precise percentage.

## 10. Motion

Motion supports feedback and spatial understanding; it is not decoration.

- Button press: `100-160ms`.
- Hover and color transitions: `180ms`.
- Popovers and dropdowns: `150-250ms`.
- Modals and drawers: `200-280ms`.
- Use `--ease-out` for enter/exit and `--ease-in-out` for movement.
- Animate only `transform` and `opacity` when possible.
- Never use `transition-all`.
- Never animate an element from `scale(0)`; begin around `scale(0.95)`.
- Gate hover movement behind `(hover: hover) and (pointer: fine)`.
- Respect `prefers-reduced-motion`.

Frequently repeated or keyboard-triggered actions should feel instant.

## 11. Accessibility

- Use one `h1` per page and preserve heading order.
- Associate every form control with a `<label>`.
- Use semantic `button`, `a`, `form`, `section`, and list elements.
- Keep keyboard focus visible.
- Ensure interactive targets are at least `44px` square.
- Do not communicate status using color alone.
- Add useful image `alt` text; use empty alt text for decoration.
- Announce generated results and errors with `aria-live="polite"`.
- Maintain readable contrast on both paper and dark surfaces.

## 12. Recommended Tool Page Template

```tsx
import { Loader2, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ToolPage() {
  const loading = false

  return (
    <div className="dashboard-page">
      <header className="max-w-3xl">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.08em] text-[var(--color-accent)]">
          Creator tool
        </p>
        <h1 className="font-[var(--font-display)] text-[clamp(2.25rem,6vw,3.75rem)] font-bold leading-[1.04] tracking-[-0.035em] text-[var(--color-ink)]">
          Tool name
        </h1>
        <p className="mt-4 max-w-[58ch] text-lg leading-relaxed text-[var(--color-ink-soft)]">
          Explain what the user can make and what input they should provide.
        </p>
      </header>

      <form className="max-w-3xl rounded-[var(--radius-lg)] border border-[var(--color-rule)] bg-[var(--color-paper-strong)] p-6 shadow-[0_12px_32px_color-mix(in_oklch,var(--color-ink)_5%,transparent)]">
        <div className="grid gap-2">
          <label htmlFor="prompt" className="text-sm font-semibold">
            Video idea
          </label>
          <textarea
            id="prompt"
            className="min-h-32 resize-y rounded-[var(--radius-md)] border border-[var(--color-rule)] bg-[var(--color-paper-muted)] px-4 py-3 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]"
            placeholder="Example: A practical guide to filming better videos"
          />
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
          <Button type="submit" disabled={loading} className="min-h-12 bg-[var(--color-accent)] px-6 text-white active:scale-[0.97]">
            {loading ? <Loader2 className="animate-spin" /> : <Sparkles />}
            {loading ? "Generating..." : "Generate"}
          </Button>
        </div>
      </form>

      <section aria-live="polite">{/* Results */}</section>
    </div>
  )
}
```

If a pattern appears on two or more pages, turn it into a shared component or
shared CSS class before creating another variation.

## 13. Review Checklist

Before considering a page complete, verify:

- It uses the existing dashboard shell and content width.
- Its header, input panel, and results follow the standard page order.
- Colors come from semantic tokens.
- Spacing follows the shared scale.
- Buttons, fields, cards, and media use the standard radii.
- Empty, loading, error, success, and disabled states are designed.
- Hover, active, focus, and reduced-motion behavior are present.
- The page works at mobile, tablet, and desktop widths.
- Text remains readable without clipping or horizontal scrolling.
- No new one-off gradient, glow, font, or color theme was introduced.
