export type FormFieldType =
  | 'short_text'
  | 'long_text'
  | 'email'
  | 'number'
  | 'select'
  | 'checkbox'
  | 'rating'
  | 'date'

export interface FormField {
  id: string
  label: string
  type: FormFieldType
  required: boolean
  placeholder?: string
  options?: string[]
}

export interface FormResponseRecord {
  id: string
  submittedAt: string
  respondentName: string
  answers: Record<string, string | number | boolean>
}

export interface FormRecord {
  id: string
  formCode: string
  title: string
  category: string
  description: string
  isOpen: boolean
  fields: FormField[]
  responses: FormResponseRecord[]
  starred?: boolean
  createdAt: string
  updatedAt: string
}

export interface FormTemplateItem {
  id: string
  name: string
  category: string
  description: string
  fields: Array<Omit<FormField, 'id'> & { id?: string }>
}

export interface FieldAnalyticsItem {
  fieldId: string
  label: string
  type: FormFieldType
  answerCount: number
  averageRating?: number
  optionBreakdown?: Array<{ option: string; count: number; pct: number }>
  recentValues: string[]
}

export interface FormAnalyticsResult {
  totalResponses: number
  completionRatePct: number
  averageRating: number | null
  fieldStats: FieldAnalyticsItem[]
}

export function generateFormCode(): string {
  const year = new Date().getFullYear()
  const rand = Math.floor(1000 + Math.random() * 9000)
  return `CLN-FRM-${year}-${rand}`
}

export function validateFormSubmission(
  form: Pick<FormRecord, 'fields' | 'isOpen'>,
  answers: Record<string, string | number | boolean>
): { valid: boolean; missingFieldIds: string[]; errors: string[] } {
  if (!form.isOpen) {
    return {
      valid: false,
      missingFieldIds: [],
      errors: ['This form is currently closed and not accepting new responses.'],
    }
  }

  const missingFieldIds: string[] = []
  const errors: string[] = []

  for (const field of form.fields) {
    const val = answers[field.id]
    const isEmpty =
      val === undefined ||
      val === null ||
      (typeof val === 'string' && val.trim() === '') ||
      (field.type === 'checkbox' && field.required && val !== true) ||
      (field.type === 'rating' && field.required && (Number(val) || 0) < 1)

    if (field.required && isEmpty) {
      missingFieldIds.push(field.id)
      errors.push(`"${field.label}" is required.`)
      continue
    }

    if (field.type === 'email' && typeof val === 'string' && val.trim() !== '') {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim())) {
        missingFieldIds.push(field.id)
        errors.push(`"${field.label}" must be a valid email address.`)
      }
    }

    if (field.type === 'rating' && val !== undefined && val !== '') {
      const r = Number(val)
      if (!Number.isFinite(r) || r < 1 || r > 5) {
        missingFieldIds.push(field.id)
        errors.push(`"${field.label}" rating must be between 1 and 5.`)
      }
    }
  }

  return { valid: errors.length === 0, missingFieldIds, errors }
}

