'use client';

import React, { useState } from 'react';
import {
  Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Video,
  Clock, MapPin, Users, CheckCircle2, Sparkles, X, ArrowRight
} from 'lucide-react';
import { CalendarEvent } from '../types/connect';

interface CalendarViewProps {
  onJoinMeeting: (meetingId: string, title: string) => void;
}

export const MOCK_EVENTS: CalendarEvent[] = [
  {
    id: 'ev-1',
    title: 'Autonomous Cyber Defense Loops: PhD Proposal Defense Sync',
    description: 'Review RL loop latency benchmarks, committee feedback, and threat mitigation models.',
    meeting_id: 'AXM-492-831',
    meeting_link: 'https://meet.axiom.com/AXM-492-831',
    start_time: '2026-08-30T14:00:00Z',
    end_time: '2026-08-30T15:30:00Z',
    color: '#8B5CF6',
    attendees: [
      { name: 'Dr. Danquah', email: 'dr.danquah@university.edu', status: 'accepted' },
      { name: 'David Asiedu', email: 'd.asiedu@axiomconnect.com', status: 'accepted' },
      { name: 'Sarah Chen', email: 'sarah.c@cloudsecurity.io', status: 'accepted' },
    ]
  },
  {
    id: 'ev-2',
    title: 'Expedite Consults: Cloud Architecture & SIEM Audit',
    description: 'Quarterly zero-trust compliance and Postfix/Dovecot email infrastructure security review.',
    meeting_id: 'AXM-782-104',
    meeting_link: 'https://meet.axiom.com/AXM-782-104',
    start_time: '2026-08-31T10:00:00Z',
    end_time: '2026-08-31T11:00:00Z',
    color: '#3B82F6',
    attendees: [
      { name: 'David Asiedu', email: 'd.asiedu@axiomconnect.com', status: 'accepted' },
      { name: 'Mike Ross', email: 'm.ross@expediteconsults.com', status: 'accepted' },
    ]
  },
  {
    id: 'ev-3',
    title: 'Weekly SRE & Mail Delivery Infrastructure Standup',
    description: 'Reviewing Rspamd DKIM, SPF alignment, and DMARC quarantine reports across domains.',
    meeting_id: 'AXM-319-902',
    meeting_link: 'https://meet.axiom.com/AXM-319-902',
    start_time: '2026-09-01T15:00:00Z',
    end_time: '2026-09-01T15:45:00Z',
    color: '#10B981',
    attendees: [
      { name: 'David Asiedu', email: 'd.asiedu@axiomconnect.com', status: 'accepted' },
      { name: 'Alex Chen', email: 'alex@cloudsystems.io', status: 'accepted' },
    ]
  }
];

