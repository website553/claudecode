# CLAUDE.md — Project Rules for Figma → Code Implementation

This document tells Claude (and future contributors) how this codebase is organised and how to translate Figma designs into it. It is the source of truth for tokens, components, asset handling, and styling conventions on this project.

> **Project type:** Static, single-page landing page (Arogya Netram).
> **Stack:** Plain HTML5 + CSS3 + vanilla JavaScript. No build step, no package manager, no framework.
> **Mandate:** Match Figma designs pixel-for-pixel. Do not redesign, simplify, or change spacing/colors/typography.

---

## 1. Project Structure

```
claudecode/
├── index.html      # Single page — all sections live here
├── style.css       # All styles, tokens, responsive rules
├── script.js       # All interactivity (IIFE, no modules)
├── CLAUDE.md       # This file
└── README.md
```

**Rules:**
- Only these three deliverable files (`index.html`, `style.css`, `script.js`). Do not add new files unless the task explicitly requires it.
- No frameworks, bundlers, or transpilers. Open `index.html` directly in a browser to test.
- Edit existing files in-place. Prefer `Edit` over `Write` when modifying.

---

## 2. Design Tokens

**Location:** All tokens are CSS custom properties defined on `:root` at the top of `style.css` (lines 5–20).

```css
:root{
  /* Brand colors */
  --green:#6cc320;
  --green-dark:#55a70e;
  --gold:#ffb400;
  --yellow:#fafa18;

  /* Surfaces */
  --bg-dark:#0f1410;
  --panel:rgba(0,0,0,0.55);       /* hero card panel */
  --panel-soft:rgba(0,0,0,0.16);  /* large content panels */

  /* Text */
  --text:#f5f5f5;
  --muted:#cfcfcf;

  /* Type stacks */
  --font-en:'Inter','Roboto',system-ui,-apple-system,sans-serif;
  --font-hi:'Noto Sans Devanagari','Inter',sans-serif;

  /* Layout */
  --maxw:1280px;
  --radius:24px;
  --shadow-lg:0 18px 40px rgba(0,0,0,.35);
}
```

**Rules when adding a new token:**
- Add it to `:root`, not inline.
- Name by purpose, not by value (`--panel-soft`, not `--black16`).
- Existing token values were extracted from Figma — do not invent new colors; reuse `--green`, `--yellow`, etc. unless the design introduces a genuinely new hue.

**Utility classes:** `.green`, `.white`, `.bold`, `.container` exist for repeated inline patterns. Prefer them over re-declaring rules.

### 2.1 Typography

| Use | Family | Weights |
| --- | --- | --- |
| English copy | `Inter` (fallback `Roboto`) | 400 / 500 / 700 / 900 |
| Hindi/Devanagari copy | `Noto Sans Devanagari` | 400 / 500 / 700 |
| Decorative quotes | `Inria Serif` | 700 |
| Numeric / summary | `Roboto` | 400 / 700 / 900 |

Fonts are loaded once via Google Fonts in `<head>`:

```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;900&family=Noto+Sans+Devanagari:wght@400;500;700&family=Inria+Serif:wght@700&family=Roboto:wght@400;700;900&display=swap" rel="stylesheet" />
```

Devanagari text **must** use `font-family: var(--font-hi)` (or a class that does). Mixing the two stacks within a single element is fine — Latin glyphs fall through to `Inter`.

### 2.2 Fluid sizing

Type and key dimensions use `clamp(min, fluid, max)` so layouts shrink gracefully without media queries:

```css
font-size: clamp(28px, 4.5vw, 52px); /* section titles */
font-size: clamp(15px, 1.6vw, 20px); /* nav CTA */
```

Match the Figma desktop value as the `max`, choose a sensible `min` for ~360px screens, and a `vw`-based middle.

### 2.3 Spacing & radius

There is no scalar spacing scale (no `--space-1` etc.). Use the Figma value directly (e.g. `padding: 26px 32px`). For repeated radii, use `--radius` (24px) where it applies; one-offs (32px, 52px, 57px) come straight from Figma.

---

## 3. Responsive System

**Mobile-first is not enforced** — desktop is the canonical layout (matches Figma); media queries narrow it down. When adding new layout, write the desktop rule first, then add overrides in the existing breakpoint blocks at the bottom of `style.css`.

| Breakpoint | Purpose |
| --- | --- |
| `@media (max-width: 1100px)` | Tablet / narrow desktop — collapse multi-column grids |
| `@media (max-width: 780px)`  | Phones — single column, larger tap targets, hamburger menu |
| `@media (max-width: 430px)`  | Small phones — tighten paddings, hide non-essential chrome |
| `@media (prefers-reduced-motion: reduce)` | Disables all animations and reveals |

**Rule:** Never add a new breakpoint without checking these three first. If you must, keep them ascending and at the bottom of the file.

---

## 4. Component & Section Architecture

There is no component library. Sections are flat HTML blocks in `index.html`, each preceded by a comment banner and styled by a matching banner in `style.css`.

