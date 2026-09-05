import TinySegmenter from 'tiny-segmenter'

const segmenter = new TinySegmenter()
const KANJI_RE = /[一-龯㐀-䶿]/g
const ONLY_PUNCTUATION_RE = /^[。、！？「」『』・…\s]+$/

// La segmentación de palabras en japonés no tiene espacios como el español,
// así que se aproxima con TinySegmenter en vez de un simple split().
export function countWords(text: string): number {
  return segmenter.segment(text).filter((token) => token.trim() && !ONLY_PUNCTUATION_RE.test(token)).length
}

export function countUniqueKanji(text: string): number {
  const matches = text.match(KANJI_RE) ?? []
  return new Set(matches).size
}
