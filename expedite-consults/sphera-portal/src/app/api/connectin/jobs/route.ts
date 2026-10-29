import { NextResponse } from "next/server"
import {
  GLOBAL_JOBS_CATALOG,
  GlobalJobItem,
  COUNTRIES_CONFIG,
  getLocalizedJobsForCountryAndEnclave
} from "@/lib/global-jobs-data"
import { ALL_PROFESSIONS, CONNECTIN_WORKER_PILLARS, PROFESSION_ENCLAVES } from "@/lib/connectin-professions"

// Global store for user-posted jobs + cache for external live job feeds
const globalForJobs = globalThis as unknown as {
  __connectinCustomPostedJobs?: GlobalJobItem[]
}
if (!globalForJobs.__connectinCustomPostedJobs) {
  globalForJobs.__connectinCustomPostedJobs = []
}
const customPostedJobs: GlobalJobItem[] = globalForJobs.__connectinCustomPostedJobs
let cachedExternalJobs: GlobalJobItem[] = []
let lastExternalFetchTime = 0
const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes

function stripHtml(html: string): string {
  if (!html) return ""
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<\/(p|div|li|h1|h2|h3|h4|br)>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim()
}

function classifyProfessionEnclave(title: string, category: string, tags: string[] = []): string {
  const text = `${title} ${category} ${tags.join(" ")}`.toLowerCase()

  if (/(carpenter|timber|welder|plumber|electrician|hvac|construction|superintendent|framing|millwork|roofing|masonry|bim|surveyor|elevator|boiler|sprinkler)/.test(text)) {
    return "trades_construction"
  }
  if (/(cnc|machinist|tool & die|toolmaker|plc|mechatronics|injection molding|lean|six sigma|quality inspector|packaging|textile|footwear)/.test(text)) {
    return "manufacturing_industrial"
  }
  if (/(wind turbine|solar|photovoltaic|nabcep|inverter|powerwall|substation|grid|lineman|mining|geolog|drilling|water treatment|wastewater|recycling|environmental remediation|nuclear|hydroelectric)/.test(text)) {
    return "energy_utilities_environment"
  }
  if (/(laboratory|biotech|bioprocess|chemist|hplc|forensic|microbiolog|clinical trial|archaeolog|museum|assay)/.test(text)) {
    return "science_laboratory_research"
  }
  if (/(directv|dish network|satellite dish|satellite tv|smatv|matv|vsat|starlink|coax|docsis|cable broadband|pro-av|home theater|cctv|fiber|splicer|otdr|telecom|tower climber|data center|bicsi|pcb|micro-soldering|electronics repair|watchmaker|horolog|semiconductor)/.test(text)) {
    return "telecom_digital_infrastructure"
  }
  if (/(aircraft|aviation|avionics|a&p|aerospace|spacecraft|orbital|drone|uav|maritime|marine|shipyard|commercial diver|seafarer)/.test(text)) {
    return "aviation_aerospace_maritime"
  }
  if (/(automotive|mechanic|diesel|powertrain|technician.*ev|ase |fleet maintenance|collision|locomotive|rail|customs broker)/.test(text)) {
    return "automotive_mechanics"
  }
  if (/(agronom|agriculture|forestry|ranch|livestock|crop|soil|aquaculture|farm|hydroponic|arborist|wildlife|veterinary tech|food scientist)/.test(text)) {
    return "agriculture_natural_resources"
  }
  if (/(barber|stylist|cosmetolog|salon|fitness|personal trainer|physical therap|wellness|esthetic|massage|tattoo|turfgrass|greenskeeper|funeral|mortuary)/.test(text)) {
    return "personal_services_wellness"
  }
  if (/(chef|culinary|hotel|hospitality|banquet|catering|restaurant|event director|baker|pastry|butcher|sommelier|stagehand|rigger|pest control)/.test(text)) {
    return "culinary_hospitality_events"
  }
  if (/(real estate|realtor|retail|supply chain|logistics|freight|procurement|merchandising|store manager|customer success|call center|pos)/.test(text)) {
    return "commerce_small_business"
  }
  if (/(video|film|audio|sound|design|creative|graphic|animator|brand|interpreter|asl|media|writer|upholster|signage|set builder|luthier)/.test(text)) {
    return "creative_media_arts"
  }
  if (/(surgeon|nurse|physician|doctor|clinical|medical|hospital|dental|dentist|orthodont|hygienist|herbal|phytotherap|botanical medicine|naturopath|veterinar|pharmac|therapist|radiologic|paramedic|phlebotom|sterile processing|bmet)/.test(text)) {
    return "healthcare_medicine"
  }
  if (/(professor|teacher|educator|curriculum|faculty|instructor|academic|school|teaching|braille|assistive tech|archivist|librarian)/.test(text)) {
    return "education_workforce"
  }
  if (/(emergency management|fema|veteran|public safety|protective|security officer|non-profit|civic|firefighter|dispatcher|bridge inspector|locksmith)/.test(text)) {
    return "community_civic_security"
  }
  if (/(intern|internship|new grad|junior|entry level|fellowship|co-op|campus|apprentice)/.test(text)) {
    return "campus_students"
  }
  if (/(cyber|security|pentest|soc |threat|appsec|infosec|zero trust|red team|cissp|devsecops|scada security)/.test(text)) {
    return "tech_cybersecurity"
  }
  if (/(judge|magistrate|judiciary|arbitrator|mediator|law clerk|counsel|attorney|lawyer|litigator|prosecutor|public defender|legal|compliance|defense|clearance|federal|government|rmf|cmmc|policy|paralegal|court reporter|notary)/.test(text)) {
    return "law_gov_defense"
  }
  if (/(finance|accountant|accounting|cpa|cfa|controller|audit|fp&a|tax|investment|treasury|fintech|bookkeeper|payroll|claims adjuster|actuar)/.test(text)) {
    return "finance_accounting"
  }
  return "tech_software"
}

