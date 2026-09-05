import Anthropic from '@anthropic-ai/sdk'
import type { VercelRequest, VercelResponse } from '@vercel/node'

interface VocabWord {
  word: string
  translation: string
}

interface RequiredVerb {
  word: string
  translation: string
  form: string
}

interface RequiredAdjective {
  word: string
  translation: string
  type: 'い' | 'な'
}

interface DailyPrompt {
  level: 'N5' | 'N4'
  grammar: string
  themeTitle: string
  topic: string
  vocab: VocabWord[]
  verbs: RequiredVerb[]
  adjectives: RequiredAdjective[]
  places: VocabWord[]
}

interface RequestBody {
  imageBase64: string
  mediaType: string
  prompt: DailyPrompt
}

interface SkillMetric {
  score: number
  comment: string
}

interface CorrectionResult {
  transcription: string
  corrected: string
  explanation: string[]
  usedRequiredElements: boolean
  score: number
  breakdown: {
    handwriting: SkillMetric
    grammar: SkillMetric
    vocabulary: SkillMetric
    naturalness: SkillMetric
  }
}

const SYSTEM_PROMPT = `Sos un profesor de japonés que corrige textos escritos a mano por un estudiante hispanohablante.
Vas a recibir una foto de un texto escrito a mano en japonés, junto con la gramática objetivo, los sustantivos, verbos, adjetivos y lugares que debía usar, y el tema que se le pidió al estudiante.

El estudiante debe escribir un TEXTO COMPLETO (un párrafo de al menos 6 a 8 oraciones, no 3 frases sueltas), integrando naturalmente los sustantivos, verbos, adjetivos y lugares pedidos.

Tu tarea:
1. Transcribí exactamente lo que el estudiante escribió a mano (tal cual, incluso si tiene errores).
2. Dá una versión corregida y natural del mismo texto. Marcá en **negrita** (envolviendo el texto en asteriscos dobles, formato markdown: **así**) únicamente las palabras o partículas que cambiaste respecto a lo que escribió el estudiante — el resto del texto va sin marcar.
3. Explicá los errores encontrados (gramática, kanji, partículas, naturalidad) como una LISTA de puntos breves en español — el campo "explanation" es un array de strings, cada uno un punto corto y autocontenido (no un párrafo largo con "1) 2) 3)" adentro). Marcá en **negrita** (mismo formato **así**) los términos japoneses puntuales de los que hablás en cada punto (el error original y/o la forma correcta), para que se puedan ubicar de un vistazo.
4. Indicá si el estudiante usó correctamente la gramática objetivo y al menos la mayoría de los sustantivos, verbos, adjetivos y lugares pedidos. Los verbos y adjetivos pedidos pueden aparecer en CUALQUIER conjugación (presente, pasado, negativo, forma て, potencial, etc.) — no hace falta que coincidan con ninguna forma específica, alcanza con que la raíz de la palabra esté usada correctamente conjugada en el contexto de la oración.
5. Asigná un puntaje general de 0 a 100 evaluando: la extensión (un texto completo de 6+ oraciones, no unas pocas líneas sueltas), el uso correcto de la gramática objetivo, el uso de los sustantivos/verbos/adjetivos/lugares pedidos, y la naturalidad general. Sé exigente pero justo: 90+ es excelente y completo, 70-89 es bueno pero corto o con errores menores, menos de 70 es muy corto o tiene errores importantes.
6. Además del puntaje general, evaluá por separado estas 4 destrezas, cada una de 0 a 100 con un comentario de una sola frase corta en español:
   - "handwriting": legibilidad y trazo de la escritura a mano en la foto (proporciones, prolijidad, firmeza del trazo).
   - "grammar": uso correcto de la gramática objetivo y la estructura general de las oraciones.
   - "vocabulary": uso correcto y natural de los sustantivos/verbos/adjetivos/lugares pedidos (si usó todos o la mayoría, mejor puntaje).
   - "naturalness": qué tan natural y fluido suena el texto para alguien nativo, más allá de si es gramaticalmente correcto.

Respondé ÚNICAMENTE con un objeto JSON válido, sin texto adicional, con este formato exacto:
{"transcription": "...", "corrected": "...", "explanation": ["...", "..."], "usedRequiredElements": true, "score": 85, "breakdown": {"handwriting": {"score": 90, "comment": "..."}, "grammar": {"score": 85, "comment": "..."}, "vocabulary": {"score": 100, "comment": "..."}, "naturalness": {"score": 80, "comment": "..."}}}`

function extractJson(text: string): CorrectionResult {
  const match = text.match(/\{[\s\S]*\}/)
  if (!match) throw new Error('La respuesta del modelo no tenía JSON')
  try {
    return JSON.parse(match[0]) as CorrectionResult
  } catch (err) {
    console.error('correct-writing: JSON inválido', match[0].slice(-300))
    throw err
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const { imageBase64, mediaType, prompt } = req.body as RequestBody
  if (!imageBase64 || !mediaType || !prompt) {
    res.status(400).json({ error: 'Faltan datos en la solicitud' })
    return
  }

  try {
    // maxRetries bajo a propósito: cada reintento re-envía la foto entera y se
    // cobra como una llamada nueva. El usuario ya tiene un botón de "Rehacer"
    // manual, así que no vale la pena arriesgarse a reintentos silenciosos.
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY, maxRetries: 1 })

    const vocabText = prompt.vocab.map((w) => `${w.word} (${w.translation})`).join('、')
    const verbsText = prompt.verbs.map((w) => `${w.word} (${w.translation})`).join('、')
    const adjectivesText = prompt.adjectives.map((w) => `${w.word} (${w.translation})`).join('、')
    const placesText = prompt.places.map((w) => `${w.word} (${w.translation})`).join('、')

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-5',
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: mediaType as 'image/jpeg', data: imageBase64 },
            },
            {
              type: 'text',
              text: `Tema: ${prompt.themeTitle}\nGramática objetivo: ${prompt.grammar}\nSustantivos objetivo: ${vocabText}${verbsText ? `\nVerbos objetivo (cualquier conjugación es válida): ${verbsText}` : ''}${adjectivesText ? `\nAdjetivos objetivo (cualquier conjugación es válida): ${adjectivesText}` : ''}${placesText ? `\nLugares objetivo: ${placesText}` : ''}\nConsigna: ${prompt.topic}`,
            },
          ],
        },
      ],
    })

    const textBlock = message.content.find((block) => block.type === 'text')
    if (!textBlock || textBlock.type !== 'text') {
      throw new Error('Respuesta sin texto del modelo')
    }

    if (message.stop_reason === 'max_tokens') {
      console.error('correct-writing: respuesta cortada por max_tokens', textBlock.text.slice(-200))
      throw new Error('La respuesta se cortó por longitud (max_tokens)')
    }

    const result = extractJson(textBlock.text)
    res.status(200).json(result)
  } catch (err) {
    console.error('correct-writing error', err)
    res.status(500).json({ error: 'No se pudo corregir el texto' })
  }
}
