import type { DailyPrompt } from './prompts'

// Desafío especial de los domingos: opcional, más corto que el desafío
// diario. Es de escritura LIBRE de verdad — no se le asigna un tema ni
// palabras obligatorias ('topic' es genérico, solo indica formato/
// extensión, y vocab/verbs/adjectives/places quedan vacíos). 'grammar' es
// siempre el mismo texto "sin gramática obligatoria" para que la corrección
// no la evalúe como requisito. Los conectores N5 sugeridos van en
// 'bonusGrammar', que la API ya trata como bonus opcional (suma puntos
// extra si se usa bien, no penaliza si no aparece). themeTitle/Translation
// se muestran como una idea meramente opcional (ver Historias.tsx), no
// como instrucción de qué escribir. No reemplaza al desafío diario, se
// suma aparte. Rota semanalmente — ver weeklyChallengeForDate en lib/date.ts.
const FREE_WRITING_TOPIC =
  'Escritura libre y corta (3 a 4 oraciones) — no hay un tema asignado ni palabras obligatorias, escribí sobre lo que quieras esta semana.'
const FREE_GRAMMAR = 'Escritura libre — sin gramática obligatoria, oraciones simples con です／ます.'

export const weeklyChallenges: DailyPrompt[] = [
  {
    level: 'N5',
    grammar: FREE_GRAMMAR,
    bonusGrammar: 'そして・それから・でも・だから',
    themeTitle: '決断の瞬間',
    themeFurigana: 'けつだんのしゅんかん',
    themeTranslation: 'El momento de decidir',
    topic: FREE_WRITING_TOPIC,
    vocab: [],
    verbs: [],
    adjectives: [],
    places: [],
  },
  {
    level: 'N5',
    grammar: FREE_GRAMMAR,
    bonusGrammar: 'それから・その後で・でも',
    themeTitle: '職場の一日',
    themeFurigana: 'しょくばのいちにち',
    themeTranslation: 'Un día en el trabajo',
    topic: FREE_WRITING_TOPIC,
    vocab: [],
    verbs: [],
    adjectives: [],
    places: [],
  },
  {
    level: 'N5',
    grammar: FREE_GRAMMAR,
    bonusGrammar: '急に・そのとき・びっくりしました',
    themeTitle: '予想外の出来事',
    themeFurigana: 'よそうがいのできごと',
    themeTranslation: 'Un imprevisto',
    topic: FREE_WRITING_TOPIC,
    vocab: [],
    verbs: [],
    adjectives: [],
    places: [],
  },
  {
    level: 'N5',
    grammar: FREE_GRAMMAR,
    bonusGrammar: 'でも・だから・と思います',
    themeTitle: '誤解されたこと',
    themeFurigana: 'ごかいされたこと',
    themeTranslation: 'Algo que malentendieron de vos',
    topic: FREE_WRITING_TOPIC,
    vocab: [],
    verbs: [],
    adjectives: [],
    places: [],
  },
  {
    level: 'N5',
    grammar: FREE_GRAMMAR,
    bonusGrammar: '今度は・次からは・〜たいです',
    themeTitle: '後悔していること',
    themeFurigana: 'こうかいしていること',
    themeTranslation: 'Algo de lo que te arrepentís',
    topic: FREE_WRITING_TOPIC,
    vocab: [],
    verbs: [],
    adjectives: [],
    places: [],
  },
  {
    level: 'N5',
    grammar: FREE_GRAMMAR,
    bonusGrammar: 'だから・そのおかげで・嬉しかったです',
    themeTitle: '成功と失敗',
    themeFurigana: 'せいこうとしっぱい',
    themeTranslation: 'Éxito y fracaso',
    topic: FREE_WRITING_TOPIC,
    vocab: [],
    verbs: [],
    adjectives: [],
    places: [],
  },
  {
    level: 'N5',
    grammar: FREE_GRAMMAR,
    bonusGrammar: 'いつも・時々・なぜなら',
    themeTitle: '毎日の工夫',
    themeFurigana: 'まいにちのくふう',
    themeTranslation: 'Trucos del día a día',
    topic: FREE_WRITING_TOPIC,
    vocab: [],
    verbs: [],
    adjectives: [],
    places: [],
  },
  {
    level: 'N5',
    grammar: FREE_GRAMMAR,
    bonusGrammar: 'でも・実は・かもしれません',
    themeTitle: '思い込みを疑う',
    themeFurigana: 'おもいこみをうたがう',
    themeTranslation: 'Cuestionar suposiciones',
    topic: FREE_WRITING_TOPIC,
    vocab: [],
    verbs: [],
    adjectives: [],
    places: [],
  },
]
