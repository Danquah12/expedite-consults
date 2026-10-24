import type { HostEmbed } from "@/lib/hosts";

export function HostFrame({
  embed,
  posterUrl,
  playing,
  onToggle,
  className,
}: {
  embed: HostEmbed;
  posterUrl?: string;
  playing: boolean;
  onToggle: () => void;
  className?: string;
}) {
  if (!playing) {
    return (
      <button type="button" onClick={onToggle} className={`relative h-full min-h-full w-full ${className ?? ""}`}>
        {posterUrl ? (
          <img src={posterUrl} alt="" className="h-full w-full object-contain" />
        ) : (
          <span className="grid h-full place-items-center bg-bg px-6 text-center font-display text-lg font-semibold">{embed.label}</span>
        )}
        <span className="absolute bottom-3 left-3 rounded-full bg-bg/80 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em]">
          {embed.label}
        </span>
      </button>
    );
  }

  return (
    <div className="yt-stage" data-host={embed.kind}>
      <div className="yt-fit">
        <iframe
          src={embed.src}
          title={embed.label}
          className="yt-touch"
          allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
    </div>
  );
}
