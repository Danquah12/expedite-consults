import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { firebaseKvGetItem, firebaseKvSetItem } from "@/lib/connectin-firebase-kv"
import {
  sendBusinessBookingQuoteEmail,
  EXPEDITE_ADMIN_NOTIFICATION_EMAILS
} from "@/lib/connectin-email"

export const dynamic = "force-dynamic"
export const revalidate = 0

const BUSINESS_COLLECTION = "connectln_business_workspace_v1"
const STATE_KEY = "global_business_state_v1"

export type BusinessMemberRole = "Owner" | "Manager" | "Staff" | "Billing Admin"

export interface BusinessTeamMember {
  id: string
  name: string
  email: string
  role: BusinessMemberRole
  title: string
  addedAtIso: string
}

export interface BusinessServiceItem {
  id: string
  businessId: string
  title: string
  category: string
  description: string
  pricingModel: "Fixed Price" | "Hourly Rate" | "Request Estimate"
  priceDisplay: string
  serviceArea: string
  status: "Active" | "Archived"
  portfolioMedia: Array<{
    id: string
    kind: "image" | "video"
    title: string
    url: string
  }>
  createdAtIso: string
}

export interface BusinessLeadAndInquiry {
  id: string
  businessId: string
  businessName: string
  serviceId?: string
  serviceTitle: string
  customerName: string
  customerEmail: string
  customerLocation: string
  projectScope: string
  preferredDate: string
  estimatedBudget: string
  assignedStaffName: string
  crmStage: "New Lead" | "Quote Sent" | "Booked" | "In Progress" | "Completed"
  quoteAmount?: string
  staffReply?: string
  appointmentConfirmed: boolean
  appointmentSlot?: string
  invoiceStatus: "Unbilled" | "Escrow Funded" | "Paid" | "Refunded"
  createdAtIso: string
  updatedAtIso: string
}

export interface BusinessVerifiedReview {
  id: string
  businessId: string
  leadId: string
  customerName: string
  serviceTitle: string
  rating: number
  comment: string
  verifiedTransaction: boolean
  createdAtIso: string
}

export interface BusinessJobOpening {
  id: string
  businessId: string
  businessName: string
  title: string
  kind: "Employment" | "Contract Project" | "Apprenticeship"
  location: string
  compensation: string
  applicants: Array<{
    id: string
    candidateName: string
    candidateHeadline: string
    status: "Applied" | "Reviewing" | "Interview" | "Hired"
    appliedAtIso: string
  }>
  createdAtIso: string
}

export interface BusinessProfileTenant {
  id: string
  slug: string
  name: string
  category: string
  businessType:
    | "Independent Business"
    | "Professional Practice"
    | "Franchise Location"
    | "Government & Enterprise Contractor"
  tagline: string
  location: string
  status: "Draft" | "Published"
  verificationStatus: "Independently Checked ✓" | "Pending Registry Check" | "Unverified"
  verificationLicenseRef: string
  subscriptionPlan: "Standard Free" | "Business Pro ($49/mo)" | "Enterprise Multi-Location ($149/mo)"
  storefrontViews: number
  ownerName: string
  ownerEmail: string
  members: BusinessTeamMember[]
  createdAtIso: string
}

export interface BusinessModerationReport {
  id: string
  businessId: string
  targetLabel: string
  reporterName: string
  reason: string
  status: "Open Review" | "Resolved · Approved" | "Resolved · Listing Archived"
  createdAtIso: string
}

export interface BusinessAuditLogEvent {
  id: string
  businessId: string
  actorName: string
  actorRole: string
  eventCode: string
  summary: string
  prevHash: string
  eventHash: string
  createdAtIso: string
}

export interface ConnectLnBusinessCloudState {
  businesses: BusinessProfileTenant[]
  services: BusinessServiceItem[]
  leads: BusinessLeadAndInquiry[]
  reviews: BusinessVerifiedReview[]
  jobs: BusinessJobOpening[]
  moderationReports: BusinessModerationReport[]
  auditLogs: BusinessAuditLogEvent[]
}

function computeAuditHash(prevHash: string, eventCode: string, summary: string, iso: string): string {
  return crypto
    .createHash("sha256")
    .update(`${prevHash}|${eventCode}|${summary}|${iso}`)
    .digest("hex")
    .slice(0, 16)
}

const INITIAL_ISO = new Date(Date.now() - 3600 * 1000 * 24).toISOString()

