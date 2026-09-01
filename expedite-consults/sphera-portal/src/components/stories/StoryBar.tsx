"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Sparkles, Loader2 } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { CreateStoryModal } from "./CreateStoryModal";
import { StoryViewerModal } from "./StoryViewerModal";
import { useSession } from "next-auth/react";
import type { StoryGroup } from "@/types";

export function StoryBar() {
  const { data: session } = useSession();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [activeGroupIndex, setActiveGroupIndex] = useState<number | null>(null);

  const { data: storyGroups = [], isLoading } = useQuery<StoryGroup[]>({
    queryKey: ["stories"],
    queryFn: async () => {
      const res = await fetch("/api/stories");
      const json = await res.json();
      if (!json.success) return [];
      return json.data;
    },
  });

  const currentUserGroup = storyGroups.find((g) => g.author.id === session?.user?.id);
  const otherGroups = storyGroups.filter((g) => g.author.id !== session?.user?.id);

  return (
    <>
      <div className="w-full bg-zinc-950/80 border border-zinc-800/80 rounded-2xl p-3 mb-6 backdrop-blur-md">
        <div className="flex items-center gap-4 overflow-x-auto no-scrollbar py-1">
          {/* Your Story (Create / View own) */}
          <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
            <button
              onClick={() => {
                if (currentUserGroup && currentUserGroup.stories.length > 0) {
                  const idx = storyGroups.findIndex((g) => g.author.id === session?.user?.id);
                  setActiveGroupIndex(idx >= 0 ? idx : 0);
                } else {
                  setIsCreateOpen(true);
                }
              }}
              className="relative group cursor-pointer"
            >
              <div
                className={`p-0.5 rounded-full ${
                  currentUserGroup && currentUserGroup.stories.length > 0
                    ? currentUserGroup.allViewed
                      ? "ring-2 ring-zinc-700"
                      : "ring-2 ring-[#00d4ff] bg-gradient-to-tr from-[#00d4ff] to-[#6366f1]"
                    : "ring-1 ring-zinc-700/60"
                }`}
              >
                <div className="p-0.5 bg-black rounded-full">
                  <Avatar
                    name={session?.user?.name || "You"}
                    src={session?.user?.image || undefined}
                    size="lg"
                    className="border-0"
                  />
                </div>
              </div>

              {/* Plus badge */}
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setIsCreateOpen(true);
                }}
                className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-[#00d4ff] text-[#0a0f1e] flex items-center justify-center border-2 border-black font-bold text-xs hover:scale-110 transition-transform"
              >
                <Plus size={12} strokeWidth={3} />
              </div>
            </button>
            <span className="text-[11px] font-medium text-gray-300 truncate max-w-[68px]">
              Your story
            </span>
          </div>

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex items-center gap-4 px-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex flex-col items-center gap-1.5 flex-shrink-0 animate-pulse">
                  <div className="h-14 w-14 rounded-full bg-zinc-900 border border-zinc-800" />
                  <div className="h-2 w-10 bg-zinc-900 rounded" />
                </div>
              ))}
            </div>
          )}

          {/* Other Users' Stories */}
          {otherGroups.map((group) => {
            const displayName = group.author.profile?.displayName ?? group.author.profile?.username ?? "User";
            const avatar = group.author.profile?.avatar;
            const allViewed = group.allViewed;

            return (
              <button
                key={group.author.id}
                onClick={() => {
                  const idx = storyGroups.findIndex((g) => g.author.id === group.author.id);
                  setActiveGroupIndex(idx);
                }}
                className="flex flex-col items-center gap-1.5 flex-shrink-0 group cursor-pointer"
              >
                <div
                  className={`p-0.5 rounded-full transition-transform group-hover:scale-105 ${
                    allViewed
                      ? "ring-2 ring-zinc-700"
                      : "ring-2 ring-transparent bg-gradient-to-tr from-[#ec4899] via-[#8b5cf6] to-[#00d4ff]"
                  }`}
                >
                  <div className="p-0.5 bg-black rounded-full">
                    <Avatar name={displayName} src={avatar || undefined} size="lg" className="border-0" />
                  </div>
                </div>
                <span className="text-[11px] font-medium text-gray-300 truncate max-w-[68px]">
                  {displayName}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Create Story Modal */}
      <CreateStoryModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />

      {/* Story Viewer Modal */}
      {activeGroupIndex !== null && storyGroups.length > 0 && (
        <StoryViewerModal
          groups={storyGroups}
          initialGroupIndex={activeGroupIndex}
          onClose={() => setActiveGroupIndex(null)}
        />
      )}
    </>
  );
}