export function computeFormAnalytics(
  form: Pick<FormRecord, 'fields' | 'responses'>
): FormAnalyticsResult {
  const fields = Array.isArray(form.fields) ? form.fields : []
  const responses = Array.isArray(form.responses) ? form.responses : []
  const totalResponses = responses.length

  let filledSlots = 0
  const totalSlots = totalResponses * Math.max(1, fields.length)
  const ratingValsAll: number[] = []

  const fieldStats: FieldAnalyticsItem[] = fields.map((field) => {
    const values = responses
      .map((r) => r.answers[field.id])
      .filter((v) => v !== undefined && v !== null && String(v).trim() !== '')

    filledSlots += values.length

    let averageRating: number | undefined
    if (field.type === 'rating') {
      const nums = values.map((v) => Number(v)).filter((n) => Number.isFinite(n) && n >= 1 && n <= 5)
      if (nums.length > 0) {
        averageRating = Math.round((nums.reduce((a, b) => a + b, 0) / nums.length) * 100) / 100
        ratingValsAll.push(...nums)
      }
    }

    let optionBreakdown: Array<{ option: string; count: number; pct: number }> | undefined
    if (field.type === 'select' && field.options && field.options.length > 0) {
      optionBreakdown = field.options.map((opt) => {
        const count = values.filter((v) => String(v) === opt).length
        return {
          option: opt,
          count,
          pct: values.length > 0 ? Math.round((count / values.length) * 100) : 0,
        }
      })
    } else if (field.type === 'checkbox') {
      const yesCount = values.filter((v) => v === true || String(v) === 'true').length
      optionBreakdown = [
        {
          option: 'Confirmed',
          count: yesCount,
          pct: totalResponses > 0 ? Math.round((yesCount / totalResponses) * 100) : 0,
        },
        {
          option: 'Unchecked',
          count: Math.max(0, totalResponses - yesCount),
          pct:
            totalResponses > 0
              ? Math.round((Math.max(0, totalResponses - yesCount) / totalResponses) * 100)
              : 0,
        },
      ]
    }

    return {
      fieldId: field.id,
      label: field.label,
      type: field.type,
      answerCount: values.length,
      averageRating,
      optionBreakdown,
      recentValues: values.slice(-5).map((v) => (typeof v === 'boolean' ? (v ? 'Yes' : 'No') : String(v))),
    }
  })

  const completionRatePct = totalResponses > 0 ? Math.round((filledSlots / totalSlots) * 100) : 0
  const averageRating =
    ratingValsAll.length > 0
      ? Math.round((ratingValsAll.reduce((a, b) => a + b, 0) / ratingValsAll.length) * 100) / 100
      : null

  return {
    totalResponses,
    completionRatePct,
    averageRating,
    fieldStats,
  }
}

