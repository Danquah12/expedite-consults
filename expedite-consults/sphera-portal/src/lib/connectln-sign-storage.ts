import { pushStudioModuleCloud } from './connectln-studio-cloud'

export type SignEnvelopeStatus = 'draft' | 'sent' | 'completed' | 'declined' | 'voided'

export interface SignSigner {
  id: string
  name: string
  email: string
  role: string
  order: number
  status: 'pending' | 'signed' | 'declined'
  signedAt?: string
  signatureDataUrl?: string
  typedSignature?: string
  signatureFont?: string
}

export interface SignAuditEvent {
  id: string
  timestamp: string
  actor: string
  action: string
  detail: string
}

export interface SignEnvelopeRecord {
  id: string
  envelopeCode: string
  title: string
  category: string
  status: SignEnvelopeStatus
  documentHtml: string
  sourceDocId?: string
  signers: SignSigner[]
  requiredChecks: Array<{ id: string; label: string; checked: boolean }>
  auditTrail: SignAuditEvent[]
  documentSha256?: string
  createdAt: string
  updatedAt: string
  completedAt?: string
  authorName: string
  starred?: boolean
}

export interface SignTemplateItem {
  id: string
  name: string
  category: string
  description: string
  defaultRoles: string[]
  requiredChecks: string[]
  documentHtml: string
}

const textEncoder = new TextEncoder()

// Deterministic FIPS 180-4 SHA-256 fallback for environments without SubtleCrypto
const SHA256_K = new Uint32Array([
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
])

function rotr(x: number, n: number): number {
  return (x >>> n) | (x << (32 - n))
}

function sha256SyncHex(input: string): string {
  const bytes = textEncoder.encode(input)
  const bitLen = bytes.length * 8
  const paddedLen = Math.ceil((bytes.length + 9) / 64) * 64
  const buf = new Uint8Array(paddedLen)
  buf.set(bytes)
  buf[bytes.length] = 0x80
  const dv = new DataView(buf.buffer)
  dv.setUint32(paddedLen - 8, Math.floor(bitLen / 0x100000000), false)
  dv.setUint32(paddedLen - 4, bitLen >>> 0, false)

  const h = new Uint32Array([
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
    0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
  ])
  const w = new Uint32Array(64)

  for (let offset = 0; offset < paddedLen; offset += 64) {
    for (let i = 0; i < 16; i++) {
      w[i] = dv.getUint32(offset + i * 4, false)
    }
    for (let i = 16; i < 64; i++) {
      const s0 = rotr(w[i - 15], 7) ^ rotr(w[i - 15], 18) ^ (w[i - 15] >>> 3)
      const s1 = rotr(w[i - 2], 17) ^ rotr(w[i - 2], 19) ^ (w[i - 2] >>> 10)
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) >>> 0
    }
    let [a, b, c, d, e, f, g, hh] = h
    for (let i = 0; i < 64; i++) {
      const S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25)
      const ch = (e & f) ^ (~e & g)
      const temp1 = (hh + S1 + ch + SHA256_K[i] + w[i]) >>> 0
      const S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22)
      const maj = (a & b) ^ (a & c) ^ (b & c)
      const temp2 = (S0 + maj) >>> 0
      hh = g
      g = f
      f = e
      e = (d + temp1) >>> 0
      d = c
      c = b
      b = a
      a = (temp1 + temp2) >>> 0
    }
    h[0] = (h[0] + a) >>> 0
    h[1] = (h[1] + b) >>> 0
    h[2] = (h[2] + c) >>> 0
    h[3] = (h[3] + d) >>> 0
    h[4] = (h[4] + e) >>> 0
    h[5] = (h[5] + f) >>> 0
    h[6] = (h[6] + g) >>> 0
    h[7] = (h[7] + hh) >>> 0
  }

  return Array.from(h)
    .map((val) => val.toString(16).padStart(8, '0'))
    .join('')
}

function canonicalEnvelopePayload(
  envelope: Pick<SignEnvelopeRecord, 'envelopeCode' | 'title' | 'documentHtml' | 'signers'>
): string {
  const signerSummary = (envelope.signers || [])
    .map((s) => `${s.name.trim()}|${s.email.trim().toLowerCase()}|${s.role.trim()}|${s.status}|${s.signedAt || ''}`)
    .join(';')
  const normalizedHtml = String(envelope.documentHtml || '').replace(/\s+/g, ' ').trim()
  return `CLN-SIGN-V1::${envelope.envelopeCode}::${envelope.title.trim()}::${normalizedHtml}::${signerSummary}`
}

