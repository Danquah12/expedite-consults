'use client'

import React, { useState } from 'react'
import type { B2BConversationThread } from '@/lib/connectin-b2b-comms'
import { MiniMarkdown } from './MiniMarkdown'

export interface NoctisTodoItem {
  thread: B2BConversationThread
  todoTitle: string
  todoExplanation: string
  dateStr: string
  dateKey: string
  timeOnly: string
  sortTimestamp: number
  attCount: number
  msgCount: number
  actionLabel: string
  actionIcon: string
}

export interface NoctisDateGroup {
  dateKey: string
  sortTimestamp: number
  items: NoctisTodoItem[]
  autoSummary: string
}

export interface NoctisTopicGroup {
  id: string
  title: string
  icon: string
  items: B2BConversationThread[]
  summary: string
}

interface NoctisAIInboxViewProps {
  firstName: string
  threads: B2BConversationThread[]
  activeNoctisTodos: NoctisTodoItem[]
  dateGroups: NoctisDateGroup[]
  noctisTopics: NoctisTopicGroup[]
  noctisUnreadFilterMode: 'unread_and_pending' | 'strict_unread' | 'all'
  setNoctisUnreadFilterMode: (mode: 'unread_and_pending' | 'strict_unread' | 'all') => void
  unreadAndPendingCount: number
  strictUnreadThreadsCount: number
  isNoctisLoading: boolean
  noctisUpdatedAtLabel: string
  noctisBriefingText: string
  noctisCustomAnswer: string | null
  setNoctisCustomAnswer: (val: string | null) => void
  noctisQuestionInput: string
  setNoctisQuestionInput: (val: string) => void
  fetchNoctisInboxBriefing: (customQuestion?: string) => void
  completedNoctisTodoIds: string[]
  onRestoreCompletedTodos: () => void
  markNoctisTodoDone: (threadId: string) => void
  toggleSnoozeThread: (threadId: string, e?: React.MouseEvent) => void
  onOpenThread: (threadId: string, prefillDraft?: string) => void
}

