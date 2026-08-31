import { Thread, ThreadDetail, Mailbox, Message } from '../types/mail';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

// Rich Mock Data for Instant Preview
export const MOCK_MAILBOXES: Mailbox[] = [
  { id: '1', name: 'Inbox', role: 'inbox', color: '#3B82F6', total_messages: 14, unread_messages: 3 },
  { id: '2', name: 'Starred', role: 'starred', color: '#F59E0B', total_messages: 4, unread_messages: 0 },
  { id: '3', name: 'Sent', role: 'sent', color: '#10B981', total_messages: 28, unread_messages: 0 },
  { id: '4', name: 'Drafts', role: 'drafts', color: '#8B5CF6', total_messages: 2, unread_messages: 0 },
  { id: '5', name: 'Spam', role: 'spam', color: '#EF4444', total_messages: 1, unread_messages: 1 },
  { id: '6', name: 'Trash', role: 'trash', color: '#6B7280', total_messages: 8, unread_messages: 0 },
  { id: '7', name: 'Archive', role: 'archive', color: '#06B6D4', total_messages: 120, unread_messages: 0 },
];

export const MOCK_THREADS: Thread[] = [
  {
    id: 't-101',
    subject: 'Autonomous Cyber Defense Loops: PhD Proposal Review & Next Steps',
    snippet: 'Hi team, I reviewed the latest revision of the cyber defense architecture and have attached the annotated feedback...',
    last_message_at: '2026-08-30T19:45:00Z',
    message_count: 4,
    is_read: false,
    is_starred: true,
    has_attachments: true,
    ai_summary: 'Dr. Danquah requested confirmation on the reinforcement learning defense loop timing and attached the approved draft. Action required: schedule defense committee review.',
    ai_category: 'urgent',
    created_at: '2026-08-30T14:20:00Z'
  },
  {
    id: 't-102',
    subject: 'AxiomMail Infrastructure Deployment Status: Postfix & Dovecot LMTP',
    snippet: 'All Docker containers are healthy. Port 25/587 and Rspamd DKIM keys have been verified with 10/10 mail-tester score.',
    last_message_at: '2026-08-30T18:30:00Z',
    message_count: 2,
    is_read: false,
    is_starred: true,
    has_attachments: false,
    ai_summary: 'DevOps confirmed that all mail daemon containers, DKIM selectors, and PostgreSQL auth maps are operational.',
    ai_category: 'updates',
    created_at: '2026-08-30T16:00:00Z'
  },
  {
    id: 't-103',
    subject: 'Invoice #2026-894: Expedite Consults Cloud Architecture Audit',
    snippet: 'Please find attached the signed contract and invoice for the security audit completed on August 28th.',
    last_message_at: '2026-08-30T15:10:00Z',
    message_count: 1,
    is_read: true,
    is_starred: false,
    has_attachments: true,
    ai_summary: 'Billing notification from Finance regarding completed cloud security audit. Invoice PDF attached.',
    ai_category: 'primary',
    created_at: '2026-08-30T15:10:00Z'
  },
  {
    id: 't-104',
    subject: 'Weekly AI Research Sync: Transformers & Large Context RAG',
    snippet: 'Reminder: Our research sync is scheduled for Monday at 10:00 AM EST. Agenda includes long-context email indexers.',
    last_message_at: '2026-08-29T21:15:00Z',
    message_count: 3,
    is_read: true,
    is_starred: false,
    has_attachments: false,
    ai_summary: 'Agenda for Monday AI sync covering context window optimization and semantic search indexing.',
    ai_category: 'primary',
    created_at: '2026-08-29T10:00:00Z'
  }
];

export const MOCK_THREAD_DETAIL: ThreadDetail = {
  ...MOCK_THREADS[0],
  messages: [
    {
      id: 'm-1',
      thread_id: 't-101',
      message_id: '<msg-001@axiommail.com>',
      from_address: 'd.asiedu@expediteconsults.com',
      from_name: 'David Asiedu',
      to_addresses: ['committee@university.edu'],
      subject: 'Autonomous Cyber Defense Loops: PhD Proposal Review & Next Steps',
      body_plain: 'Dear Committee Members, please find attached my updated research proposal on Autonomous Cyber Defense Loops.',
      body_html: '<p>Dear Committee Members,<br/><br/>Please find attached my updated research proposal on <strong>Autonomous Cyber Defense Loops</strong>. I look forward to your valuable critique.</p>',
      snippet: 'Dear Committee Members, please find attached my updated research proposal...',
      is_read: true,
      is_starred: false,
      is_draft: false,
      has_attachments: true,
      received_at: '2026-08-30T14:20:00Z',
      attachments: [
        {
          id: 'att-1',
          filename: 'Autonomous_Cyber_Defense_Loops_Proposal.pdf',
          content_type: 'application/pdf',
          size_bytes: 2457600,
          s3_key: 'attachments/proposal.pdf',
          is_inline: false
        }
      ]
    },
    {
      id: 'm-2',
      thread_id: 't-101',
      message_id: '<msg-002@university.edu>',
      in_reply_to: '<msg-001@axiommail.com>',
      from_address: 'dr.danquah@university.edu',
      from_name: 'Dr. Danquah',
      to_addresses: ['d.asiedu@expediteconsults.com'],
      subject: 'Re: Autonomous Cyber Defense Loops: PhD Proposal Review & Next Steps',
      body_plain: 'Hi David, exceptional work on section 4 regarding multi-agent reinforcement learning. Please see my inline notes attached.',
      body_html: '<p>Hi David,<br/><br/>Exceptional work on <strong>Section 4</strong> regarding multi-agent reinforcement learning. The mitigation loop latency benchmarks look very solid.<br/><br/>Please review my inline notes and let me know your availability for the defense committee briefing on Thursday.</p>',
      snippet: 'Hi David, exceptional work on section 4 regarding multi-agent reinforcement learning...',
      is_read: false,
      is_starred: true,
      is_draft: false,
      has_attachments: true,
      received_at: '2026-08-30T19:45:00Z',
      attachments: [
        {
          id: 'att-2',
          filename: 'Annotated_Review_Notes_Danquah.docx',
          content_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          size_bytes: 512000,
          s3_key: 'attachments/notes.docx',
          is_inline: false
        }
      ]
    }
  ]
};
