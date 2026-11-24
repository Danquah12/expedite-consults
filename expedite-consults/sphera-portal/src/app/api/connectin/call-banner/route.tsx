import { ImageResponse } from 'next/og';

export const runtime = 'edge';

function getCallerInitials(name: string): string {
  const parts = String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return 'CL';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] || ''}${parts[parts.length - 1][0] || ''}`.toUpperCase();
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const rawCaller = (searchParams.get('caller') || 'ConnectLn Caller').trim();
  const caller = (rawCaller || 'ConnectLn Caller').slice(0, 40);
  const mode = searchParams.get('mode') === 'audio' ? 'audio' : 'video';
  const rawPhone = (searchParams.get('phone') || '').trim().slice(0, 28);
  const isVideo = mode !== 'audio';
  const initials = getCallerInitials(caller);

  const callTypeBadge = isVideo ? 'ConnectLn Video Call' : 'ConnectLn Voice Call';
  const acceptCtaText = isVideo
    ? 'TAP TO ACCEPT VIDEO CALL'
    : 'TAP TO ACCEPT CALL';

  return new ImageResponse(
    (
      <div
        style={{
          width: '800px',
          height: '400px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#0B141A',
          backgroundImage:
            'linear-gradient(180deg, #0F2D28 0%, #0B1B1E 52%, #0B141A 100%)',
          border: '6px solid #25D366',
          borderRadius: '28px',
          overflow: 'hidden',
          fontFamily: 'sans-serif',
          color: '#FFFFFF',
        }}
      >
        {/* Top WhatsApp E2EE Row */}
        <div
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '18px 32px 10px 32px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#94A3B8"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <span
              style={{
                fontSize: '16px',
                fontWeight: 600,
                color: '#94A3B8',
              }}
            >
              End-to-end encrypted
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'rgba(37, 211, 102, 0.16)',
              border: '1.5px solid #25D366',
              borderRadius: '999px',
              padding: '6px 16px',
            }}
          >
            <div
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '5px',
                backgroundColor: '#25D366',
              }}
            />
            <span
              style={{
                fontSize: '16px',
                fontWeight: 800,
                color: '#25D366',
              }}
            >
              {callTypeBadge}
            </span>
          </div>
        </div>

        {/* Center Hero Monogram + Caller Identity */}
        <div
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '28px',
            padding: '6px 36px',
          }}
        >
          <div
            style={{
              width: '132px',
              height: '132px',
              borderRadius: '66px',
              backgroundColor: 'rgba(37, 211, 102, 0.18)',
              border: '2px solid rgba(37, 211, 102, 0.45)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: '110px',
                height: '110px',
                borderRadius: '55px',
                backgroundColor: '#128C7E',
                backgroundImage:
                  'linear-gradient(135deg, #128C7E 0%, #075E54 100%)',
                border: '3px solid #25D366',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span
                style={{
                  fontSize: '42px',
                  fontWeight: 800,
                  color: '#FFFFFF',
                }}
              >
                {initials}
              </span>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              maxWidth: '540px',
            }}
          >
            <span
              style={{
                fontSize: '44px',
                fontWeight: 800,
                lineHeight: 1.12,
                color: '#FFFFFF',
              }}
            >
              {caller}
            </span>
            <span
              style={{
                marginTop: '8px',
                fontSize: '22px',
                fontWeight: 600,
                color: '#86EFAC',
              }}
            >
              {rawPhone || 'Ringing…'}
            </span>
          </div>
        </div>

        {/* Bottom Frosted WhatsApp Action Dock */}
        <div
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '20px',
            backgroundColor: 'rgba(255, 255, 255, 0.06)',
            borderTop: '1px solid rgba(255, 255, 255, 0.12)',
            padding: '16px 32px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '26px',
                backgroundColor: '#FF3B30',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#FFFFFF"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </div>
            <span
              style={{
                fontSize: '18px',
                fontWeight: 700,
                color: '#FCA5A5',
              }}
            >
              Decline
            </span>
          </div>

          <div
            style={{
              flex: 1,
              height: '68px',
              borderRadius: '999px',
              backgroundColor: '#25D366',
              border: '3px solid #BBF7D0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '14px',
            }}
          >
            {isVideo ? (
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#FFFFFF"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polygon points="23 7 16 12 23 17 23 7" />
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
              </svg>
            ) : (
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#FFFFFF"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
            )}
            <span
              style={{
                fontSize: '26px',
                fontWeight: 900,
                color: '#FFFFFF',
                letterSpacing: '0.5px',
              }}
            >
              {acceptCtaText}
            </span>
          </div>
        </div>
      </div>
    ),
    {
      width: 800,
      height: 400,
      headers: {
        'Cache-Control': 'public, max-age=120, s-maxage=120',
      },
    }
  );
}