function detectCountryFromLocation(rawLoc: string): { code: string; name: string; hub: string } {
  const loc = (rawLoc || "").toLowerCase()
  if (/france|paris|lyon|toulouse|marseille/.test(loc)) {
    return { code: "FR", name: "France", hub: "Remote France" }
  }
  if (/uk|united kingdom|london|manchester|edinburgh/.test(loc)) {
    return { code: "GB", name: "United Kingdom", hub: "UK Remote" }
  }
  if (/germany|deutschland|berlin|munich|münchen|frankfurt|hamburg/.test(loc)) {
    return { code: "DE", name: "Germany (Deutschland)", hub: "Berlin (Silicon Allee)" }
  }
  if (/canada|toronto|vancouver|montreal|ottawa/.test(loc)) {
    return { code: "CA", name: "Canada", hub: "Canada Remote" }
  }
  if (/australia|sydney|melbourne|brisbane|perth/.test(loc)) {
    return { code: "AU", name: "Australia", hub: "Australia Remote" }
  }
  if (/netherlands|amsterdam|rotterdam|eindhoven/.test(loc)) {
    return { code: "NL", name: "Netherlands (Nederland)", hub: "Remote Netherlands" }
  }
  if (/india|bengaluru|bangalore|hyderabad|pune|mumbai/.test(loc)) {
    return { code: "IN", name: "India", hub: "Remote India" }
  }
  if (/brazil|brasil|são paulo|rio/.test(loc)) {
    return { code: "BR", name: "Brazil (Brasil)", hub: "Remote Brazil" }
  }
  if (/singapore/.test(loc)) {
    return { code: "SG", name: "Singapore", hub: "Remote Singapore" }
  }
  if (/ghana|accra|kumasi|takoradi/.test(loc)) {
    return { code: "GH", name: "Ghana", hub: "Remote Ghana" }
  }
  if (/nigeria|lagos|abuja/.test(loc)) {
    return { code: "NG", name: "Nigeria", hub: "Remote Nigeria" }
  }
  if (/kenya|nairobi|mombasa/.test(loc)) {
    return { code: "KE", name: "Kenya", hub: "Remote Kenya" }
  }
  if (/south africa|johannesburg|cape town/.test(loc)) {
    return { code: "ZA", name: "South Africa", hub: "Remote South Africa" }
  }
  if (/mexico|méxico|monterrey|guadalajara/.test(loc)) {
    return { code: "MX", name: "Mexico (México)", hub: "Remote Mexico" }
  }
  if (/spain|españa|madrid|barcelona/.test(loc)) {
    return { code: "ES", name: "Spain (España)", hub: "Remote Spain" }
  }
  if (/japan|tokyo|osaka/.test(loc)) {
    return { code: "JP", name: "Japan (日本)", hub: "Remote Japan" }
  }
  if (/uae|dubai|abu dhabi/.test(loc)) {
    return { code: "AE", name: "United Arab Emirates", hub: "UAE Remote" }
  }
  if (/italy|italia|milan|milano|rome|roma|turin|torino/.test(loc)) {
    return { code: "IT", name: "Italy (Italia)", hub: "Remote Italy" }
  }
  if (/sweden|sverige|stockholm|gothenburg|göteborg|malmö/.test(loc)) {
    return { code: "SE", name: "Sweden (Sverige)", hub: "Remote Sweden" }
  }
  if (/switzerland|schweiz|suisse|zurich|zürich|geneva|genève|basel/.test(loc)) {
    return { code: "CH", name: "Switzerland (Schweiz / Suisse)", hub: "Remote Switzerland" }
  }
  if (/ireland|dublin|cork|galway/.test(loc)) {
    return { code: "IE", name: "Ireland", hub: "Remote Ireland" }
  }
  if (/poland|polska|warsaw|warszawa|krakow|kraków|wrocław/.test(loc)) {
    return { code: "PL", name: "Poland (Polska)", hub: "Remote Poland" }
  }
  if (/korea|seoul|busan|pangyo/.test(loc)) {
    return { code: "KR", name: "South Korea (대한민국)", hub: "Remote South Korea" }
  }
  if (/saudi|riyadh|jeddah|neom|dammam/.test(loc)) {
    return { code: "SA", name: "Saudi Arabia (السعودية)", hub: "Remote Saudi Arabia" }
  }
  if (/egypt|cairo|alexandria/.test(loc)) {
    return { code: "EG", name: "Egypt (مصر)", hub: "Remote Egypt" }
  }
  return { code: "US", name: "United States", hub: "US Remote" }
}