function escapeCsvCell(value: unknown): string {
  const raw = String(value ?? '')
  if (/[",\n\r]/.test(raw)) return `"${raw.replace(/"/g, '""')}"`
  return raw
}

export function exportFormResponsesToCsv(form: FormRecord): string {
  const header = ['ResponseId', 'SubmittedAt', 'Respondent', ...form.fields.map((f) => f.label)]
  const lines = [header.map(escapeCsvCell).join(',')]
  for (const r of form.responses) {
    lines.push(
      [
        r.id,
        r.submittedAt,
        r.respondentName,
        ...form.fields.map((f) => {
          const val = r.answers[f.id]
          if (typeof val === 'boolean') return val ? 'Yes' : 'No'
          return val ?? ''
        }),
      ]
        .map(escapeCsvCell)
        .join(',')
    )
  }
  return lines.join('\r\n')
}

export function buildTasksFromFormResponses(
  form: FormRecord
): Array<{ title: string; description: string; assignee?: string; tags?: string[] }> {
  if (form.responses.length === 0) {
    return [
      {
        title: `Follow up on ${form.title}`,
        description: `Created from ConnectLn Forms (${form.formCode}).`,
        tags: ['Intake', form.category],
      },
    ]
  }
  return form.responses.map((resp, idx) => {
    const primarySummary = form.fields
      .slice(0, 3)
      .map((f) => `${f.label}: ${String(resp.answers[f.id] ?? '—')}`)
      .join(' | ')
    const firstTextField = form.fields.find((f) => f.type === 'short_text' || f.type === 'long_text')
    const headline =
      (firstTextField && String(resp.answers[firstTextField.id] || '').trim()) ||
      `${form.title} Submission #${idx + 1}`
    return {
      title: `${headline.slice(0, 64)} (${resp.respondentName})`,
      description: `${primarySummary} — Captured via ${form.formCode}`,
      assignee: 'Intake Triage',
      tags: ['Forms Intake', form.category],
    }
  })
}

export const FORM_TEMPLATES: FormTemplateItem[] = [
  {
    id: 'client-intake',
    name: 'Client Project Intake & Scope Form',
    category: 'Consulting & Sales',
    description: 'Capture client objectives, budget tier, target launch date, and key contact.',
    fields: [
      { id: 'f_org', label: 'Client Name or Organization', type: 'short_text', required: true, placeholder: 'Harbor Ventures LLC' },
      { id: 'f_email', label: 'Work Email', type: 'email', required: true, placeholder: 'lead@organization.com' },
      { id: 'f_scope', label: 'Project Service Track', type: 'select', required: true, options: ['Advisory & Architecture', 'Full Portal Build', 'Security Audit', 'Skilled Trades Installation'] },
      { id: 'f_date', label: 'Target Kickoff Date', type: 'date', required: false },
      { id: 'f_notes', label: 'Deliverables & Special Requirements', type: 'long_text', required: false, placeholder: 'Summarize milestones or site constraints...' },
      { id: 'f_confirm', label: 'Confirm authority to initiate project scoping', type: 'checkbox', required: true },
    ],
  },
  {
    id: 'trades-safety',
    name: 'Field Site Safety & Pre-Work Checklist',
    category: 'Skilled Trades & Field Ops',
    description: 'Daily crew safety verification, hazard mitigation, and supervisor inspection rating.',
    fields: [
      { id: 's_site', label: 'Job Site / Building Code', type: 'short_text', required: true, placeholder: 'BWI North Wing — Bay 4' },
      { id: 's_crew', label: 'Lead Technician Name', type: 'short_text', required: true, placeholder: 'Name' },
      { id: 's_hazard', label: 'Primary Hazard Control', type: 'select', required: true, options: ['Electrical Lockout/Tagout', 'Fall Protection & Harness', 'Confined Space Air Check', 'General PPE & Perimeter'] },
      { id: 's_ppe', label: 'All crew members verified wearing OSHA-compliant PPE', type: 'checkbox', required: true },
      { id: 's_score', label: 'Site Readiness Rating (1–5)', type: 'rating', required: true },
    ],
  },
  {
    id: 'feedback-nps',
    name: 'Post-Engagement Satisfaction & Rating Survey',
    category: 'Client Success',
    description: 'Measure CSAT rating, delivery speed, testimonial permission, and open feedback.',
    fields: [
      { id: 'r_name', label: 'Your Name', type: 'short_text', required: true, placeholder: 'Full name' },
      { id: 'r_rating', label: 'Overall Delivery Satisfaction (1–5)', type: 'rating', required: true },
      { id: 'r_speed', label: 'Communication & Turnaround', type: 'select', required: true, options: ['Exceeded Expectations', 'Met Expectations', 'Needs Improvement'] },
      { id: 'r_quote', label: 'What stood out most?', type: 'long_text', required: false, placeholder: 'Share brief feedback...' },
      { id: 'r_ref', label: 'Open to being a ConnectLn client reference', type: 'checkbox', required: false },
    ],
  },
  {
    id: 'event-rsvp',
    name: 'Workshop & Executive Briefing Registration',
    category: 'Events & Learning',
    description: 'Register attendees, session track selection, dietary/access needs, and email confirmation.',
    fields: [
      { id: 'e_name', label: 'Attendee Full Name', type: 'short_text', required: true, placeholder: 'Full name' },
      { id: 'e_email', label: 'Confirmation Email', type: 'email', required: true, placeholder: 'name@company.com' },
      { id: 'e_track', label: 'Workshop Track', type: 'select', required: true, options: ['AI & Systems Leadership', 'Field Trades Operations', 'Health & Practice Management'] },
      { id: 'e_seats', label: 'Number of Seats', type: 'number', required: true, placeholder: '1' },
    ],
  },
  {
    id: 'vendor-compliance',
    name: 'Vendor Onboarding & Compliance Disclosure',
    category: 'Procurement & Legal',
    description: 'Verify vendor tax ID readiness, insurance certificate status, and primary AP contact.',
    fields: [
      { id: 'v_comp', label: 'Legal Entity Name', type: 'short_text', required: true, placeholder: 'Vendor Corp' },
      { id: 'v_email', label: 'Accounts Payable Email', type: 'email', required: true, placeholder: 'ap@vendor.com' },
      { id: 'v_ins', label: 'Certificate of Insurance Active Through', type: 'date', required: true },
      { id: 'v_w9', label: 'W-9 / Tax Registration Uploaded & Verified', type: 'checkbox', required: true },
    ],
  },
]

function normalizeUserStorageKey(user?: { email?: string; id?: string; name?: string } | null): string {
  const email = (user?.email || '').trim().toLowerCase()
  const id = (user?.id || '').trim().toLowerCase()
  const name = (user?.name || '').trim().toLowerCase()
  return email || id || name || 'guest'
}

export function loadForms(
  user?: { email?: string; id?: string; name?: string } | null
): FormRecord[] {
  const key = `connectln_power_forms_v1:${normalizeUserStorageKey(user)}`
  const nowIso = new Date().toISOString()
  const earlier = new Date(Date.now() - 86400000).toISOString()

  const seed = (): FormRecord[] => [
    {
      id: 'frm-starter-intake',
      formCode: 'CLN-FRM-2026-7201',
      title: FORM_TEMPLATES[0].name,
      category: FORM_TEMPLATES[0].category,
      description: FORM_TEMPLATES[0].description,
      isOpen: true,
      fields: FORM_TEMPLATES[0].fields.map((f, idx) => ({
        ...f,
        id: f.id || `fld_intake_${idx + 1}`,
      })),
      responses: [
        {
          id: 'resp_seed_1',
          submittedAt: earlier,
          respondentName: 'Elena Vance',
          answers: {
            f_org: 'Harbor Ventures LLC',
            f_email: 'evance@harbor-ventures.com',
            f_scope: 'Advisory & Architecture',
            f_date: '2026-12-01',
            f_notes: 'Need Zero-Trust architecture sign-off packet before Q1.',
            f_confirm: true,
          },
        },
        {
          id: 'resp_seed_2',
          submittedAt: nowIso,
          respondentName: 'Marcus Reid',
          answers: {
            f_org: 'Reid Properties Group',
            f_email: 'm.reid@client-holdings.com',
            f_scope: 'Skilled Trades Installation',
            f_date: '2026-12-05',
            f_notes: 'Main commercial panel upgrade & permit filing.',
            f_confirm: true,
          },
        },
      ],
      starred: true,
      createdAt: earlier,
      updatedAt: nowIso,
    },
    {
      id: 'frm-starter-csat',
      formCode: 'CLN-FRM-2026-7209',
      title: FORM_TEMPLATES[2].name,
      category: FORM_TEMPLATES[2].category,
      description: FORM_TEMPLATES[2].description,
      isOpen: true,
      fields: FORM_TEMPLATES[2].fields.map((f, idx) => ({
        ...f,
        id: f.id || `fld_csat_${idx + 1}`,
      })),
      responses: [
        {
          id: 'csat_1',
          submittedAt: earlier,
          respondentName: 'Dr. Amara Okafor',
          answers: {
            r_name: 'Dr. Amara Okafor',
            r_rating: 5,
            r_speed: 'Exceeded Expectations',
            r_quote: 'Crystal clear deliverables and fast turnarounds.',
            r_ref: true,
          },
        },
        {
          id: 'csat_2',
          submittedAt: nowIso,
          respondentName: 'Elena Vance',
          answers: {
            r_name: 'Elena Vance',
            r_rating: 5,
            r_speed: 'Exceeded Expectations',
            r_quote: 'Seamless contract signing inside ConnectLn.',
            r_ref: true,
          },
        },
      ],
      createdAt: earlier,
      updatedAt: nowIso,
    },
  ]

  if (typeof window === 'undefined') return seed()
  try {
    const raw = localStorage.getItem(key)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch {
    // Fallback
  }
  const initial = seed()
  try {
    localStorage.setItem(key, JSON.stringify(initial))
  } catch {
    // ignore
  }
  return initial
}

export function saveForms(
  user: { email?: string; id?: string; name?: string } | null | undefined,
  forms: FormRecord[]
): void {
  if (typeof window === 'undefined') return
  const key = `connectln_power_forms_v1:${normalizeUserStorageKey(user)}`
  try {
    localStorage.setItem(key, JSON.stringify(forms.slice(0, 40)))
  } catch {
    // ignore
  }
}
