import { NextResponse } from 'next/server'
import { COUNTRIES_CONFIG, GLOBAL_JOBS_CATALOG } from '@/lib/global-jobs-data'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')?.toLowerCase() || ''
  const countryCode = (searchParams.get('country') || 'US').toUpperCase()
  const hub = searchParams.get('hub') || 'All Hubs'
  const remoteOnly = searchParams.get('remote') === 'true'

  // Find country configuration
  const currentCountry = COUNTRIES_CONFIG.find(c => c.code === countryCode) || COUNTRIES_CONFIG[0]

  // Filter jobs by country code first
  let countryJobs = GLOBAL_JOBS_CATALOG.filter(j => j.countryCode === countryCode)

  // If specific query, filter by title, company, description, requirements, or tags
  if (query) {
    countryJobs = countryJobs.filter(job =>
      job.title.toLowerCase().includes(query) ||
      job.company.toLowerCase().includes(query) ||
      job.description.toLowerCase().includes(query) ||
      job.tags.some(t => t.toLowerCase().includes(query)) ||
      job.location.toLowerCase().includes(query)
    )
  }

  // Filter by regional tech hub if not "All Hubs"
  if (hub && hub !== 'All Hubs' && hub !== 'All') {
    countryJobs = countryJobs.filter(job =>
      job.hub.toLowerCase().includes(hub.toLowerCase()) ||
      job.location.toLowerCase().includes(hub.toLowerCase())
    )
  }

  // Filter by Remote if requested
  if (remoteOnly) {
    countryJobs = countryJobs.filter(job => job.workplaceType === 'Remote')
  }

  return NextResponse.json({
    status: 'success',
    selectedCountry: currentCountry,
    allCountries: COUNTRIES_CONFIG,
    total: countryJobs.length,
    jobs: countryJobs
  })
}
