import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline" | "link";
  size?: "sm" | "md" | "lg" | "xl" | "icon" | "icon-sm" | "icon-lg";
  loading?: boolean;
}

const variantStyles: Record<string, string> = {
  primary:
    "bg-[#00d4ff] text-[#0a0f1e] hover:bg-[#00bce0] hover:shadow-[0_0_20px_rgba(0,212,255,0.3)]",
  secondary:
    "bg-[#1f2937] text-[#f9fafb] border border-[#1e2a3a] hover:bg-[#374151] hover:border-[#374151]",
  ghost: "text-[#9ca3af] hover:bg-[#1f2937] hover:text-[#f9fafb]",
  danger: "bg-[#ef4444] text-white hover:bg-[#dc2626]",
  outline:
    "border border-[#00d4ff] text-[#00d4ff] hover:bg-[rgba(0,212,255,0.1)]",
  link: "text-[#00d4ff] hover:underline p-0 h-auto",
};

const sizeStyles: Record<string, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-base",
  xl: "h-14 px-8 text-lg",
  icon: "h-9 w-9",
  "icon-sm": "h-7 w-7",
  "icon-lg": "h-11 w-11",
};

export function buttonVariants({
  variant = "secondary",
  size = "md",
  className,
}: {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline" | "link";
  size?: "sm" | "md" | "lg" | "xl" | "icon" | "icon-sm" | "icon-lg";
  className?: string;
} = {}) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00d4ff] disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
    variantStyles[variant] || variantStyles.secondary,
    sizeStyles[size] || sizeStyles.md,
    className
  );
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "secondary", size = "md", loading, children, disabled, ...props }, ref) => {
    return (
      <button
        className={buttonVariants({ variant, size, className })}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <span className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
        ) : null}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button };