### 4.1 Section pattern

```html
<!-- COMMON PROBLEMS -->
<section class="problems" id="problems">
  <div class="container">
    <h2 class="section-title green reveal">COMMON PROBLEMS</h2>
    <p class="section-sub reveal">…</p>
    <div class="problems-grid">
      <div class="problem-card reveal"> … </div>
    </div>
  </div>
</section>
```

```css
/* ==================== PROBLEMS ==================== */
.problems{padding:80px 20px}
.problems-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:24px;margin-top:50px}
.problem-card{display:flex;flex-direction:column;align-items:center;gap:14px;text-align:center;transition:transform .3s}
.problem-card:hover{transform:translateY(-8px)}
```

**Rules:**
- One `<section>` per Figma section. Give it an `id` matching the nav anchor.
- Wrap content in `<div class="container">` to inherit `max-width: 1280px` + padding.
- Add `class="reveal"` to anything you want animated into view on scroll. The IntersectionObserver in `script.js` handles it.
- Every section in `style.css` is preceded by `/* ==================== NAME ==================== */`. Keep this convention; it's how you locate styles.

### 4.2 Reusable primitives

| Class | Purpose |
| --- | --- |
| `.container` | 1280px max-width + side padding |
| `.section-title` | Centered headline, fluid 28→52px |
| `.section-sub` | Hindi subtitle under section titles |
| `.title-underline` | Thin green gradient divider under titles |
| `.cta-btn` | Primary green "Call Now" pill with ripple + sheen + lift |
| `.reveal` / `.reveal.in` | Fade-in-up scroll animation (driven by JS) |
| `.green`, `.white`, `.bold` | Inline text utility colors |

### 4.3 The CTA button (canonical interactive element)

This is the most repeated component. Reuse it verbatim — do **not** create variants without a strong reason:

```html
<a href="tel:+917316624109" class="cta-btn">
  <span>Call Now</span>
  <svg viewBox="0 0 24 24" fill="currentColor" width="26" height="26">
    <path d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2…"/>
  </svg>
</a>
```

It auto-receives ripple + haptic feedback from `script.js` via the `.cta-btn` selector. Adding the class is enough — no JS wiring needed.

### 4.4 Naming convention

- Kebab-case, semantically rooted in the section: `.hero-card`, `.cert-badge`, `.problem-img`.
- Block-prefix child classes (`cert-badge` + `cert-img` + `cert-label`).
- Positional modifiers use `pos-` prefix: `.pos-tl`, `.pos-bc`.
- State modifiers are plain adjectives: `.open`, `.scrolled`, `.in`, `.invalid`, `.pulsed`.

---

## 5. Asset Management

### 5.1 Figma assets

Images come from the Figma MCP server as signed URLs of the shape:

```
https://www.figma.com/api/mcp/asset/<uuid>
```

**These URLs expire after ~7 days.** For permanent deployment they must be downloaded and re-hosted locally. The current code uses them inline as `src` and CSS `url(...)` for speed of iteration.

**Rules for new assets:**
- Always set `loading="lazy"` on `<img>` except for above-the-fold imagery (hero gets `loading="eager"`).
- Always provide a meaningful `alt`. For Hindi UI, alts may be English descriptions for SEO.
- Decorative images get `alt=""` + `aria-hidden="true"`.
- Preserve the Figma aspect ratio — use `object-fit: cover` for photos, `contain` for logos/badges.

### 5.2 Icons

Icons are inline SVG, written directly in `index.html` (no sprite, no icon font, no external file). Example — the phone glyph inside `.cta-btn`:

```html
<svg viewBox="0 0 24 24" fill="currentColor" width="26" height="26">
  <path d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2 …"/>
</svg>
```

**Rules:**
- Use `fill="currentColor"` so icons inherit text color and respond to hover.
- Set explicit `width` / `height` attributes equal to the Figma icon box.
- Reuse the same `<svg>` snippet rather than refactoring — duplication here is cheaper than abstraction.
- Social icons in the footer follow the same pattern, one `<svg>` per platform.

---

## 6. JavaScript Architecture

`script.js` is a single IIFE (`(() => { 'use strict'; … })()`), loaded with `defer`. It wires up:

1. **Sticky navbar shadow** — toggles `.scrolled` on `#navbar` past 30px.
2. **Hamburger toggle** — `.open` on `#hamburger` and `#navLinks`, syncs `aria-expanded`.
3. **Smooth scroll** — intercepts `a[href^="#"]` clicks, accounts for sticky-nav offset.
4. **Scroll reveal** — IntersectionObserver adds `.in` to `.reveal` elements once visible.
5. **Ripple + haptic on CTAs** — for `.cta-btn`, `.nav-cta`, `.float-call`. Creates a `<span class="ripple">`, removed after 650 ms.
6. **Cert badge pulse** — `.cert-img.pulsed` animation on click.
7. **Form validation** — manual checks on `#leadForm`, Hindi error messages, regex phone gate (`^[6-9]\d{9}$`).
8. **Lazy-load fallback** — IntersectionObserver-based fallback for browsers without `loading="lazy"`.

