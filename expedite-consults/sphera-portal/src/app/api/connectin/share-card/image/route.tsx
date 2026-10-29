import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const author = (searchParams.get('author') || 'ConnectLn Member').slice(0, 80);
    const role = (searchParams.get('role') || 'Verified ConnectLn Professional').slice(0, 110);
    const text = (searchParams.get('text') || '').slice(0, 420);
    const sharedBy = (searchParams.get('sharedBy') || '').slice(0, 80);
    const rawAvatar = searchParams.get('avatar') || '';

    const origin = new URL(req.url).origin || 'https://www.connectln.app';
    let avatarUrl = `${origin}/brand/kwesi-avatar.png`;
    if (rawAvatar && /^https?:\/\//i.test(rawAvatar)) {
        avatarUrl = rawAvatar;
    } else if (rawAvatar && rawAvatar.startsWith('/')) {
        avatarUrl = `${origin}${rawAvatar}`;
    }

    const logoUrl = `${origin}/brand/connectln-icon-256.png`;

    return new ImageResponse(
        (
            <div
                style={{
                    width: '1200px',
                    height: '630px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    backgroundColor: '#F5F0EB',
                    backgroundImage: 'linear-gradient(135deg, #171513 0%, #26221E 55%, #3B2820 100%)',
                    padding: '48px 56px',
                    color: '#F5F0EB',
                    fontFamily: 'sans-serif',
                }}
            >
                {/* Top Header: Author Profile Picture + ConnectLn Logo */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        width: '100%',
                        borderBottom: '2px solid rgba(245, 240, 235, 0.14)',
                        paddingBottom: '26px',
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <img
                            src={avatarUrl}
                            alt={author}
                            width={88}
                            height={88}
                            style={{
                                width: '88px',
                                height: '88px',
                                borderRadius: '44px',
                                objectFit: 'cover',
                                border: '4px solid #0A66C2',
                            }}
                        />
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{ fontSize: '32px', fontWeight: 900, color: '#FFFFFF' }}>
                                    {author}
                                </span>
                                <span
                                    style={{
                                        fontSize: '15px',
                                        fontWeight: 800,
                                        backgroundColor: '#0A66C2',
                                        color: '#FFFFFF',
                                        padding: '4px 12px',
                                        borderRadius: '999px',
                                    }}
                                >
                                    ✓ Verified
                                </span>
                            </div>
                            <span style={{ fontSize: '20px', color: '#D6CFC7', marginTop: '6px' }}>
                                {role}
                            </span>
                        </div>
                    </div>

                    {/* ConnectLn Brand Logo */}
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '14px',
                            backgroundColor: 'rgba(255, 255, 255, 0.08)',
                            padding: '12px 22px',
                            borderRadius: '18px',
                            border: '1px solid rgba(255, 255, 255, 0.16)',
                        }}
                    >
                        <img
                            src={logoUrl}
                            alt="ConnectLn"
                            width={48}
                            height={48}
                            style={{ width: '48px', height: '48px', borderRadius: '10px' }}
                        />
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: '28px', fontWeight: 900, color: '#FFFFFF' }}>
                                ConnectLn
                            </span>
                            <span style={{ fontSize: '13px', fontWeight: 700, color: '#E07A5F' }}>
                                Tickets, vouches &amp; real work
                            </span>
                        </div>
                    </div>
                </div>

                {/* Center Message Card */}
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        flex: 1,
                        margin: '28px 0',
                        padding: '32px 38px',
                        backgroundColor: 'rgba(255, 255, 255, 0.06)',
                        borderRadius: '24px',
                        border: '1px solid rgba(255, 255, 255, 0.14)',
                    }}
                >
                    <p
                        style={{
                            fontSize: text.length > 200 ? '26px' : '34px',
                            lineHeight: 1.4,
                            fontWeight: 700,
                            color: '#F5F0EB',
                            margin: 0,
                        }}
                    >
                        “{text}”
                    </p>
                </div>

                {/* Footer */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        width: '100%',
                        fontSize: '18px',
                        color: '#C7BFB5',
                    }}
                >
                    <span>
                        {sharedBy && sharedBy !== author
                            ? `Shared by ${sharedBy} via ConnectLn Professional Network`
                            : `Official Dispatch via ConnectLn Professional Network`}
                    </span>
                    <span style={{ fontWeight: 800, color: '#60A5FA' }}>www.connectln.app →</span>
                </div>
            </div>
        ),
        {
            width: 1200,
            height: 630,
        }
    );
}
