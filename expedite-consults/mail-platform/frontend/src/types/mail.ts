export type MailboxRole = 'inbox' | 'starred' | 'sent' | 'drafts' | 'spam' | 'trash' | 'archive' | 'custom';
export type AICategory = 'primary' | 'updates' | 'promotions' | 'urgent';

export interface Attachment {
  id: string;
  filename: string;
  content_type: string;
  size_bytes: number;
  s3_key: string;
  is_inline: boolean;
}

export interface Message {
  id: string;
  thread_id: string;
  message_id: string;
  in_reply_to?: string;
  from_address: string;
  from_name?: string;
  to_addresses: string[];
  cc_addresses?: string[];
  bcc_addresses?: string[];
  subject: string;
  body_plain?: string;
  body_html?: string;
  snippet?: string;
  is_read: boolean;
  is_starred: boolean;
  is_draft: boolean;
  has_attachments: boolean;
  ai_summary?: string;
  sent_at?: string;
  received_at: string;
  attachments?: Attachment[];
}

export interface Thread {
  id: string;
  subject: string;
  snippet?: string;
  last_message_at: string;
  message_count: number;
  is_read: boolean;
  is_starred: boolean;
  has_attachments: boolean;
  ai_summary?: string;
  ai_category: AICategory;
  created_at: string;
}

export interface ThreadDetail extends Thread {
  messages: Message[];
}

export interface Mailbox {
  id: string;
  name: string;
  role: MailboxRole;
  color?: string;
  total_messages: number;
  unread_messages: number;
}
