import type { DailyPrompt } from '../data/prompts'

export interface CorrectionResult {
  transcription: string
  corrected: string
  explanation: string
  usedRequiredElements: boolean
  score: number
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
    const text = await res.text().catch(() => '')
    throw new Error(`No se pudo corregir el texto (${res.status}): ${text}`)
  }

  return res.json() as Promise<CorrectionResult>
}