export function NoctisAIInboxView({
  firstName,
  threads,
  activeNoctisTodos,
  dateGroups,
  noctisTopics,
  noctisUnreadFilterMode,
  setNoctisUnreadFilterMode,
  unreadAndPendingCount,
  strictUnreadThreadsCount,
  isNoctisLoading,
  noctisUpdatedAtLabel,
  noctisBriefingText,
  noctisCustomAnswer,
  setNoctisCustomAnswer,
  noctisQuestionInput,
  setNoctisQuestionInput,
  fetchNoctisInboxBriefing,
  completedNoctisTodoIds,
  onRestoreCompletedTodos,
  markNoctisTodoDone,
  toggleSnoozeThread,
  onOpenThread,
}: NoctisAIInboxViewProps) {
  const [showAllTodos, setShowAllTodos] = useState(false)
  const [showFilterTray, setShowFilterTray] = useState(false)
  const [showDateBreakdown, setShowDateBreakdown] = useState(false)
  const [dismissedTopicIds, setDismissedTopicIds] = useState<string[]>([])
  const [openMenuThreadId, setOpenMenuThreadId] = useState<string | null>(null)

  // Transform activeNoctisTodos into action-oriented "Suggested to-dos" matching the screenshot
  const formattedTodos = activeNoctisTodos.map((item, idx) => {
    const t = item.thread
    const senderShort = t.title.split('(')[0].trim()
    const isUnread = (t.unreadCount || 0) > 0
    const isDirectPeer = t.channelType === 'People'
    const isCompanyOrMeeting =
      t.channelType === 'Companies' ||
      t.lastMessage.toLowerCase().includes('call') ||
      t.lastMessage.toLowerCase().includes('briefing') ||
      t.lastMessage.toLowerCase().includes('meeting') ||
      t.lastMessage.toLowerCase().includes('huddle')

    let actionType: 'reply' | 'view' | 'open' = 'open'
    let title = item.todoTitle
    let summary = ''
    let linkLabel = ''

    if (isDirectPeer && idx === 0) {
      actionType = 'reply'
      title = `Reply to ${senderShort} regarding job & project connection`
      summary = `${senderShort} (${t.subtitle}) asked whether you are available to connect on "${t.lastMessage.replace(/^Subject:\s*/i, '').slice(0, 95)}".`
      linkLabel = item.attCount > 0 ? 'attached report' : ''
    } else if (isCompanyOrMeeting) {
      actionType = 'view'
      title = `Attend Intro Call / Role Briefing with ${senderShort}`
      summary = `${senderShort} (${t.subtitle}) invited you to review "${t.lastMessage.slice(0, 115)}". You can RSVP, add the event to your calendar, or launch a ConnectLn Video Huddle.`
      linkLabel = 'briefing details'
    } else if (item.attCount > 0 || t.channelType === 'Products') {
      actionType = 'open'
      title = `Review & verify dossier from ${senderShort}`
      summary = `${senderShort} notified you regarding "${t.lastMessage.slice(0, 110)}". You should inspect the attached specifications and confirm next steps via the`
      linkLabel = 'attached dossier'
    } else {
      actionType = idx % 3 === 0 ? 'reply' : idx % 3 === 1 ? 'view' : 'open'
      title =
        actionType === 'reply'
          ? `Follow up with ${senderShort} on recent message`
          : actionType === 'view'
          ? `Review briefing update from ${senderShort}`
          : `Open conversation & specs from ${senderShort}`
      summary = `${senderShort} (${t.subtitle}) sent: "${t.lastMessage.slice(0, 115)}".`
      linkLabel = 'thread details'
    }

    return {
      ...item,
      actionType,
      formattedTitle: title,
      formattedSummary: summary,
      linkLabel,
      isNewBadge: isUnread || idx === 0,
      citationCount: Math.max(1, item.attCount || Math.min(2, item.msgCount)),
    }
  })

  const visibleTodos = showAllTodos ? formattedTodos : formattedTodos.slice(0, 3)
  const hiddenTodoCount = Math.max(0, formattedTodos.length - 3)

  return (
    <div className="flex-1 bg-white overflow-y-auto h-full flex flex-col justify-between">
      {/* TOP WORKSPACE: ASK NOCTIS SEARCH BAR + HI KWESI + SUGGESTED TO-DOS */}
      <div className="px-6 sm:px-10 pt-5 pb-6 max-w-4xl w-full mx-auto">
        {/* 1. TOP "ASK NOCTIS" SEARCH BAR (MATCHING TOP RED BOX IN SCREENSHOT) */}
        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (!noctisQuestionInput.trim()) return
            fetchNoctisInboxBriefing(noctisQuestionInput.trim())
          }}
          className="relative mb-6"
        >
          <div className="w-full rounded-full bg-[#EAF1FB] hover:bg-[#E2ECF9] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#0B57D0]/30 border border-transparent focus-within:border-[#0B57D0]/40 px-4 py-2.5 flex items-center gap-3 transition-all shadow-2xs">
            {/* Sparkle Magnifying Glass Icon */}
            <div className="flex items-center text-slate-700 shrink-0">
              <svg className="w-5 h-5 text-slate-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <circle cx="11" cy="11" r="7" />
                <line x1="20" y1="20" x2="16.2" y2="16.2" />
                <path d="M11 7v4m-2-2h4" strokeLinecap="round" />
              </svg>
            </div>

            <input
              type="text"
              value={noctisQuestionInput}
              onChange={(e) => setNoctisQuestionInput(e.target.value)}
              placeholder="Ask Noctis"
              className="flex-1 bg-transparent text-sm font-medium text-slate-900 placeholder:text-slate-600 focus:outline-none"
            />

            {noctisQuestionInput.trim() && (
              <button
                type="submit"
                disabled={isNoctisLoading}
                className="rounded-full bg-[#0B57D0] hover:bg-[#0842A0] text-white px-3.5 py-1 text-xs font-bold transition-all cursor-pointer shrink-0"
              >
                {isNoctisLoading ? 'Asking...' : 'Ask →'}
              </button>
            )}

            {/* Right Filter Sliders Icon (Matches Screenshot Top Search Bar) */}
            <button
              type="button"
              onClick={() => setShowFilterTray((prev) => !prev)}
              title="Filter Noctis AI Inbox scope & arrival dates"
              className="w-8 h-8 rounded-full hover:bg-slate-300/60 flex items-center justify-center text-slate-700 transition-colors cursor-pointer shrink-0"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <line x1="4" y1="6" x2="20" y2="6" />
                <circle cx="9" cy="6" r="2" fill="currentColor" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <circle cx="15" cy="12" r="2" fill="currentColor" />
                <line x1="4" y1="18" x2="20" y2="18" />
                <circle cx="10" cy="18" r="2" fill="currentColor" />
              </svg>
            </button>
          </div>

          {/* Expandable Filter & Quick Prompt Drawer when filter icon is clicked */}
          {showFilterTray && (
            <div className="mt-2 rounded-2xl bg-[#F8FAFD] border border-[#D3E3FD] p-3.5 shadow-sm space-y-2.5 animate-in fade-in">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] font-bold text-slate-500 mr-1">Scope:</span>
                  <button
                    type="button"
                    onClick={() => setNoctisUnreadFilterMode('unread_and_pending')}
                    className={`rounded-full px-3 py-1 text-xs font-bold cursor-pointer ${
                      noctisUnreadFilterMode === 'unread_and_pending'
                        ? 'bg-[#0B57D0] text-white'
                        : 'bg-white text-slate-700 border border-slate-200'
                    }`}
                  >
                    Suggested &amp; Pending ({unreadAndPendingCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setNoctisUnreadFilterMode('strict_unread')}
                    className={`rounded-full px-3 py-1 text-xs font-bold cursor-pointer ${
                      noctisUnreadFilterMode === 'strict_unread'
                        ? 'bg-[#0B57D0] text-white'
                        : 'bg-white text-slate-700 border border-slate-200'
                    }`}
                  >
                    Unread Only ({strictUnreadThreadsCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setNoctisUnreadFilterMode('all')}
                    className={`rounded-full px-3 py-1 text-xs font-bold cursor-pointer ${
                      noctisUnreadFilterMode === 'all'
                        ? 'bg-[#0B57D0] text-white'
                        : 'bg-white text-slate-700 border border-slate-200'
                    }`}
                  >
                    All Threads ({threads.length})
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => fetchNoctisInboxBriefing()}
                  className="text-xs font-bold text-[#0B57D0] hover:underline cursor-pointer"
                >
                  ↻ Refresh ({noctisUpdatedAtLabel})
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {[
                  'Summarize my unread emails grouped by the dates they came in',
                  'Which messages need urgent replies today?',
                  'Explain all attached files & arrival dates',
                ].map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => {
                      setNoctisQuestionInput(chip)
                      fetchNoctisInboxBriefing(chip)
                    }}
                    className="rounded-full bg-white hover:bg-blue-50 text-[#0B57D0] border border-blue-200 px-2.5 py-1 text-[11px] font-semibold cursor-pointer"
                  >
                    ✨ {chip}
                  </button>
                ))}
              </div>
            </div>
          )}
        </form>

        {/* Live Noctis Answer Callout if the user asked a custom question */}
        {noctisCustomAnswer && (
          <div className="mb-5 rounded-2xl bg-[#F8FAFD] border border-[#D3E3FD] p-4 shadow-2xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-extrabold text-[#0B57D0] flex items-center gap-1.5">
                <span>✨</span> Noctis AI Inbox Answer
              </span>
              <button
                type="button"
                onClick={() => setNoctisCustomAnswer(null)}
                className="text-xs font-bold text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                Dismiss ✕
              </button>
            </div>
            <div className="text-xs sm:text-sm text-slate-800 leading-relaxed">
              <MiniMarkdown text={noctisCustomAnswer} />
            </div>
          </div>
        )}

        {/* 2. GREETING & HEADLINE WITH BLUE "VIEW" PILL BUTTON (MATCHING SCREENSHOT) */}
        <div className="mb-5">
          <span className="inline-block rounded-md bg-[#E8F0FE] text-[#1967D2] px-2 py-0.5 text-[11px] font-bold mb-1.5">
            Beta
          </span>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight leading-snug">
                Hi {firstName} 👋
              </h1>
              <h2 className="text-lg sm:text-[22px] font-bold text-slate-900 tracking-tight leading-snug">
                Updated to-dos and topics available
              </h2>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowDateBreakdown((prev) => !prev)
                fetchNoctisInboxBriefing()
              }}
              className="rounded-full bg-[#0B57D0] hover:bg-[#0842A0] text-white px-4 py-1.5 text-xs font-bold shadow-2xs transition-all cursor-pointer shrink-0"
            >
              {showDateBreakdown ? 'Hide Date Summary' : 'View'}
            </button>
          </div>
        </div>

        {/* Optional Collapsible Date-Grouped Summary Box when clicking "View" */}
        {showDateBreakdown && (
          <div className="mb-6 rounded-2xl bg-[#F8FAFD] border border-[#D3E3FD] p-4 animate-in fade-in">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-extrabold text-[#041E49]">
                📅 Noctis Unread Email Summary by Arrival Date ({dateGroups.length}{' '}
                {dateGroups.length === 1 ? 'date' : 'dates'})
              </span>
              <button
                type="button"
                onClick={() => setShowDateBreakdown(false)}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                Close ✕
              </button>
            </div>
            <div className="text-xs text-slate-800 leading-relaxed bg-white rounded-xl border border-blue-100 p-3">
              <MiniMarkdown
                text={
                  noctisBriefingText ||
                  dateGroups
                    .map(
                      (g) =>
                        `#### 📅 ${g.dateKey} (${g.items.length} unread)\n` +
                        g.items
                          .map((i) => `- **${i.thread.title}** (${i.timeOnly}): "${i.thread.lastMessage}"`)
                          .join('\n')
                    )
                    .join('\n\n')
                }
              />
            </div>
          </div>
        )}

        {/* 3. SUGGESTED TO-DOS SECTION (MATCHING MIDDLE RED BOX IN SCREENSHOT) */}
        <div className="mb-2">
          <div className="flex items-center justify-between mb-2.5">
            <h3 className="text-xs font-semibold text-slate-600">Suggested to-dos</h3>
            {completedNoctisTodoIds.length > 0 && (
              <button
                type="button"
                onClick={onRestoreCompletedTodos}
                className="text-xs font-bold text-[#0B57D0] hover:underline cursor-pointer"
              >
                Restore {completedNoctisTodoIds.length} completed
              </button>
            )}
          </div>

          {visibleTodos.length === 0 ? (
            <div className="rounded-2xl bg-[#F0F4F9] p-6 text-center">
              <p className="text-sm font-bold text-slate-800 mb-1">All suggested to-dos completed!</p>
              <button
                type="button"
                onClick={() => setNoctisUnreadFilterMode('all')}
                className="mt-2 rounded-full bg-[#0B57D0] text-white px-4 py-1.5 text-xs font-bold cursor-pointer"
              >
                Show All Inbox To-Dos
              </button>
            </div>
          ) : (
            <div className="space-y-1.5">
              {visibleTodos.map((item, idx) => {
                const isFirst = idx === 0
                const isLast = idx === visibleTodos.length - 1
                const roundedClass =
                  visibleTodos.length === 1
                    ? 'rounded-2xl'
                    : isFirst
                    ? 'rounded-t-2xl rounded-b-md'
                    : isLast
                    ? 'rounded-t-md rounded-b-2xl'
                    : 'rounded-md'

                return (
                  <div
                    key={item.thread.id}
                    className={`${roundedClass} bg-[#F0F4F9] hover:bg-[#E7EDF6] transition-colors px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h4 className="text-xs sm:text-[13.5px] font-bold text-slate-900">
                          {item.formattedTitle}
                        </h4>
                        {item.isNewBadge && (
                          <span className="rounded-md bg-[#0B57D0] text-white px-1.5 py-0.2 text-[10px] font-bold">
                            New
                          </span>
                        )}
                      </div>
                      <p className="text-xs sm:text-[13px] text-slate-700 leading-relaxed">
                        {item.formattedSummary}{' '}
                        {item.linkLabel && (
                          <button
                            type="button"
                            onClick={() => onOpenThread(item.thread.id)}
                            className="underline text-slate-800 hover:text-[#0B57D0] font-medium cursor-pointer"
                          >
                            {item.linkLabel}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => onOpenThread(item.thread.id)}
                          title={`Open source message (${item.dateStr})`}
                          className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-slate-500 hover:text-[#0B57D0] ml-1.5 align-baseline cursor-pointer"
                        >
                          <span>🔗</span>
                          <span>{item.citationCount}</span>
                        </button>
                      </p>
                    </div>

                    {/* Right-side Action Pills matching Screenshot: (Reply / View ▾ / Open) + Clock + Check + 3-dots */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {item.actionType === 'reply' && (
                        <button
                          type="button"
                          onClick={() => {
                            const senderShort = item.thread.title.split('(')[0].trim()
                            const prefill = `Hi ${senderShort}, thanks for reaching out! I reviewed your message and I'm available to connect today.`
                            onOpenThread(item.thread.id, prefill)
                          }}
                          className="inline-flex items-center gap-1.5 rounded-full bg-[#D3E3FD] hover:bg-[#C2E7FF] text-[#041E49] px-3.5 py-1.5 text-xs font-bold transition-colors cursor-pointer"
                        >
                          <span>✏️</span>
                          <span>Reply</span>
                        </button>
                      )}

                      {item.actionType === 'view' && (
                        <button
                          type="button"
                          onClick={() => onOpenThread(item.thread.id)}
                          className="inline-flex items-center gap-1.5 rounded-full bg-[#D3E3FD] hover:bg-[#C2E7FF] text-[#041E49] px-3.5 py-1.5 text-xs font-bold transition-colors cursor-pointer"
                        >
                          <span>View</span>
                          <span className="text-[10px]">▾</span>
                        </button>
                      )}

                      {item.actionType === 'open' && (
                        <button
                          type="button"
                          onClick={() => onOpenThread(item.thread.id)}
                          className="inline-flex items-center gap-1.5 rounded-full bg-[#D3E3FD] hover:bg-[#C2E7FF] text-[#041E49] px-3.5 py-1.5 text-xs font-bold transition-colors cursor-pointer"
                        >
                          <span>🔗</span>
                          <span>Open</span>
                        </button>
                      )}

                      {/* Snooze Clock Icon */}
                      <button
                        type="button"
                        onClick={(e) => toggleSnoozeThread(item.thread.id, e)}
                        title="Snooze to-do"
                        className="w-8 h-8 rounded-full hover:bg-slate-300/60 flex items-center justify-center text-slate-600 transition-colors cursor-pointer"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                          <circle cx="12" cy="12" r="9" />
                          <polyline points="12 7 12 12 15 15" />
                        </svg>
                      </button>

                      {/* Mark Done Checkmark Icon */}
                      <button
                        type="button"
                        onClick={() => markNoctisTodoDone(item.thread.id)}
                        title="Mark to-do complete"
                        className="w-8 h-8 rounded-full hover:bg-emerald-100 flex items-center justify-center text-slate-600 hover:text-emerald-700 transition-colors cursor-pointer"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </button>

                      {/* 3-Dots More Menu */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() =>
                            setOpenMenuThreadId((prev) =>
                              prev === item.thread.id ? null : item.thread.id
                            )
                          }
                          title="More actions"
                          className="w-8 h-8 rounded-full hover:bg-slate-300/60 flex items-center justify-center text-slate-600 font-bold text-sm transition-colors cursor-pointer"
                        >
                          ⋮
                        </button>

                        {openMenuThreadId === item.thread.id && (
                          <div className="absolute right-0 top-9 z-30 w-48 rounded-xl bg-white border border-slate-200 shadow-lg py-1 text-xs text-slate-800">
                            <button
                              type="button"
                              onClick={() => {
                                const senderShort = item.thread.title.split('(')[0].trim()
                                onOpenThread(
                                  item.thread.id,
                                  `Hi ${senderShort}, following up on your message from ${item.dateStr}.`
                                )
                                setOpenMenuThreadId(null)
                              }}
                              className="w-full text-left px-3 py-2 hover:bg-slate-100 font-semibold"
                            >
                              ✨ Draft AI Reply with Noctis
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                onOpenThread(item.thread.id)
                                setOpenMenuThreadId(null)
                              }}
                              className="w-full text-left px-3 py-2 hover:bg-slate-100"
                            >
                              📬 Open Full Conversation
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                markNoctisTodoDone(item.thread.id)
                                setOpenMenuThreadId(null)
                              }}
                              className="w-full text-left px-3 py-2 hover:bg-slate-100 text-emerald-700"
                            >
                              ✓ Mark To-Do Done
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* "⌄ Show X more" expander button matching screenshot */}
          { formattedTodos.length > 3 && (
            <button
              type="button"
              onClick={() => setShowAllTodos((prev) => !prev)}
              className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-slate-700 hover:text-slate-950 px-2 py-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <span>{showAllTodos ? '⌃' : '⌄'}</span>
              <span>{showAllTodos ? 'Show less' : `Show ${hiddenTodoCount} more`}</span>
            </button>
          )}
        </div>
      </div>

      {/* 4. SCALLOPED WAVY DIVIDER + "TOPICS TO CATCH UP ON" SECTION (MATCHING BOTTOM OF SCREENSHOT) */}
      <div className="w-full mt-2">
        {/* Subtle Scalloped Wave SVG */}
        <div className="w-full overflow-hidden leading-none">
          <svg
            viewBox="0 0 1200 28"
            preserveAspectRatio="none"
            className="w-full h-5 text-[#F3F6FC] fill-current block"
          >
            <path d="M0,28 L0,14 Q30,0 60,14 T120,14 T180,14 T240,14 T300,14 T360,14 T420,14 T480,14 T540,14 T600,14 T660,14 T720,14 T780,14 T840,14 T900,14 T960,14 T1020,14 T1080,14 T1140,14 T1200,14 L1200,28 Z" />
          </svg>
        </div>

        <div className="bg-[#F3F6FC] px-6 sm:px-10 pt-4 pb-10">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-xs font-semibold text-slate-600 mb-3">Topics to catch up on</h3>

            <div className="space-y-4">
              {/* TOPIC CARD 1: SOFTWARE DEVELOPMENT & PLATFORM ENGINEERING (MATCHES SCREENSHOT) */}
              {!dismissedTopicIds.includes('topic_software_dev') && (
                <div className="rounded-2xl bg-white border border-slate-200/80 p-5 shadow-2xs">
                  <div className="flex items-center justify-between mb-3.5">
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-md bg-blue-50 flex items-center justify-center text-sm">
                        💻
                      </span>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                        Software Development
                      </h4>
                    </div>
                    <div className="flex items-center gap-1 text-slate-500">
                      <button
                        type="button"
                        onClick={() => setDismissedTopicIds((p) => [...p, 'topic_software_dev'])}
                        title="Mark topic caught up"
                        className="w-7 h-7 rounded-full hover:bg-slate-100 flex items-center justify-center cursor-pointer"
                      >
                        ✓
                      </button>
                      <button
                        type="button"
                        onClick={() => window.open('https://connectln-devhub.vercel.app', '_blank')}
                        title="Open ConnectLn DevHub"
                        className="w-7 h-7 rounded-full hover:bg-slate-100 flex items-center justify-center font-bold cursor-pointer"
                      >
                        ⋮
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4 text-xs sm:text-[13px] text-slate-700 leading-relaxed">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <p className="flex-1">
                        <strong className="text-slate-900">ConnectLn DevHub Standalone Platform</strong> — ConnectLn Engineering Control Plane v1.0 is live at{' '}
                        <a
                          href="https://connectln-devhub.vercel.app"
                          target="_blank"
                          rel="noreferrer"
                          className="underline text-[#0B57D0] font-medium"
                        >
                          connectln-devhub.vercel.app
                        </a>{' '}
                        with 14 lifecycle modules, ephemeral PR preview databases, and 20/20 verified acceptance gates.{' '}
                        <span className="inline-flex items-center gap-0.5 text-[11px] text-slate-500 ml-1">
                          🔗 1
                        </span>
                      </p>
                      <span className="text-[11px] text-slate-500 shrink-0">Just now</span>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <p className="flex-1">
                        <strong className="text-slate-900">Noctis CareerTwin 25-Question Interview Prep</strong> — Every advertised job on ConnectLn now includes 25 tailored interview questions across 5 interview rounds with AI rubric grading and study guide downloads.{' '}
                        <span className="inline-flex items-center gap-0.5 text-[11px] text-slate-500 ml-1">
                          🔗 1
                        </span>
                      </p>
                      <span className="text-[11px] text-slate-500 shrink-0">2 hours ago</span>
                    </div>
                  </div>
                </div>
              )}

              {/* DYNAMIC TOPIC CARDS FROM REAL MAILBOX THREADS */}
              {noctisTopics
                .filter((topic) => topic.items.length > 0 && !dismissedTopicIds.includes(topic.id))
                .map((topic) => (
                  <div
                    key={topic.id}
                    className="rounded-2xl bg-white border border-slate-200/80 p-5 shadow-2xs"
                  >
                    <div className="flex items-center justify-between mb-3.5">
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-md bg-blue-50 flex items-center justify-center text-sm">
                          {topic.icon}
                        </span>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                          {topic.title}
                        </h4>
                      </div>
                      <div className="flex items-center gap-1 text-slate-500">
                        <button
                          type="button"
                          onClick={() => setDismissedTopicIds((p) => [...p, topic.id])}
                          title="Mark topic caught up"
                          className="w-7 h-7 rounded-full hover:bg-slate-100 flex items-center justify-center cursor-pointer"
                        >
                          ✓
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (topic.items[0]) onOpenThread(topic.items[0].id)
                          }}
                          title="Open top conversation in topic"
                          className="w-7 h-7 rounded-full hover:bg-slate-100 flex items-center justify-center font-bold cursor-pointer"
                        >
                          ⋮
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3.5 text-xs sm:text-[13px] text-slate-700 leading-relaxed">
                      {topic.items.slice(0, 3).map((t) => {
                        const senderShort = t.title.split('(')[0].trim()
                        return (
                          <div
                            key={t.id}
                            onClick={() => onOpenThread(t.id)}
                            className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 cursor-pointer group"
                          >
                            <p className="flex-1">
                              <strong className="text-slate-900 group-hover:text-[#0B57D0] transition-colors">
                                {senderShort}
                              </strong>{' '}
                              — {t.subtitle}: &ldquo;{t.lastMessage}&rdquo;. Click to open the{' '}
                              <span className="underline text-slate-800 group-hover:text-[#0B57D0]">
                                conversation thread
                              </span>
                              .{' '}
                              <span className="inline-flex items-center gap-0.5 text-[11px] text-slate-500 ml-1">
                                🔗 {(t.messages || []).length || 1}
                              </span>
                            </p>
                            <span className="text-[11px] text-slate-500 shrink-0">
                              {t.lastMessageTime || 'Recent'}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
