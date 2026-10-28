# Overprint

Site for Overprint, a (fictional) risograph studio in Bandung. One long page: a
kinetic hero, a scroll-driven explainer, a pinned horizontal showcase of recent
print runs, a live print queue backed by SQLite, and a kinetic footer.

## Stack

- Next.js 16 (App Router, Cache Components) + TypeScript
- Tailwind CSS v4, tokens and custom utilities in `src/app/globals.css`
- GSAP + ScrollTrigger + SplitText, Lenis smooth scroll driven by the GSAP ticker
- Prisma 7 with the better-sqlite3 driver adapter
- Server Actions for writes, a GET route handler for live polling

## Getting started

```bash
cp .env.example .env
npm install            # also runs prisma generate
npm run db:migrate     # creates prisma/dev.db
npm run db:seed        # optional: a few prints on the wall
npm run dev
```

## Layout

```
src/
  app/
    actions.ts          sendToPress, pullCopy (validated, rate-limited)
    api/prints/route.ts GET ?ink= → latest prints + ink totals
    layout.tsx          fonts, smooth scroll provider, ink cursor
    page.tsx            section order
  components/
    providers/          SmoothScroll (Lenis ↔ GSAP), InkCursor
    hero/               Hero, HalftoneField (canvas)
    process/            word-scrub manifesto, steps, drawn paper path
    runs/               pinned horizontal showcase, generated SVG artwork
    queue/              PrintQueue (server, Suspense) → QueueClient → PosterCard
    footer/             curtain-reveal footer with variable-font letters
    ui/                 MagneticButton, RegistrationMark, ScrollProgress
  hooks/                useMagnetic, useMediaQuery / useReducedMotion
  lib/                  prisma client, data access, inks, runs, gsap registration
prisma/                 schema, migrations, seed
```

## Motion notes

- Every scroll and pointer effect checks `prefers-reduced-motion`. With it set,
  Lenis is off, the showcase becomes a native horizontal scroller, and text
  renders without entrances.
- The halftone canvas pauses off screen and halves its frame rate when the
  pointer is away.
- The rate limiter is in-memory, so it only covers a single Node process.
  Replace it before running more than one instance.
