import * as React from "react";
import { cn, getInitials } from "@/lib/utils";

interface AvatarProps {
  src?: string | null;
  alt?: string;
  name?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  className?: string;
  /** Show online/offline indicator dot */
  online?: boolean;
}

const sizeMap: Record<NonNullable<AvatarProps["size"]>, string> = {
  xs: "h-6 w-6 text-[10px]",
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
  xl: "h-16 w-16 text-xl",
  "2xl": "h-24 w-24 text-3xl",
};

export function Avatar({ src, alt, name, size = "md", className, online }: AvatarProps) {
  const initials = name ? getInitials(name) : "?";

  return (
    <div className={cn("relative flex-shrink-0", className)}>
      <div
        className={cn(
          "rounded-full overflow-hidden flex items-center justify-center font-semibold",
          "bg-gradient-to-br from-[#00d4ff] to-[#6366f1] text-[#0a0f1e]",
          sizeMap[size]
        )}
      >
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={alt || name || "Avatar"}
            className="w-full h-full object-cover"
          />
        ) : (
          <span>{initials}</span>
        )}
      </div>

      {/* Online presence dot */}
      {online !== undefined && (
        <span
          className={cn(
            "absolute bottom-0 right-0 rounded-full border-2 border-[#0a0f1e]",
            size === "xs" || size === "sm" ? "h-2 w-2" : "h-3 w-3",
            online ? "bg-[#10b981]" : "bg-[#6b7280]"
          )}
        />
      )}
    </div>
  );
}
