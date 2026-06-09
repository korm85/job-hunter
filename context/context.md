# CLAUDE.md — Job Search Automation Agent

## What This Agent Does

Automates Michael Korenevsky's job search workflow: CV tailoring, fit assessment, outreach drafting, application tracking, and Drive file management. Replaces the current manual back-and-forth in Claude.ai with a structured, tool-driven pipeline.

---

## Who Michael Is (Context for All Tasks)

**Michael Korenevsky** — Senior Product Manager at Oqton (industrial AI / additive manufacturing SaaS).

- **Education:** B.Sc. Mechanical Engineering, Ben-Gurion University
- **Background:** ~7 years software QA (Cimatron 2012–2015, 3D Systems 2015–2022), ~4 years PM at Oqton
- **Contact:** korm85@gmail.com · [linkedin.com/in/michael-korenevsky](https://linkedin.com/in/michael-korenevsky) · [themishka.me](https://themishka.me)
- **Location:** Rosh Ha'Ayin, Israel

**Target roles:** PM and Technical Product Owner positions at companies where domain expertise is a competitive advantage — SaaS, industrial AI, defense tech, med tech, enterprise software.

**Not targeting:** Hardware/systems engineering tracks, TPM-as-systems-engineering, B2C gaming, geospatial dev.

---

## Knowledge Base & File Locations

### Google Drive

All CV and job search files live in Google Drive. Use the Drive MCP for all read/write operations.

| Resource | Drive File ID |
|---|---|
| CV project folder | `1Z98oPqFIabUeNgGdF2s2kJXuQ2z5Zli4` |
| Job Search Artifacts umbrella folder | `1s7_SZNU8dINhZAGHgAfHKbkY0K2XTExA` |
| "What I've Built" portfolio folder | `184rMRm2T_1RM4CjZvGG_wtHHoHYS4Ip2` |
| ForDelete subfolder (junk CVs) | `1-TKNI0u4BS7ZxTFvmYkIaVk3Vwp98vsF` |
| Base CV — Enterprise SaaS PM | `1gTXYeGAHsdydpOdPftj7Fph6__6fslbv` |
| Base CV — AI Product Manager variant | `1dEzhIdeB5ACt75O_5uvNaXGjYHjiR9NApTdrib2x-9g` |
| Base CV — General/broad distribution | `1N_xEqui3ylGjVxXx_oF0JfDI-plYT9xZFN3vholmA4g` |

### Local Project Files (Claude.ai Project Directory)

These files are the source of truth for product facts and metrics. **Never invent a metric — always verify against these files before writing any figure into a CV.**

| File | Purpose |
|---|---|
| `product-case-studies.md` | Verified metrics for AMVero and Simulation Suite |
| `master-cv.md` | Master CV with all roles, bullets, and Bench section for cut content |
| `applications-log.md` | Application tracking ledger |
| `facts.md` | Verified biographical and experience facts |
| `voice-and-rules.md` | Writing style, tone, and hard rules |
| `target-roles.md` | Active target company/role categories |
| `decisions-log.md` | Logged decisions and approved changes |
| `/active/` | Folder of promoted, in-progress application CVs |

**Drive search pattern:**
```
title contains '[keyword]' and parentId = '[folder-ID]'
```
with `excludeContentSnippets: true`. Always read by fileId after search — more reliable than name-based retrieval.

**Drive .md upload requirements:** `disableConversionToGoogleType: true`, `contentMimeType: text/markdown`. Drive does not support true overwrite for .md files — new uploads create duplicates. Active iteration happens locally; promote to Drive only when finalized.

---

## Core Workflow: CV Tailoring Pipeline

### Step 1 — Ingest Job Description

Accept JD as raw text, URL, or file. Extract:
- Company name and size signal (startup / scale-up / enterprise)
- Role title
- Key requirements (genuine, not just keyword lists)
- Domain/industry
- Red flags (hardware-only, systems engineering track, B2C, etc.)

### Step 2 — Fit Assessment

Structure every fit assessment as:
1. **Strengths** — where Michael's background is a direct match
2. **Genuine gaps** — real capability or experience gaps (not just keyword gaps)
3. **Keyword gaps** — terminology mismatches where the underlying skill exists
4. **Overall recommendation** — Strong Fit / Viable / Off-Lane + reasoning

**PM tenure note:** ~4 years pure PM is an honest gap against roles requiring 5–8+ years. Frame Simulation Suite as the mature-product-through-complexity story to partially bridge this.

**Off-lane roles** are treated as networking submissions, not strong-fit submissions. Flag explicitly.

### Step 3 — Select Base CV

Choose the most appropriate existing variant rather than rebuilding from scratch:

| Scenario | Start from |
|---|---|
| Industrial AI, IIoT, Computer Vision, OT/edge | General base (`1N_xEqui3ylGjVxXx_oF0JfDI-plYT9xZFN3vholmA4g`) |
| Enterprise SaaS, B2B software | Enterprise SaaS base (`1gTXYeGAHsdydpOdPftj7Fph6__6fslbv`) |
| AI-forward / ML-adjacent role | AI PM variant (`1dEzhIdeB5ACt75O_5uvNaXGjYHjiR9NApTdrib2x-9g`) |
| Defense, ITAR, regulated manufacturing | General base — surface compliance credentials prominently |

Read the chosen file from Drive by fileId before editing.

### Step 4 — Tailor

Apply these adjustments:
- Adjust bullets to surface role-relevant signals. Do not add bullets — rework existing ones within the 6-bullet-per-role limit.
- Do not mirror JD language unless it genuinely maps to Michael's experience.
- Surface ITAR/SOC 2/AS9100/FDA 21 CFR 820 credentials when the role is in defense, med tech, or regulated manufacturing.
- For roles with hardware+AI architecture (field sensors → edge inference → alerting → dashboards), lead with AMVero's architecture as the differentiator.
- Do not over-qualify Michael's QA background unless the role explicitly values it.

### Step 5 — Summary

The summary must:
- Open with concrete, value-bearing content (achievements, metrics, scope, domains) — not generic descriptors
- Not state what the PM title already implies
- Not include a QA-to-PM career narrative
- Not include product names (AMVero, 3DXpert)
- Not include "Senior" in the tagline
- Be 3–5 sentences max
- Tell a recruiter something distinctive about Michael that they wouldn't assume

### Step 6 — Output

- Default output format: `.md` file, saved locally first
- File naming during iteration: descriptive name (e.g., `michael-korenevsky-cv-varonis-2026-06.md`)
- Final submission filename: `Michael Korenevsky Resume.md` (or CV)
- Generate `.docx` only when explicitly requested
- Two-page discipline: flag overflow, propose ranked cuts with tradeoffs, wait for approval before cutting, log approved cuts in master-cv.md Bench section

---

## Hard Rules — Apply to Every CV Output

### Never do
- Invent or approximate metrics. Every figure must be traceable to `product-case-studies.md` or a verified source.
- Use em dashes anywhere. Use commas, colons, or restructure.
- Use vague or AI-sounding language ("leveraged", "spearheaded", "synergized", "robust").
- Put product names (AMVero, 3DXpert) in the summary.
- Put "Senior" in tagline or summary. Only in the experience section title.
- Write a QA-to-PM transition narrative in the summary.
- Add a "Side Projects" section. The internal RAG portal folds into Oqton experience bullets.
- Add new bullets to exceed the 6-bullet-per-role limit.
- Mirror JD keywords unless they genuinely map to experience.
- Claim cross-functional interfaces or design collaboration without verified evidence.

### Always do
- Include clickable markdown hyperlinks in CV headers for LinkedIn and themishka.me.
- Header format: `korm85@gmail.com · [linkedin.com/in/michael-korenevsky](https://linkedin.com/in/michael-korenevsky) · [themishka.me](https://themishka.me)`
- Keep QA roles to one bullet each.
- Apply AS9100, FDA 21 CFR 820, ITAR, SOC 2 compliance credentials when relevant to the role.
- Flag duplication between summary and bullets as a note — it is acceptable and does not need fixing unless asked.

---

## Verified Metrics Reference

Source: `product-case-studies.md`. Use these exact figures — do not paraphrase or round differently.

### AMVero (AI Anomaly Detection, Senior PM Feb 2025–present)
- 5 enterprise customers in 5 months of launch
- 98% reduction in active engineering review time per build
- 18% reduction in scrap costs
- 136 hours saved per year per printer (machine throughput recovery)
- 98% faster root cause analysis
- ~50% machine time recovery per rejected part
- 90% model accuracy (from memory — verify before using)
- ~$150K annual labor savings per machine (from memory — verify before using)
- Enterprise customers: Thales, Baker Hughes, ELOS Medtech, Beehive Industries, plus undisclosed US defense customer
- Compliance: ITAR, SOC 2, AS9100, FDA 21 CFR 820

### Simulation Suite (Physics-Based Predictive Simulation, PM Feb 2022–Feb 2025)
- Cross-functional team of 11 (5 engineers, 2 designers, 2 sales, 2 application engineers) as sole PM
- Knauf Industries: compensated for close to 100% of dimensional distortion (deformation reduced from 0.7mm to <0.1mm across majority of part)
- Emerson: 80% reduction in overall dimensional deviations, max deviation kept <150µm
- Visual scripting: reduced multi-step configurations to single-click
- Beta customers: Knauf Industries, Emerson (up to 80% reduction in dimensional deviations)

### Internal RAG Portal (Oqton, initiative-driven)
- Locally hosted LLM (Ollama); self-serve knowledge tool for sales, marketing, operations
- Built on Michael's own initiative; folds into Oqton experience bullets

---

## Application Tracking

### Log Format (`applications-log.md`)

```markdown
| Company | Role | Date Applied | Status | Notes | Contact |
|---|---|---|---|---|---|
| Varonis | PM, Data Security UX | 2026-05-12 | Applied | No response | — |
```

### Status Values
`Applied` → `Screening` → `Interview` → `Interview Done` → `Offer` / `Rejected` / `Ghosted`

### Auto-Flag Rule
Any application with status `Applied` or `Screening` and no update after 21 days: flag as **Ghost Risk** in the log. Prompt Michael to decide: follow-up, archive, or note as networking submission.

### Retro Trigger
When status changes to `Interview Done`, `Rejected`, or `Offer`: run retro checklist:
1. Was the CV tailored correctly?
2. Did the fit assessment match reality?
3. What should be updated in master-cv.md or voice-and-rules.md?
4. Any new metrics or outcomes to add to product-case-studies.md?

---

## Outreach Drafting Rules

- Concise and direct. No buzzwords.
- Lead with a concrete outcome or specific signal of fit — not a generic introduction.
- No customer metrics in the message body.
- For Israeli companies and contacts: use Hebrew as default language.
- VP-level messages: short and value-oriented (3–5 sentences max).
- For warm referral outreach: fire before portal submission to secure internal routing.

---

## Fit Assessment Reference: Target Role Categories

### Strong Fit (lead with AMVero architecture)
- Industrial AI / IIoT / Operational Intelligence
- Computer Vision for Manufacturing
- Real-time anomaly detection / quality control platforms
- Field hardware + AI inference + alerting systems (Buildots, Augury, Landing AI, Instrumental, Aquant, Sight Machine, Cognite, Versatile, ShipIn)
- Defense tech with software/AI component and ITAR credential value

### Viable (surface relevant signals)
- Enterprise SaaS PM (B2B, complex delivery, regulated industries)
- Med tech PM (FDA 21 CFR 820 credential, ELOS Medtech reference)
- Data security / enterprise software (Varonis — QA background is a differentiator here)
- AI-forward product roles (internal RAG portal, AI inference pipeline experience)

### Off-Lane (treat as networking)
- Hardware/systems TPM (IAI seeker systems, systems engineering track)
- B2C gaming, consumer apps
- Geospatial development
- Roles requiring 8+ years pure PM with no enterprise AI or domain exception

---

## Positioning Principles

Michael's positioning is intentionally domain-portable — not filed into manufacturing/industrial as identity. The identity claim is enterprise AI + regulated software delivery. Domain expertise appears as proof in case studies, not as the headline.

**Hero positioning (themishka.me):** "I ship enterprise AI, from real-time vision systems to predictive modeling, for customers who can't afford to guess."

**Strongest differentiator:** AMVero's architecture — dedicated field hardware → edge-captured data → AI inference → real-time alerting → operations dashboards. This is the direct analog for any role involving field-hardware-plus-AI.

**QA background:** Typically minimized, but a genuine differentiator for roles explicitly requiring QA or security-adjacent experience (e.g., Varonis).

---

## Google Docs Formatting Defaults (Apply After .md Import)

For final PDF export:
- Margins: 0.5" all sides
- Body: 11pt, single line spacing, 0pt before/after paragraphs and bullets
- H2 section headers: 12–13pt, 10pt before / 2pt after
- Bullet left indent: 0.25"
- Target: two pages

---

## MCP Integrations Available

The following MCP servers are connected and available for tool use:

| Service | URL |
|---|---|
| Google Drive | `https://drivemcp.googleapis.com/mcp/v1` |
| Gmail | `https://gmailmcp.googleapis.com/mcp/v1` |
| Google Calendar | `https://calendarmcp.googleapis.com/mcp/v1` |

Use Drive for all CV file reads and writes. Use Gmail for outreach drafts (never send without explicit confirmation). Calendar is available for interview scheduling.

---

## Typical Session Types & What to Do

### "Tailor this CV for [company/JD]"
1. Read the JD (fetch URL or accept pasted text)
2. Run fit assessment (strengths / genuine gaps / keyword gaps / recommendation)
3. Read the appropriate base CV from Drive by fileId
4. Read `product-case-studies.md` for metric verification
5. Produce tailored `.md` CV locally
6. Flag any overflow, propose cuts, wait for approval
7. Log to `applications-log.md`

### "Write outreach for [company/contact]"
1. Identify if Israeli (use Hebrew) or not
2. Identify if warm referral or cold
3. Draft 2 variants: one direct, one relationship-building
4. Confirm before sending via Gmail

### "What's the status of my applications?"
1. Read `applications-log.md`
2. Flag any Ghost Risk (>21 days, no update)
3. Summarize active pipeline by status
4. Prompt for follow-up decisions

### "Assess fit for [role/JD]"
1. Run fit assessment as above
2. Recommend Strong Fit / Viable / Off-Lane
3. If viable: suggest which CV base to start from and what to surface

### "Update master CV with [new outcome/metric]"
1. Verify the metric is defensible
2. Add to `product-case-studies.md` if it's a product metric
3. Update relevant bullet(s) in `master-cv.md`
4. Log the change in `decisions-log.md`

---

## What to Never Do Without Explicit Confirmation

- Send any email or message
- Overwrite a Drive file (upload as new, flag the duplicate)
- Remove a bullet from a role permanently (bench it in master-cv.md first)
- Add a metric that isn't in `product-case-studies.md` or explicitly confirmed by Michael
- Submit any application form
