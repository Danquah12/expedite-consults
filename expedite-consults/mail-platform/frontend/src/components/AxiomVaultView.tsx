'use client';

import React, { useState } from 'react';
import {
  HardDrive, Folder, FileText, Download, Share2, Star,
  Trash2, Plus, Search, ShieldCheck
} from 'lucide-react';
import { VaultFile } from '../types/connect';

const MOCK_FILES: VaultFile[] = [
  { id: 'f-1', name: 'Autonomous_Cyber_Defense_Loops_Proposal.pdf', type: 'pdf', size: '2.4 MB', updatedAt: 'Aug 30, 2026', owner: 'David Asiedu', isStarred: true },
  { id: 'f-2', name: 'CR_Process_Flow_ServiceNow_Exchange.docx', type: 'docx', size: '512 KB', updatedAt: 'Aug 29, 2026', owner: 'David Asiedu' },
  { id: 'f-3', name: 'Security_Audit_Report_2026_Final.pdf', type: 'pdf', size: '1.8 MB', updatedAt: 'Aug 28, 2026', owner: 'Sarah Chen' },
  { id: 'f-4', name: 'Mitigation_Loop_Traces_v2.pcap', type: 'code', size: '4.2 MB', updatedAt: 'Aug 30, 2026', owner: 'Dr. Danquah', isStarred: true },
];

export const AxiomVaultView: React.FC = () => {
  const [files, setFiles] = useState<VaultFile[]>(MOCK_FILES);
  const [search, setSearch] = useState('');

  const filtered = files.filter((f) => f.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] overflow-hidden bg-white">
      {/* Vault Header */}
      <div className="h-12 bg-slate-50 border-b border-slate-200 px-4 flex items-center justify-between shrink-0 select-none">
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition">
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Store File in Vault</span>
          </button>
          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Axiom Vault..."
              className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs outline-none"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span>Vault Utilization: <strong>2.4 GB</strong> / 10 GB</span>
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 p-6 overflow-y-auto">
        <h2 className="text-sm font-bold text-slate-900 mb-4">Axiom Vault — Zero-Trust Encrypted Storage</h2>

        <div className="grid grid-cols-4 gap-4">
          {filtered.map((file) => (
            <div
              key={file.id}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-md transition cursor-pointer flex flex-col justify-between h-40"
            >
              <div className="flex items-start justify-between">
                <div className="p-2.5 rounded-xl bg-blue-100 text-blue-700">
                  <FileText className="w-6 h-6" />
                </div>
                <button className="text-slate-400 hover:text-amber-500">
                  <Star className={`w-4 h-4 ${file.isStarred ? 'fill-amber-400 text-amber-500' : ''}`} />
                </button>
              </div>

              <div>
                <p className="text-xs font-bold text-slate-900 line-clamp-2">{file.name}</p>
                <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
                  <span>{file.size}</span>
                  <span>{file.updatedAt}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
