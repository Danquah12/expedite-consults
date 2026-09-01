import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Icon rendered on the left side of the input */
  icon?: React.ReactNode;
  /** Icon rendered on the right side of the input */
  rightIcon?: React.ReactNode;
  /** Inline validation error message shown below the input */
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, icon, rightIcon, error, ...props }, ref) => {
    return (
      <div className="relative w-full">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7280] pointer-events-none">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          className={cn(
            "w-full rounded-xl border border-[#1e2a3a] bg-[#111827] px-4 py-2.5",
            "text-[#f9fafb] placeholder:text-[#6b7280] text-sm",
            "transition-all duration-200",
            "focus:outline-none focus:border-[#00d4ff] focus:ring-1 focus:ring-[#00d4ff]/20",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            error && "border-[#ef4444] focus:border-[#ef4444] focus:ring-[#ef4444]/20",
            icon && "pl-10",
            rightIcon && "pr-10",
            className
          )}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b7280] pointer-events-none">
            {rightIcon}
          </div>
        )}
        {error && <p className="mt-1 text-xs text-[#ef4444]">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";
