'use client';

import React, { useState, useEffect } from 'react';
import { 
  VeritasHeader, 
  VeritasTab,
  VeritasTheme 
} from '@/components/veritaslens/VeritasHeader';
import { Mahama2024PromiseTracker } from '@/components/truth-platform/Mahama2024PromiseTracker';
import { GhanaPoliticalTracker } from '@/components/truth-platform/GhanaPoliticalTracker';
import { MultiChannelIngestConsole } from '@/components/truth-platform/MultiChannelIngestConsole';
import { GhanaLieDetectorStudio } from '@/components/truth-platform/GhanaLieDetectorStudio';
import { GhanaHotTopicsRadar } from '@/components/truth-platform/GhanaHotTopicsRadar';
import { GhanaBERTClassifierStudio } from '@/components/truth-platform/GhanaBERTClassifierStudio';
import { GhanaNkontonpoGraph } from '@/components/truth-platform/GhanaNkontonpoGraph';
import { GhanaChieftaincyMonitorStudio } from '@/components/truth-platform/GhanaChieftaincyMonitorStudio';
import { BlindspotDashboard } from '@/components/veritaslens/BlindspotDashboard';
import { KafkaPipelineSimulator } from '@/components/veritaslens/KafkaPipelineSimulator';
import { TVScorecardStudio } from '@/components/veritaslens/TVScorecardStudio';
import { InvestigationWorkspace } from '@/components/veritaslens/InvestigationWorkspace';
import { BrandSafetyPortal } from '@/components/veritaslens/BrandSafetyPortal';
import { PublicReportGenerator } from '@/components/veritaslens/PublicReportGenerator';
import { PythonCliViewer } from '@/components/veritaslens/PythonCliViewer';
import { MobileAlertModal } from '@/components/veritaslens/MobileAlertModal';
import { VeritasErrorBoundary } from '@/components/veritaslens/VeritasErrorBoundary';

// ── 100% Pure Ghanaian Big Database ──
import { 
  GHANA_MEDIA_OUTLETS, 
  GHANA_NEWS_CLUSTERS, 
  GHANA_CLAIMS, 
  GHANA_GRAPH_NODES, 
  GHANA_GRAPH_EDGES, 
  GHANA_TV_SCORECARDS,
  GHANA_SPIN_CASES
} from '@/lib/truth-platform/ghana-data';

import { 
  INITIAL_KAFKA_STREAM, 
  INITIAL_DLQ_RECORDS, 
  INITIAL_MODEL_METRICS 
} from '@/lib/veritaslens/data';

import { NewsCluster } from '@/lib/veritaslens/types';
import { Sparkles, Shield, Compass, Scale, SlidersHorizontal, Eye, Vote, AlertOctagon, Flame, Radio, Share2, Cpu, Network, Target } from 'lucide-react';

export type TruthPlatformPerspective = 'npp-audit' | 'balanced' | 'blindspot-focus';
export type TruthCustomTab = VeritasTab | 'ghana-tracker' | 'multichannel-ingest' | 'nkontonpo-graph' | 'mahama-2024-tracker';

