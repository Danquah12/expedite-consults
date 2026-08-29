import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      platform = 'linkedin', 
      headline, 
      leftPct, 
      rightPct, 
      unspunFact, 
      groundTruthSource, 
      customText 
    } = body;

    const portalUrl = 'https://portal.expediteconsults.com/veritaslens';

    const postContent = customText || `🚨 Daily Blindspot Alert | VeritasLens Intelligence
Story: "${headline}"
• Left Media Coverage: ${leftPct}%
• Right Media Coverage: ${rightPct}%
• Empirical Fact: ${unspunFact}
• Verification Source: ${groundTruthSource}

Read verified primary source dockets: ${portalUrl}`;

    // 1. LinkedIn Native Posting if Token is set
    if (platform === 'linkedin' && process.env.LINKEDIN_ACCESS_TOKEN && process.env.LINKEDIN_ORG_ID) {
      const liRes = await fetch('https://api.linkedin.com/v2/ugcPosts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.LINKEDIN_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
          'X-Restli-Protocol-Version': '2.0.0'
        },
        body: JSON.stringify({
          author: `urn:li:organization:${process.env.LINKEDIN_ORG_ID}`,
          lifecycleState: 'PUBLISHED',
          specificContent: {
            'com.linkedin.ugc.ShareContent': {
              shareCommentary: { text: postContent },
              shareMediaCategory: 'ARTICLE',
              media: [
                {
                  status: 'READY',
                  description: { text: 'Real-time AI Media Bias Aggregator & Claim Verification Platform' },
                  originalUrl: portalUrl,
                  title: { text: `VeritasLens Blindspot: ${headline}` }
                }
              ]
            }
          },
          visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' }
        })
      });

      const liData = await liRes.json();
      return NextResponse.json({ success: true, platform: 'linkedin', postData: liData, syndicatedAt: new Date().toISOString() });
    }

    // 2. Facebook Page Posting if Token is set
    if (platform === 'facebook' && process.env.FACEBOOK_PAGE_ACCESS_TOKEN && process.env.FACEBOOK_PAGE_ID) {
      const fbRes = await fetch(`https://graph.facebook.com/v19.0/${process.env.FACEBOOK_PAGE_ID}/feed`, {
        method: 'POST',
        body: new URLSearchParams({
          message: postContent,
          link: portalUrl,
          access_token: process.env.FACEBOOK_PAGE_ACCESS_TOKEN
        })
      });
      const fbData = await fbRes.json();
      return NextResponse.json({ success: true, platform: 'facebook', postData: fbData, syndicatedAt: new Date().toISOString() });
    }

    // Default simulation / relay mode
    return NextResponse.json({
      success: true,
      platform,
      headline,
      syndicatedAt: new Date().toISOString(),
      message: `Payload successfully generated and prepared for ${platform.toUpperCase()} syndication.`
    });
  } catch (error: any) {
    console.error('Syndication Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
