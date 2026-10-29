import type { Metadata } from 'next';
import Link from 'next/link';

type SearchParamsPromise = Promise<{ [key: string]: string | string[] | undefined }>;

function pickStr(v: string | string[] | undefined, fallback = ''): string {
    if (Array.isArray(v)) return v[0] || fallback;
    return typeof v === 'string' ? v : fallback;
}

export async function generateMetadata({
    searchParams,
}: {
    searchParams: SearchParamsPromise;
}): Promise<Metadata> {
    const sp = await searchParams;
    const author = pickStr(sp.author, 'ConnectLn Member');
    const role = pickStr(sp.role, 'Verified ConnectLn Professional');
    const text = pickStr(sp.text, 'Shared message from ConnectLn');
    const avatar = pickStr(sp.avatar, '/brand/kwesi-avatar.png');
    const sharedBy = pickStr(sp.sharedBy, '');

    const qs = new URLSearchParams({
        author,
        role,
        text,
        avatar,
        sharedBy,
    }).toString();

    const ogImageUrl = `https://www.connectln.app/api/connectin/share-card/image?${qs}`;
    const title = `${author} on ConnectLn — "${text.slice(0, 70)}${text.length > 70 ? '…' : ''}"`;
    const description = `${role} · ${text.slice(0, 180)}`;

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            url: `https://www.connectln.app/share/message?${qs}`,
            siteName: 'ConnectLn',
            type: 'article',
            images: [
                {
                    url: ogImageUrl,
                    width: 1200,
                    height: 630,
                    alt: `${author} — ConnectLn Dispatch`,
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [ogImageUrl],
        },
    };
}

export default async function SharedMessagePage({
    searchParams,
}: {
    searchParams: SearchParamsPromise;
}) {
    const sp = await searchParams;
    const author = pickStr(sp.author, 'ConnectLn Member');
    const role = pickStr(sp.role, 'Verified ConnectLn Professional');
    const text = pickStr(sp.text, '');
    const rawAvatar = pickStr(sp.avatar, '');
    const sharedBy = pickStr(sp.sharedBy, '');

    const avatarSrc =
        rawAvatar && (/^https?:\/\//i.test(rawAvatar) || rawAvatar.startsWith('/'))
            ? rawAvatar
            : '/brand/kwesi-avatar.png';

    return (
        <main className="min-h-screen bg-[#EDE8E0] flex flex-col items-center justify-center p-4 sm:p-8">
            <div className="w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl border border-[#2C2825] bg-[#171513] text-[#F5F0EB]">
                {/* Top Branded Header: Profile Picture + ConnectLn Logo */}
                <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-5 bg-[#1F1C1A] border-b border-white/10">
                    <div className="flex items-center gap-3.5 min-w-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={avatarSrc}
                            alt={author}
                            className="h-14 w-14 rounded-full object-cover ring-2 ring-[#0A66C2] shrink-0"
                        />
                        <div className="min-w-0">
                            <div className="flex items-center gap-2">
                                <h1 className="text-lg font-black truncate text-[#F5F0EB]">
                                    {author}
                                </h1>
                                <span className="inline-flex items-center rounded-full bg-[#0A66C2] px-2.5 py-0.5 text-[11px] font-extrabold text-white">
                                    ✓ Verified
                                </span>
                            </div>
                            <p className="text-xs text-[#D6CFC7] truncate mt-0.5">{role}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2.5 bg-white/5 border border-white/15 px-3.5 py-2 rounded-xl shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src="/brand/connectln-icon-256.png"
                            alt="ConnectLn"
                            className="h-8 w-8 rounded-lg object-contain"
                        />
                        <div className="flex flex-col">
                            <span className="text-base font-black leading-none text-[#F5F0EB]">
                                ConnectLn
                            </span>
                            <span className="text-[10px] font-bold text-[#E07A5F] mt-0.5">
                                Tickets, vouches &amp; real work
                            </span>
                        </div>
                    </div>
                </div>

                {/* Message Body */}
                <div className="p-6 sm:p-8 space-y-5">
                    <div className="rounded-2xl bg-white/5 border border-white/10 p-5 sm:p-6">
                        <p className="text-base sm:text-lg font-semibold leading-relaxed whitespace-pre-line text-[#F5F0EB]">
                            {text}
                        </p>
                    </div>

                    {sharedBy && sharedBy !== author && (
                        <p className="text-xs font-bold text-[#C7BFB5]">
                            ↪ Shared with you by <span className="text-white">{sharedBy}</span> via ConnectLn
                        </p>
                    )}

                    <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-white/10">
                        <span className="text-xs text-[#C7BFB5]">
                            🔒 Verified ConnectLn Professional Dispatch
                        </span>
                        <Link
                            href="/connectin?tab=messaging"
                            className="inline-flex items-center gap-2 rounded-xl bg-[#0A66C2] hover:bg-[#004182] px-5 py-2.5 text-xs font-black text-white shadow-md transition-all"
                        >
                            Reply &amp; Connect on ConnectLn →
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    );
}
