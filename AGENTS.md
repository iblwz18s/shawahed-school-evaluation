# AGENTS.md

## Project

**منصة شواهد** — منصة عربية (RTL) لتوثيق وتقويم الأداء المدرسي وفق معايير هيئة تقويم التعليم والتدريب (ETEC).

- **Stack**: Next.js 14 (App Router) · React 18 · TypeScript 5 · Tailwind CSS · Prisma + PostgreSQL (Supabase) · Playwright / `@sparticuz/chromium` (PDF) · Sharp (images) · JWT via `jose` + `bcryptjs`
- **Commands**: `npm run dev` (port 3000) · `npm run build` · `npm run lint` · `npm run db:push` · `npm run db:seed`
- Keep the Arabic RTL UI, ETEC terminology, and Hijri-only dates intact.

---

## Skills

### `/brag` — launch video generator

Turns this project into a short, shareable launch video (15–25s) using Hyperframes.
Music, motion, and share copy included.

**Skill file (the source of truth for this skill):**

```
.agents/skills/brag/SKILL.md
```

**When to use:** the user says `/brag`, "let's brag about this", "make a launch video",
"turn this into a video", or asks to share what they built.

**Trigger:** read `.agents/skills/brag/SKILL.md` in full and follow it top to bottom.
Its bundled assets live in `.agents/skills/brag/assets/` and scripts in
`.agents/skills/brag/scripts/`. Resolve that path at runtime — do not assume a global
install location.

**Flags:** `--tone <preset|freeform>` · `--format landscape|vertical|square` ·
`--duration <sec>` · `--title <string>` · `--no-music` · `--no-sfx` · `--voice`
(narration is **off** by default).

**Output goes to** `brag-output/` (or `brag-output-<YYYY-MM-DD-HHmmss>/` if that
directory already exists). Never write generated video artifacts anywhere else.

**Requirements** — verify with `npx hyperframes doctor`:

| Requirement | Notes |
|---|---|
| Node.js 22+ | satisfied locally |
| FFmpeg + FFprobe on `PATH` | satisfied locally |
| Hyperframes CLI | `npx hyperframes` (latest) |
| Headless Chrome | cached via Hyperframes |

**Companion skills** (loaded by `/brag` step 3): `hyperframes-core`,
`hyperframes-animation`, `hyperframes-creative`, `hyperframes-keyframes`,
`hyperframes-cli`. Install/update them with `npx hyperframes skills update`.

**Guardrails:**

- Producing a video must not change application behavior. Do not touch `src/`,
  `prisma/`, `next.config.mjs`, or any app config while running `/brag`.
- `/brag` is its own workflow — do not route it into Hyperframes' generic
  promo / launch-video intent interview.
