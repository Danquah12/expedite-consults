import { UserButton } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

export function AuthSlot() {
  const { user, isPending } = useCurrentUserState();
  if (isPending) return <div className="size-8 animate-pulse rounded-full bg-elevated" />;
  if (!user) return <div className="size-8" />;
  return <UserButton />;
}
