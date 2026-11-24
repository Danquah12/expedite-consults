import { NextResponse } from 'next/server';
import { firebaseKvGetItem, firebaseKvSetItem } from '@/lib/connectin-firebase-kv';

export const dynamic = 'force-dynamic';

const WORKSPACE_KV_MAP = 'connectln_teams_workspace_v1';

export interface WorkspaceFileItem {
  id: string;
  name: string;
  type: string;
  sizeLabel: string;
  uploadedBy: string;
  uploadedAtIso: string;
  url?: string;
  dataUrl?: string;
}

export interface WorkspaceTaskItem {
  id: string;
  title: string;
  status: 'todo' | 'in_progress' | 'done';
  assignee: string;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  createdBy: string;
  updatedAtIso: string;
}

export interface WorkspaceNoteItem {
  id: string;
  title: string;
  content: string;
  updatedBy: string;
  updatedAtIso: string;
}

export interface ScheduledMessageItem {
  id: string;
  threadId: string;
  threadTitle: string;
  recipientName: string;
  recipientEmail?: string;
  text: string;
  scheduledForIso: string;
  senderName: string;
  senderEmail?: string;
  status: 'queued' | 'sent' | 'cancelled';
  createdAtIso: string;
}

interface ThreadWorkspaceBucket {
  files: WorkspaceFileItem[];
  tasks: WorkspaceTaskItem[];
  notes: WorkspaceNoteItem[];
}

interface ScheduledBucket {
  items: ScheduledMessageItem[];
}

function makeThreadBucketKey(threadId: string): string {
  return `tw_${String(threadId || 'default').replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 72)}`;
}

function makeUserBucketKey(raw: string): string {
  return `sched_${String(raw || '').trim().toLowerCase().replace(/[^a-z0-9@._-]/g, '_').slice(0, 72)}`;
}

async function getThreadBucket(threadId: string): Promise<ThreadWorkspaceBucket> {
  const item = await firebaseKvGetItem<ThreadWorkspaceBucket>(
    WORKSPACE_KV_MAP,
    makeThreadBucketKey(threadId)
  ).catch(() => null);
  return {
    files: Array.isArray(item?.files) ? item.files : [],
    tasks: Array.isArray(item?.tasks) ? item.tasks : [],
    notes: Array.isArray(item?.notes) ? item.notes : [],
  };
}

