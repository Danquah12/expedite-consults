'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  CheckSquare,
  ChevronDown,
  FileText,
  FolderOpen,
  Plus,
  StickyNote,
  Trash2,
  Upload,
} from 'lucide-react';
import {
  ConnectLnPresenceRecord,
  ConnectLnPresenceStatus,
  PRESENCE_META,
  getLocalPresenceRecord,
  setLocalPresenceStatus,
  subscribePresenceChange,
} from '@/lib/connectln-presence';
import type { B2BConversationThread } from '@/lib/b2b-messaging-data';
import type {
  WorkspaceFileItem,
  WorkspaceNoteItem,
  WorkspaceTaskItem,
} from '@/app/api/connectin/teams-workspace/route';

export function PresencePickerPill({
  userName,
  userEmail,
}: {
  userName?: string;
  userEmail?: string;
}) {
  const [open, setOpen] = useState(false);
  const [presence, setPresence] = useState<ConnectLnPresenceRecord>(() =>
    getLocalPresenceRecord()
  );
  const [statusMsgDraft, setStatusMsgDraft] = useState(presence.customMessage || '');
  const boxRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    return subscribePresenceChange((rec) => {
      setPresence(rec);
      if (rec.customMessage !== undefined) setStatusMsgDraft(rec.customMessage);
    });
  }, []);

  useEffect(() => {
    if (!open) return;
    const onOutside = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, [open]);

  const meta = PRESENCE_META[presence.status] || PRESENCE_META.available;

  const chooseStatus = async (status: ConnectLnPresenceStatus) => {
    const updated = await setLocalPresenceStatus(
      {
        status,
        customMessage: statusMsgDraft.trim(),
      },
      { name: userName, email: userEmail }
    );
    setPresence(updated);
    setOpen(false);
  };

  return (
    <div ref={boxRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 px-2.5 py-1 text-[11px] font-bold text-slate-800 cursor-pointer transition-colors"
        title={`Presence: ${meta.label} — ${meta.desc}`}
      >
        <span className={`h-2 w-2 rounded-full ${meta.dotClass}`} />
        <span>{meta.shortLabel}</span>
        <ChevronDown className="h-3 w-3 text-slate-500" />
      </button>

      {open && (
        <div className="absolute left-0 top-9 z-50 w-64 rounded-2xl bg-white border border-slate-200 shadow-2xl p-2.5 space-y-2">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 px-1">
            Set Your Teams Status
          </p>
          <div className="space-y-0.5">
            {(
              ['available', 'busy', 'dnd', 'brb', 'ooo', 'offline'] as ConnectLnPresenceStatus[]
            ).map((stKey) => {
              const m = PRESENCE_META[stKey];
              const isSelected = presence.status === stKey;
              return (
                <button
                  key={stKey}
                  type="button"
                  onClick={() => void chooseStatus(stKey)}
                  className={`w-full flex items-start gap-2 rounded-xl px-2.5 py-1.5 text-left cursor-pointer transition-colors ${
                    isSelected ? 'bg-blue-50 text-[#0A66C2]' : 'hover:bg-slate-50 text-slate-800'
                  }`}
                >
                  <span className={`mt-1 h-2.5 w-2.5 rounded-full shrink-0 ${m.dotClass}`} />
                  <div className="min-w-0">
                    <p className="text-xs font-extrabold leading-tight">{m.label}</p>
                    <p className="text-[10px] text-slate-500 leading-tight">{m.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-100 space-y-1.5">
            <input
              type="text"
              value={statusMsgDraft}
              onChange={(e) => setStatusMsgDraft(e.target.value)}
              placeholder="Set status note (e.g. On site until 3pm)"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] text-slate-900 focus:outline-none focus:border-[#0A66C2]"
            />
            <label className="flex items-center gap-2 text-[11px] font-semibold text-slate-700 px-1 cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(presence.oooAutoDecline)}
                onChange={(e) =>
                  void setLocalPresenceStatus(
                    {
                      oooAutoDecline: e.target.checked,
                      status: e.target.checked ? 'ooo' : presence.status,
                      customMessage: statusMsgDraft.trim(),
                    },
                    { name: userName, email: userEmail }
                  )
                }
              />
              <span>Auto-decline invites when OOO</span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
}

export function ChannelWorkspaceTabsPanel({
  activeTab,
  thread,
  userName,
  triggerToast,
}: {
  activeTab: 'files' | 'tasks' | 'notes';
  thread: B2BConversationThread;
  userName: string;
  triggerToast: (msg: string) => void;
}) {
  const [files, setFiles] = useState<WorkspaceFileItem[]>([]);
  const [tasks, setTasks] = useState<WorkspaceTaskItem[]>([]);
  const [notes, setNotes] = useState<WorkspaceNoteItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskAssignee, setNewTaskAssignee] = useState(thread.title || userName);
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newTaskDue, setNewTaskDue] = useState('');

  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const loadWorkspace = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/connectin/teams-workspace?threadId=${encodeURIComponent(thread.id)}`,
        { cache: 'no-store' }
      );
      const data = await res.json();
      if (data?.ok) {
        setFiles(Array.isArray(data.files) ? data.files : []);
        setTasks(Array.isArray(data.tasks) ? data.tasks : []);
        setNotes(Array.isArray(data.notes) ? data.notes : []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [thread.id]);

  useEffect(() => {
    void loadWorkspace();
  }, [loadWorkspace]);

  // Also gather all files previously shared in messages inside this thread
  const messageAttachments: WorkspaceFileItem[] = [];
  for (const m of thread.messages || []) {
    for (const att of m.attachments || []) {
      messageAttachments.push({
        id: `msg_att_${m.id}_${att.name}`,
        name: att.name,
        type: att.type || 'Shared Attachment',
        sizeLabel: 'Chat Attachment',
        uploadedBy: m.sender?.name || 'Member',
        uploadedAtIso: m.createdAtIso || '',
        url: att.url,
      });
    }
  }
  const combinedFiles = [...files, ...messageAttachments];

  const handleUploadWorkspaceFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    if (file.size > 350 * 1024) {
      triggerToast('Please upload files under 350 KB to the Channel Files tab.');
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = String(reader.result || '');
      const res = await fetch('/api/connectin/teams-workspace', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_file',
          threadId: thread.id,
          userName,
          file: {
            name: file.name,
            type: file.type || 'Document',
            sizeLabel: `${Math.max(1, Math.round(file.size / 1024))} KB`,
            uploadedBy: userName,
            dataUrl,
          },
        }),
      });
      const data = await res.json();
      if (data?.ok) {
        setFiles(data.files || []);
        triggerToast(`📁 Added "${file.name}" to ${thread.title} Files.`);
      }
    };
    reader.readAsDataURL(file);
  };

  if (activeTab === 'files') {
    return (
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 bg-slate-50/70 space-y-4">
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleUploadWorkspaceFile}
        />
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h4 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
              <FolderOpen className="h-4 w-4 text-[#0A66C2]" />
              <span>Shared Files · {thread.title}</span>
            </h4>
            <p className="text-[11px] text-slate-500">
              Every blueprint, spec sheet, and document exchanged in this conversation appears here.
            </p>
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            style={{ color: '#FFFFFF' }}
            className="rounded-xl bg-[#0A66C2] hover:bg-[#004182] px-3.5 py-2 text-xs font-extrabold flex items-center gap-1.5 cursor-pointer"
          >
            <Upload className="h-3.5 w-3.5" />
            <span>Upload File</span>
          </button>
        </div>

        {loading ? (
          <p className="text-xs text-slate-500">Syncing channel files...</p>
        ) : combinedFiles.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center space-y-2">
            <FileText className="h-8 w-8 text-slate-400 mx-auto" />
            <p className="text-xs font-bold text-slate-700">No shared files in this channel yet</p>
            <p className="text-[11px] text-slate-500">
              Upload a document above or attach a file in Chat to populate this repository.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {combinedFiles.map((f) => (
              <div
                key={f.id}
                className="rounded-xl bg-white border border-slate-200 px-3.5 py-2.5 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <FileText className="h-5 w-5 text-[#0A66C2] shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-extrabold text-slate-900 truncate">{f.name}</p>
                    <p className="text-[10.5px] text-slate-500 truncate">
                      {f.sizeLabel} · Shared by {f.uploadedBy}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {(f.dataUrl || f.url) && (
                    <a
                      href={f.dataUrl || f.url}
                      download={f.name}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg bg-slate-100 hover:bg-slate-200 px-2.5 py-1 text-[11px] font-bold text-slate-800 no-underline"
                    >
                      Download
                    </a>
                  )}
                  {!f.id.startsWith('msg_att_') && (
                    <button
                      type="button"
                      onClick={async () => {
                        const res = await fetch('/api/connectin/teams-workspace', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            action: 'delete_file',
                            threadId: thread.id,
                            fileId: f.id,
                          }),
                        });
                        const data = await res.json();
                        if (data?.ok) setFiles(data.files || []);
                      }}
                      className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-600 cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (activeTab === 'tasks') {
    const columns: Array<{ key: WorkspaceTaskItem['status']; label: string; bg: string }> = [
      { key: 'todo', label: 'To Do', bg: 'bg-slate-100/80' },
      { key: 'in_progress', label: 'In Progress', bg: 'bg-blue-50/80' },
      { key: 'done', label: 'Completed', bg: 'bg-emerald-50/80' },
    ];

    const addTask = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!newTaskTitle.trim()) return;
      const res = await fetch('/api/connectin/teams-workspace', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'upsert_task',
          threadId: thread.id,
          userName,
          task: {
            title: newTaskTitle.trim(),
            status: 'todo',
            assignee: newTaskAssignee.trim() || thread.title,
            priority: newTaskPriority,
            dueDate: newTaskDue || undefined,
            createdBy: userName,
          },
        }),
      });
      const data = await res.json();
      if (data?.ok) {
        setTasks(data.tasks || []);
        setNewTaskTitle('');
        setNewTaskDue('');
      }
    };

    const moveTask = async (t: WorkspaceTaskItem, nextStatus: WorkspaceTaskItem['status']) => {
      const res = await fetch('/api/connectin/teams-workspace', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'upsert_task',
          threadId: thread.id,
          userName,
          task: { ...t, status: nextStatus },
        }),
      });
      const data = await res.json();
      if (data?.ok) setTasks(data.tasks || []);
    };

    return (
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 bg-slate-50/70 space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h4 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
            <CheckSquare className="h-4 w-4 text-[#0A66C2]" />
            <span>Planner Tasks · {thread.title}</span>
          </h4>
        </div>

        <form
          onSubmit={addTask}
          className="rounded-2xl bg-white border border-slate-200 p-3 flex flex-wrap items-center gap-2"
        >
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="New action item or deliverable..."
            className="flex-1 min-w-[180px] rounded-xl bg-slate-100 border border-slate-200 px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-[#0A66C2]"
          />
          <input
            type="text"
            value={newTaskAssignee}
            onChange={(e) => setNewTaskAssignee(e.target.value)}
            placeholder="Assignee"
            className="w-32 rounded-xl bg-slate-100 border border-slate-200 px-2.5 py-1.5 text-xs text-slate-900"
          />
          <select
            value={newTaskPriority}
            onChange={(e) => setNewTaskPriority(e.target.value as any)}
            className="rounded-xl bg-slate-100 border border-slate-200 px-2 py-1.5 text-xs font-semibold text-slate-800"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <input
            type="date"
            value={newTaskDue}
            onChange={(e) => setNewTaskDue(e.target.value)}
            className="rounded-xl bg-slate-100 border border-slate-200 px-2 py-1.5 text-xs text-slate-800"
          />
          <button
            type="submit"
            style={{ color: '#FFFFFF' }}
            className="rounded-xl bg-[#0A66C2] hover:bg-[#004182] px-3 py-1.5 text-xs font-extrabold flex items-center gap-1 cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Task</span>
          </button>
        </form>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {columns.map((col) => {
            const colTasks = tasks.filter((t) => t.status === col.key);
            return (
              <div
                key={col.key}
                className={`rounded-2xl border border-slate-200 ${col.bg} p-3 space-y-2`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-800">{col.label}</span>
                  <span className="text-[10.5px] font-bold bg-white px-2 py-0.5 rounded-full border border-slate-200 text-slate-700">
                    {colTasks.length}
                  </span>
                </div>
                {colTasks.map((t) => (
                  <div
                    key={t.id}
                    className="rounded-xl bg-white border border-slate-200 p-2.5 space-y-1.5 shadow-2xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-bold text-slate-900">{t.title}</p>
                      <button
                        type="button"
                        onClick={async () => {
                          const res = await fetch('/api/connectin/teams-workspace', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              action: 'delete_task',
                              threadId: thread.id,
                              taskId: t.id,
                            }),
                          });
                          const data = await res.json();
                          if (data?.ok) setTasks(data.tasks || []);
                        }}
                        className="text-slate-400 hover:text-rose-600 cursor-pointer"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-500">
                      👤 {t.assignee} ·{' '}
                      <span
                        className={
                          t.priority === 'high'
                            ? 'text-rose-700 font-bold'
                            : 'text-slate-600 font-semibold'
                        }
                      >
                        {t.priority.toUpperCase()}
                      </span>
                      {t.dueDate ? ` · Due ${t.dueDate}` : ''}
                    </p>
                    <div className="flex items-center gap-1 pt-0.5">
                      {col.key !== 'todo' && (
                        <button
                          type="button"
                          onClick={() => void moveTask(t, 'todo')}
                          className="rounded bg-slate-100 hover:bg-slate-200 px-1.5 py-0.5 text-[10px] font-bold text-slate-700 cursor-pointer"
                        >
                          To Do
                        </button>
                      )}
                      {col.key !== 'in_progress' && (
                        <button
                          type="button"
                          onClick={() => void moveTask(t, 'in_progress')}
                          className="rounded bg-blue-100 hover:bg-blue-200 px-1.5 py-0.5 text-[10px] font-bold text-blue-800 cursor-pointer"
                        >
                          In Progress
                        </button>
                      )}
                      {col.key !== 'done' && (
                        <button
                          type="button"
                          onClick={() => void moveTask(t, 'done')}
                          className="rounded bg-emerald-100 hover:bg-emerald-200 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800 cursor-pointer"
                        >
                          Done
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Notes tab
  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-5 bg-slate-50/70 space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h4 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
          <StickyNote className="h-4 w-4 text-[#0A66C2]" />
          <span>Shared Channel Notes · {thread.title}</span>
        </h4>
      </div>

      <form
        onSubmit={async (e) => {
          e.preventDefault();
          if (!noteContent.trim()) return;
          const res = await fetch('/api/connectin/teams-workspace', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'save_note',
              threadId: thread.id,
              userName,
              note: {
                title: noteTitle.trim() || 'Meeting & Project Note',
                content: noteContent.trim(),
                updatedBy: userName,
              },
            }),
          });
          const data = await res.json();
          if (data?.ok) {
            setNotes(data.notes || []);
            setNoteTitle('');
            setNoteContent('');
            triggerToast('📝 Channel note saved.');
          }
        }}
        className="rounded-2xl bg-white border border-slate-200 p-3.5 space-y-2"
      >
        <input
          type="text"
          value={noteTitle}
          onChange={(e) => setNoteTitle(e.target.value)}
          placeholder="Note title (e.g. Site Walkthrough Action Plan)"
          className="w-full rounded-xl bg-slate-100 border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#0A66C2]"
        />
        <textarea
          rows={3}
          value={noteContent}
          onChange={(e) => setNoteContent(e.target.value)}
          placeholder="Write shared agenda items, decisions, or specifications..."
          className="w-full rounded-xl bg-slate-100 border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#0A66C2]"
        />
        <button
          type="submit"
          style={{ color: '#FFFFFF' }}
          className="rounded-xl bg-[#0A66C2] hover:bg-[#004182] px-4 py-1.5 text-xs font-extrabold cursor-pointer"
        >
          Save Channel Note
        </button>
      </form>

      <div className="space-y-2.5">
        {notes.map((n) => (
          <div
            key={n.id}
            className="rounded-2xl bg-white border border-slate-200 p-3.5 space-y-1.5"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <h5 className="text-xs font-extrabold text-slate-900">{n.title}</h5>
                <p className="text-[10px] text-slate-500">
                  Updated by {n.updatedBy} ·{' '}
                  {new Date(n.updatedAtIso).toLocaleString([], {
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              <button
                type="button"
                onClick={async () => {
                  const res = await fetch('/api/connectin/teams-workspace', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      action: 'delete_note',
                      threadId: thread.id,
                      noteId: n.id,
                    }),
                  });
                  const data = await res.json();
                  if (data?.ok) setNotes(data.notes || []);
                }}
                className="p-1 rounded hover:bg-rose-50 text-rose-600 cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
            <p className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">{n.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
