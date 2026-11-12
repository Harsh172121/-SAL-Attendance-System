# DESIGN.md — SAL Attendance Management System

## Design Read
Reading this as: Higher education institutional portal for students, faculty, and campus administrators, in a structured academic governance style, dial ENERGY 1 / RHYTHM 2 / MOTION 1.

Dial: ENERGY 1 / RHYTHM 2 / MOTION 1

---

## Brand Identity & Personality
- **Institution:** SAL Education Campus, Ahmedabad.
- **Product:** College Attendance Management System.
- **Tone:** Dependable, institutional, transparent, accessible to non-technical users.
- **Character:** Calm academic utility. Avoid trendy startup aesthetics, glowing mesh backgrounds, generic neon gradients, or artificial tech decoration.

---

## Palette (R-29: 2-3 Core Colors + 1 Accent)
- **Core 1 (Canvas & Ground):** Deep Academic Slate
  - Background base: `#090d16` (Deep Slate)
  - Layer 1 surface: `#0f172a` (Slate 900)
  - Layer 2 borders & dividers: `#1e293b` (Slate 800)
- **Core 2 (Institutional Identity):** Collegiate Navy / Blue
  - Primary interactive & brand elements: `#2563eb` (Blue 600), `#1d4ed8` (Blue 700)
  - Soft surface badge tint: `#1e3a8a33` (Navy 950 with border `#1d4ed866`)
- **Core 3 (Academic Clearance & Verification):** SAL Emerald Green
  - Attendance success & verified status: `#10b981` (Emerald 500), `#059669` (Emerald 600)
  - Soft approval badge tint: `#064e3b33` (Emerald 950 with border `#05966966`)
- **Deliberate Accent (Threshold & Alert):** Academic Amber
  - Attendance warning threshold (< 75% requirement): `#f59e0b` (Amber 500)
- **Text & Contrast (WCAG AA compliant):**
  - High emphasis: `#f8fafc` (17.5:1 on `#090d16`)
  - Medium emphasis: `#cbd5e1` (11.2:1 on `#090d16`)
  - Low emphasis / metadata: `#94a3b8` (5.8:1 on `#090d16`, exceeds 4.5:1 minimum)

---

## Typography (R-06)
- **Family:** System UI / Inter (`font-sans`)
- **Weights:** Regular (400) for prose, Medium (500) for UI labels, Semibold (600) for card titles, Bold (700) for major headings.
- **Hierarchy:**
  - Page Heading: `text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white`
  - Section Title: `text-2xl sm:text-3xl font-bold text-white`
  - Card Heading: `text-base sm:text-lg font-semibold text-white`
  - Body Text: `text-sm sm:text-base text-slate-300 leading-relaxed`
  - Metadata / Microcopy: `text-xs text-slate-400`
- **Rule:** No uppercase labels with wide tracking (`HOW IT WORKS`). No terminal-style monospace for prose or headings.

---

## Layout & Rhythm (R-05, RHYTHM 2)
1. **Header:** Clean institutional bar with official SAL crest, quick jump links, and direct portal access.
2. **Hero:** Focused proposition with live system statistics and 2 primary functional actions.
3. **Problem & Transformation:** Concrete side-by-side comparison of manual paper registers vs. digital automated workflows.
4. **Role Matrix:** 3 structured pillars for Student, Teacher, and Administrator responsibilities.
5. **System Flowchart:** 5-step compact visual flow with purposeful directional connectors.
6. **Interactive Live Sandbox:** 3 fully functional simulations (Teacher roll call, Peer proxy dispatch, Student 75% gauge) with real state toggles.
7. **System Capabilities:** Functional feature catalog categorized by operational domain.
8. **Tangible & Intangible Ledger:** Concrete institutional outcomes.
9. **Footer:** Simple campus sign-off and immediate login access.

---

## Motion & Transitions (R-19, MOTION 1)
- Motion is functional only:
  - Smooth page anchor navigation.
  - Subtle directional dashed flow on system flowchart arrows (`animate-flow-dash`).
  - Clear hover and focus states on interactive buttons and inputs.
  - All motion strictly respects `prefers-reduced-motion: reduce`.
