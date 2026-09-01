"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { X, Search, Users, User, Loader2, Check } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { useDebounce } from "@/hooks/useDebounce";
import type { PublicUser, ConversationWithDetails } from "@/types";

interface NewConversationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectConversation: (conversation: ConversationWithDetails) => void;
}

export function NewConversationModal({
  isOpen,
  onClose,
  onSelectConversation,
}: NewConversationModalProps) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<PublicUser[]>([]);
  const [groupName, setGroupName] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  const { data: users = [], isLoading } = useQuery<PublicUser[]>({
    queryKey: ["search-users-chat", debouncedSearch],
    queryFn: async () => {
      if (!debouncedSearch || debouncedSearch.length < 2) return [];
      const res = await fetch(`/api/users?q=${encodeURIComponent(debouncedSearch)}`);
      const json = await res.json();
      if (!json.success) return [];
      return json.data;
    },
    enabled: debouncedSearch.length >= 2,
  });

  const createMutation = useMutation({
    mutationFn: async (payload: { type: "DM" | "GROUP"; participantIds: string[]; name?: string }) => {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      onSelectConversation(data);
      handleClose();
    },
  });

  const handleClose = () => {
    setSearch("");
    setSelectedUsers([]);
    setGroupName("");
    onClose();
  };

  const toggleUser = (user: PublicUser) => {
    if (selectedUsers.some((u) => u.id === user.id)) {
      setSelectedUsers(selectedUsers.filter((u) => u.id !== user.id));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  const handleStartChat = () => {
    if (selectedUsers.length === 0) return;
    const isGroup = selectedUsers.length > 1;

    createMutation.mutate({
      type: isGroup ? "GROUP" : "DM",
      participantIds: selectedUsers.map((u) => u.id),
      name: isGroup ? groupName || "Group Chat" : undefined,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={handleClose} />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md bg-[#111827] border border-[#1e2a3a] rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1e2a3a]">
          <button onClick={handleClose} className="text-[#6b7280] hover:text-[#f9fafb] transition-colors">
            <X size={20} />
          </button>
          <div className="font-semibold text-sm text-[#f9fafb]">
            {selectedUsers.length > 1 ? "New Group Chat" : "New Message"}
          </div>
          <button
            onClick={handleStartChat}
            disabled={selectedUsers.length === 0 || createMutation.isPending}
            className="text-xs font-semibold px-3.5 py-1.5 rounded-full bg-[#00d4ff] text-[#0a0f1e] hover:bg-[#00bce0] disabled:opacity-40 transition-all flex items-center gap-1"
          >
            {createMutation.isPending ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              "Chat"
            )}
          </button>
        </div>

        {/* Group title input if multiple users selected */}
        {selectedUsers.length > 1 && (
          <div className="p-3 border-b border-[#1e2a3a] bg-[#161924]">
            <input
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Group name (optional)..."
              className="w-full h-9 px-3 rounded-xl border border-[#1e2a3a] bg-[#111827] text-[#f9fafb] placeholder:text-[#6b7280] text-xs focus:outline-none focus:border-[#00d4ff]"
            />
          </div>
        )}

        {/* Selected Users Chips */}
        {selectedUsers.length > 0 && (
          <div className="flex flex-wrap gap-1.5 p-3 border-b border-[#1e2a3a] max-h-24 overflow-y-auto">
            {selectedUsers.map((u) => (
              <div
                key={u.id}
                className="flex items-center gap-1.5 bg-[#00d4ff]/10 text-[#00d4ff] border border-[#00d4ff]/30 px-2.5 py-1 rounded-full text-xs"
              >
                <span>{u.profile?.displayName || u.profile?.username}</span>
                <button onClick={() => toggleUser(u)} className="hover:text-white">
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Search Bar */}
        <div className="p-3 border-b border-[#1e2a3a] relative">
          <Search size={14} className="absolute left-6 top-1/2 -translate-y-1/2 text-[#6b7280]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or @username..."
            autoFocus
            className="w-full h-10 pl-9 pr-4 rounded-xl border border-[#1e2a3a] bg-[#161924] text-[#f9fafb] placeholder:text-[#6b7280] text-xs focus:outline-none focus:border-[#00d4ff]"
          />
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1 divide-y divide-[#1e2a3a]/40">
          {isLoading && (
            <div className="flex justify-center py-8">
              <Loader2 size={20} className="text-[#00d4ff] animate-spin" />
            </div>
          )}

          {!isLoading && debouncedSearch.length >= 2 && users.length === 0 && (
            <div className="text-center py-8 text-xs text-[#6b7280]">
              No users found matching &quot;{debouncedSearch}&quot;
            </div>
          )}

          {users.map((user) => {
            const isSelected = selectedUsers.some((u) => u.id === user.id);
            const name = user.profile?.displayName || user.profile?.username || "User";
            const username = user.profile?.username || "user";
            const avatar = user.profile?.avatar;

            return (
              <div
                key={user.id}
                onClick={() => toggleUser(user)}
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[#161924] cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Avatar name={name} src={avatar || undefined} size="sm" />
                  <div>
                    <p className="text-xs font-semibold text-[#f9fafb]">{name}</p>
                    <p className="text-[11px] text-[#6b7280]">@{username}</p>
                  </div>
                </div>

                <div
                  className={`h-5 w-5 rounded-full flex items-center justify-center border transition-all ${
                    isSelected
                      ? "bg-[#00d4ff] border-[#00d4ff] text-[#0a0f1e]"
                      : "border-[#374151]"
                  }`}
                >
                  {isSelected && <Check size={12} strokeWidth={3} />}
                </div>
              </div>
            );
          })}

          {debouncedSearch.length < 2 && selectedUsers.length === 0 && (
            <div className="text-center py-10 text-xs text-[#6b7280]">
              Type at least 2 characters to search for users
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
