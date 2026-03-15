# PINK PRINT: A DIY Project Planner

**Pink Print** — Pink Print doesn't just estimate costs — it understands what you're building.

By blending AI-powered extraction with deterministic cost logic, Pink Print turns natural language ("paint my 12x14 bedroom") into actionable estimates. Clarifying questions when needed. Materials breakdowns always. Budget to premium ranges, by design.

On Wednesdays, We Build in Pink. 

## Live App

**Vercel Deployment:** https://buildingforabuilder-git-main-phyphy07s-projects.vercel.app/

## How It Works

### Data Flow & Architecture

**Summary:** User describes their project in plain language → `cachedGenerateObject()` checks Supabase cache → on miss, Gemini extracts structured project data (type, dimensions, options) → `getFilteredKnownQuestions()` merges experienced clarifying questions with AI questions → user answers → refine request re-extracts with answers → `estimateProject()` runs deterministic math (area, quantities, materials, costs) → UI displays estimate + materials breakdown + "Don't forget!" checklist.

### Extraction & Estimation

1. **AI extraction** — Gemini parses user input into a Zod-validated schema: `projectType`, dimensions (`roomLengthFt`, `roomWidthFt`, `ceilingHeightFt`, etc.), and `clarifyingQuestions` when info is missing.
2. **Clarifying questions** — Known questions (interior/exterior, drywall vs existing paint, molding/trim) are filtered by context (e.g. skip "interior or exterior?" when user says "bedroom"). Door projects get door-specific questions (metal/wood, primed, oil-based).
3. **Refine flow** — User answers are appended as `[Answers to clarifying questions]: ...` and sent back; AI fills gaps and omits questions for answered info.
4. **Deterministic estimates** — No AI for numbers. `estimateProject()` computes area, paint gallons, flooring sq ft, fence linear ft, and applies cost ranges (low/mid/high) per project type.

### Project Types

| Type     | Key Inputs                          | Outputs                                      |
| -------- | ------------------------------------ | -------------------------------------------- |
| Painting | Room size, ceiling height, ceiling, trim | Wall/ceiling area, paint gallons, primer, supplies |
| Flooring | Room size, flooring type (lvp, hardwood, carpet, tile) | Sq ft, underlayment, transitions, trim |
| Fence    | Length, height, material (wood, metal, plastic) | Linear ft, posts, concrete, hardware |

### Caching

| Layer        | Purpose                                      |
| ------------ | --------------------------------------------- |
| Supabase     | AI response cache (hash of input + cache type) |
| Cache key    | `buildCacheKey(input, cacheType)` → SHA-256 hash |

## Getting Started

### Prerequisites

- Node.js 18+
- A Google AI (Gemini) API key
- Supabase project for response caching (required — the app fails to build without these env vars)

### Setup

1. Clone the repo and install dependencies:

```bash
git clone https://github.com/PhyPhy07/buildingforabuilder.git
cd buildingforabuilder
npm install
```

2. Copy `.env.example` to `.env.local` and add your keys:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
GOOGLE_GENERATIVE_AI_API_KEY=your_google_ai_key
```

3. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Tech Stack

| Layer        | Tech                          |
| ------------ | ------------------------------ |
| Framework    | Next.js 16 (App Router)         |
| AI           | Vercel AI SDK + Gemini (or Groq) |
| Caching      | Supabase                       |
| Validation   | Zod                            |
| Styling      | Tailwind CSS                   |
| Deployment   | Vercel                         |

## Project Structure

| Path                          | Purpose                                                |
| ----------------------------- | ------------------------------------------------------ |
| `app/page.tsx`                | Main UI: form, clarifying questions, results, sticky note |
| `app/api/ai/route.ts`         | POST handler: extraction → estimation → response      |
| `app/lib/cache-ai.ts`         | `cachedGenerateObject` / `cachedGenerateText` (AI + cache) |
| `app/lib/ai-cache.ts`         | Supabase get/set for AI responses                     |
| `app/lib/cache-utils.ts`      | Cache key hashing                                     |
| `app/lib/estimators/index.ts` | Deterministic cost logic (painting, flooring, fence)  |
| `app/lib/known-clarifying-questions.ts` | Home Depot–style questions + filtering        |
| `app/lib/schemas/`            | Zod schemas for extraction                            |
| `app/lib/supabase.ts`         | Supabase client                                       |

## Future Scalability

Upon future iterations of this application, I would consider implementing:

### Caching & Performance

- **Shared cache** — Redis or similar when running multiple instances so cache hits work across instances
- **Rate limiting** — On the API to avoid abuse and stay within provider limits
- **Optional Supabase** — Graceful fallback when env vars are missing so the app builds and runs without Supabase

### Providers & Data

- **More project types** — Deck, plumbing, electrical, etc.
- **Regional pricing** — Adjust cost ranges by ZIP or region
- **Supplier integration** — Link to Home Depot / Lowe's product pages with prices
- **Runtime validation** — Zod for API responses when exposing externally

### UX & Accessibility

- **Mobile view** — DONE (responsive layout, sticky note in flow, no speech bubble on mobile)
- **Screen reader support** — Dynamic updates, ARIA labels
- **Dark mode**

### User Preferences

- **Save projects** — User accounts, saved estimates, history
- **Export PDF** — Download estimate + materials checklist as PDF
- **Export CSV** — Checklist export for shopping

### Observability

- **Logging and error tracking** — e.g. Sentry
- **Metrics** — Cache hit rate, extraction success rate, popular project types
- **Monitoring** — Alert on AI provider failures

### Flexibility

- **API versioning** — If the public API shape changes over time
- **Configurable estimators** — Adjust cost ranges without code changes