export async function computeSignEnvelopeHash(
  envelope: Pick<SignEnvelopeRecord, 'envelopeCode' | 'title' | 'documentHtml' | 'signers'>
): Promise<string> {
  const payload = canonicalEnvelopePayload(envelope)
  try {
    if (typeof globalThis !== 'undefined' && globalThis.crypto?.subtle) {
      const digest = await globalThis.crypto.subtle.digest(
        'SHA-256',
        textEncoder.encode(payload)
      )
      return Array.from(new Uint8Array(digest))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('')
    }
  } catch {
    // Fall back to deterministic JS SHA-256
  }
  return sha256SyncHex(payload)
}

export async function verifySignEnvelopeIntegrity(
  envelope: SignEnvelopeRecord
): Promise<{ verified: boolean; expectedHash: string; computedHash: string }> {
  const computedHash = await computeSignEnvelopeHash(envelope)
  const expectedHash = envelope.documentSha256 || ''
  return {
    verified: Boolean(expectedHash) && expectedHash === computedHash,
    expectedHash,
    computedHash,
  }
}

export function generateEnvelopeCode(): string {
  const year = new Date().getFullYear()
  const rand = Math.floor(1000 + Math.random() * 9000)
  return `CLN-SIGN-${year}-${rand}`
}

export const SIGN_TEMPLATES: SignTemplateItem[] = [
  {
    id: 'mutual-nda',
    name: 'Mutual Non-Disclosure Agreement (NDA)',
    category: 'Confidentiality',
    description: 'Two-way protection of technical designs, pricing, and client proprietary data.',
    defaultRoles: ['Disclosing Partner', 'Receiving Partner'],
    requiredChecks: [
      'Both parties confirm confidentiality obligations apply to written and digital disclosures.',
      'Authorized signatories hold authority to bind their respective organizations.',
    ],
    documentHtml: `<h1>Mutual Non-Disclosure Agreement (NDA)</h1>
<p><strong>Effective Date:</strong> Immediate upon final electronic signature.</p>
<h2>1. Purpose of Disclosure</h2>
<p>The undersigned parties intend to evaluate and execute collaborative technical, advisory, or construction services across ConnectLn 360 and may exchange confidential commercial, architectural, and operational records.</p>
<h2>2. Confidentiality Obligations</h2>
<ul>
  <li>Each receiving party shall exercise reasonable care to safeguard proprietary information, rate cards, client lists, and technical specifications.</li>
  <li>Confidential information shall not be disclosed to unrelated third parties without prior written consent.</li>
</ul>
<h2>3. Term &amp; Return of Materials</h2>
<p>Obligations remain active for three (3) years from execution. Upon written request, digital and printed copies shall be returned or securely destroyed.</p>`,
  },
  {
    id: 'independent-contractor',
    name: 'Independent Contractor & Trade Agreement',
    category: 'Workforce & Trades',
    description: 'Clear scope, safety compliance, milestone invoicing, and independent status terms.',
    defaultRoles: ['Hiring Client', 'Lead Contractor'],
    requiredChecks: [
      'Contractor confirms valid trade licensing and active general liability coverage.',
      'Milestone deliverables and change-order approval workflow are acknowledged.',
    ],
    documentHtml: `<h1>Independent Contractor &amp; Trade Services Agreement</h1>
<p><strong>Governing Platform:</strong> ConnectLn 360 Business Workspace</p>
<h2>1. Scope of Services</h2>
<p>Contractor agrees to perform the trade, consulting, or engineering tasks detailed in attached project work orders in strict compliance with applicable local codes and site safety standards.</p>
<h2>2. Compensation &amp; Payment Gates</h2>
<ul>
  <li>Milestone invoices submitted through ConnectLn Invoice &amp; Ledger are net due upon inspection approval.</li>
  <li>Additional out-of-scope labor requires a signed ConnectLn Change Order prior to mobilization.</li>
</ul>
<h2>3. Independent Relationship</h2>
<p>Contractor operates as an independent business entity responsible for crew supervision, statutory withholdings, tools, and insurance coverages.</p>`,
  },
  {
    id: 'change-order',
    name: 'Project Change Order Authorization',
    category: 'Construction & Ops',
    description: 'Formalize added scope, material price adjustments, and schedule impact cleanly.',
    defaultRoles: ['Project Owner', 'Project Lead'],
    requiredChecks: [
      'Itemized cost adjustment and updated target completion date reviewed.',
      'Notice to proceed authorized for modified scope.',
    ],
    documentHtml: `<h1>Project Change Order Authorization</h1>
<p><strong>Change Order Ref:</strong> CO-04 · <strong>Original Contract:</strong> Active Master Agreement</p>
<h2>1. Description of Modified Scope</h2>
<p>Addition of upgraded structural framing reinforcement, weatherproof fascia trim, and secondary electrical panel inspection as requested during site walk-through.</p>
<h2>2. Financial &amp; Schedule Impact</h2>
<table>
  <tr><th>Adjustment Line</th><th>Allocation</th><th>Amount</th></tr>
  <tr><td>Additional Skilled Labor (14 hrs)</td><td>Field Crew</td><td>$1,190.00</td></tr>
  <tr><td>Engineered Hardware &amp; Conduit</td><td>Materials</td><td>$640.00</td></tr>
  <tr><td><strong>Net Change Order Total</strong></td><td><strong>Fixed Adjustment</strong></td><td><strong>$1,830.00</strong></td></tr>
</table>
<p><strong>Schedule Extension:</strong> +3 Business Days added to final milestone date.</p>`,
  },
  {
    id: 'client-sow',
    name: 'Client Statement of Work & Milestone Approval',
    category: 'Commercial',
    description: 'Authorize deliverables, acceptance criteria, and milestone billing stages.',
    defaultRoles: ['Client Representative', 'Delivery Lead'],
    requiredChecks: [
      'Deliverables and acceptance testing criteria verified.',
      'Authorized milestone payment schedule approved.',
    ],
    documentHtml: `<h1>Statement of Work &amp; Milestone Authorization</h1>
<h2>1. Engagement Objectives</h2>
<p>Delivery Partner will complete assessment, technical implementation, field testing, and handover documentation per the approved project brief.</p>
<h2>2. Milestone Sign-Off Gates</h2>
<ul>
  <li><strong>Gate 1 (35%):</strong> Mobilization &amp; design sign-off.</li>
  <li><strong>Gate 2 (45%):</strong> Core execution &amp; QA verification.</li>
  <li><strong>Gate 3 (20%):</strong> Final walk-through &amp; warranty certificate issuance.</li>
</ul>`,
  },
  {
    id: 'safety-waiver',
    name: 'Equipment & Jobsite Safety Waiver',
    category: 'Safety & Compliance',
    description: 'Jobsite hazard briefing acknowledgment, PPE confirmation, and equipment check.',
    defaultRoles: ['Safety Supervisor', 'Crew Member'],
    requiredChecks: [
      'Personal Protective Equipment (PPE) inspected and fitted prior to entry.',
      'Lockout/tagout zones and emergency egress exits reviewed.',
    ],
    documentHtml: `<h1>Jobsite Safety &amp; Equipment Check Acknowledgment</h1>
<h2>1. Site Briefing Confirmation</h2>
<p>The undersigned confirms participation in the pre-shift safety briefing covering fall protection, electrical isolation boundaries, lifting clearances, and emergency contacts.</p>
<h2>2. Compliance Pledge</h2>
<p>No hazardous operation shall commence until safety barriers and shutoff verifications are actively in place.</p>`,
  },
]

