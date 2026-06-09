// Michael Korenevsky — canonical profile context for AI generation
// Source of truth: context/context.md + Google Drive base CVs

export const PROFILE_CONTEXT = `
# CANDIDATE PROFILE: Michael Korenevsky

## Identity
- Name: Michael Korenevsky
- Role: Senior Product Manager
- Email: korm85@gmail.com
- LinkedIn: linkedin.com/in/michael-korenevsky
- Portfolio: themishka.me
- Location: Rosh Ha'Ayin, Israel
- Phone: 050-9542810
- Education: B.Sc. Mechanical Engineering, Ben-Gurion University (2008–2012)
- Languages: Hebrew (Native), English (Professional), Russian (Fluent)

## Experience Summary
~13.5 years total: ~7 years software QA (Cimatron 2012–2015, 3D Systems 2015–2022), ~4 years PM at Oqton (2022–present).

## Career Timeline
- 2012–2015: Cimatron — QA Engineer (CAD/CAM manufacturing software)
- 2015–2017: 3D Systems — QA Engineer, Founding Team (V1 product launch)
- 2017–2022: 3D Systems — QA Team Lead (defined "ready to ship" standards)
- Feb 2022–Feb 2025: Oqton — Product Manager, Simulation Suite
- Feb 2025–Present: Oqton — Senior Product Manager, AMVero (AI monitoring)

## AMVero (Current — Senior PM, Feb 2025–present)
AI-powered real-time process monitoring for additive manufacturing (LPBF). Image-based computer vision + IIoT data fusion. Detects anomalies during printing — warpage, spatter, recoater hopping, short feed, recoater lines.

### Architecture (strongest differentiator)
Field hardware → in-situ camera capture → edge inference → real-time AI anomaly detection → alerting → operations dashboard. Machine-agnostic, supports all LPBF printers. On-cloud (AWS) and on-prem deployments.

### Verified Metrics
- 5 enterprise customers within 5 months of launch (Thales, Baker Hughes, 3D Systems, ELOS Medtech, Beehive Industries + undisclosed US defense customer)
- 98% reduction in active engineering review time per build
- 18% reduction in scrap costs
- 136 hours saved per year per printer
- 98% faster root cause analysis
- ~50% machine time recovery per rejected part
- 90% model accuracy (AI defect detection)
- ~$150K annual labor savings per machine
- Compliance: ITAR, SOC 2, AS9100, FDA 21 CFR 820

### Key Contributions
- Owned product end-to-end: vision, roadmap, MVP boundaries, DRI across discovery/UX/data/engineering
- Ran structured discovery with operators and application engineers
- Validated prototypes before engineering investment
- Authored Smart Alerting Feature PRD
- Shipped under ITAR and SOC 2 as hard constraints from day one
- Built internal RAG portal (Ollama, locally hosted LLM) for sales/marketing/ops
- Used Label Studio for training data curation with data science teams

## Simulation Suite (PM Feb 2022–Feb 2025)
Physics-based predictive simulation for additive manufacturing within 3DXpert. Three interconnected modules. Served medical, aerospace, defense workflows.

### Verified Metrics
- Led cross-functional team of 11 (5 engineers, 2 designers, 2 sales, 2 application engineers) as sole PM
- Knauf Industries: compensated for ~100% of dimensional distortion (0.7mm → <0.1mm across majority of part)
- Emerson: 80% reduction in dimensional deviations, max deviation <150µm
- Visual scripting: turned multi-step configurations into single-click operations
- 2 published whitepapers post-beta
- Beta customers: Knauf Industries, Emerson

## Skills
- Product: End-to-end ownership, 0→1 (prototype→MVP→platform), roadmap, customer discovery, GTM, stakeholder management
- AI/ML: Computer vision products, RAG, Label Studio data curation, AI-augmented PM workflows (Claude Code, Figma Make)
- Delivery: Multi-persona enterprise workflows, regulated industries, cross-functional delivery
- Compliance: ITAR, SOC 2, AS9100, FDA 21 CFR 820
- Tools: Figma/FigJam, Jira, Agile, cloud + on-prem

## Positioning (Core)
Enterprise AI + regulated software delivery. Domain expertise (additive manufacturing, industrial AI) appears as proof, not as identity headline.

Hero: "I ship enterprise AI, from real-time vision systems to predictive modeling, for customers who can't afford to guess."

AMVero architecture is the strongest differentiator for any role involving field-hardware-plus-AI: sensors → edge → AI inference → alerting → dashboards.

## Target Role Categories
- STRONG FIT: Industrial AI / IIoT, Computer Vision for manufacturing, Real-time anomaly detection / QC platforms, Field hardware + AI inference + alerting (Augury, Buildots, Landing AI, Instrumental, Aquant, Sight Machine), Defense tech with software/AI + ITAR value
- VIABLE: Enterprise SaaS PM, Med tech (FDA credential), Data security/enterprise software, AI-forward roles, Simulation/digital twin
- OFF-LANE: Pure hardware/systems TPM, B2C gaming/consumer, Geospatial dev, 8+ years pure PM with no domain exception

## Hard Rules (CV Writing)
- NEVER invent metrics — only use verified figures above
- NEVER use em dashes — use commas, colons, or restructure
- NEVER use: "leveraged", "spearheaded", "synergized", "robust", "dynamic"
- NEVER put product names (AMVero, 3DXpert) in the summary
- NEVER write a QA-to-PM transition narrative in the summary
- NEVER exceed 6 bullets per role
- NEVER add bullets — rework existing ones
- PM tenure honest gap: ~4 years pure PM. Frame Simulation Suite as maturity story.
- Summary: open with achievements/metrics/scope, 3–5 sentences max
- Keep QA roles to 1 bullet each
- Include: korm85@gmail.com · linkedin.com/in/michael-korenevsky · themishka.me in header

## Base CV Variants
- General/broad (Industrial AI, Defense, IIoT, Computer Vision): file ID 1N_xEqui3ylGjVxXx_oF0JfDI-plYT9xZFN3vholmA4g
- Enterprise SaaS PM (B2B software): file ID 1gTXYeGAHsdydpOdPftj7Fph6__6fslbv
- AI Product Manager variant: file ID 1dEzhIdeB5ACt75O_5uvNaXGjYHjiR9NApTdrib2x-9g

## Outreach Rules
- Concise and direct, no buzzwords
- Lead with concrete outcome or specific fit signal
- No customer metrics in message body
- Israeli companies/contacts: use Hebrew by default
- VP-level: 3–5 sentences max
- Fire outreach BEFORE portal submission for warm referrals
`;