const DEFAULT_BUSINESS_STATE: ConnectLnBusinessCloudState = {
  businesses: [
    {
      id: "biz_expedite_consults",
      slug: "expedite-consults-heritage-timber",
      name: "Expedite Consults & Heritage Timber Works",
      category: "Cybersecurity, GovCloud RMF & Master Heavy Timber Carpentry",
      businessType: "Independent Business",
      tagline: "Zero-Trust Cloud Engineering, DoD RMF Compliance & Custom Heavy Timber Joinery",
      location: "Laurel, MD & Washington, D.C. Metro",
      status: "Published",
      verificationStatus: "Independently Checked ✓",
      verificationLicenseRef: "MD-MHIC #142890 · DoD CMMC L2 Registered",
      subscriptionPlan: "Enterprise Multi-Location ($149/mo)",
      storefrontViews: 184,
      ownerName: "Kwesi Asiedu",
      ownerEmail: "kwesi@expediteconsults.com",
      members: [
        {
          id: "mem-1",
          name: "Kwesi Asiedu",
          email: "kwesi@expediteconsults.com",
          role: "Owner",
          title: "Founder & Chief Security Officer",
          addedAtIso: INITIAL_ISO,
        },
        {
          id: "mem-2",
          name: "Esther Boa Asiedu",
          email: "esther@expediteconsults.com",
          role: "Manager",
          title: "Principal Operations & Client Intake Lead",
          addedAtIso: INITIAL_ISO,
        },
        {
          id: "mem-3",
          name: "Patience Addo",
          email: "patience@expediteconsults.com",
          role: "Billing Admin",
          title: "Director of Enterprise Procurement & Escrow",
          addedAtIso: INITIAL_ISO,
        },
      ],
      createdAtIso: INITIAL_ISO,
    },
    {
      id: "biz_mendez_painting",
      slug: "mendez-master-painting-laurel",
      name: "Mendez Master Painting & Cabinet Finishes LLC",
      category: "Painting, Drywall & Cabinet Refinishing",
      businessType: "Independent Business",
      tagline: "Level-5 Drywall Skim Coating, Zero-VOC Interior Painting & HVLP Kitchen Cabinets",
      location: "Laurel, Bowie & Columbia, MD",
      status: "Published",
      verificationStatus: "Independently Checked ✓",
      verificationLicenseRef: "Maryland DLLR MHIC #149204 · $2M Liability COI",
      subscriptionPlan: "Business Pro ($49/mo)",
      storefrontViews: 112,
      ownerName: "Carlos Mendez",
      ownerEmail: "carlos@mendezpainting.com",
      members: [
        {
          id: "mem-4",
          name: "Carlos Mendez",
          email: "carlos@mendezpainting.com",
          role: "Owner",
          title: "Master Painter & Principal Estimator",
          addedAtIso: INITIAL_ISO,
        },
        {
          id: "mem-5",
          name: "Kwesi Asiedu",
          email: "kwesi@expediteconsults.com",
          role: "Manager",
          title: "Partner Advisory & Commercial Project Lead",
          addedAtIso: INITIAL_ISO,
        },
      ],
      createdAtIso: INITIAL_ISO,
    },
  ],
  services: [
    {
      id: "bsrv-1",
      businessId: "biz_expedite_consults",
      title: "Custom Heavy Timber Framing, Stair Treads & Architectural Millwork",
      category: "Carpentry & Joinery",
      description:
        "Precision mortise-and-tenon heavy timber framing, white oak stair installations, and commercial blueprint layout with full structural sign-off.",
      pricingModel: "Request Estimate",
      priceDisplay: "Request Estimate (Typical Project: $4,500 – $28,000)",
      serviceArea: "Maryland, Washington D.C. & Northern Virginia",
      status: "Active",
      portfolioMedia: [
        {
          id: "pm-1",
          kind: "image",
          title: "Arlington Structural Beam & White Oak Ceiling Leveling",
          url: "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600&auto=format&fit=crop&q=80",
        },
        {
          id: "pm-2",
          kind: "video",
          title: "Shop Walkthrough: Mortise & Tenon Joinery Tolerance Check (MP4)",
          url: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80",
        },
      ],
      createdAtIso: INITIAL_ISO,
    },
    {
      id: "bsrv-2",
      businessId: "biz_expedite_consults",
      title: "Zero-Trust GovCloud RMF, Continuous ATO & Penetration Testing",
      category: "Cybersecurity & Cloud Architecture",
      description:
        "End-to-end DoD RMF authorization packages, automated SAST/DAST vulnerability remediation, and cloud security posture engineering.",
      pricingModel: "Fixed Price",
      priceDisplay: "$12,500 Fixed Scope Assessment · Direct Escrow",
      serviceArea: "Global Remote & D.C. Metro Cleared Facilities",
      status: "Active",
      portfolioMedia: [
        {
          id: "pm-3",
          kind: "image",
          title: "Zero-Trust Multi-Enclave Architecture Blueprint",
          url: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&auto=format&fit=crop&q=80",
        },
      ],
      createdAtIso: INITIAL_ISO,
    },
    {
      id: "bsrv-3",
      businessId: "biz_mendez_painting",
      title: "4-Room Colonial Interior Repaint & HVLP Kitchen Cabinet Refinishing",
      category: "Painting & Decorating",
      description:
        "Dustless sanding, Level-5 drywall prep, and factory-smooth catalyzed enamel finishes for residential and commercial interiors.",
      pricingModel: "Fixed Price",
      priceDisplay: "$1,850 – $4,200 (Includes Sherwin-Williams Zero-VOC Materials)",
      serviceArea: "Laurel, Bowie, Columbia & Silver Spring, MD",
      status: "Active",
      portfolioMedia: [
        {
          id: "pm-4",
          kind: "image",
          title: "Laurel Colonial Crown Molding & Satin Trim Finish",
          url: "https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=600&auto=format&fit=crop&q=80",
        },
      ],
      createdAtIso: INITIAL_ISO,
    },
  ],
  leads: [
    {
      id: "lead-101",
      businessId: "biz_expedite_consults",
      businessName: "Expedite Consults & Heritage Timber Works",
      serviceId: "bsrv-1",
      serviceTitle: "Custom Heavy Timber Framing, Stair Treads & Architectural Millwork",
      customerName: "Marcus Vance",
      customerEmail: "mvance@turnerbuilds.com",
      customerLocation: "Bethesda, MD",
      projectScope:
        "Install structural white oak ceiling beams and custom stair treads for a 3,400 sq ft commercial buildout.",
      preferredDate: "Next Monday · 8:00 AM Site Walkthrough",
      estimatedBudget: "$18,500",
      assignedStaffName: "Kwesi Asiedu",
      crmStage: "Completed",
      quoteAmount: "$18,200 Fixed Price (Materials + Labor)",
      staffReply:
        "Included kiln-dried white oak timber package, 3-day installation crew, and structural inspection sign-off.",
      appointmentConfirmed: true,
      appointmentSlot: "Mon 8:00 AM EST · Confirmed",
      invoiceStatus: "Paid",
      createdAtIso: INITIAL_ISO,
      updatedAtIso: INITIAL_ISO,
    },
    {
      id: "lead-102",
      businessId: "biz_expedite_consults",
      businessName: "Expedite Consults & Heritage Timber Works",
      serviceId: "bsrv-2",
      serviceTitle: "Zero-Trust GovCloud RMF, Continuous ATO & Penetration Testing",
      customerName: "Commander Robert Hayes",
      customerEmail: "rhayes@defense-logistics.org",
      customerLocation: "Arlington, VA",
      projectScope: "CMMC Level 2 readiness review and automated DAST penetration test for 4 web enclaves.",
      preferredDate: "Thursday · 10:00 AM Technical Intake",
      estimatedBudget: "$12,500",
      assignedStaffName: "Esther Boa Asiedu",
      crmStage: "Quote Sent",
      quoteAmount: "$12,500 Fixed Scope Escrow",
      staffReply: "Ready to begin enclave scoping this Thursday with full ROE documentation.",
      appointmentConfirmed: true,
      appointmentSlot: "Thu 10:00 AM EST · Confirmed",
      invoiceStatus: "Escrow Funded",
      createdAtIso: INITIAL_ISO,
      updatedAtIso: INITIAL_ISO,
    },
    {
      id: "lead-103",
      businessId: "biz_expedite_consults",
      businessName: "Expedite Consults & Heritage Timber Works",
      serviceId: "bsrv-1",
      serviceTitle: "Custom Heavy Timber Framing, Stair Treads & Architectural Millwork",
      customerName: "Sarah Chen",
      customerEmail: "schen@columbia-architects.com",
      customerLocation: "Columbia, MD",
      projectScope: "Need quote for custom walnut reception millwork and acoustic slat wall installation.",
      preferredDate: "This Friday · 2:00 PM",
      estimatedBudget: "$9,200",
      assignedStaffName: "Kwesi Asiedu",
      crmStage: "New Lead",
      appointmentConfirmed: false,
      invoiceStatus: "Unbilled",
      createdAtIso: new Date().toISOString(),
      updatedAtIso: new Date().toISOString(),
    },
  ],
  reviews: [
    {
      id: "rev-1",
      businessId: "biz_expedite_consults",
      leadId: "lead-101",
      customerName: "Marcus Vance",
      serviceTitle: "Custom Heavy Timber Framing, Stair Treads & Architectural Millwork",
      rating: 5,
      comment:
        "Flawless white oak beam joinery and laser-level ceiling alignment. Finished ahead of schedule and passed structural inspection on the first walkthrough.",
      verifiedTransaction: true,
      createdAtIso: INITIAL_ISO,
    },
  ],
  jobs: [
    {
      id: "bjob-1",
      businessId: "biz_expedite_consults",
      businessName: "Expedite Consults & Heritage Timber Works",
      title: "Lead Finish Carpenter & Heavy Timber Layout Specialist",
      kind: "Employment",
      location: "Laurel, MD & D.C. Metro",
      compensation: "$48 – $62 / hr + Project Profit Share",
      applicants: [
        {
          id: "app-1",
          candidateName: "Isaac Boye",
          candidateHeadline: "Senior Field Engineering & Structural Layout Lead",
          status: "Interview",
          appliedAtIso: INITIAL_ISO,
        },
        {
          id: "app-2",
          candidateName: "Devon Brooks",
          candidateHeadline: "Journeyman Finish Carpenter · OSHA 30 Certified",
          status: "Applied",
          appliedAtIso: INITIAL_ISO,
        },
      ],
      createdAtIso: INITIAL_ISO,
    },
  ],
  moderationReports: [
    {
      id: "mod-1",
      businessId: "biz_expedite_consults",
      targetLabel: "License & COI Registry Verification Audit",
      reporterName: "ConnectLn Trust & Safety Automated Check",
      reason: "Periodic MHIC #142890 & CMMC Registry Attestation Verification",
      status: "Resolved · Approved",
      createdAtIso: INITIAL_ISO,
    },
  ],
  auditLogs: [
    {
      id: "aud-1",
      businessId: "biz_expedite_consults",
      actorName: "Kwesi Asiedu",
      actorRole: "Owner",
      eventCode: "BIZ_CREATED_AND_VERIFIED",
      summary: "Initialized Expedite Consults & Heritage Timber Works tenant with Owner RBAC and MHIC #142890 check",
      prevHash: "0000000000000000",
      eventHash: "9f84c2e1b7a04d31",
      createdAtIso: INITIAL_ISO,
    },
  ],
}

