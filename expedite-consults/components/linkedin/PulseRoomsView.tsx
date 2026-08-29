"use client"

import React, { useState } from "react"
import {
  Radio,
  Mic,
  MicOff,
  Hand,
  Users,
  MessageSquare,
  Sparkles,
  Share2,
  X,
  Send,
  Volume2,
  Play,
  CheckCircle2,
  Plus
} from "lucide-react"
import { pulseRoomsData, PulseRoom } from "@/lib/nextgen-data"
import { UserProfile } from "@/lib/linkedin-data"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface PulseRoomsViewProps {
  currentUser: UserProfile
}

export function PulseRoomsView({ currentUser }: PulseRoomsViewProps) {
  const [rooms, setRooms] = useState<PulseRoom[]>(pulseRoomsData)
  const [activeRoom, setActiveRoom] = useState<PulseRoom | null>(null)
  const [isMuted, setIsMuted] = useState(false)
  const [handRaised, setHandRaised] = useState(false)
  const [chatMessages, setChatMessages] = useState<{ sender: string; text: string }[]>([
    { sender: "Samantha Wei", text: "Great point regarding vector index isolation Elena!" },
    { sender: "Devon Hughes", text: "Are you benchmarking on AWS Graviton4 or x86?" }
  ])
  const [chatInput, setChatInput] = useState("")

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatInput.trim()) return
    setChatMessages(prev => [...prev, { sender: currentUser.name, text: chatInput.trim() }])
    setChatInput("")
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-12">
      {/* Header Banner */}
      <div className="rounded-2xl border border-zinc-200 bg-gradient-to-r from-purple-950 via-indigo-950 to-slate-950 p-6 text-white shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="rounded-full bg-purple-400/20 px-2.5 py-0.5 text-xs font-bold text-purple-300 border border-purple-400/40 flex items-center gap-1.5 w-fit">
              <Radio className="h-3.5 w-3.5 animate-pulse text-red-400" /> ConnectIn Pulse Rooms (Live)
            </span>
            <h2 className="mt-2 text-xl sm:text-2xl font-bold tracking-tight">
              Drop-In Audio Stages & Architecture Teardowns
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-purple-200 max-w-xl">
              Listen, speak, and collaborate live with Principal Engineers and Security Fellows. Automated AI minutes recorded in real-time.
            </p>
          </div>

          <button
            onClick={() => setActiveRoom(rooms[0])}
            className="flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg hover:from-purple-600 hover:to-indigo-700 transition-all"
          >
            <Plus className="h-4 w-4" /> Start a Pulse Stage
          </button>
        </div>
      </div>

      {/* Live Audio Stages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {rooms.map((room) => (
          <div
            key={room.id}
            onClick={() => setActiveRoom(room)}
            className="group rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs transition-all hover:border-[#0A66C2] hover:shadow-md cursor-pointer dark:border-zinc-800 dark:bg-zinc-900 space-y-4"
          >
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-2.5 py-0.5 text-[11px] font-bold text-red-600 dark:bg-red-950 dark:text-red-400">
                <span className="h-2 w-2 rounded-full bg-red-600 animate-ping" />
                LIVE NOW · {room.listenersCount} listening
              </span>
              <span className="text-xs text-zinc-400 font-semibold">{room.category}</span>
            </div>

            <h3 className="font-bold text-base text-zinc-900 group-hover:text-[#0A66C2] leading-snug dark:text-zinc-100">
              {room.title}
            </h3>

            {/* Speakers Cluster */}
            <div className="flex items-center gap-3 pt-1">
              <div className="flex -space-x-3">
                {room.speakers.map((spk) => (
                  <div key={spk.id} className="relative">
                    <img
                      src={spk.avatar}
                      alt={spk.name}
                      className={`h-11 w-11 rounded-full border-2 border-white object-cover shadow-sm dark:border-zinc-900 ${
                        spk.isSpeaking ? "ring-2 ring-emerald-500 animate-pulse" : ""
                      }`}
                    />
                    {spk.isSpeaking && (
                      <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white" />
                    )}
                  </div>
                ))}
              </div>
              <div className="text-xs">
                <p className="font-bold text-zinc-900 dark:text-zinc-100">
                  {room.speakers.map(s => s.name.split(' ')[0]).join(', ')} speaking
                </p>
                <p className="text-[11px] text-zinc-400">{room.startedAt}</p>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 pt-2 border-t border-zinc-100 dark:border-zinc-800">
              {room.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-md bg-zinc-100 px-2 py-0.5 text-[10px] font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Live Stage Room Modal Dialog */}
      <Dialog open={Boolean(activeRoom)} onOpenChange={() => setActiveRoom(null)}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden sm:rounded-2xl bg-zinc-950 text-white border-zinc-800">
          <DialogHeader className="border-b border-zinc-800 px-6 py-4 bg-zinc-900/60">
            <div className="flex items-center justify-between">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/20 px-2.5 py-0.5 text-[10px] font-bold text-red-400 border border-red-500/40">
                  🔴 LIVE STAGE · {activeRoom?.listenersCount} Participants
                </span>
                <DialogTitle className="text-base sm:text-lg font-bold text-white mt-1">
                  {activeRoom?.title}
                </DialogTitle>
              </div>
            </div>
          </DialogHeader>

          {activeRoom && (
            <div className="grid grid-cols-1 md:grid-cols-12 max-h-[75vh]">
              {/* Left Side: Speaker Stage & Listeners */}
              <div className="md:col-span-7 p-6 space-y-6 overflow-y-auto border-r border-zinc-800">
                {/* Speakers Grid */}
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-3">
                    Speakers on Stage
                  </p>
                  <div className="grid grid-cols-3 gap-4">
                    {activeRoom.speakers.map((spk) => (
                      <div key={spk.id} className="text-center space-y-1.5">
                        <div className="relative inline-block">
                          <img
                            src={spk.avatar}
                            alt={spk.name}
                            className={`h-16 w-16 rounded-full object-cover mx-auto ring-4 ${
                              spk.isSpeaking
                                ? "ring-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)] animate-pulse"
                                : "ring-zinc-700"
                            }`}
                          />
                          <span
                            className={`absolute bottom-0 right-0 h-5 w-5 rounded-full flex items-center justify-center text-[10px] text-white ${
                              spk.isMuted ? "bg-red-600" : "bg-emerald-600"
                            }`}
                          >
                            {spk.isMuted ? <MicOff className="h-3 w-3" /> : <Mic className="h-3 w-3" />}
                          </span>
                        </div>
                        <p className="font-bold text-xs text-zinc-100 truncate">{spk.name}</p>
                        <p className="text-[10px] text-zinc-400 truncate">{spk.role}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Live Meeting Minutes */}
                {activeRoom.aiSummaryNotes && (
                  <div className="rounded-xl border border-purple-900/60 bg-purple-950/30 p-3.5 space-y-2">
                    <span className="font-bold text-xs text-purple-300 flex items-center gap-1.5">
                      <Sparkles className="h-4 w-4 text-amber-300" /> AI Live Summary Stream
                    </span>
                    <ul className="space-y-1 text-xs text-zinc-300 list-disc list-inside">
                      {activeRoom.aiSummaryNotes.map((note, nIdx) => (
                        <li key={nIdx} className="leading-relaxed">
                          {note}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Live Controls Bar */}
                <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsMuted(!isMuted)}
                      className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition-all ${
                        isMuted
                          ? "bg-red-600 text-white hover:bg-red-700"
                          : "bg-emerald-600 text-white hover:bg-emerald-700"
                      }`}
                    >
                      {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                      <span>{isMuted ? "Unmute" : "Mute"}</span>
                    </button>

                    <button
                      onClick={() => setHandRaised(!handRaised)}
                      className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold border transition-all ${
                        handRaised
                          ? "bg-amber-500 text-black border-amber-400"
                          : "border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                      }`}
                    >
                      <Hand className="h-4 w-4" />
                      <span>{handRaised ? "Hand Raised ✋" : "Raise Hand"}</span>
                    </button>
                  </div>

                  <button
                    onClick={() => setActiveRoom(null)}
                    className="rounded-full bg-zinc-800 px-4 py-2 text-xs font-bold text-zinc-300 hover:bg-zinc-700"
                  >
                    Leave Quietly ✌️
                  </button>
                </div>
              </div>

              {/* Right Side: Stage Live Chat */}
              <div className="md:col-span-5 p-4 flex flex-col justify-between bg-zinc-900/40 h-80 md:h-auto">
                <p className="text-xs font-bold text-zinc-400 pb-2 border-b border-zinc-800 flex items-center gap-1.5">
                  <MessageSquare className="h-4 w-4 text-[#0A66C2]" /> Stage Backchannel Chat
                </p>

                <div className="flex-1 overflow-y-auto space-y-2.5 py-3 text-xs">
                  {chatMessages.map((msg, mIdx) => (
                    <div key={mIdx} className="rounded-lg bg-zinc-850 p-2.5 border border-zinc-800 space-y-0.5">
                      <p className="font-bold text-[11px] text-sky-400">{msg.sender}</p>
                      <p className="text-zinc-200">{msg.text}</p>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleSendChat} className="flex items-center gap-1.5 pt-2 border-t border-zinc-800">
                  <input
                    type="text"
                    placeholder="Comment on stage..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    className="flex-1 rounded-full bg-zinc-800 px-3 py-1.5 text-xs text-white placeholder:text-zinc-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="rounded-full bg-[#0A66C2] p-1.5 text-white hover:bg-[#004182]"
                  >
                    <Send className="h-3 w-3" />
                  </button>
                </form>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
