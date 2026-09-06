import type { DailyPrompt } from '../data/prompts'

export interface SkillMetric {
  score: number
  comment: string
}

export interface ExplanationPoint {
  title: string
  description: string
}

export interface CorrectionResult {
  transcription: string
  corrected: string
  // string[]/string: formato viejo de entradas guardadas antes de este cambio.
  explanation: ExplanationPoint[] | string[] | string
  usedRequiredElements: boolean
  // Palabras del banco pedido (vocab/verbs/adjectives/places) que el
  // estudiante usó correctamente, tal cual aparecen en el prompt del día.
  // undefined en entradas guardadas antes de este campo.
  usedWords?: string[]
  // Si usó bien la gramática opcional (bonus) del día. undefined en entradas
  // guardadas antes de este campo.
  usedBonusGrammar?: boolean
  bonusPoints?: number
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