async function saveThreadBucket(threadId: string, bucket: ThreadWorkspaceBucket): Promise<void> {
  await firebaseKvSetItem(WORKSPACE_KV_MAP, makeThreadBucketKey(threadId), bucket);
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const threadId = (url.searchParams.get('threadId') || '').trim();
    const scheduledForUser = (url.searchParams.get('scheduledForUser') || '').trim();
    const scheduledEmail = (url.searchParams.get('scheduledEmail') || '').trim().toLowerCase();

    if (scheduledForUser || scheduledEmail) {
      const keys = Array.from(
        new Set(
          [
            scheduledEmail ? makeUserBucketKey(scheduledEmail) : '',
            scheduledForUser ? makeUserBucketKey(scheduledForUser) : '',
          ].filter(Boolean)
        )
      );
      const buckets = await Promise.all(
        keys.map((k) => firebaseKvGetItem<ScheduledBucket>(WORKSPACE_KV_MAP, k).catch(() => null))
      );
      const byId = new Map<string, ScheduledMessageItem>();
      for (const b of buckets) {
        for (const item of b?.items || []) {
          if (item?.id) byId.set(item.id, item);
        }
      }
      const scheduledMessages = Array.from(byId.values()).sort((a, b) =>
        a.scheduledForIso.localeCompare(b.scheduledForIso)
      );
      return NextResponse.json({ ok: true, scheduledMessages });
    }

    if (!threadId) {
      return NextResponse.json(
        { ok: false, error: 'threadId or scheduledForUser is required.' },
        { status: 400 }
      );
    }

    const bucket = await getThreadBucket(threadId);
    return NextResponse.json({
      ok: true,
      threadId,
      files: bucket.files,
      tasks: bucket.tasks,
      notes: bucket.notes,
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || 'Workspace read failed' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const action = String(body?.action || '').trim().toLowerCase();
    const nowIso = new Date().toISOString();

    if (
      action === 'schedule_message' ||
      action === 'cancel_scheduled' ||
      action === 'mark_scheduled_sent'
    ) {
      const senderName = String(body?.senderName || body?.userName || '').trim();
      const senderEmail = String(body?.senderEmail || body?.userEmail || '').trim().toLowerCase();
      const userKeys = Array.from(
        new Set(
          [
            senderEmail ? makeUserBucketKey(senderEmail) : '',
            senderName ? makeUserBucketKey(senderName) : '',
          ].filter(Boolean)
        )
      );
      if (userKeys.length === 0) {
        return NextResponse.json(
          { ok: false, error: 'senderName or senderEmail is required.' },
          { status: 400 }
        );
      }

      const existingBuckets = await Promise.all(
        userKeys.map((k) => firebaseKvGetItem<ScheduledBucket>(WORKSPACE_KV_MAP, k).catch(() => null))
      );
      const map = new Map<string, ScheduledMessageItem>();
      for (const b of existingBuckets) {
        for (const it of b?.items || []) {
          if (it?.id) map.set(it.id, it);
        }
      }

      let targetItem: ScheduledMessageItem | null = null;
      if (action === 'schedule_message') {
        const text = String(body?.text || '').trim();
        const threadId = String(body?.threadId || '').trim();
        const scheduledForIso = String(body?.scheduledForIso || '').trim();
        if (!text || !threadId || !scheduledForIso) {
          return NextResponse.json(
            { ok: false, error: 'threadId, text, and scheduledForIso are required.' },
            { status: 400 }
          );
        }
        targetItem = {
          id: String(body?.id || `sched_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`),
          threadId,
          threadTitle: String(body?.threadTitle || body?.recipientName || 'Conversation'),
          recipientName: String(body?.recipientName || body?.threadTitle || 'Member'),
          recipientEmail: body?.recipientEmail ? String(body.recipientEmail).trim().toLowerCase() : undefined,
          text: text.slice(0, 2000),
          scheduledForIso,
          senderName: senderName || senderEmail || 'ConnectLn Member',
          senderEmail: senderEmail || undefined,
          status: 'queued',
          createdAtIso: nowIso,
        };
        map.set(targetItem.id, targetItem);
      } else {
        const id = String(body?.id || '').trim();
        const existing = map.get(id);
        if (existing) {
          targetItem = {
            ...existing,
            status: action === 'mark_scheduled_sent' ? 'sent' : 'cancelled',
          };
          map.set(id, targetItem);
        }
      }

      const nextList = Array.from(map.values())
        .sort((a, b) => b.createdAtIso.localeCompare(a.createdAtIso))
        .slice(0, 80);

      await Promise.all(
        userKeys.map((k) => firebaseKvSetItem(WORKSPACE_KV_MAP, k, { items: nextList }))
      );

      return NextResponse.json({
        ok: true,
        item: targetItem,
        scheduledMessages: nextList,
      });
    }

    const threadId = String(body?.threadId || '').trim();
    if (!threadId) {
      return NextResponse.json({ ok: false, error: 'threadId is required.' }, { status: 400 });
    }
    const bucket = await getThreadBucket(threadId);

    if (action === 'add_file') {
      const f = body?.file || body;
      const name = String(f?.name || '').trim();
      if (!name) {
        return NextResponse.json({ ok: false, error: 'File name is required.' }, { status: 400 });
      }
      const dataUrlRaw = typeof f?.dataUrl === 'string' ? f.dataUrl : undefined;
      const fileItem: WorkspaceFileItem = {
        id: String(f?.id || `file_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`),
        name: name.slice(0, 140),
        type: String(f?.type || 'Document').slice(0, 60),
        sizeLabel: String(f?.sizeLabel || 'Shared file').slice(0, 40),
        uploadedBy: String(f?.uploadedBy || body?.userName || 'ConnectLn Member'),
        uploadedAtIso: nowIso,
        url: f?.url ? String(f.url).slice(0, 500) : undefined,
        dataUrl: dataUrlRaw && dataUrlRaw.length <= 450000 ? dataUrlRaw : undefined,
      };
      bucket.files = [fileItem, ...bucket.files.filter((x) => x.id !== fileItem.id)].slice(0, 60);
      await saveThreadBucket(threadId, bucket);
      return NextResponse.json({ ok: true, file: fileItem, files: bucket.files });
    }

    if (action === 'delete_file') {
      const fileId = String(body?.fileId || '').trim();
      bucket.files = bucket.files.filter((x) => x.id !== fileId);
      await saveThreadBucket(threadId, bucket);
      return NextResponse.json({ ok: true, files: bucket.files });
    }

    if (action === 'upsert_task') {
      const t = body?.task || body;
      const title = String(t?.title || '').trim();
      if (!title) {
        return NextResponse.json({ ok: false, error: 'Task title is required.' }, { status: 400 });
      }
      const status: WorkspaceTaskItem['status'] =
        t?.status === 'in_progress' || t?.status === 'done' ? t.status : 'todo';
      const priority: WorkspaceTaskItem['priority'] =
        t?.priority === 'low' || t?.priority === 'high' ? t.priority : 'medium';
      const taskItem: WorkspaceTaskItem = {
        id: String(t?.id || `task_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`),
        title: title.slice(0, 180),
        status,
        assignee: String(t?.assignee || 'Unassigned').slice(0, 80),
        priority,
        dueDate: t?.dueDate ? String(t.dueDate).slice(0, 24) : undefined,
        createdBy: String(t?.createdBy || body?.userName || 'ConnectLn Member'),
        updatedAtIso: nowIso,
      };
      bucket.tasks = [taskItem, ...bucket.tasks.filter((x) => x.id !== taskItem.id)].slice(0, 100);
      await saveThreadBucket(threadId, bucket);
      return NextResponse.json({ ok: true, task: taskItem, tasks: bucket.tasks });
    }

    if (action === 'delete_task') {
      const taskId = String(body?.taskId || '').trim();
      bucket.tasks = bucket.tasks.filter((x) => x.id !== taskId);
      await saveThreadBucket(threadId, bucket);
      return NextResponse.json({ ok: true, tasks: bucket.tasks });
    }

    if (action === 'save_note') {
      const n = body?.note || body;
      const title = String(n?.title || 'Shared Meeting Note').trim();
      const content = String(n?.content || '').trim();
      const noteItem: WorkspaceNoteItem = {
        id: String(n?.id || `note_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`),
        title: title.slice(0, 140),
        content: content.slice(0, 6000),
        updatedBy: String(n?.updatedBy || body?.userName || 'ConnectLn Member'),
        updatedAtIso: nowIso,
      };
      bucket.notes = [noteItem, ...bucket.notes.filter((x) => x.id !== noteItem.id)].slice(0, 40);
      await saveThreadBucket(threadId, bucket);
      return NextResponse.json({ ok: true, note: noteItem, notes: bucket.notes });
    }

    if (action === 'delete_note') {
      const noteId = String(body?.noteId || '').trim();
      bucket.notes = bucket.notes.filter((x) => x.id !== noteId);
      await saveThreadBucket(threadId, bucket);
      return NextResponse.json({ ok: true, notes: bucket.notes });
    }

    return NextResponse.json(
      { ok: false, error: `Unsupported workspace action "${action}".` },
      { status: 400 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || 'Workspace operation failed' },
      { status: 500 }
    );
  }
}
