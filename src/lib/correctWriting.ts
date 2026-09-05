import type { DailyPrompt } from '../data/prompts'

export interface SkillMetric {
  score: number
  comment: string
}

export interface CorrectionResult {
  transcription: string
  corrected: string
  explanation: string[]
  usedRequiredElements: boolean
  score: number
  breakdown?: {
    handwriting: SkillMetric
    grammar: SkillMetric
    vocabulary: SkillMetric
    naturalness: SkillMetric
  }
}

export async function requestCorrection(
  imageBase64: string,
  mediaType: string,
  prompt: DailyPrompt,
): Promise<CorrectionResult> {
  const res = await fetch('/api/correct-writing', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageBase64, mediaType, prompt }),
  })

  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw new Error(body?.error ?? `No se pudo corregir el texto (${res.status})`)
  }

  return res.json() as Promise<CorrectionResult>
}
