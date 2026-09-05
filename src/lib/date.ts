import { START_DATE, prompts, type DailyPrompt } from '../data/prompts'

const ARG_TIMEZONE = 'America/Argentina/Buenos_Aires'

function pad2(n: number): string {
  return String(n).padStart(2, '0')
}

// El desafío del día renueva a medianoche hora Argentina (no la del
// dispositivo), para que sea consistente sin importar el huso horario local.
export function todayId(): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: ARG_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date())

  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '0'
  const year = Number(get('year'))
  const month = Number(get('month'))
  const day = Number(get('day'))

  return `${year}-${pad2(month)}-${pad2(day)}`
}

export function dateIdToDaysSinceStart(dateId: string): number {
  const start = new Date(`${START_DATE}T00:00:00`)
  const date = new Date(`${dateId}T00:00:00`)
  const msPerDay = 24 * 60 * 60 * 1000
  return Math.floor((date.getTime() - start.getTime()) / msPerDay)
}

export function promptForDate(dateId: string, variant: 0 | 1 = 0): DailyPrompt {
  const daysSinceStart = Math.max(0, dateIdToDaysSinceStart(dateId))
  const index = (daysSinceStart * 2 + variant) % prompts.length
  return prompts[index]
}

export function isYesterday(dateId: string, today: string): boolean {
  const yesterday = new Date(`${today}T00:00:00`)
  yesterday.setDate(yesterday.getDate() - 1)
  const y = yesterday.getFullYear()
  const m = String(yesterday.getMonth() + 1).padStart(2, '0')
  const d = String(yesterday.getDate()).padStart(2, '0')
  return dateId === `${y}-${m}-${d}`
}

const JP_WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土']
const ES_MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
const ES_MONTHS_FULL = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

export function jpWeekdayLabel(dateId: string): string {
  const date = new Date(`${dateId}T00:00:00`)
  return `(${JP_WEEKDAYS[date.getDay()]}曜日)`
}

export function shortDate(dateId: string): string {
  const date = new Date(`${dateId}T00:00:00`)
  return `${date.getDate()} ${ES_MONTHS[date.getMonth()]}`
}

export function relativeDateLabel(dateId: string, today: string): string {
  if (dateId === today) return `Hoy · ${shortDate(dateId)}`
  if (isYesterday(dateId, today)) return `Ayer · ${shortDate(dateId)}`
  return shortDate(dateId)
}

export function currentMonthLabel(): string {
  return ES_MONTHS_FULL[new Date().getMonth()]
}

export function isSameMonth(dateId: string, today: string): boolean {
  return dateId.slice(0, 7) === today.slice(0, 7)
}
