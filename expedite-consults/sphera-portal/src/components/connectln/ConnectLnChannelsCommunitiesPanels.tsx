"use client"

import React, { useState } from "react"
import {
  BarChart3,
  CheckCircle2,
  Copy,
  Lock,
  Megaphone,
  Plus,
  QrCode,
  Radio,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react"
import { buildQrSvgDataUrl } from "@/lib/connectln-e2ee-crypto"
import {
  CommPrivacySettings,
  updateCommPrivacySettings,
} from "@/lib/connectln-comm-pro"

export interface ChannelItem {
  id: string
  name: string
  handle: string
  category: string
  followers: number
  isVerified: boolean
  isPromoted?: boolean
  isPremium?: boolean
  priceLabel?: string
  description: string
  avatar: string
  posts: Array<{
    id: string
    text: string
    time: string
    reach: number
    reactions: Record<string, number>
    pollQuestion?: string
    pollOptions?: string[]
  }>
}

const INITIAL_CHANNELS: ChannelItem[] = [
  {
    id: "ch_connectln_official",
    name: "ConnectLn Platform & Security Bulletins",
    handle: "@connectln_official",
    category: "Product & Security",
    followers: 42800,
    isVerified: true,
    description: "Official release notes, E2EE encryption advisories, and enterprise feature rollouts.",
    avatar: "/brand/connectln-icon-256.png",
    posts: [
      {
        id: "chp_1",
        text: "Server-Blind ECDH P-256 E2EE messaging, AES-256-GCM backups, and multi-device QR pairing are now live across ConnectLn Mail & Messaging.",
        time: "Today · 10:15 AM",
        reach: 18420,
        reactions: { "👍": 412, "🔐": 289, "🔥": 154 },
        pollQuestion: "Which capability improves your daily workflow most?",
        pollOptions: ["Server-Blind E2EE", "Live Call Caption Translation", "Business Quick Checkout"],
      },
      {
        id: "chp_2",
        text: "Reminder: Enable Silence Unknown Callers under Thread Drawer -> Privacy & Devices for spam-free calling.",
        time: "Yesterday · 4:30 PM",
        reach: 14910,
        reactions: { "🛡️": 203, "👍": 168 },
      },
    ],
  },
  {
    id: "ch_builders_guild",
    name: "Master Builders & Field Ops Network",
    handle: "@builders_guild",
    category: "Trades & Architecture",
    followers: 19450,
    isVerified: true,
    isPromoted: true,
    description: "Structural inspections, commercial RFQ alerts, safety checklists, and field commissioning reels.",
    avatar: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=180",
    posts: [
      {
        id: "chp_3",
        text: "Phase 2 steel truss rigging inspection template published — share directly inside your community groups.",
        time: "Today · 8:45 AM",
        reach: 9640,
        reactions: { "🏗️": 184, "👏": 112 },
      },
    ],
  },
  {
    id: "ch_executive_briefings",
    name: "Global Infrastructure & GovCon Tenders",
    handle: "@govcon_pro",
    category: "Enterprise & Advisory",
    followers: 11280,
    isVerified: true,
    isPremium: true,
    priceLabel: "$19/mo Pro Feed",
    description: "Curated federal/state contract tenders, compliance memos, and partner teardown briefs.",
    avatar: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=180",
    posts: [
      {
        id: "chp_4",
        text: "Q4 critical infrastructure cybersecurity RFP digest uploaded for subscribed members.",
        time: "2 days ago",
        reach: 6220,
        reactions: { "💼": 94, "👍": 78 },
      },
    ],
  },
]

interface BroadcastListItem {
  id: string
  name: string
  recipients: string[]
  lastSentText?: string
  lastSentTime?: string
}

export function ConnectLnChannelsView({
  userName,
  privacy,
  contacts,
  onSwitchToCommunities,
  onToast,
}: {
  userName: string
  privacy: CommPrivacySettings
  contacts: Array<{ id: string; name: string }>
  onSwitchToCommunities: () => void
  onToast: (msg: string) => void
}) {
  const [channels, setChannels] = useState<ChannelItem[]>(INITIAL_CHANNELS)
  const [leftTab, setLeftTab] = useState<"directory" | "following" | "broadcasts">("directory")
  const [search, setSearch] = useState("")
  const [selectedChannelId, setSelectedChannelId] = useState<string>(INITIAL_CHANNELS[0].id)
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [newPostDraft, setNewPostDraft] = useState("")
  const [channelPollVotes, setChannelPollVotes] = useState<Record<string, number>>({})

  const [broadcastLists, setBroadcastLists] = useState<BroadcastListItem[]>([
    {
      id: "bl_clients",
      name: "VIP Client Updates",
      recipients: contacts.slice(0, 4).map((c) => c.name),
      lastSentText: "Weekly milestone update & schedule link sent.",
      lastSentTime: "Yesterday",
    },
    {
      id: "bl_vendors",
      name: "Field Contractors & Suppliers",
      recipients: contacts.slice(2, 6).map((c) => c.name),
    },
  ])
  const [selectedBroadcastId, setSelectedBroadcastId] = useState<string>("bl_clients")
  const [newBroadcastName, setNewBroadcastName] = useState("")
  const [broadcastText, setBroadcastText] = useState("")

  const followedIds = privacy.followedChannelIds || []
  const filteredChannels = channels.filter((ch) => {
    const matchesSearch =
      !search.trim() ||
      `${ch.name} ${ch.handle} ${ch.category}`.toLowerCase().includes(search.trim().toLowerCase())
    if (!matchesSearch) return false
    if (leftTab === "following") return followedIds.includes(ch.id)
    return true
  })

  const activeChannel =
    channels.find((c) => c.id === selectedChannelId) || channels[0]
  const activeBroadcast =
    broadcastLists.find((b) => b.id === selectedBroadcastId) || broadcastLists[0]

  const toggleFollow = (channelId: string, channelName: string) => {
    const isFollowed = followedIds.includes(channelId)
    updateCommPrivacySettings((prev) => ({
      ...prev,
      followedChannelIds: isFollowed
        ? (prev.followedChannelIds || []).filter((id) => id !== channelId)
        : Array.from(new Set([...(prev.followedChannelIds || []), channelId])),
    }))
    onToast(isFollowed ? `Unfollowed ${channelName}.` : `📢 Following ${channelName}!`)
  }

  return (
    <div className="flex-1 flex flex-col md:flex-row h-full bg-[#FBF8F3] overflow-hidden">
      {/* Left Rail Column: Channels Directory & Broadcast Lists */}
      <div className="w-full md:w-[360px] border-r border-[#E0D6C5] flex flex-col h-full bg-[#FBF8F3] shrink-0">
        <div className="px-4 py-3 border-b border-[#E0D6C5]/70 space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-lg font-black text-[#1C1917] flex items-center gap-2">
              <Megaphone className="h-4 w-4 text-[#7C4225]" />
              <span>Channels</span>
            </h2>
            <div className="inline-flex rounded-xl bg-[#EFE8DA] border border-[#D0C4AE] p-0.5 text-[11px] font-bold">
              <span
                className="px-2.5 py-1 rounded-lg bg-[#7C4225] text-[#FBF8F3]"
                style={{ color: "#FBF8F3" }}
              >
                Channels
              </span>
              <button
                type="button"
                onClick={onSwitchToCommunities}
                className="px-2.5 py-1 rounded-lg text-[#57534E] hover:text-[#1C1917] cursor-pointer"
              >
                Communities
              </button>
            </div>
          </div>

          <div className="relative">
            <Search className="h-3.5 w-3.5 text-[#78716C] absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search channels directory..."
              className="w-full rounded-xl border border-[#D0C4AE] bg-[#F8F4EC] pl-8 pr-3 py-1.5 text-xs text-[#1C1917] focus:outline-none focus:border-[#7C4225]"
            />
          </div>

          <div className="grid grid-cols-3 gap-1 text-[11px] font-bold">
            {(
              [
                { id: "directory", label: "Directory" },
                { id: "following", label: `Following (${followedIds.length})` },
                { id: "broadcasts", label: "Broadcasts" },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setLeftTab(t.id)}
                className={`rounded-lg py-1.5 border cursor-pointer transition-colors ${
                  leftTab === t.id
                    ? "bg-[#7C4225] border-[#5E3119] text-[#FBF8F3]"
                    : "bg-[#F3EDE2] border-[#D0C4AE] text-[#57534E] hover:bg-[#EFE8DA]"
                }`}
                style={leftTab === t.id ? { color: "#FBF8F3" } : undefined}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2.5 space-y-2">
          {leftTab === "broadcasts" ? (
            <>
              <div className="rounded-xl border border-[#D0C4AE] bg-[#F8F4EC] p-2.5 space-y-1.5">
                <p className="text-[11px] font-extrabold text-[#5E3119]">
                  + New 1-to-Many Broadcast List
                </p>
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={newBroadcastName}
                    onChange={(e) => setNewBroadcastName(e.target.value)}
                    placeholder="List name (e.g. Q1 Clients)"
                    className="flex-1 rounded-lg border border-[#D0C4AE] bg-white px-2.5 py-1 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!newBroadcastName.trim()) return
                      const created: BroadcastListItem = {
                        id: `bl_${Date.now()}`,
                        name: newBroadcastName.trim(),
                        recipients: contacts.slice(0, 3).map((c) => c.name),
                      }
                      setBroadcastLists((prev) => [created, ...prev])
                      setSelectedBroadcastId(created.id)
                      setNewBroadcastName("")
                      onToast(`📣 Created broadcast list "${created.name}".`)
                    }}
                    className="rounded-lg bg-[#7C4225] px-2.5 py-1 text-xs font-extrabold cursor-pointer"
                    style={{ color: "#FBF8F3" }}
                  >
                    Create
                  </button>
                </div>
              </div>

              {broadcastLists.map((bl) => (
                <button
                  key={bl.id}
                  type="button"
                  onClick={() => setSelectedBroadcastId(bl.id)}
                  className={`w-full text-left rounded-xl border p-3 cursor-pointer transition-colors ${
                    selectedBroadcastId === bl.id
                      ? "bg-[#EFE8DA] border-[#7C4225]"
                      : "bg-white border-[#E0D6C5] hover:bg-[#F6F1E7]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-black text-[#1C1917]">{bl.name}</span>
                    <span className="text-[10px] font-bold text-[#7C4225]">
                      {bl.recipients.length} recipients
                    </span>
                  </div>
                  <p className="text-[11px] text-[#78716C] truncate mt-0.5">
                    {bl.lastSentText || bl.recipients.join(", ") || "Select recipients"}
                  </p>
                </button>
              ))}
            </>
          ) : (
            filteredChannels.map((ch) => {
              const isFollowed = followedIds.includes(ch.id)
              const isSelected = activeChannel.id === ch.id
              return (
                <div
                  key={ch.id}
                  onClick={() => setSelectedChannelId(ch.id)}
                  className={`rounded-xl border p-3 cursor-pointer transition-colors space-y-1.5 ${
                    isSelected
                      ? "bg-[#EFE8DA] border-[#7C4225]"
                      : "bg-white border-[#E0D6C5] hover:bg-[#F6F1E7]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={ch.avatar}
                        alt={ch.name}
                        className="w-10 h-10 rounded-xl object-cover border border-[#D0C4AE] shrink-0 bg-white"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-black text-[#1C1917] truncate flex items-center gap-1">
                          <span className="truncate">{ch.name}</span>
                          {ch.isVerified && (
                            <CheckCircle2 className="h-3.5 w-3.5 text-[#0A66C2] shrink-0" />
                          )}
                        </p>
                        <p className="text-[10.5px] text-[#78716C] truncate">
                          {ch.handle} · {ch.followers.toLocaleString()} followers
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleFollow(ch.id, ch.name)
                      }}
                      className={`rounded-lg px-2.5 py-1 text-[10.5px] font-extrabold shrink-0 cursor-pointer border ${
                        isFollowed
                          ? "bg-white border-[#7C4225] text-[#7C4225]"
                          : "bg-[#7C4225] border-[#5E3119] text-[#FBF8F3]"
                      }`}
                      style={isFollowed ? undefined : { color: "#FBF8F3" }}
                    >
                      {isFollowed ? "Following ✓" : "Follow"}
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    <span className="rounded bg-[#F3EDE2] text-[#57534E] px-1.5 py-0.5 text-[9.5px] font-bold">
                      {ch.category}
                    </span>
                    {ch.isPromoted && (
                      <span className="rounded bg-amber-100 text-amber-900 px-1.5 py-0.5 text-[9.5px] font-extrabold">
                        ★ Promoted
                      </span>
                    )}
                    {ch.isPremium && (
                      <span className="rounded bg-purple-100 text-purple-900 px-1.5 py-0.5 text-[9.5px] font-extrabold">
                        💎 {ch.priceLabel || "Premium"}
                      </span>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Right Workspace: Selected Channel Feed / Analytics OR Broadcast Composer */}
      <div className="flex-1 bg-[#F3EDE2] flex flex-col h-full overflow-hidden">
        {leftTab === "broadcasts" && activeBroadcast ? (
          <div className="flex-1 flex flex-col p-5 space-y-4 overflow-y-auto">
            <div className="rounded-2xl bg-[#FBF8F3] border border-[#E0D6C5] p-5 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h3 className="text-base font-black text-[#1C1917] flex items-center gap-2">
                    <Radio className="h-4 w-4 text-[#7C4225]" />
                    <span>{activeBroadcast.name}</span>
                  </h3>
                  <p className="text-xs text-[#78716C]">
                    Recipients receive a direct 1-to-1 copy privately (members cannot see other recipients).
                  </p>
                </div>
                <span className="rounded-full bg-[#EFE8DA] border border-[#D0C4AE] px-3 py-1 text-[11px] font-extrabold text-[#5E3119]">
                  {activeBroadcast.recipients.length} Contacts
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {activeBroadcast.recipients.map((r) => (
                  <span
                    key={r}
                    className="rounded-full bg-white border border-[#D0C4AE] px-2.5 py-0.5 text-[11px] font-bold text-[#1C1917]"
                  >
                    {r}
                  </span>
                ))}
              </div>
              {activeBroadcast.lastSentText && (
                <div className="rounded-xl bg-[#EFE8DA]/70 border border-[#D0C4AE] p-3 text-xs text-[#1C1917]">
                  <p className="font-bold text-[#5E3119]">
                    Last Broadcast ({activeBroadcast.lastSentTime || "Just now"}):
                  </p>
                  <p className="mt-0.5">{activeBroadcast.lastSentText}</p>
                </div>
              )}
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  if (!broadcastText.trim()) return
                  const clean = broadcastText.trim()
                  setBroadcastLists((prev) =>
                    prev.map((b) =>
                      b.id === activeBroadcast.id
                        ? { ...b, lastSentText: clean, lastSentTime: "Just now" }
                        : b
                    )
                  )
                  setBroadcastText("")
                  onToast(
                    `📣 Broadcast delivered to ${activeBroadcast.recipients.length} recipients!`
                  )
                }}
                className="flex items-center gap-2 pt-2"
              >
                <input
                  type="text"
                  value={broadcastText}
                  onChange={(e) => setBroadcastText(e.target.value)}
                  placeholder={`Send broadcast to ${activeBroadcast.name}...`}
                  className="flex-1 rounded-xl border border-[#D0C4AE] bg-white px-3.5 py-2 text-xs text-[#1C1917]"
                />
                <button
                  type="submit"
                  className="rounded-xl bg-[#7C4225] hover:bg-[#5E3119] px-4 py-2 text-xs font-extrabold flex items-center gap-1.5 cursor-pointer"
                  style={{ color: "#FBF8F3" }}
                >
                  <Send className="h-3.5 w-3.5" /> Broadcast
                </button>
              </form>
            </div>
          </div>
        ) : (
          <>
            <div className="px-5 py-3.5 bg-[#FBF8F3] border-b border-[#E0D6C5] flex items-center justify-between gap-3">
              <div className="min-w-0">
                <h3 className="text-sm font-black text-[#1C1917] flex items-center gap-1.5 truncate">
                  <span className="truncate">{activeChannel.name}</span>
                  {activeChannel.isVerified && (
                    <CheckCircle2 className="h-4 w-4 text-[#0A66C2] shrink-0" />
                  )}
                </h3>
                <p className="text-xs text-[#78716C] truncate">{activeChannel.description}</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAnalytics((v) => !v)}
                className="rounded-xl border border-[#D0C4AE] bg-[#EFE8DA] hover:bg-[#E2D9C8] px-3 py-1.5 text-xs font-extrabold text-[#5E3119] flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                <BarChart3 className="h-3.5 w-3.5" />
                <span>{showAnalytics ? "Hide Analytics" : "Analytics"}</span>
              </button>
            </div>

            {showAnalytics && (
              <div className="px-5 py-3 bg-[#EFE8DA]/80 border-b border-[#D0C4AE] grid grid-cols-3 gap-3 text-center">
                <div className="rounded-xl bg-[#FBF8F3] border border-[#D0C4AE] p-2.5">
                  <p className="text-[10px] font-bold uppercase text-[#78716C]">Subscribers</p>
                  <p className="text-base font-black text-[#1C1917]">
                    {activeChannel.followers.toLocaleString()}
                  </p>
                </div>
                <div className="rounded-xl bg-[#FBF8F3] border border-[#D0C4AE] p-2.5">
                  <p className="text-[10px] font-bold uppercase text-[#78716C]">7d Total Reach</p>
                  <p className="text-base font-black text-[#7C4225]">
                    {activeChannel.posts
                      .reduce((s, p) => s + p.reach, 0)
                      .toLocaleString()}
                  </p>
                </div>
                <div className="rounded-xl bg-[#FBF8F3] border border-[#D0C4AE] p-2.5">
                  <p className="text-[10px] font-bold uppercase text-[#78716C]">Engagement Rate</p>
                  <p className="text-base font-black text-emerald-700">6.8%</p>
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {activeChannel.posts.map((post) => (
                <div
                  key={post.id}
                  className="rounded-2xl bg-[#FBF8F3] border border-[#E0D6C5] p-4 shadow-2xs space-y-2.5 max-w-2xl"
                >
                  <div className="flex items-center justify-between text-[11px] text-[#78716C]">
                    <span className="font-bold text-[#5E3119]">{activeChannel.name}</span>
                    <span>
                      {post.time} · 👁 {post.reach.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-[#1C1917] leading-relaxed">{post.text}</p>

                  {post.pollQuestion && Array.isArray(post.pollOptions) && (
                    <div className="rounded-xl bg-[#F3EDE2] border border-[#D0C4AE] p-3 space-y-1.5">
                      <p className="text-xs font-extrabold text-[#1C1917]">
                        📊 {post.pollQuestion}
                      </p>
                      {post.pollOptions.map((opt, idx) => {
                        const chosen = channelPollVotes[post.id] === idx
                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() =>
                              setChannelPollVotes((prev) => ({ ...prev, [post.id]: idx }))
                            }
                            className={`w-full text-left rounded-lg border px-2.5 py-1.5 text-xs font-bold cursor-pointer ${
                              chosen
                                ? "bg-[#7C4225] border-[#5E3119] text-[#FBF8F3]"
                                : "bg-white border-[#D0C4AE] text-[#1C1917]"
                            }`}
                            style={chosen ? { color: "#FBF8F3" } : undefined}
                          >
                            {chosen ? "✓ " : ""}
                            {opt}
                          </button>
                        )
                      })}
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    {Object.entries(post.reactions).map(([emoji, count]) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => {
                          setChannels((prev) =>
                            prev.map((c) =>
                              c.id !== activeChannel.id
                                ? c
                                : {
                                    ...c,
                                    posts: c.posts.map((p) =>
                                      p.id !== post.id
                                        ? p
                                        : {
                                            ...p,
                                            reactions: {
                                              ...p.reactions,
                                              [emoji]: (p.reactions[emoji] || 0) + 1,
                                            },
                                          }
                                    ),
                                  }
                            )
                          )
                        }}
                        className="rounded-full bg-[#EFE8DA] hover:bg-[#E2D9C8] border border-[#D0C4AE] px-2.5 py-0.5 text-[11px] font-bold text-[#1C1917] cursor-pointer"
                      >
                        {emoji} {count}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                if (!newPostDraft.trim()) return
                const clean = newPostDraft.trim()
                setChannels((prev) =>
                  prev.map((c) =>
                    c.id !== activeChannel.id
                      ? c
                      : {
                          ...c,
                          posts: [
                            ...c.posts,
                            {
                              id: `chp_${Date.now()}`,
                              text: `${clean} — posted by ${userName}`,
                              time: "Just now",
                              reach: 1,
                              reactions: { "👍": 1 },
                            },
                          ],
                        }
                  )
                )
                setNewPostDraft("")
                onToast(`📢 Published update to ${activeChannel.name}!`)
              }}
              className="p-3 bg-[#FBF8F3] border-t border-[#E0D6C5] flex items-center gap-2"
            >
              <input
                type="text"
                value={newPostDraft}
                onChange={(e) => setNewPostDraft(e.target.value)}
                placeholder={`Publish channel update to ${activeChannel.name}...`}
                className="flex-1 rounded-full border border-[#D0C4AE] bg-[#F8F4EC] px-4 py-2 text-xs text-[#1C1917]"
              />
              <button
                type="submit"
                className="rounded-full bg-[#7C4225] hover:bg-[#5E3119] px-4 py-2 text-xs font-extrabold cursor-pointer"
                style={{ color: "#FBF8F3" }}
              >
                Publish
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

export function CommunityGroupToolsPanel({
  communityId,
  communityName,
  groupId,
  groupName,
  isAdminOnly,
  onToggleAdminOnly,
  onToast,
}: {
  communityId: string
  communityName: string
  groupId: string
  groupName: string
  isAdminOnly: boolean
  onToggleAdminOnly: (next: boolean) => void
  onToast: (msg: string) => void
}) {
  const [pendingMembers, setPendingMembers] = useState<Array<{ id: string; name: string; role: string }>>([
    { id: "req_1", name: "Daniel Osei", role: "Licensed Electrician · Requested join" },
  ])
  const inviteUrl = `https://conectln.com/connectin?joinCommunity=${encodeURIComponent(
    `${communityId}:${groupId}`
  )}`
  const qrSrc = buildQrSvgDataUrl(inviteUrl)

  return (
    <div className="px-4 py-3 bg-[#EFE8DA]/90 border-b border-[#D0C4AE] grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
      <div className="rounded-xl bg-[#FBF8F3] border border-[#D0C4AE] p-3 space-y-2">
        <p className="font-black text-[#1C1917] flex items-center gap-1.5">
          <Lock className="h-3.5 w-3.5 text-[#7C4225]" /> Posting Permissions
        </p>
        <label className="flex items-center justify-between gap-2 cursor-pointer">
          <span className="font-bold text-[#57534E]">Admin-only messaging</span>
          <input
            type="checkbox"
            checked={isAdminOnly}
            onChange={(e) => {
              onToggleAdminOnly(e.target.checked)
              onToast(
                e.target.checked
                  ? `🔒 ${groupName} restricted to Group Admins only.`
                  : `🔓 All members can now post in ${groupName}.`
              )
            }}
            className="h-4 w-4 accent-[#7C4225]"
          />
        </label>
        <p className="text-[10.5px] text-[#78716C]">
          Synced per group to prevent spam while keeping announcements authoritative.
        </p>
      </div>

      <div className="rounded-xl bg-[#FBF8F3] border border-[#D0C4AE] p-3 space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <p className="font-black text-[#1C1917] flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 text-[#7C4225]" /> Approvals ({pendingMembers.length})
          </p>
          <button
            type="button"
            onClick={() =>
              setPendingMembers((prev) => [
                ...prev,
                {
                  id: `req_${Date.now()}`,
                  name: `Applicant #${prev.length + 2}`,
                  role: "Pending Member Verification",
                },
              ])
            }
            className="text-[10px] font-bold text-[#7C4225] underline cursor-pointer"
          >
            + Simulate Request
          </button>
        </div>
        {pendingMembers.length === 0 ? (
          <p className="text-[11px] text-[#78716C]">No pending membership requests.</p>
        ) : (
          pendingMembers.map((pm) => (
            <div
              key={pm.id}
              className="flex items-center justify-between gap-2 rounded-lg bg-[#F8F4EC] border border-[#E0D6C5] px-2 py-1"
            >
              <div className="min-w-0">
                <p className="font-bold text-[#1C1917] truncate">{pm.name}</p>
                <p className="text-[10px] text-[#78716C] truncate">{pm.role}</p>
              </div>
              <div className="flex gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setPendingMembers((prev) => prev.filter((x) => x.id !== pm.id))
                    onToast(`✓ Approved ${pm.name} into ${communityName}.`)
                  }}
                  className="rounded bg-emerald-700 px-1.5 py-0.5 text-[10px] font-bold text-white cursor-pointer"
                >
                  Approve
                </button>
                <button
                  type="button"
                  onClick={() => setPendingMembers((prev) => prev.filter((x) => x.id !== pm.id))}
                  className="rounded bg-rose-100 text-rose-800 px-1.5 py-0.5 text-[10px] font-bold cursor-pointer"
                >
                  Deny
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="rounded-xl bg-[#FBF8F3] border border-[#D0C4AE] p-3 flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={qrSrc}
          alt="Community Invite QR"
          className="w-16 h-16 rounded-lg border border-[#D0C4AE] bg-white shrink-0"
        />
        <div className="min-w-0 space-y-1">
          <p className="font-black text-[#1C1917] flex items-center gap-1">
            <QrCode className="h-3.5 w-3.5 text-[#7C4225]" /> Invite QR &amp; Link
          </p>
          <p className="text-[10px] text-[#78716C] truncate">{inviteUrl}</p>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard?.writeText(inviteUrl).catch(() => {})
              onToast("✓ Copied community invite link!")
            }}
            className="inline-flex items-center gap-1 rounded-lg bg-[#7C4225] px-2.5 py-1 text-[10.5px] font-extrabold cursor-pointer"
            style={{ color: "#FBF8F3" }}
          >
            <Copy className="h-3 w-3" /> Copy Invite Link
          </button>
        </div>
      </div>
    </div>
  )
}
