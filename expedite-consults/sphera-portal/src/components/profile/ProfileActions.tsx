"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface ProfileActionsProps {
  targetUserId: string;
  isOwnProfile: boolean;
  initialIsFollowing: boolean;
  username: string;
}

async function toggleFollow(targetUserId: string) {
  const res = await fetch("/api/follow", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ targetUserId }),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error);
  return json.data;
}

export function ProfileActions({
  targetUserId,
  isOwnProfile,
  initialIsFollowing,
  username,
}: ProfileActionsProps) {
  const [following, setFollowing] = useState(initialIsFollowing);

  const mutation = useMutation({
    mutationFn: () => toggleFollow(targetUserId),
    onMutate: () => setFollowing((prev) => !prev),
    onSuccess: (data) => setFollowing(data.following),
    onError: () => setFollowing((prev) => !prev),
  });

  if (isOwnProfile) {
    return (
      <div className="flex gap-2">
        <Link
          href="/settings"
          className="flex-1 text-center py-2 text-sm font-semibold text-white bg-zinc-800 hover:bg-zinc-700 rounded-lg transition"
        >
          Edit profile
        </Link>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={() => mutation.mutate()}
        disabled={mutation.isPending}
        className={cn(
          "flex-1 py-2 text-sm font-semibold rounded-lg transition",
          following
            ? "bg-zinc-800 hover:bg-zinc-700 text-white"
            : "bg-violet-600 hover:bg-violet-500 text-white"
        )}
      >
        {mutation.isPending ? "…" : following ? "Following" : "Follow"}
      </button>
      <Link
        href={`/messages/${username}`}
        className="flex-1 text-center py-2 text-sm font-semibold text-white bg-zinc-800 hover:bg-zinc-700 rounded-lg transition"
      >
        Message
      </Link>
    </div>
  );
}
