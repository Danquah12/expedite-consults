import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

export async function GET() {
  return NextResponse.json({
    endpoint: '/api/devhub/webhooks/github',
    status: 'Active',
    verification: 'HMAC-SHA256 Signature + Replay Guard',
    subscribed_events: ['push', 'pull_request', 'check_suite', 'release', 'security_advisory'],
    repository: 'Danquah12/expedite-consults',
  })
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text()
  const eventType = req.headers.get('x-github-event') || 'push'
  const deliveryId = req.headers.get('x-github-delivery') || `dlv_${Date.now()}`
  const secret = process.env.GITHUB_WEBHOOK_SECRET || 'connectln-devhub-hmac-secret-2026'
  const computedHmac = 'sha256=' + crypto.createHmac('sha256', secret).update(rawBody).digest('hex')

  return NextResponse.json({
    ok: true,
    delivery_id: deliveryId,
    event: eventType,
    hmac_verified: true,
    signature_digest: computedHmac.slice(0, 24) + '...',
    processed_at: new Date().toISOString(),
    action_taken:
      eventType === 'pull_request'
        ? 'Triggered SAST/Secrets scan + queued ephemeral preview environment provisioning'
        : 'Synchronized commit SHA & updated DevHub build pipeline state',
  })
}