**Rules when adding behaviour:**
- Append a new commented block inside the existing IIFE — do not create new files or modules.
- Prefer event delegation off `document` over wide `querySelectorAll`.
- Use IntersectionObserver and CSS transitions; reserve JS animation for what CSS can't do.
- Respect `prefers-reduced-motion` (already covered globally in `style.css`).
- Never block render — `defer` keeps the script non-blocking; keep it that way.

---

## 7. Workflow: Figma → Code

When asked to implement a Figma node:

### 7.1 Extract the design

1. Parse the Figma URL: `figma.com/design/<fileKey>/...?node-id=<nodeId>`. Hyphens in `nodeId` become colons.
2. Call `mcp__…__get_design_context` with `fileKey` + `nodeId` to retrieve generated code + asset URLs + a screenshot.
3. If only metadata is needed (overview), call `get_metadata`; for high-res visuals, `get_screenshot`.

### 7.2 Translate the output

The MCP server returns **React + Tailwind** reference code. **Do not commit it.** Convert it to this project's stack:

| Figma MCP output | This project |
| --- | --- |
| `className="bg-[#6cc320] rounded-[14px]"` | New rule in `style.css` referencing `--green` and matching radius |
| `<div className="absolute left-[100px] top-[200px]">` | Flow/Grid layout — only use `position: absolute` when the design itself is a constellation/overlay |
| `<img src={imgFoo} />` with `const imgFoo = "https://www.figma.com/api/mcp/asset/…"` | Inline the URL directly into `<img src="…">` (note the 7-day expiry caveat) |
| Tailwind `font-['Inter:Bold',…]` | `font-family: var(--font-en); font-weight: 700;` |
| Inline Tailwind shadows | Move to a class; reuse `--shadow-lg` if it fits |

### 7.3 Match exactly

- Pull exact px values (padding, radius, font-size) into the relevant section block. Wrap font-sizes in `clamp()`.
- Use the existing breakpoints. If something at 780px needs different treatment, add to that block; don't introduce a new one.
- Preserve gradients, opacities, and `backdrop-filter: blur(...)` verbatim.
- Hindi text comes back as Devanagari Unicode — paste verbatim, do not transliterate.

### 7.4 Make it interactive

Every visible button, badge, accordion, or card the design implies should respond to user input:

- Buttons → reuse `.cta-btn` (gets ripple + sheen + lift for free) or pattern off `.nav-cta`.
- Cards → `transform: translateY(-Xpx)` + shadow grow on `:hover`.
- Accordion → native `<details>` / `<summary>` with custom `::after` rotate (see `.faq-item`).
- Always provide `:focus-visible` outlines for keyboard users (`outline: 3px solid var(--green)`).
- Tap targets ≥ 44×44px on mobile.

---

## 8. Accessibility & SEO Baseline

- `<html lang="hi">` — primary language is Hindi.
- Each section has a unique `id`; nav links use them for in-page anchoring.
- Meaningful `<meta name="description">` and `<meta name="keywords">` already in `<head>`.
- Icons inside text-only buttons get an `aria-label`.
- `<form>` fields have labels and inline `.err` spans with `data-for` matching the input id.
- Reduced-motion rule disables animations globally.

When extending, preserve these — do not remove `lang`, `alt`, or `aria-*` attributes.

---

## 9. Performance Checklist

Before declaring a change "done":

- [ ] All new images have `loading="lazy"` (except above-the-fold)
- [ ] No new external scripts / fonts added unless required
- [ ] No `position: absolute` constellation works on mobile (collapsed to a grid in the matching breakpoint)
- [ ] No horizontal scroll at any breakpoint (`body { overflow-x: hidden }` is a safety net, not an excuse)
- [ ] Background images either `background-size: cover` with `background-position` set, or downsized for mobile

---

## 10. Strict Rules (the "do not break")

1. **No frameworks, no build tools, no package.json.** Three files only.
2. **No redesigns.** If something looks wrong in Figma, mirror it anyway — flag it in the reply, don't silently "fix" it.
3. **Tokens live on `:root`.** No magic numbers for brand colors.
4. **Match Figma spacing.** Use px values from the design, wrapped in `clamp()` for type only when fluid scaling is needed.
5. **Hindi text uses `--font-hi`.** Never substitute glyphs or Romanize.
6. **CSS is sectioned with `/* ==================== NAME ==================== */` banners.** Keep them.
7. **Buttons are interactive by default.** A new `.cta-btn` gets ripple + hover free; resist the urge to make a "static" button.
8. **All animations honor `prefers-reduced-motion`.** Don't add a JS animation that ignores it.
9. **Commit messages describe the why.** Branch is `claude/figma-to-frontend-ccEGm`; never push to `main` without explicit instruction.
