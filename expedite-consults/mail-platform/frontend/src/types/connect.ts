export type AppModule = 
  | 'dispatch'      // Email (Formerly Outlook)
  | 'schedule'      // Calendar
  | 'nexus'         // Channels & Chat (Formerly Teams)
  | 'session'       // Video Meetings (Formerly Teams Meet)
  | 'forge'         // Low-code App Studio (Formerly Power Apps)
  | 'flow'          // Visual Automation Engine (Formerly Power Automate)
  | 'vault'         // Cloud File Storage (Formerly OneDrive)
  | 'directory'     // Personnel & Team Hierarchy (Formerly GAL)
  | 'intelligence'; // Cross-platform AI Copilot

export type PresenceStatus = 'available' | 'busy' | 'in_meeting' | 'away' | 'offline';

export interface UserPresence {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  title?: string;
  department?: string;
  status: PresenceStatus;
  statusText?: string;
}

export interface ScheduleEvent {
  id: string;
  title: string;
  description?: string;
  location?: string;
  session_id?: string;
  session_link?: string;
  start_time: string;
  end_time: string;
  is_all_day?: boolean;
  color?: string;
  attendees: Array<{
    name: string;
    email: string;
    status: 'accepted' | 'tentative' | 'declined';
  }>;
}

export interface SessionParticipant {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  isMuted: boolean;
  isVideoOff: boolean;
  isScreenSharing: boolean;
  isSpeaking: boolean;
  role: 'host' | 'presenter' | 'attendee';
}

export interface SessionDecision {
  id: string;
  text: string;
  agreed_by?: string;
}

export interface SessionActionItem {
  id: string;
  assignee: string;
  task: string;
  due_date?: string;
  is_done: boolean;
}

export interface SessionState {
  id: string; // 'AXM-492-831'
  title: string;
  isLive: boolean;
  startedAt: string;
  participants: SessionParticipant[];
  aiSummary?: string;
  decisions: SessionDecision[];
  actionItems: SessionActionItem[];
  chatMessages: Array<{
    id: string;
    senderName: string;
    text: string;
    timestamp: string;
  }>;
}

export interface NexusChannel {
  id: string;
  name: string;
  topic?: string;
  unreadCount?: number;
  isPrivate?: boolean;
}

export interface NexusMessage {
  id: string;
  sender: UserPresence;
  content: string;
  timestamp: string;
  reactions?: Record<string, number>;
  sessionCard?: {
    sessionId: string;
    title: string;
    time: string;
    link: string;
  };
  attachments?: Array<{
    filename: string;
    size: string;
    type: string;
  }>;
}

export interface VaultFile {
  id: string;
  name: string;
  type: 'pdf' | 'docx' | 'xlsx' | 'image' | 'zip' | 'code';
  size: string;
  updatedAt: string;
  owner: string;
  isStarred?: boolean;
}

// Axiom Forge (Low-Code Custom Apps)
export interface ForgeAppField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'date' | 'textarea' | 'user';
  options?: string[];
  required?: boolean;
}

export interface ForgeApp {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  color: string;
  fields: ForgeAppField[];
  recordsCount: number;
  lastUpdated: string;
}

// Axiom Flow (Visual Automated Pipelines)
export interface FlowStep {
  id: string;
  type: 'trigger' | 'condition' | 'action';
  title: string;
  description: string;
  app: 'dispatch' | 'nexus' | 'relay' | 'schedule' | 'vault' | 'intelligence';
  icon: string;
}

export interface AutomatedPipeline {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  triggerApp: string;
  actionSummary: string;
  totalRuns: number;
  lastRunStatus: 'success' | 'running' | 'failed';
  lastRunTime: string;
  steps: FlowStep[];
}