export const BASE_CV_GENERAL = `# Michael Korenevsky

**Senior Product Manager · B2B Platforms | 0→1 Delivery | Applied AI in Regulated Industries**

050-9542810 · korm85@gmail.com · linkedin.com/in/michael-korenevsky · themishka.me

## Summary

Senior Product Manager with an engineering foundation, experienced in owning B2B products end-to-end in regulated enterprise environments, including medical, aerospace, and defense. Have built products from prototype through MVP to scaled platform in Agile delivery, coordinating UX, data, and engineering into one coherent release. Comfortable working directly with customers and global cross-functional teams to translate ambiguous needs into a prioritized backlog and clear product decisions. Hands-on experience shipping AI capabilities into production where accuracy, auditability, and access control are non-negotiable.

## Experience

### Oqton
*Senior Product Manager | Feb 2025 – Present*
*Oqton builds industrial SaaS products that automate enterprise workflows and quality control for high-value production at scale.*

- Owned a new product line end-to-end from prototype through MVP to enterprise rollout, defining vision, roadmap, MVP boundaries, and release scope as the DRI across discovery, UX, data, and engineering.
- Signed 5 enterprise customers within 5 months, including Thales, Baker Hughes, 3D Systems and ELOS Medtech, by running structured discovery with operators and application engineers, validating prototypes before engineering investment, and staying close to deployment to ensure the product worked in practice.
- Drove 98% reduction in manual review time, delivering ~$150,000 in annual labor savings per machine by replacing a multi-step manual process with an AI-powered automated workflow; shipped real-time detection to 90% model accuracy enabling autonomous decisions on live production runs.
- Shipped under ITAR and SOC 2 as hard constraints: data residency, role-based access, auditability, and security were part of every feature definition from day one, not retrofitted.
- Defined specs and context prompts for Figma Make and Claude Code with product documentation as a persistent knowledge base, then validated prototypes directly with customers before engineering implementation to reduce feature lead time.
- Shipped a self-serve knowledge platform for sales, marketing, and operations to resolve technical questions independently, implemented as a RAG pipeline on a locally hosted LLM connected to live product documentation.

### Oqton
*Product Manager – Simulation Suite | Feb 2022 – Feb 2025*
*Owned a separate enterprise software product line: strategy, roadmap, and GTM.*

- Built a new product line from zero by shaping a third-party physics simulation engine into three workflow modules within 3DXpert, serving distinct personas in medical, aerospace, and defense to validate designs digitally and get prints right on the first run.
- Worked directly with customers to identify that complex multi-parameter workflows were the primary friction point, then prioritized visual scripting that turned multi-step configurations into single-click operations.
- Ran beta validation with 2 enterprise customers; published 2 whitepapers following beta completion, supporting sales credibility and market positioning.
- Owned GTM execution end-to-end for each release: in-product tutorials, release notes, and sales enablement messaging.

### 3D Systems
**Software QA Team Lead** | Jan 2017 – Feb 2022
- Defined what "ready to ship" meant for the team: testing scope, coverage expectations, and quality gates that held across multiple release cycles.

**Software QA Engineer – Founding Team** | 2015 – Jan 2017
- Part of the founding team for a V1 product launch, setting testing standards for a new enterprise software category.

### Cimatron
*Software QA Engineer | 2012 – 2015*
*CAD/CAM manufacturing software, early career role.*

## Skills
| Category | Skills |
|---|---|
| **Product Leadership** | End-to-end product ownership, 0→1 (Prototype → MVP → Platform), Roadmap and prioritization, Customer discovery, Stakeholder management, GTM execution |
| **Applied AI / ML** | AI features in production, RAG, Data curation (Label Studio), AI-augmented PM workflows; shipped products powered by Computer Vision |
| **Data & Delivery** | Role-based access and data governance, Multi-persona enterprise workflows, Cross-functional delivery across UX, data, and engineering |
| **Compliance** | ITAR, SOC 2, AS9100, FDA 21 CFR 820 |

## Education
**Ben-Gurion University of the Negev** | Beer Sheva, Israel
*B.Sc., Mechanical Engineering* | 2008 – 2012

## Languages
**Hebrew** (Native) · **English** (Professional) · **Russian** (Fluent)`;

export function selectBaseVariant(fitTier: string, domain: string): { variant: string; cv: string } {
  const d = domain.toLowerCase();
  if (d.includes("ai") || d.includes("iiot") || d.includes("vision") || d.includes("defense") || d.includes("simulation")) {
    return { variant: "general", cv: BASE_CV_GENERAL };
  }
  // Default to general for all cases — enterprise SaaS and AI PM variants
  // are structurally similar; general is the strongest starting point
  return { variant: "general", cv: BASE_CV_GENERAL };
}
`;
