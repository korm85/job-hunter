import Anthropic from "@anthropic-ai/sdk";
import { PROFILE_CONTEXT, selectBaseVariant } from "./profile";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export interface FitAssessment {
  recommendation: "Strong Fit" | "Viable" | "Off-Lane";
  score: number; // 0-100 match score
  strengths: string[];
  genuineGaps: string[];
  keywordGaps: string[];
  summary: string;
}

export interface GeneratedMaterials {
  fitAssessment: FitAssessment;
  tailoredCv: string;
  coverLetter: string;
  linkedinMessage: string;
  baseVariant: string;
}

export async function generateFitAssessment(
  jobTitle: string,
  company: string,
  description: string,
  domain: string
): Promise<FitAssessment> {
  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: `${PROFILE_CONTEXT}

---

Assess Michael's fit for this role. Return ONLY valid JSON matching this schema:
{
  "recommendation": "Strong Fit" | "Viable" | "Off-Lane",
  "score": <integer 0-100 where 100 = perfect match for Michael's exact background>,
  "strengths": ["...", "..."],
  "genuineGaps": ["..."],
  "keywordGaps": ["..."],
  "summary": "2-3 sentence executive summary of fit"
}

Score guide: 85-100 = core domain match (LPBF/AM/CV/IIoT + PM), 60-84 = strong adjacent, 40-59 = viable with gaps, <40 = off-lane.

Job: ${jobTitle} at ${company}
Domain: ${domain}

Job Description:
${description}

Rules:
- Genuine gaps = real capability or experience gaps
- Keyword gaps = terminology mismatches where underlying skill exists
- PM tenure (~4 years pure PM) is an honest gap against 5-8+ year requirements
- Surface ITAR/SOC2/AS9100/FDA credentials when relevant
- Off-Lane = hardware TPM track, B2C, geospatial dev, 8+ yr pure PM with no domain exception`,
      },
    ],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Failed to parse fit assessment JSON");
  return JSON.parse(jsonMatch[0]) as FitAssessment;
}

export async function generateTailoredCv(
  jobTitle: string,
  company: string,
  description: string,
  domain: string
): Promise<{ cv: string; baseVariant: string }> {
  const { variant, cv: baseCv } = selectBaseVariant("Viable", domain);

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 3000,
    messages: [
      {
        role: "user",
        content: `${PROFILE_CONTEXT}

---

Tailor Michael's CV for this role. Start from the base CV below and adjust — do NOT rebuild from scratch.

Base CV:
${baseCv}

Job: ${jobTitle} at ${company}
Domain: ${domain}

Job Description:
${description}

Tailoring rules:
- Adjust bullets to surface role-relevant signals. Rework existing bullets, do not add new ones (6-bullet max per role).
- Do not mirror JD language unless it genuinely maps to Michael's experience.
- Surface ITAR/SOC2/AS9100/FDA 21 CFR 820 when role is defense, med tech, or regulated manufacturing.
- For hardware+AI architecture roles: lead with AMVero's field→edge→AI→alerting→dashboard architecture.
- Summary: open with concrete value (achievements, metrics, scope). 3–5 sentences. No product names in summary. No "Senior" in tagline. No QA-to-PM narrative.
- Keep QA roles to 1 bullet each.
- NEVER invent metrics. Only use verified figures from the profile context.
- NEVER use em dashes. NEVER use: leveraged, spearheaded, synergized, robust.
- Output clean markdown CV only. No explanation text.`,
      },
    ],
  });

  const cv = response.content[0].type === "text" ? response.content[0].text : baseCv;
  return { cv, baseVariant: variant };
}

export async function generateCoverLetter(
  jobTitle: string,
  company: string,
  description: string,
  domain: string
): Promise<string> {
  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 800,
    messages: [
      {
        role: "user",
        content: `${PROFILE_CONTEXT}

---

Write a cover letter for Michael applying to this role.

Job: ${jobTitle} at ${company}
Domain: ${domain}

Job Description:
${description}

Rules:
- 3 short paragraphs max. Concise and direct.
- Open with a concrete outcome or specific fit signal — not "I am writing to apply for..."
- No buzzwords: no "leveraged", "spearheaded", "passionate", "excited".
- No customer metrics in the body.
- No em dashes.
- If Israeli company: write in Hebrew.
- Output the cover letter only. No explanation.`,
      },
    ],
  });

  return response.content[0].type === "text" ? response.content[0].text : "";
}

export async function generateLinkedInMessage(
  jobTitle: string,
  company: string,
  contactName: string | null,
  isIsraeli: boolean
): Promise<string> {
  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 300,
    messages: [
      {
        role: "user",
        content: `${PROFILE_CONTEXT}

---

Write a LinkedIn outreach message from Michael to a ${contactName ? `contact named ${contactName}` : "hiring manager or employee"} at ${company} regarding the ${jobTitle} role.

Rules:
- VP-level: 3–5 sentences max. Concise and value-oriented.
- Lead with a concrete outcome or specific fit signal.
- No customer metrics in the body.
- No buzzwords.
- No em dashes.
- ${isIsraeli ? "Write in Hebrew." : "Write in English."}
- Purpose: secure internal routing BEFORE portal submission (warm referral outreach).
- Output the message only. No subject line. No explanation.`,
      },
    ],
  });

  return response.content[0].type === "text" ? response.content[0].text : "";
}

export async function generateAllMaterials(
  jobTitle: string,
  company: string,
  description: string,
  domain: string,
  isIsraeli: boolean
): Promise<GeneratedMaterials> {
  const [fitAssessment, cvResult, coverLetter, linkedinMessage] = await Promise.all([
    generateFitAssessment(jobTitle, company, description, domain),
    generateTailoredCv(jobTitle, company, description, domain),
    generateCoverLetter(jobTitle, company, description, domain),
    generateLinkedInMessage(jobTitle, company, null, isIsraeli),
  ]);

  return {
    fitAssessment,
    tailoredCv: cvResult.cv,
    coverLetter,
    linkedinMessage,
    baseVariant: cvResult.baseVariant,
  };
}