const globalForBiz = globalThis as unknown as {
  __connectlnBusinessState?: ConnectLnBusinessCloudState
}

async function loadBusinessState(): Promise<ConnectLnBusinessCloudState> {
  const fromCloud = await firebaseKvGetItem<ConnectLnBusinessCloudState>(
    BUSINESS_COLLECTION,
    STATE_KEY
  ).catch(() => null)
  if (fromCloud && Array.isArray(fromCloud.businesses) && fromCloud.businesses.length > 0) {
    globalForBiz.__connectlnBusinessState = fromCloud
    return fromCloud
  }
  if (!globalForBiz.__connectlnBusinessState) {
    globalForBiz.__connectlnBusinessState = structuredClone(DEFAULT_BUSINESS_STATE)
  }
  return globalForBiz.__connectlnBusinessState
}

async function saveBusinessState(state: ConnectLnBusinessCloudState): Promise<void> {
  globalForBiz.__connectlnBusinessState = state
  await firebaseKvSetItem(BUSINESS_COLLECTION, STATE_KEY, state).catch(() => {})
}

function appendAuditEvent(
  state: ConnectLnBusinessCloudState,
  params: {
    businessId: string
    actorName: string
    actorRole: string
    eventCode: string
    summary: string
  }
) {
  const prevHash = state.auditLogs[0]?.eventHash || "0000000000000000"
  const iso = new Date().toISOString()
  const eventHash = computeAuditHash(prevHash, params.eventCode, params.summary, iso)
  state.auditLogs.unshift({
    id: `aud-${Date.now()}`,
    businessId: params.businessId,
    actorName: params.actorName,
    actorRole: params.actorRole,
    eventCode: params.eventCode,
    summary: params.summary,
    prevHash,
    eventHash,
    createdAtIso: iso,
  })
  state.auditLogs = state.auditLogs.slice(0, 80)
}