async function fetchLiveExternalFeeds(): Promise<GlobalJobItem[]> {
  const now = Date.now()
  if (cachedExternalJobs.length > 0 && now - lastExternalFetchTime < CACHE_TTL_MS) {
    return cachedExternalJobs
  }

  const liveItems: GlobalJobItem[] = []

  await Promise.allSettled([
    // 1. Fetch from The Muse Public Jobs API (Multi-Industry Fortune 500, Healthcare, Engineering, Finance, Legal, Operations)
    (async () => {
      try {
        const controller = new AbortController()
        const timer = setTimeout(() => controller.abort(), 3200)
        const res = await fetch("https://www.themuse.com/api/public/jobs?page=1", {
          signal: controller.signal,
          headers: { Accept: "application/json" },
          next: { revalidate: 600 }
        })
        clearTimeout(timer)
        if (res.ok) {
          const data = await res.json()
          const museJobs = Array.isArray(data?.results) ? data.results.slice(0, 30) : []
          for (const mj of museJobs) {
            const catNames = Array.isArray(mj.categories) ? mj.categories.map((c: any) => c.name || "").join(" ") : ""
            const levelNames = Array.isArray(mj.levels) ? mj.levels.map((l: any) => l.name || "") : []
            const locName = Array.isArray(mj.locations) && mj.locations[0]?.name ? mj.locations[0].name : "United States"
            const detected = detectCountryFromLocation(locName)
            const enclave = classifyProfessionEnclave(mj.name || "", catNames, levelNames)
            const cleanDesc = stripHtml(mj.contents || "").slice(0, 360) + "..."
            const isRemote = /remote|flexible/i.test(locName)

            liveItems.push({
              id: `muse_${mj.id}`,
              countryCode: detected.code,
              countryName: detected.name,
              professionEnclave: enclave,
              domainCategory: isRemote ? "Remote" : "Full-time",
              title: mj.name || "Verified Industry Role",
              company: mj.company?.name || "Fortune 500 Employer",
              companyLogo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&auto=format&fit=crop&q=80",
              location: locName,
              hub: detected.hub,
              workplaceType: isRemote ? "Remote" : "On-site",
              employmentType: "Full-time",
              postedTime: "Live · Just synced",
              applicantsCount: Math.floor(Math.random() * 19) + 3,
              salaryRange: "$105,000 - $162,000 / yr (Est.)",
              easyApply: true,
              description: cleanDesc || `Live opening for ${mj.name} at ${mj.company?.name} in ${locName}.`,
              requirements: [
                `Verified experience in ${catNames || "this profession"}`,
                ...(levelNames.length > 0 ? [`Role Level: ${levelNames.join(", ")}`] : []),
                "Direct employer application via official portal"
              ],
              languageRequirement: "English",
              applyUrl: mj.refs?.landing_page || "https://www.themuse.com/search",
              source: "The Muse Official ATS Feed",
              tags: [
                ...(catNames ? catNames.split(" ").slice(0, 2) : []),
                ...(levelNames.slice(0, 1)),
                "Direct Hire",
                "Live Feed"
              ],
              isLiveFeed: true
            })
          }
        }
      } catch {
        // Non-blocking fallback
      }
    })(),

    // 2. Fetch from Jobicy Public Live Jobs API
    (async () => {
      try {
        const controller = new AbortController()
        const timer = setTimeout(() => controller.abort(), 3200)
        const res = await fetch("https://jobicy.com/api/v2/remote-jobs?count=30", {
          signal: controller.signal,
          headers: { Accept: "application/json" },
          next: { revalidate: 600 }
        })
        clearTimeout(timer)
        if (res.ok) {
          const data = await res.json()
          const jobicyList = Array.isArray(data?.jobs) ? data.jobs.slice(0, 30) : []
          for (const jj of jobicyList) {
            const ind = Array.isArray(jj.jobIndustry) ? jj.jobIndustry.join(" ") : String(jj.jobIndustry || "")
            const enclave = classifyProfessionEnclave(jj.jobTitle || "", ind, [jj.jobType || ""])
            const rawLoc = String(jj.jobGeo || "United States")
            const detected = detectCountryFromLocation(rawLoc)
            const cleanDesc = stripHtml(jj.jobExcerpt || jj.jobDescription || "").slice(0, 360) + "..."
            const sal =
              jj.annualSalaryMin && jj.annualSalaryMax
                ? `${jj.salaryCurrency || "$"}${Number(jj.annualSalaryMin).toLocaleString()} - ${jj.salaryCurrency || "$"}${Number(jj.annualSalaryMax).toLocaleString()} / yr`
                : "$112,000 - $158,000 / yr (Est.)"

            liveItems.push({
              id: `jobicy_${jj.id}`,
              countryCode: detected.code,
              countryName: detected.name,
              professionEnclave: enclave,
              domainCategory: "Remote",
              title: stripHtml(jj.jobTitle || "Verified Specialist"),
              company: jj.companyName || "Verified Global Employer",
              companyLogo: jj.companyLogo || "https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=100&auto=format&fit=crop&q=80",
              location: `${rawLoc} (Live Feed)`,
              hub: detected.hub,
              workplaceType: "Remote",
              employmentType: /contract/i.test(String(jj.jobType)) ? "Contract" : "Full-time",
              postedTime: "Live · Just synced",
              applicantsCount: Math.floor(Math.random() * 16) + 4,
              salaryRange: sal,
              easyApply: true,
              description: cleanDesc,
              requirements: [
                `Domain competency in ${ind || "core specialization"}`,
                `Level: ${jj.jobLevel || "Mid-Senior"}`
              ],
              languageRequirement: "English",
              applyUrl: jj.url || "https://jobicy.com",
              source: "Jobicy Live Employer Feed",
              tags: [ind || "Specialist", jj.jobLevel || "Verified", "Live Feed"].filter(Boolean),
              isLiveFeed: true
            })
          }
        }
      } catch {
        // Non-blocking fallback
      }
    })(),

    // 3. Fetch from Greenhouse Live Public ATS Boards (SpaceX Aerospace/Manufacturing, Procore Construction, Samsara Fleet/IoT, Cloudflare Cyber/Infra)
    (async () => {
      const boards = [
        { token: "spacex", company: "SpaceX", defaultEnclave: "aviation_aerospace_maritime", logo: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=100&auto=format&fit=crop&q=80" },
        { token: "samsara", company: "Samsara Fleet & Industrial IoT", defaultEnclave: "automotive_mechanics", logo: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=100&auto=format&fit=crop&q=80" },
        { token: "cloudflare", company: "Cloudflare Cyber & Edge Network", defaultEnclave: "tech_cybersecurity", logo: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=100&auto=format&fit=crop&q=80" },
        { token: "stripe", company: "Stripe Global Financial Infrastructure", defaultEnclave: "finance_accounting", logo: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=100&auto=format&fit=crop&q=80" }
      ]
      await Promise.allSettled(
        boards.map(async (b) => {
          try {
            const controller = new AbortController()
            const timer = setTimeout(() => controller.abort(), 2800)
            const res = await fetch(`https://boards-api.greenhouse.io/v1/boards/${b.token}/jobs`, {
              signal: controller.signal,
              headers: { Accept: "application/json" },
              next: { revalidate: 600 }
            })
            clearTimeout(timer)
            if (res.ok) {
              const data = await res.json()
              const ghJobs = Array.isArray(data?.jobs) ? data.jobs.slice(0, 12) : []
              for (const gj of ghJobs) {
                const rawLoc = gj.location?.name || "United States"
                const detected = detectCountryFromLocation(rawLoc)
                const classified = classifyProfessionEnclave(gj.title || "", b.company, [])
                const enclave = classified === "tech_software" && b.defaultEnclave !== "tech_software" ? b.defaultEnclave : classified
                const isRemote = /remote|distributed/i.test(rawLoc)

                liveItems.push({
                  id: `gh_${b.token}_${gj.id}`,
                  countryCode: detected.code,
                  countryName: detected.name,
                  professionEnclave: enclave,
                  domainCategory: isRemote ? "Remote" : "Full-time",
                  title: gj.title || "Specialist Opening",
                  company: b.company,
                  companyLogo: b.logo,
                  location: rawLoc,
                  hub: detected.hub,
                  workplaceType: isRemote ? "Remote" : "On-site",
                  employmentType: "Full-time",
                  postedTime: "Live · Greenhouse ATS",
                  applicantsCount: Math.floor(Math.random() * 20) + 4,
                  salaryRange: "$128,000 - $185,000 / yr",
                  easyApply: true,
                  description: `Live verified opening for ${gj.title} at ${b.company} in ${rawLoc}. Synced directly from ${b.company}'s live Greenhouse ATS board.`,
                  requirements: [
                    `Hands-on field, technical, or operational experience for ${gj.title}`,
                    `Direct ATS submission to ${b.company}`
                  ],
                  languageRequirement: "English",
                  applyUrl: gj.absolute_url || "https://www.greenhouse.io",
                  source: `${b.company} Live Greenhouse ATS`,
                  tags: [b.company.split(" ")[0], rawLoc.split(",")[0], "Greenhouse ATS", "Live Feed"],
                  isLiveFeed: true
                })
              }
            }
          } catch {
            // Non-blocking
          }
        })
      )
    })(),

    // 4. Fetch from Remotive Public Live Jobs API
    (async () => {
      try {
        const controller = new AbortController()
        const timer = setTimeout(() => controller.abort(), 3200)
        const res = await fetch("https://remotive.com/api/remote-jobs?limit=35", {
          signal: controller.signal,
          headers: { Accept: "application/json" },
          next: { revalidate: 600 }
        })
        clearTimeout(timer)

        if (res.ok) {
          const data = await res.json()
          const remotiveJobs = Array.isArray(data?.jobs) ? data.jobs.slice(0, 35) : []

          for (const rj of remotiveJobs) {
            const cleanDesc = stripHtml(rj.description || "").slice(0, 360) + "..."
            const enclave = classifyProfessionEnclave(
              rj.title || "",
              rj.category || "",
              Array.isArray(rj.tags) ? rj.tags : []
            )
            const rawLoc = (rj.candidate_required_location || "Remote").trim()
            const detected = detectCountryFromLocation(rawLoc)

            liveItems.push({
              id: `remotive_${rj.id}`,
              countryCode: detected.code,
              countryName: detected.name,
              professionEnclave: enclave,
              domainCategory: "Remote",
              title: rj.title || "Remote Specialist",
              company: rj.company_name || "Global Employer",
              companyLogo:
                rj.company_logo ||
                "https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=100&auto=format&fit=crop&q=80",
              location: `${rawLoc} (Live Remote Feed)`,
              hub: detected.hub,
              workplaceType: "Remote",
              employmentType: rj.job_type === "contract" ? "Contract" : "Full-time",
              postedTime: "Live · Just synced",
              applicantsCount: Math.floor(Math.random() * 18) + 4,
              salaryRange: rj.salary && rj.salary.trim().length > 0 ? rj.salary : "$115,000 - $165,000 / yr (Est.)",
              easyApply: true,
              description: cleanDesc || `Live opening for ${rj.title} at ${rj.company_name}. Apply directly on the employer's live portal.`,
              requirements: [
                `Proven professional experience in ${rj.category || "this domain"}`,
                ...(Array.isArray(rj.tags) && rj.tags.length > 0
                  ? [`Core competencies: ${rj.tags.slice(0, 4).join(", ")}`]
                  : []),
                "Strong remote collaboration & execution track record"
              ],
              languageRequirement: "English",
              applyUrl: rj.url || "https://remotive.com",
              source: "Remotive Live Job Feed",
              tags: [
                ...(Array.isArray(rj.tags) ? rj.tags.slice(0, 4) : []),
                "Remote",
                "Live Feed"
              ],
              isLiveFeed: true
            })
          }
        }
      } catch {
        // Non-blocking fallback
      }
    })(),

    // 5. Fetch from Arbeitnow Public Job Board API
    (async () => {
      try {
        const controller = new AbortController()
        const timer = setTimeout(() => controller.abort(), 3000)
        const res = await fetch("https://www.arbeitnow.com/api/job-board-api", {
          signal: controller.signal,
          headers: { Accept: "application/json" },
          next: { revalidate: 600 }
        })
        clearTimeout(timer)

        if (res.ok) {
          const data = await res.json()
          const arbeitJobs = Array.isArray(data?.data) ? data.data.slice(0, 20) : []

          for (const aj of arbeitJobs) {
            const cleanDesc = stripHtml(aj.description || "").slice(0, 360) + "..."
            const enclave = classifyProfessionEnclave(
              aj.title || "",
              "",
              Array.isArray(aj.tags) ? aj.tags : []
            )
            const loc = aj.location || "Berlin / Remote"
            const detected = detectCountryFromLocation(loc)

            liveItems.push({
              id: `arbeitnow_${aj.slug || Math.random().toString(36).slice(2, 9)}`,
              countryCode: detected.code,
              countryName: detected.name,
              professionEnclave: enclave,
              domainCategory: aj.remote ? "Remote" : "Full-time",
              title: aj.title || "Professional Opening",
              company: aj.company_name || "Verified Employer",
              companyLogo:
                "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&auto=format&fit=crop&q=80",
              location: `${loc}${aj.remote ? " (Remote)" : ""}`,
              hub: detected.hub,
              workplaceType: aj.remote ? "Remote" : "Hybrid",
              employmentType: "Full-time",
              postedTime: "Live · Just synced",
              applicantsCount: Math.floor(Math.random() * 15) + 3,
              salaryRange: detected.code === "DE" || detected.code === "FR" || detected.code === "NL"
                ? "€85,000 - €120,000 / yr (Est.)"
                : "$110,000 - $155,000 / yr (Est.)",
              easyApply: true,
              description: cleanDesc,
              requirements: [
                "Verified domain experience and industry credentials",
                ...(Array.isArray(aj.tags) && aj.tags.length > 0
                  ? [`Skills: ${aj.tags.slice(0, 4).join(", ")}`]
                  : [])
              ],
              languageRequirement: detected.code === "DE" ? "English / Deutsch" : detected.code === "FR" ? "Français / English" : "English",
              applyUrl: aj.url || "https://www.arbeitnow.com",
              source: "Arbeitnow Live API",
              tags: [...(Array.isArray(aj.tags) ? aj.tags.slice(0, 4) : []), "Live Feed"],
              isLiveFeed: true
            })
          }
        }
      } catch {
        // Non-blocking fallback
      }
    })()
  ])

  if (liveItems.length > 0) {
    cachedExternalJobs = liveItems
    lastExternalFetchTime = now
  }

  return liveItems
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const enclave = searchParams.get("enclave") || "all"
    const country = searchParams.get("country") || "US"
    const hub = searchParams.get("hub") || "All Hubs"
    const domain = searchParams.get("domain") || "All"
    const pillar = searchParams.get("pillar") || "all"
    const professionId = searchParams.get("professionId") || "all"
    const force = searchParams.get("force") === "true"
    const q = (searchParams.get("q") || "").trim().toLowerCase()

    if (force) {
      lastExternalFetchTime = 0
    }

    // Fetch live public feeds + combine with custom posted jobs & country-localized multi-profession catalog
    const externalJobs = await fetchLiveExternalFeeds()
    let list = getLocalizedJobsForCountryAndEnclave(country, enclave, [
      ...customPostedJobs,
      ...externalJobs
    ])

    // Filter by specific Profession Definition if requested
    if (professionId && professionId !== "all") {
      const targetProf = ALL_PROFESSIONS.find((p) => p.id === professionId)
      const profFiltered = list.filter((j) => {
        if (j.professionId === professionId) return true
        if (targetProf) {
          const titleWords = targetProf.title.toLowerCase().split(/[\s/&,-]+/).filter((w) => w.length > 3)
          return titleWords.some((w) => j.title.toLowerCase().includes(w) || j.tags.some((t) => t.toLowerCase().includes(w)))
        }
        return false
      })
      if (profFiltered.length > 0) {
        list = profFiltered
      }
    }

    // Filter by Worker Pillar (Hands-On, Independent & Service, Emerging & STARs) if enclave === 'all'
    if (pillar && pillar !== "all" && enclave === "all") {
      const matchedPillar = CONNECTIN_WORKER_PILLARS.find((p) => p.id === pillar)
      if (matchedPillar) {
        list = list.filter((j) => matchedPillar.enclaveIds.includes(j.professionEnclave))
      }
    }

    // Filter by Hub (strictly within the selected country)
    if (hub && hub !== "All Hubs") {
      const hubFiltered = list.filter(
        (j) =>
          j.hub === hub ||
          j.location.toLowerCase().includes(hub.toLowerCase().split(" ")[0])
      )
      if (hubFiltered.length > 0) {
        list = hubFiltered
      }
    }

    // Filter by Domain / Category
    if (domain && domain !== "All") {
      list = list.filter((j) => {
        if (domain === "Remote") return j.workplaceType === "Remote" || j.tags.includes("Remote")
        if (domain === "Contract") return j.employmentType === "Contract" || j.tags.includes("Contract")
        if (domain === "Full-time") return j.employmentType === "Full-time"
        if (domain === "Recommended") return j.domainCategory === "Recommended" || j.tags.includes("Recommended")
        return (
          j.domainCategory === domain ||
          j.tags.some((t) => t.toLowerCase().includes(domain.toLowerCase())) ||
          j.title.toLowerCase().includes(domain.toLowerCase()) ||
          j.description.toLowerCase().includes(domain.toLowerCase())
        )
      })
    }

    // Filter by Search Query
    if (q) {
      list = list.filter(
        (j) =>
          j.title.toLowerCase().includes(q) ||
          j.company.toLowerCase().includes(q) ||
          j.description.toLowerCase().includes(q) ||
          j.location.toLowerCase().includes(q) ||
          j.tags.some((t) => t.toLowerCase().includes(q))
      )
    }

    return NextResponse.json({
      success: true,
      total: list.length,
      liveExternalCount: list.filter((j) => j.isLiveFeed).length,
      customPublishedCount: customPostedJobs.length,
      enclave,
      country,
      pillar,
      professionId,
      totalEnclaves: PROFESSION_ENCLAVES.length,
      totalProfessions: ALL_PROFESSIONS.length,
      totalCountries: COUNTRIES_CONFIG.length,
      workerPillars: CONNECTIN_WORKER_PILLARS,
      syncedAt: new Date().toISOString(),
      jobs: list
    })
  } catch (error) {
    console.error("Error in GET /api/connectin/jobs:", error)
    return NextResponse.json({
      success: true,
      total: GLOBAL_JOBS_CATALOG.length,
      liveExternalCount: 0,
      syncedAt: new Date().toISOString(),
      jobs: GLOBAL_JOBS_CATALOG
    })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const targetCountry = COUNTRIES_CONFIG.find((c) => c.code === body.countryCode) || COUNTRIES_CONFIG[0]
    const inferredEnclave =
      body.professionEnclave && body.professionEnclave !== "all"
        ? body.professionEnclave
        : classifyProfessionEnclave(body.title || "", body.requiredProduct || "", body.tags || [])

    const newJob: GlobalJobItem = {
      id: body.id || "job_live_" + Date.now(),
      countryCode: targetCountry.code,
      countryName: targetCountry.name,
      professionEnclave: inferredEnclave,
      professionId: body.professionId && body.professionId !== "all" ? body.professionId : undefined,
      domainCategory: "Recommended",
      title: body.title || "Verified Professional Role",
      company: body.company || "Expedite Partner Employer",
      companyLogo:
        body.companyLogo ||
        "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=100&auto=format&fit=crop&q=80",
      location: body.location || `${targetCountry.hubs[1] || targetCountry.name} (${body.workplaceType || "Hybrid"})`,
      hub: body.hub && body.hub !== "All Hubs" ? body.hub : targetCountry.hubs[1] || "All Hubs",
      workplaceType: body.workplaceType || "Hybrid",
      employmentType: body.employmentType || "Full-time",
      postedTime: "Just published · Synced live",
      applicantsCount: 1,
      salaryRange: body.salaryRange || "Competitive",
      easyApply: true,
      description:
        body.description || "Verified role published via ConnectLn Live Recruiting Hub.",
      requirements: Array.isArray(body.requirements)
        ? body.requirements
        : ["Verified experience in " + (body.requiredProduct || "domain skills")],
      languageRequirement: targetCountry.primaryLanguage || "English",
      applyUrl: body.applyUrl || "",
      source: "ConnectLn Direct ATS · Live Synced",
      tags: Array.isArray(body.tags)
        ? body.tags
        : [
            "Just Published",
            "Recommended",
            "Direct Hire",
            ...(body.requiredProduct ? [body.requiredProduct] : [])
          ],
      requiredProductExperience: body.requiredProduct ? [body.requiredProduct] : undefined,
      isLiveFeed: true
    }

    // Deduplicate and prepend immediately
    const existingIdx = customPostedJobs.findIndex((j) => j.id === newJob.id)
    if (existingIdx !== -1) {
      customPostedJobs.splice(existingIdx, 1)
    }
    customPostedJobs.unshift(newJob)

    return NextResponse.json({
      success: true,
      syncedAt: new Date().toISOString(),
      job: newJob
    })
  } catch (error) {
    console.error("Error in POST /api/connectin/jobs:", error)
    return NextResponse.json(
      { success: false, error: "Failed to publish job" },
      { status: 500 }
    )
  }
}
