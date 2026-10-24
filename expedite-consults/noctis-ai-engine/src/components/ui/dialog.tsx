import type { ComponentProps } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;
export const DialogPortal = DialogPrimitive.Portal;
export const DialogTitle = DialogPrimitive.Title;
export const DialogDescription = DialogPrimitive.Description;

export function DialogOverlay({ className, ...props }: ComponentProps<typeof DialogPrimitive.Overlay>) {
  return <DialogPrimitive.Overlay className={cn("fixed inset-0 z-[120] bg-bg/70", className)} {...props} />;
}

export function DialogContent({
  className,
  children,
  hideClose,
  ...props
}: ComponentProps<typeof DialogPrimitive.Content> & { hideClose?: boolean }) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        className={cn(
          "fixed left-1/2 top-1/2 z-[120] w-[min(92vw,440px)] max-h-[min(88dvh,640px)] overflow-y-auto -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-surface p-5 text-fg shadow-float",
          "max-lg:inset-x-0 max-lg:bottom-0 max-lg:top-auto max-lg:left-0 max-lg:w-full max-lg:max-w-none max-lg:translate-x-0 max-lg:translate-y-0 max-lg:rounded-b-none max-lg:rounded-t-3xl max-lg:max-h-[92dvh] max-lg:overflow-y-auto max-lg:pb-[max(1.25rem,env(safe-area-inset-bottom))] max-lg:pt-[max(1rem,env(safe-area-inset-top))]",
          className,
        )}
        {...props}
      >
        {children}
        {hideClose ? null : (
          <DialogPrimitive.Close
            type="button"
            className="absolute right-3 top-[max(0.65rem,env(safe-area-inset-top))] z-20 grid size-11 place-items-center rounded-full text-muted hover:bg-elevated hover:text-fg"
          >
            <X className="size-4" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  );
}

export function DialogHeader({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("mb-3 pr-8", className)} {...props} />;
}