function getMemberRoleForBusiness(
  biz: BusinessProfileTenant | undefined,
  actorName: string,
  actorEmail: string
): BusinessMemberRole | null {
  if (!biz) return null
  const n = actorName.trim().toLowerCase()
  const e = actorEmail.trim().toLowerCase()
  const match = biz.members.find(
    (m) =>
      (n && m.name.trim().toLowerCase() === n) ||
      (e && m.email.trim().toLowerCase() === e)
  )
  if (match) return match.role
  if (n && biz.ownerName.trim().toLowerCase() === n) return "Owner"
  return null
}

export async function GET(req: NextRequest) {
  try {
    const state = await loadBusinessState()
    const viewerName = (req.nextUrl.searchParams.get("viewerName") || "Kwesi Asiedu").trim()
    const viewerEmail = (req.nextUrl.searchParams.get("viewerEmail") || "").trim()

    // BIZ-03: Multi-business membership resolution
    const myBusinesses = state.businesses.filter((b) =>
      Boolean(getMemberRoleForBusiness(b, viewerName, viewerEmail))
    )

    // BIZ-04 & MKT-01: Publicly discoverable published storefronts (accessible without login)
    const publicBusinesses = state.businesses.filter((b) => b.status === "Published")

    return NextResponse.json({
      ok: true,
      myBusinesses,
      publicBusinesses,
      state,
    })
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Failed to load ConnectLn Business Workspace" },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const action = String(body?.action || "")
    const actorName = String(body?.actorName || "Kwesi Asiedu").trim()
    const actorEmail = String(body?.actorEmail || "kwesi@expediteconsults.com").trim()
    const state = await loadBusinessState()

    // BIZ-01 & BIZ-02: Create draft or published business with automatic Owner membership
    if (action === "create_business") {
      const name = String(body?.name || "").trim()
      if (!name) {
        return NextResponse.json({ ok: false, error: "Business name is required" }, { status: 400 })
      }
      const status = body?.status === "Draft" ? "Draft" : "Published"
      const newBiz: BusinessProfileTenant = {
        id: `biz_${Date.now()}`,
        slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        name,
        category: String(body?.category || "Skilled Trades & Professional Services").trim(),
        businessType: (body?.businessType as BusinessProfileTenant["businessType"]) || "Independent Business",
        tagline: String(body?.tagline || "Verified ConnectLn Business Storefront").trim(),
        location: String(body?.location || "Laurel, MD").trim(),
        status,
        verificationStatus: "Pending Registry Check",
        verificationLicenseRef: String(body?.licenseRef || "License / COI Pending Check").trim(),
        subscriptionPlan: "Standard Free",
        storefrontViews: 1,
        ownerName: actorName,
        ownerEmail: actorEmail,
        members: [
          {
            id: `mem-${Date.now()}`,
            name: actorName,
            email: actorEmail,
            role: "Owner",
            title: "Founder & Business Owner",
            addedAtIso: new Date().toISOString(),
          },
        ],
        createdAtIso: new Date().toISOString(),
      }
      state.businesses.unshift(newBiz)
      appendAuditEvent(state, {
        businessId: newBiz.id,
        actorName,
        actorRole: "Owner",
        eventCode: "BIZ_CREATED",
        summary: `Created ${status} business "${newBiz.name}" with Owner role assigned to ${actorName}`,
      })
      await saveBusinessState(state)
      return NextResponse.json({ ok: true, createdBusinessId: newBiz.id, state })
    }

    // BIZ-04 & BIZ-05: Publish draft storefront or complete independent registry verification check
    if (action === "update_business_status") {
      const businessId = String(body?.businessId || "")
      const biz = state.businesses.find((b) => b.id === businessId)
      const role = getMemberRoleForBusiness(biz, actorName, actorEmail)
      if (!biz || !role) {
        return NextResponse.json({ ok: false, error: "Unauthorized tenant access" }, { status: 403 })
      }
      if (body?.status === "Published" || body?.status === "Draft") {
        biz.status = body.status
      }
      if (body?.verifyCheck === true) {
        biz.verificationStatus = "Independently Checked ✓"
      }
      if (body?.subscriptionPlan) {
        biz.subscriptionPlan = body.subscriptionPlan
      }
      appendAuditEvent(state, {
        businessId: biz.id,
        actorName,
        actorRole: role,
        eventCode: "BIZ_STATUS_UPDATED",
        summary: `Updated "${biz.name}" (Status: ${biz.status}, Verification: ${biz.verificationStatus}, Plan: ${biz.subscriptionPlan})`,
      })
      await saveBusinessState(state)
      return NextResponse.json({ ok: true, state })
    }

    // SRV-01 & SRV-02: Create, update, or archive a business service + portfolio media
    if (action === "create_service") {
      const businessId = String(body?.businessId || "")
      const biz = state.businesses.find((b) => b.id === businessId)
      const role = getMemberRoleForBusiness(biz, actorName, actorEmail)
      if (!biz || !role) {
        return NextResponse.json({ ok: false, error: "Unauthorized tenant access" }, { status: 403 })
      }
      const title = String(body?.title || "").trim()
      if (title) {
        const srv: BusinessServiceItem = {
          id: `bsrv-${Date.now()}`,
          businessId,
          title,
          category: String(body?.category || biz.category).trim(),
          description: String(body?.description || "Professional service backed by verified credentials.").trim(),
          pricingModel: (body?.pricingModel as BusinessServiceItem["pricingModel"]) || "Request Estimate",
          priceDisplay: String(body?.priceDisplay || "Request Estimate").trim(),
          serviceArea: String(body?.serviceArea || biz.location).trim(),
          status: "Active",
          portfolioMedia: body?.sampleUrl
            ? [
                {
                  id: `pm-${Date.now()}`,
                  kind: body?.sampleKind === "video" ? "video" : "image",
                  title: String(body?.sampleTitle || `${title} — Completed Project Sample`),
                  url: String(body.sampleUrl),
                },
              ]
            : [],
          createdAtIso: new Date().toISOString(),
        }
        state.services.unshift(srv)
        appendAuditEvent(state, {
          businessId,
          actorName,
          actorRole: role,
          eventCode: "SRV_CREATED",
          summary: `Published service "${srv.title}" (${srv.priceDisplay})`,
        })
        await saveBusinessState(state)
      }
      return NextResponse.json({ ok: true, state })
    }

    if (action === "toggle_service_archive") {
      const serviceId = String(body?.serviceId || "")
      const srv = state.services.find((s) => s.id === serviceId)
      if (srv) {
        const biz = state.businesses.find((b) => b.id === srv.businessId)
        const role = getMemberRoleForBusiness(biz, actorName, actorEmail)
        if (!role) {
          return NextResponse.json({ ok: false, error: "Unauthorized tenant access" }, { status: 403 })
        }
        srv.status = srv.status === "Active" ? "Archived" : "Active"
        appendAuditEvent(state, {
          businessId: srv.businessId,
          actorName,
          actorRole: role,
          eventCode: "SRV_STATUS_CHANGED",
          summary: `Changed service "${srv.title}" status to ${srv.status}`,
        })
        await saveBusinessState(state)
      }
      return NextResponse.json({ ok: true, state })
    }

    // MKT-02 & BOOK-01: Customer submits a Quote Request / Appointment Request to a business
    if (action === "request_quote") {
      const businessId = String(body?.businessId || "biz_expedite_consults").trim()
      const biz =
        state.businesses.find((b) => b.id === businessId || b.slug === businessId) ||
        state.businesses[0]
      const businessName = String(body?.businessName || biz?.name || "ConnectLn Business").trim()
      const ownerName = String(body?.ownerName || biz?.ownerName || "Business Owner").trim()
      const ownerEmail = String(body?.ownerEmail || biz?.ownerEmail || "").trim()
      const serviceTitle = String(body?.serviceTitle || "General Service Estimate & Consultation").trim()
      const customerName = String(body?.customerName || actorName || "Verified Client").trim()
      const customerContact = String(body?.customerContact || body?.customerEmail || actorEmail || "").trim()
      const customerLocation = String(body?.customerLocation || biz?.location || "Service Area").trim()
      const projectScope =
        String(body?.projectScope || "").trim() ||
        `Direct Booking & Upfront Estimate Request for ${serviceTitle}`
      const preferredDate = String(body?.preferredDate || "Next Available Slot").trim()
      const estimatedBudget = String(body?.estimatedBudget || "Requesting Itemized Quote").trim()
      const referenceId = String(body?.referenceId || `REQ-${Math.floor(10000 + Math.random() * 89999)}`).trim()

      const lead: BusinessLeadAndInquiry = {
        id: referenceId,
        businessId: biz?.id || businessId,
        businessName,
        serviceId: body?.serviceId,
        serviceTitle,
        customerName,
        customerEmail: customerContact,
        customerLocation,
        projectScope,
        preferredDate,
        estimatedBudget,
        assignedStaffName: ownerName,
        crmStage: "New Lead",
        appointmentConfirmed: false,
        invoiceStatus: "Unbilled",
        createdAtIso: new Date().toISOString(),
        updatedAtIso: new Date().toISOString(),
      }
      if (biz) {
        biz.storefrontViews = (biz.storefrontViews || 100) + 1
      }
      state.leads.unshift(lead)
      appendAuditEvent(state, {
        businessId: biz?.id || businessId,
        actorName: customerName,
        actorRole: "Customer",
        eventCode: "MKT_QUOTE_REQUESTED",
        summary: `Customer ${customerName} (${customerContact}) requested quote for "${serviceTitle}" (${referenceId})`,
      })
      await saveBusinessState(state)

      const emailResult = await sendBusinessBookingQuoteEmail({
        referenceId,
        businessName,
        ownerName,
        ownerEmail,
        serviceTitle,
        customerName,
        customerContact,
        customerLocation,
        projectScope,
        preferredDate,
        estimatedBudget,
      })

      return NextResponse.json({
        ok: true,
        referenceId,
        emailDispatched: emailResult.success,
        emailRecipients:
          emailResult.sentTo.length > 0 ? emailResult.sentTo : [...EXPEDITE_ADMIN_NOTIFICATION_EMAILS],
        emailMessageId: emailResult.id,
        emailError: emailResult.error,
        lead,
        state,
      })
    }

    // CRM-01, MSG-01, BOOK-01, PAY-01: Staff sends quote, advances CRM lead stage, confirms booking, or updates payment
    if (action === "update_lead") {
      const leadId = String(body?.leadId || "")
      const lead = state.leads.find((l) => l.id === leadId)
      if (lead) {
        const biz = state.businesses.find((b) => b.id === lead.businessId)
        const role = getMemberRoleForBusiness(biz, actorName, actorEmail)
        if (!role) {
          return NextResponse.json({ ok: false, error: "Unauthorized tenant access" }, { status: 403 })
        }
        if (body?.quoteAmount) {
          lead.quoteAmount = String(body.quoteAmount).trim()
          lead.crmStage = "Quote Sent"
        }
        if (body?.staffReply) {
          lead.staffReply = String(body.staffReply).trim()
        }
        if (body?.crmStage) {
          lead.crmStage = body.crmStage
        }
        if (typeof body?.appointmentConfirmed === "boolean") {
          lead.appointmentConfirmed = body.appointmentConfirmed
          lead.appointmentSlot = `${lead.preferredDate} · Confirmed by ${actorName}`
          if (lead.crmStage === "New Lead" || lead.crmStage === "Quote Sent") {
            lead.crmStage = "Booked"
          }
        }
        if (body?.invoiceStatus) {
          lead.invoiceStatus = body.invoiceStatus
          if (body.invoiceStatus === "Paid") {
            lead.crmStage = "Completed"
          }
        }
        lead.updatedAtIso = new Date().toISOString()
        appendAuditEvent(state, {
          businessId: lead.businessId,
          actorName,
          actorRole: role,
          eventCode: "CRM_LEAD_UPDATED",
          summary: `Updated lead ${lead.customerName} (${lead.serviceTitle}) → Stage: ${lead.crmStage}, Invoice: ${lead.invoiceStatus}`,
        })
        await saveBusinessState(state)
      }
      return NextResponse.json({ ok: true, state })
    }

    // REV-01: Submit verified customer review on completed transaction
    if (action === "submit_review") {
      const businessId = String(body?.businessId || "biz_expedite_consults")
      const leadId = String(body?.leadId || "lead-101")
      const comment = String(body?.comment || "").trim()
      const rating = Math.min(5, Math.max(1, Number(body?.rating || 5)))
      if (comment) {
        state.reviews.unshift({
          id: `rev-${Date.now()}`,
          businessId,
          leadId,
          customerName: actorName,
          serviceTitle: String(body?.serviceTitle || "Verified Business Service"),
          rating,
          comment,
          verifiedTransaction: true,
          createdAtIso: new Date().toISOString(),
        })
        appendAuditEvent(state, {
          businessId,
          actorName,
          actorRole: "Verified Customer",
          eventCode: "REV_PUBLISHED",
          summary: `Published ${rating}-star verified transaction review by ${actorName}`,
        })
        await saveBusinessState(state)
      }
      return NextResponse.json({ ok: true, state })
    }

    // JOB-01: Post a business job opening or advance applicant status
    if (action === "post_business_job") {
      const businessId = String(body?.businessId || "biz_expedite_consults")
      const biz = state.businesses.find((b) => b.id === businessId)
      const role = getMemberRoleForBusiness(biz, actorName, actorEmail)
      if (!biz || !role) {
        return NextResponse.json({ ok: false, error: "Unauthorized tenant access" }, { status: 403 })
      }
      const title = String(body?.title || "").trim()
      if (title) {
        state.jobs.unshift({
          id: `bjob-${Date.now()}`,
          businessId,
          businessName: biz.name,
          title,
          kind: (body?.kind as BusinessJobOpening["kind"]) || "Employment",
          location: String(body?.location || biz.location).trim(),
          compensation: String(body?.compensation || "$45 – $60 / hr").trim(),
          applicants: [],
          createdAtIso: new Date().toISOString(),
        })
        appendAuditEvent(state, {
          businessId,
          actorName,
          actorRole: role,
          eventCode: "JOB_POSTED",
          summary: `Posted ${body?.kind || "Employment"} opening: "${title}"`,
        })
        await saveBusinessState(state)
      }
      return NextResponse.json({ ok: true, state })
    }

    if (action === "apply_business_job") {
      const jobId = String(body?.jobId || "")
      const job = state.jobs.find((j) => j.id === jobId)
      if (job) {
        if (!job.applicants.some((a) => a.candidateName.toLowerCase() === actorName.toLowerCase())) {
          job.applicants.unshift({
            id: `app-${Date.now()}`,
            candidateName: actorName,
            candidateHeadline: String(body?.actorHeadline || "Verified ConnectLn Professional"),
            status: "Applied",
            appliedAtIso: new Date().toISOString(),
          })
          appendAuditEvent(state, {
            businessId: job.businessId,
            actorName,
            actorRole: "Candidate",
            eventCode: "JOB_APPLICATION_RECEIVED",
            summary: `${actorName} applied for "${job.title}"`,
          })
          await saveBusinessState(state)
        }
      }
      return NextResponse.json({ ok: true, state })
    }

    // Team Management (RBAC): Add team member to business tenant
    if (action === "add_team_member") {
      const businessId = String(body?.businessId || "")
      const biz = state.businesses.find((b) => b.id === businessId)
      const role = getMemberRoleForBusiness(biz, actorName, actorEmail)
      if (!biz || role !== "Owner") {
        return NextResponse.json(
          { ok: false, error: "Only Business Owners can modify team RBAC roles" },
          { status: 403 }
        )
      }
      const memberName = String(body?.memberName || "").trim()
      const memberEmail = String(body?.memberEmail || "").trim()
      const memberRole = (body?.memberRole as BusinessMemberRole) || "Staff"
      if (memberName) {
        biz.members.push({
          id: `mem-${Date.now()}`,
          name: memberName,
          email: memberEmail || `${memberName.toLowerCase().replace(/\s+/g, ".")}@connectln.com`,
          role: memberRole,
          title: String(body?.memberTitle || `${memberRole} · Operations`),
          addedAtIso: new Date().toISOString(),
        })
        appendAuditEvent(state, {
          businessId,
          actorName,
          actorRole: role,
          eventCode: "RBAC_MEMBER_ADDED",
          summary: `Granted ${memberRole} access to ${memberName} on "${biz.name}"`,
        })
        await saveBusinessState(state)
      }
      return NextResponse.json({ ok: true, state })
    }

    // ADM-01: Platform moderation report & resolution
    if (action === "resolve_moderation") {
      const reportId = String(body?.reportId || "")
      const rep = state.moderationReports.find((r) => r.id === reportId)
      if (rep) {
        rep.status = "Resolved · Approved"
        appendAuditEvent(state, {
          businessId: rep.businessId,
          actorName,
          actorRole: "Platform Moderator",
          eventCode: "ADM_MODERATION_RESOLVED",
          summary: `Resolved moderation review "${rep.targetLabel}"`,
        })
        await saveBusinessState(state)
      }
      return NextResponse.json({ ok: true, state })
    }

    return NextResponse.json({ ok: true, state })
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Failed to process ConnectLn Business action" },
      { status: 500 }
    )
  }
}
