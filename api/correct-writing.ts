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

interface ExplanationPoint {
  title: string
  description: string
}

interface CorrectionResult {
  transcription: string
  corrected: string
  explanation: ExplanationPoint[]
  usedRequiredElements: boolean
  usedWords: string[]
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
1. Transcribí exactamente lo que el estudiante escribió a mano (tal cual, incluso si tiene errores — no los corrijas acá). Marcá en **negrita** (formato **así**) únicamente las palabras, partículas o kanji que tengan un error (gramatical, de partícula, de kanji equivocado, etc.) — el resto del texto va sin marcar. Si no hay errores, no marques nada.
2. Dá una versión corregida y natural del mismo texto. Marcá en **negrita** (envolviendo el texto en asteriscos dobles, formato markdown: **así**) únicamente las palabras o partículas que cambiaste respecto a lo que escribió el estudiante — el resto del texto va sin marcar.
   IMPORTANTE — CONSISTENCIA entre los pasos 1 y 2: cada error que marcaste en la transcripción (paso 1) tiene que tener su corrección correspondiente marcada acá en el mismo lugar de la oración, y viceversa — si marcaste algo acá como corregido, el error original que le dio origen tiene que estar marcado en la transcripción. Antes de responder, revisá que la cantidad de partes marcadas en el paso 1 coincida uno a uno con las partes marcadas acá (no dejes ninguna sin su par).
3. Explicá los errores encontrados (gramática, kanji, partículas, naturalidad) como una LISTA de puntos en español — el campo "explanation" es un array de objetos {"title": "...", "description": "..."}, uno por cada punto (no un párrafo largo con "1) 2) 3)" adentro). "title" es un resumen muy corto (3 a 6 palabras, sin punto final) del tipo de corrección (por ejemplo "Partícula incorrecta", "Kanji equivocado", "Falta de politesse"). "description" es 1 o 2 oraciones breves explicando el error y la forma correcta, marcando en **negrita** (formato **así**) los términos japoneses puntuales (el error original y/o la forma correcta), para que se puedan ubicar de un vistazo.
4. Indicá si el estudiante usó correctamente la gramática objetivo y al menos la mayoría de los sustantivos, verbos, adjetivos y lugares pedidos. Los verbos y adjetivos pedidos pueden aparecer en CUALQUIER conjugación (presente, pasado, negativo, forma て, potencial, etc.) — no hace falta que coincidan con ninguna forma específica, alcanza con que la raíz de la palabra esté usada correctamente conjugada en el contexto de la oración. Si la gramática objetivo lista varias formas alternativas separadas por "・" o "／" (por ejemplo "これ・それ・あれ" o "〜ました／〜ませんでした"), alcanza con que el estudiante use CORRECTAMENTE AL MENOS UNA de esas formas — no hace falta que use todas. Además, en el campo "usedWords" (array de strings) listá exactamente cuáles de esas palabras pedidas (tal cual están escritas en la lista de sustantivos/verbos/adjetivos/lugares objetivo, en su forma de diccionario) usó CORRECTAMENTE el estudiante en el texto — si no usó ninguna, devolvé un array vacío.
5. Asigná un puntaje general de 0 a 100 evaluando: la extensión (un texto completo de 6+ oraciones, no unas pocas líneas sueltas), el uso correcto de la gramática objetivo, el uso de los sustantivos/verbos/adjetivos/lugares pedidos, y la naturalidad general. Sé exigente pero justo: 90+ es excelente y completo, 70-89 es bueno pero corto o con errores menores, menos de 70 es muy corto o tiene errores importantes.
6. Además del puntaje general, evaluá por separado estas 4 destrezas, cada una de 0 a 100 con un comentario de una sola frase corta en español:
   - "handwriting": legibilidad y trazo de la escritura a mano en la foto (proporciones, prolijidad, firmeza del trazo).
   - "grammar": uso correcto de la gramática objetivo y la estructura general de las oraciones.
   - "vocabulary": uso correcto y natural de los sustantivos/verbos/adjetivos/lugares pedidos (si usó todos o la mayoría, mejor puntaje).
   - "naturalness": qué tan natural y fluido suena el texto para alguien nativo, más allá de si es gramaticalmente correcto.

Respondé ÚNICAMENTE con un objeto JSON válido, sin texto adicional, con este formato exacto:
{"transcription": "...", "corrected": "...", "explanation": [{"title": "...", "description": "..."}], "usedRequiredElements": true, "usedWords": ["...", "..."], "score": 85, "breakdown": {"handwriting": {"score": 90, "comment": "..."}, "grammar": {"score": 85, "comment": "..."}, "vocabulary": {"score": 100, "comment": "..."}, "naturalness": {"score": 80, "comment": "..."}}}`

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

    const vocabText = (prompt.vocab ?? []).map((w) => `${w.word} (${w.translation})`).join('、')
    const verbsText = (prompt.verbs ?? []).map((w) => `${w.word} (${w.translation})`).join('、')
    const adjectivesText = (prompt.adjectives ?? []).map((w) => `${w.word} (${w.translation})`).join('、')
    const placesText = (prompt.places ?? []).map((w) => `${w.word} (${w.translation})`).join('、')

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-5',
      max_tokens: 8192,
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
      res.status(500).json({ error: 'El texto era muy largo y la respuesta se cortó. Probá con un párrafo más corto.' })
      return
    }

    const result = extractJson(textBlock.text)
    res.status(200).json(result)
  } catch (err) {
    console.error('correct-writing error', err)
    const message = err instanceof Error ? err.message : 'Error desconocido'
    res.status(500).json({ error: `No se pudo corregir el texto: ${message}` })
  }
}