export function createEnvelopeFromStudioDoc(
  doc: { id: string; title: string; contentHtml: string; category?: string },
  user?: { name?: string; email?: string } | null
): SignEnvelopeRecord {
  const now = new Date().toISOString()
  const actorName = user?.name || 'ConnectLn Member'
  const actorEmail = user?.email || 'member@conectln.com'
  const code = generateEnvelopeCode()
  return {
    id: `env_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    envelopeCode: code,
    title: doc.title || 'Agreement for E-Signature',
    category: doc.category || 'ConnectLn Docs Import',
    status: 'draft',
    sourceDocId: doc.id,
    documentHtml: doc.contentHtml || '<p>Agreement terms imported from ConnectLn Docs.</p>',
    signers: [
      {
        id: `signer_${Date.now()}_1`,
        name: actorName,
        email: actorEmail,
        role: 'Authorized Sender',
        order: 1,
        status: 'pending',
      },
      {
        id: `signer_${Date.now()}_2`,
        name: 'Client / Counterparty',
        email: 'client@example.com',
        role: 'Counterparty Signer',
        order: 2,
        status: 'pending',
      },
    ],
    requiredChecks: [
      {
        id: 'chk_1',
        label: 'I confirm all terms and deliverables in this agreement have been reviewed.',
        checked: false,
      },
    ],
    auditTrail: [
      {
        id: `aud_${Date.now()}`,
        timestamp: now,
        actor: actorName,
        action: 'Imported from ConnectLn Docs',
        detail: `Created envelope ${code} from document "${doc.title}".`,
      },
    ],
    createdAt: now,
    updatedAt: now,
    authorName: actorName,
  }
}

function normalizeUserStorageKey(user?: { email?: string; id?: string; name?: string } | null): string {
  const email = (user?.email || '').trim().toLowerCase()
  const id = (user?.id || '').trim().toLowerCase()
  const name = (user?.name || '').trim().toLowerCase()
  return email || id || name || 'guest'
}

export function loadSignEnvelopes(
  user?: { email?: string; id?: string; name?: string } | null
): SignEnvelopeRecord[] {
  const key = `connectln_power_sign_v1:${normalizeUserStorageKey(user)}`
  const now = new Date().toISOString()
  const earlier = new Date(Date.now() - 86400000).toISOString()
  const actorName = user?.name || 'ConnectLn Member'
  const actorEmail = user?.email || 'member@conectln.com'

  const seedEnvelopes = (): SignEnvelopeRecord[] => {
    const executedNdaBase = {
      envelopeCode: 'CLN-SIGN-2026-8410',
      title: SIGN_TEMPLATES[0].name,
      documentHtml: SIGN_TEMPLATES[0].documentHtml,
      signers: [
        {
          id: 'seed_s1',
          name: actorName,
          email: actorEmail,
          role: 'Disclosing Partner',
          order: 1,
          status: 'signed' as const,
          signedAt: earlier,
          typedSignature: actorName,
          signatureFont: 'Executive Script',
        },
        {
          id: 'seed_s2',
          name: 'Elena Vance',
          email: 'evance@partner-group.com',
          role: 'Receiving Partner',
          order: 2,
          status: 'signed' as const,
          signedAt: earlier,
          typedSignature: 'Elena Vance',
          signatureFont: 'Classic Cursive',
        },
      ],
    }

    return [
      {
        id: 'env-starter-change-order',
        envelopeCode: 'CLN-SIGN-2026-9042',
        title: SIGN_TEMPLATES[2].name,
        category: SIGN_TEMPLATES[2].category,
        status: 'draft',
        documentHtml: SIGN_TEMPLATES[2].documentHtml,
        signers: [
          {
            id: 'co_s1',
            name: actorName,
            email: actorEmail,
            role: 'Project Lead',
            order: 1,
            status: 'pending',
          },
          {
            id: 'co_s2',
            name: 'Marcus Reid',
            email: 'm.reid@client-holdings.com',
            role: 'Project Owner',
            order: 2,
            status: 'pending',
          },
        ],
        requiredChecks: SIGN_TEMPLATES[2].requiredChecks.map((label, idx) => ({
          id: `co_chk_${idx}`,
          label,
          checked: false,
        })),
        auditTrail: [
          {
            id: 'aud_seed_1',
            timestamp: now,
            actor: actorName,
            action: 'Envelope Created',
            detail: 'Prepared Change Order CO-04 for electronic signature.',
          },
        ],
        createdAt: now,
        updatedAt: now,
        authorName: actorName,
        starred: true,
      },
      {
        id: 'env-starter-nda-signed',
        ...executedNdaBase,
        category: SIGN_TEMPLATES[0].category,
        status: 'completed',
        requiredChecks: SIGN_TEMPLATES[0].requiredChecks.map((label, idx) => ({
          id: `nda_chk_${idx}`,
          label,
          checked: true,
        })),
        auditTrail: [
          {
            id: 'aud_nda_1',
            timestamp: earlier,
            actor: actorName,
            action: 'Envelope Sent',
            detail: 'Routed Mutual NDA to all designated signatories.',
          },
          {
            id: 'aud_nda_2',
            timestamp: earlier,
            actor: actorName,
            action: 'Signer Adopted Signature',
            detail: `${actorName} (${actorEmail}) executed signature as Disclosing Partner.`,
          },
          {
            id: 'aud_nda_3',
            timestamp: earlier,
            actor: 'Elena Vance',
            action: 'Signer Adopted Signature',
            detail: 'Elena Vance (evance@partner-group.com) executed signature as Receiving Partner.',
          },
          {
            id: 'aud_nda_4',
            timestamp: earlier,
            actor: 'ConnectLn Sign Engine',
            action: 'Sealed & Completed',
            detail: 'All required signatures verified and cryptographic SHA-256 seal applied.',
          },
        ],
        documentSha256: sha256SyncHex(canonicalEnvelopePayload(executedNdaBase)),
        createdAt: earlier,
        updatedAt: earlier,
        completedAt: earlier,
        authorName: actorName,
      },
    ]
  }

  if (typeof window === 'undefined') return seedEnvelopes()
  try {
    const raw = localStorage.getItem(key)
    if (!raw) {
      const seeded = seedEnvelopes()
      localStorage.setItem(key, JSON.stringify(seeded))
      return seeded
    }
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed) && parsed.length > 0) return parsed
  } catch {
    // Fallback
  }
  const seeded = seedEnvelopes()
  try {
    localStorage.setItem(key, JSON.stringify(seeded))
  } catch {
    // ignore
  }
  return seeded
}

export function saveSignEnvelopes(
  user: { email?: string; id?: string; name?: string } | null | undefined,
  envelopes: SignEnvelopeRecord[]
): void {
  if (typeof window === 'undefined') return
  const key = `connectln_power_sign_v1:${normalizeUserStorageKey(user)}`
  try {
    localStorage.setItem(key, JSON.stringify(envelopes))
  } catch {
    // ignore quota errors
  }
  pushStudioModuleCloud(user, 'sign', envelopes)
}
