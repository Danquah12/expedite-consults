// Career quiz: scores ConnectLn professions from a member's answers using enclave (field), skills and title keywords.
// Matches are suggestions to explore, not guarantees.
import { PROFESSION_ENCLAVES } from './connectin-professions'

export interface QuizOption { id: string; label: string }
export interface QuizQuestion { id: string; text: string; options: QuizOption[] }

export const QUIZ: QuizQuestion[] = [
  {
    id: 'field', text: 'Which area interests you most?',
    options: [
      { id: 'health', label: '🩺 Health & care' }, { id: 'build', label: '🧱 Building & repairing things' },
      { id: 'tech', label: '💻 Technology & computers' }, { id: 'business', label: '🛍️ Business, money & sales' },
      { id: 'food', label: '🍽️ Food, travel & hospitality' }, { id: 'creative', label: '🎨 Arts, media & design' },
      { id: 'teach', label: '🎓 Teaching & community' }, { id: 'science', label: '🔬 Science, land & environment' },
      { id: 'move', label: '🚚 Transport, flying & shipping' }, { id: 'safety', label: '🛡️ Safety, law & public service' },
    ],
  },
  {
    id: 'style', text: 'How do you like to work?',
    options: [
      { id: 'hands', label: '🔧 With my hands and tools' }, { id: 'people', label: '🤝 Helping or serving people' },
      { id: 'data', label: '📊 With data, screens and planning' }, { id: 'outdoors', label: '🌳 Outdoors' },
      { id: 'create', label: '✏️ Creating and designing' }, { id: 'analyse', label: '🧪 Investigating and solving problems' },
    ],
  },
  {
    id: 'physical', text: 'How physical should the work be?',
    options: [{ id: 'high', label: 'Very physical' }, { id: 'mid', label: 'Some movement' }, { id: 'low', label: 'Mostly seated' }],
  },
  {
    id: 'education', text: 'How much study are you ready for?',
    options: [
      { id: 'short', label: 'On-the-job or a short course (under 1 year)' },
      { id: 'mid', label: 'Apprenticeship or diploma (1–3 years)' },
      { id: 'degree', label: 'University degree or longer' },
    ],
  },
]

const FIELD_ENCLAVES: Record<string, string[]> = {
  health: ['healthcare_medicine'],
  build: ['trades_construction', 'manufacturing_industrial', 'automotive_mechanics'],
  tech: ['tech_software', 'tech_cybersecurity', 'telecom_digital_infrastructure'],
  business: ['commerce_small_business', 'finance_accounting'],
  food: ['culinary_hospitality_events', 'personal_services_wellness'],
  creative: ['creative_media_arts'],
  teach: ['education_workforce', 'community_civic_security'],
  science: ['science_laboratory_research', 'agriculture_natural_resources', 'energy_utilities_environment'],
  move: ['aviation_aerospace_maritime', 'automotive_mechanics'],
  safety: ['community_civic_security', 'law_gov_defense'],
}

const STYLE_WORDS: Record<string, RegExp> = {
  hands: /install|repair|mechanic|weld|carpent|plumb|electric|build|fabricat|machin|technician|operator|maintenance|tool/i,
  people: /care|nurse|teach|counsel|service|support|coach|therap|guide|assistant|social|customer|host|stylist|trainer/i,
  data: /data|analy|software|account|audit|finance|plann|admin|bookkeep|engineer|cyber|network|systems|report/i,
  outdoors: /farm|forest|field|garden|land|survey|fish|mining|outdoor|ranger|driver|construction|solar|wind|grounds/i,
  create: /design|artist|media|music|photo|video|write|animat|fashion|craft|chef|bak|film|studio/i,
  analyse: /scien|research|lab|investigat|diagnos|inspect|analys|forensic|quality|test|engineer/i,
}

const DEGREE = /physician|surgeon|doctor|dentist|lawyer|attorney|judge|pharmacist|architect|scientist|professor|psychologist|engineer|veterinarian|nurse practitioner|actuar|economist|geolog|physicist|chemist/i
const SHORT = /assistant|attendant|aide|clerk|cleaner|driver|operator|helper|installer|handler|cashier|vendor|guard|server|barista|technician|worker|mechanic/i
const PHYS_HIGH = /construct|weld|carpent|plumb|farm|forest|mining|firefight|driver|mechanic|install|fabricat|lineworker|roof|mason|rigg|ranger|warehouse/i
const PHYS_LOW = /software|data|analyst|account|admin|writer|design|counsel|lawyer|programmer|developer|bookkeep|planner|manager/i

export type QuizAnswers = Record<string, string>
export interface QuizMatch { id: string; title: string; field: string; score: number; reasons: string[] }

const short = (title: string) => title.replace(/\s*\(.*?\)\s*/g, ' ').split(/[,&]/)[0].trim()

export function scoreCareers(answers: QuizAnswers, limit = 8): QuizMatch[] {
  const wanted = FIELD_ENCLAVES[answers.field] || []
  const out: QuizMatch[] = []
  for (const e of PROFESSION_ENCLAVES) {
    for (const p of e.professions) {
      const hay = `${p.title} ${(p.typicalSkills || []).join(' ')}`
      const reasons: string[] = []
      let s = 0
      if (wanted.includes(e.id)) { s += 6; reasons.push(`Fits your interest in ${e.name || 'this field'}`) }
      if (answers.style && STYLE_WORDS[answers.style]?.test(hay)) { s += 3; reasons.push('Matches how you like to work') }
      const level = DEGREE.test(p.title) ? 'degree' : SHORT.test(p.title) ? 'short' : 'mid'
      if (answers.education === level) { s += 3; reasons.push('Study level looks like a fit') }
      else if (answers.education === 'degree' && level === 'mid') s += 1
      else if (answers.education === 'short' && level === 'degree') s -= 3
      if (answers.physical === 'high' && PHYS_HIGH.test(hay)) { s += 2; reasons.push('Physical work') }
      if (answers.physical === 'low' && PHYS_LOW.test(hay)) { s += 2; reasons.push('Mostly seated work') }
      if (answers.physical === 'low' && PHYS_HIGH.test(p.title)) s -= 2
      if (s > 0) out.push({ id: p.id, title: p.title, field: e.name || '', score: s, reasons })
    }
  }
  return out.sort((a, b) => b.score - a.score || a.title.localeCompare(b.title)).slice(0, limit)
}

export const askTitle = short