export const CalendarView: React.FC<CalendarViewProps> = ({ onJoinMeeting }) => {
  const [events, setEvents] = useState<CalendarEvent[]>(MOCK_EVENTS);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(MOCK_EVENTS[0]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState('2026-08-30');
  const [newTime, setNewTime] = useState('16:00');

  const handleCreateMeeting = () => {
    if (!newTitle) return;
    const meetingId = `AXM-${Math.floor(100 + Math.random() * 900)}-${Math.floor(100 + Math.random() * 900)}`;
    const newEv: CalendarEvent = {
      id: `ev-${Date.now()}`,
      title: newTitle,
      meeting_id: meetingId,
      meeting_link: `https://meet.axiom.com/${meetingId}`,
      start_time: `${newDate}T${newTime}:00Z`,
      end_time: `${newDate}T${newTime}:45:00Z`,
      color: '#3B82F6',
      attendees: [{ name: 'David Asiedu', email: 'd.asiedu@axiomconnect.com', status: 'accepted' }]
    };
    setEvents([...events, newEv]);
    setSelectedEvent(newEv);
    setIsCreateModalOpen(false);
    setNewTitle('');
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] overflow-hidden bg-white">
      {/* Top Calendar Toolbar */}
      <div className="h-12 bg-slate-50 border-b border-slate-200 px-4 flex items-center justify-between shrink-0 select-none">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>New Event</span>
          </button>

          <button
            onClick={() => onJoinMeeting('AXM-492-831', 'Instant Collaboration Meeting')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-100 hover:bg-purple-200 text-purple-900 text-xs font-bold border border-purple-200 transition"
          >
            <Video className="w-3.5 h-3.5 text-purple-700" />
            <span>Meet Now</span>
          </button>

          <div className="h-5 w-px bg-slate-300 mx-1" />

          <div className="flex items-center gap-1">
            <button className="p-1.5 text-slate-600 hover:bg-slate-200 rounded-md">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-slate-800 px-2">August — September 2026</span>
            <button className="p-1.5 text-slate-600 hover:bg-slate-200 rounded-md">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
            Work Week (Mon - Fri)
          </span>
        </div>
      </div>

      {/* Main Split Grid */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Interactive Calendar Week Grid */}
        <div className="flex-1 p-5 overflow-y-auto">
          <div className="grid grid-cols-5 gap-3 h-full min-h-[500px]">
            {['Mon, Aug 24', 'Tue, Aug 25', 'Wed, Aug 26', 'Thu, Aug 27', 'Fri, Aug 28'].map((day, idx) => (
              <div key={day} className="border border-slate-200 rounded-xl bg-slate-50/40 p-2.5 flex flex-col">
                <div className="text-xs font-bold text-slate-700 pb-2 border-b border-slate-200 mb-2">
                  {day}
                </div>
                <div className="flex-1 space-y-2">
                  {idx === 0 && (
                    <div
                      onClick={() => setSelectedEvent(events[0])}
                      className="p-2.5 rounded-lg bg-purple-500 text-white cursor-pointer shadow-sm hover:scale-[1.02] transition"
                    >
                      <div className="flex items-center justify-between text-[10px] font-bold mb-1 opacity-90">
                        <span>2:00 PM - 3:30 PM</span>
                        <Video className="w-3 h-3" />
                      </div>
                      <p className="text-xs font-bold leading-tight">Autonomous Cyber Defense Loops: PhD Proposal</p>
                      <span className="mt-1.5 inline-block text-[9px] bg-white/20 px-1.5 py-0.5 rounded font-mono">
                        AXM-492-831
                      </span>
                    </div>
                  )}

                  {idx === 1 && (
                    <div
                      onClick={() => setSelectedEvent(events[1])}
                      className="p-2.5 rounded-lg bg-blue-600 text-white cursor-pointer shadow-sm hover:scale-[1.02] transition"
                    >
                      <div className="flex items-center justify-between text-[10px] font-bold mb-1 opacity-90">
                        <span>10:00 AM - 11:00 AM</span>
                        <Video className="w-3 h-3" />
                      </div>
                      <p className="text-xs font-bold leading-tight">Expedite Consults Security Audit</p>
                    </div>
                  )}

                  {idx === 2 && (
                    <div
                      onClick={() => setSelectedEvent(events[2])}
                      className="p-2.5 rounded-lg bg-emerald-600 text-white cursor-pointer shadow-sm hover:scale-[1.02] transition"
                    >
                      <div className="flex items-center justify-between text-[10px] font-bold mb-1 opacity-90">
                        <span>3:00 PM - 3:45 PM</span>
                        <Video className="w-3 h-3" />
                      </div>
                      <p className="text-xs font-bold leading-tight">SRE Standup: Postfix & Rspamd</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Event Inspector & 1-Click Join Drawer */}
        <div className="w-96 bg-slate-50 border-l border-slate-200 p-5 shrink-0 flex flex-col justify-between overflow-y-auto">
          {selectedEvent ? (
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-100 px-2 py-0.5 rounded">
                  Axiom Teams Meeting
                </span>
                <h2 className="text-base font-bold text-slate-900 mt-2 leading-snug">
                  {selectedEvent.title}
                </h2>
              </div>

              {/* One-Click Video Launch Card */}
              {selectedEvent.meeting_id && (
                <div className="p-4 rounded-xl bg-purple-600 text-white shadow-md">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Video className="w-5 h-5" />
                      <span className="text-xs font-bold">Axiom Video Room</span>
                    </div>
                    <span className="text-[10px] font-mono bg-white/20 px-2 py-0.5 rounded font-bold">
                      {selectedEvent.meeting_id}
                    </span>
                  </div>
                  <p className="text-xs text-purple-100 mb-3">
                    Multi-party encrypted WebRTC room with live AI transcription & screen sharing.
                  </p>
                  <button
                    onClick={() => onJoinMeeting(selectedEvent.meeting_id!, selectedEvent.title)}
                    className="w-full py-2 bg-white hover:bg-purple-50 text-purple-900 rounded-lg text-xs font-bold shadow-sm transition flex items-center justify-center gap-2"
                  >
                    <Video className="w-4 h-4 text-purple-700" />
                    <span>Join Axiom Meeting Now</span>
                  </button>
                </div>
              )}

              <div className="space-y-2 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>2:00 PM – 3:30 PM EDT (90 mins)</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span>https://meet.axiom.com/{selectedEvent.meeting_id}</span>
                </div>
              </div>

              {/* Attendees List */}
              <div className="pt-3 border-t border-slate-200">
                <p className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" />
                  <span>Participants ({selectedEvent.attendees.length})</span>
                </p>
                <div className="space-y-2">
                  {selectedEvent.attendees.map((att) => (
                    <div key={att.email} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-300 text-slate-800 font-bold text-[10px] flex items-center justify-center">
                          {att.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{att.name}</p>
                          <p className="text-[10px] text-slate-400">{att.email}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                        {att.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Schedule Notes */}
              <div className="p-3 rounded-xl bg-violet-50 border border-violet-200 text-xs text-violet-900">
                <div className="flex items-center gap-1.5 font-bold mb-1 text-violet-950">
                  <Sparkles className="w-3.5 h-3.5 text-violet-600" />
                  <span>AI Scheduling Assistant</span>
                </div>
                <p className="text-[11px] text-violet-800">
                  All attendees confirmed availability without schedule conflicts.
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center text-xs text-slate-400 py-12">Select an event</div>
          )}
        </div>
      </div>

      {/* Create Event Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-[460px] p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-900">Schedule Axiom Meeting</span>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-600 block mb-1">Event Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Cyber Defense Loops Committee Briefing"
                  className="w-full p-2.5 border border-slate-300 rounded-xl outline-none focus:border-blue-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-600 block mb-1">Date</label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-600 block mb-1">Time</label>
                  <input
                    type="time"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-xl outline-none"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 flex items-center gap-2">
                <Video className="w-4 h-4 text-purple-700" />
                <span className="text-purple-900 font-medium text-[11px]">
                  Automatically generate unique Axiom Meet video room link
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateMeeting}
                className="px-4 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
              >
                Save & Invite
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