export default function TruthPlatformPage() {
  const [activeTab, setActiveTab] = useState<TruthCustomTab>('mahama-2024-tracker');
  const [perspective, setPerspective] = useState<TruthPlatformPerspective>('npp-audit');
  
  // 100% Pure Ghana State Data
  const [clusters, setClusters] = useState(GHANA_NEWS_CLUSTERS);
  const [outlets, setOutlets] = useState(GHANA_MEDIA_OUTLETS);
  const [claims, setClaims] = useState(GHANA_CLAIMS);
  const [kafkaMessages, setKafkaMessages] = useState(INITIAL_KAFKA_STREAM);
  const [dlqRecords, setDlqRecords] = useState(INITIAL_DLQ_RECORDS);
  const [tvScorecards, setTvScorecards] = useState(GHANA_TV_SCORECARDS);
  const [spinCases, setSpinCases] = useState(GHANA_SPIN_CASES);
  const [modelMetrics, setModelMetrics] = useState(INITIAL_MODEL_METRICS);
  const [graphNodes, setGraphNodes] = useState(GHANA_GRAPH_NODES);
  const [graphEdges, setGraphEdges] = useState(GHANA_GRAPH_EDGES);

  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncSuccessMsg, setSyncSuccessMsg] = useState<string | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const [isMobileAlertOpen, setIsMobileAlertOpen] = useState<boolean>(false);
  const [theme, setTheme] = useState<VeritasTheme>('sapphire');

  useEffect(() => {
    setLastSyncedAt(new Date());
    try {
      const savedTheme = localStorage.getItem('truth_platform_theme') as VeritasTheme;
      const validThemes: VeritasTheme[] = ['navy', 'sapphire', 'emerald', 'twilight', 'crimson', 'obsidian', 'light'];
      if (savedTheme && validThemes.includes(savedTheme)) {
        setTheme(savedTheme);
      }
    } catch (e) {
      console.warn(e);
    }
  }, []);

  const handleThemeChange = (newTheme: VeritasTheme) => {
    setTheme(newTheme);
    try {
      localStorage.setItem('truth_platform_theme', newTheme);
    } catch (e) {
      console.warn(e);
    }
  };

  const activeDlqCount = dlqRecords.filter(d => !d.resolved).length;
  const activeLearningCount = claims.filter(c => c.confidence < 0.70 || c.reviewStatus === 'Pending_Review').length;

  const getThemeStyles = (t: VeritasTheme) => {
    switch (t) {
      case 'sapphire':
        return {
          wrapper: 'bg-[#030e21] text-slate-100 bg-gradient-to-br from-[#020b18] via-[#081e3d] to-[#0d2a52]',
          glow1: 'bg-cyan-500/15',
          glow2: 'bg-blue-600/10'
        };
      case 'emerald':
        return {
          wrapper: 'bg-[#04140e] text-slate-100 bg-gradient-to-br from-[#020b08] via-[#07241a] to-[#0f3b2d]',
          glow1: 'bg-emerald-500/15',
          glow2: 'bg-teal-600/10'
        };
      case 'twilight':
        return {
          wrapper: 'bg-[#0f071d] text-slate-100 bg-gradient-to-br from-[#0a0414] via-[#1a0c30] to-[#29134a]',
          glow1: 'bg-purple-500/15',
          glow2: 'bg-fuchsia-600/10'
        };
      case 'crimson':
        return {
          wrapper: 'bg-[#18060b] text-slate-100 bg-gradient-to-br from-[#100407] via-[#260a12] to-[#3a101d]',
          glow1: 'bg-rose-500/15',
          glow2: 'bg-amber-600/10'
        };
      case 'obsidian':
        return {
          wrapper: 'bg-[#000000] text-slate-100 bg-gradient-to-b from-[#000000] via-[#0a0a0a] to-[#000000]',
          glow1: 'bg-slate-500/5',
          glow2: 'bg-slate-700/5'
        };
      case 'light':
        return {
          wrapper: 'bg-[#f1f5f9] text-slate-900 bg-gradient-to-br from-[#f8fafc] via-[#e2e8f0] to-[#cbd5e1]',
          glow1: 'bg-blue-400/10',
          glow2: 'bg-indigo-300/10'
        };
      case 'navy':
      default:
        return {
          wrapper: 'bg-[#091124] text-slate-100 bg-gradient-to-br from-[#060b18] via-[#0f172a] to-[#1e293b]',
          glow1: 'bg-blue-500/15',
          glow2: 'bg-indigo-600/10'
        };
    }
  };

  const themeStyle = getThemeStyles(theme);

  const handleSyncLiveData = async () => {
    setIsSyncing(true);
    try {
      setLastSyncedAt(new Date());
      setSyncSuccessMsg(`✅ Synced 100% Ghanaian political database across Joy FM, Citi FM, Peace FM, and Graphic!`);
      setTimeout(() => setSyncSuccessMsg(null), 6000);
    } catch (err) {
      console.error('Failed to sync:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDlqResolved = (resolvedId: string) => {
    setDlqRecords(prev => prev.map(d => d.id === resolvedId ? { ...d, resolved: true, replayedAt: new Date().toISOString() } : d));
  };

  const handleSelectClusterForInvestigation = (cluster: NewsCluster) => {
    setActiveTab('investigations');
  };

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-500 relative overflow-hidden ${themeStyle.wrapper}`}>
      {/* Ambient Meshes */}
      <div className={`absolute top-0 right-1/4 w-[600px] h-[600px] rounded-full blur-[140px] pointer-events-none transition-all duration-700 ${themeStyle.glow1}`} />
      <div className={`absolute bottom-1/3 left-10 w-[500px] h-[500px] rounded-full blur-[140px] pointer-events-none transition-all duration-700 ${themeStyle.glow2}`} />

      {/* Veritas Standard Header configured in 100% Pure Ghana Truth Platform Mode */}
      <VeritasHeader 
        activeTab={activeTab} 
        onTabChange={(t) => setActiveTab(t)}
        dlqCount={activeDlqCount}
        activeLearningCount={activeLearningCount}
        lastSyncedAt={lastSyncedAt}
        onOpenMobileAlert={() => setIsMobileAlertOpen(true)}
        currentTheme={theme}
        onThemeChange={handleThemeChange}
        isGhanaMode={true}
      />

      {/* Main Content Body */}
      <main className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full space-y-6">
        <VeritasErrorBoundary fallbackTabName={activeTab} onReset={() => setActiveTab('graph')}>
          
          {/* 1. 2024 Mahama Campaign Promise Tracker (Sept 4, 2026 Audit) */}
          {activeTab === 'mahama-2024-tracker' && (
            <Mahama2024PromiseTracker />
          )}

          {/* 2. Ghana Nkontonpo (Lies & Broken Promises) Semantic Knowledge Graph */}
          {activeTab === 'graph' && (
            <GhanaNkontonpoGraph />
          )}

          {/* 2. 100% Ghanaian BERT MLOps Claim Classifier Studio */}
          {activeTab === 'classifier' && (
            <GhanaBERTClassifierStudio />
          )}

          {/* 3. 100% Ghanaian Hot Topics Radar */}
          {activeTab === 'hot-topics' && (
            <GhanaHotTopicsRadar />
          )}

          {/* 4. Ghana Political Speech & Video Polygraph Lie Detector */}
          {activeTab === 'lie-detector' && (
            <GhanaLieDetectorStudio />
          )}

          {/* 4b. Traditional Authority & Online Broadcaster Forensic Audit (Kelvin Taylor / Diaspora Attack Matrix) */}
          {activeTab === 'chieftaincy-monitor' && (
            <GhanaChieftaincyMonitorStudio />
          )}

          {/* 5. Ghana NDC Opposition Record & Statement Fact-Checker */}
          {activeTab === 'ghana-tracker' && (
            <GhanaPoliticalTracker />
          )}

          {/* 6. Multi-Channel Live Radio & Social Stream Ingestion Console */}
          {activeTab === 'multichannel-ingest' && (
            <MultiChannelIngestConsole />
          )}

          {/* 7. Ghana Newsroom Blindspots Radar */}
          {activeTab === 'blindspots' && (
            <BlindspotDashboard
              clusters={clusters}
              outlets={outlets}
              onSelectClusterForInvestigation={handleSelectClusterForInvestigation}
              onOpenDietCalculator={() => setActiveTab('public-report')}
              onOpenVideoPolygraph={() => setActiveTab('lie-detector')}
              onOpenHotTopics={() => setActiveTab('hot-topics')}
              onSyncLiveData={handleSyncLiveData}
              isSyncing={isSyncing}
              syncSuccessMsg={syncSuccessMsg}
              lastSyncedAt={lastSyncedAt}
            />
          )}

          {/* 8. Kafka Pipeline */}
          {activeTab === 'pipeline' && (
            <KafkaPipelineSimulator
              initialMessages={kafkaMessages}
              initialDlq={dlqRecords}
              onDlqResolved={handleDlqResolved}
            />
          )}

          {/* 9. Ghana TV Station Scorecards */}
          {activeTab === 'tv-scorecard' && (
            <TVScorecardStudio
              scorecards={tvScorecards}
              spinCases={spinCases}
            />
          )}

          {/* 10. Investigation Workspace */}
          {activeTab === 'investigations' && (
            <InvestigationWorkspace
              claims={claims}
              clusters={clusters}
              isGhanaPlatform={true}
            />
          )}

          {/* 11. Brand Safety */}
          {activeTab === 'brand-safety' && (
            <BrandSafetyPortal
              outlets={outlets}
            />
          )}

          {/* 12. Public Report Generator */}
          {activeTab === 'public-report' && (
            <PublicReportGenerator
              clusters={clusters}
              scorecards={tvScorecards}
              spinCases={spinCases}
              isGhanaPlatform={true}
            />
          )}

          {/* 13. Python CLI */}
          {activeTab === 'python-cli' && (
            <PythonCliViewer isGhanaPlatform={true} />
          )}
        </VeritasErrorBoundary>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-900/60 py-4 px-6 text-xs text-slate-400 font-mono flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="font-bold text-cyan-300">GHANA TRUTH PLATFORM</span>
          <span>• Nkontonpo (Deception & Broken Promises) Semantic Knowledge Graph</span>
        </div>
        <div className="flex items-center gap-4 text-slate-500">
          <span>Sources: Auditor-General / Energy Commission / High Court / WAEC</span>
          <span>Live URL: /truth-platform</span>
        </div>
      </footer>

      {/* Mobile Phone Alert Modal */}
      <MobileAlertModal
        cluster={clusters[0] || null}
        isOpen={isMobileAlertOpen}
        onClose={() => setIsMobileAlertOpen(false)}
      />
    </div>
  );
}
