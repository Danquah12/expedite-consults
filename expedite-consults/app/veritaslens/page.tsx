'use client';

import React, { useState, useEffect } from 'react';
import { 
  VeritasHeader, 
  VeritasTab,
  VeritasTheme 
} from '@/components/veritaslens/VeritasHeader';
import { BlindspotDashboard } from '@/components/veritaslens/BlindspotDashboard';
import { KafkaPipelineSimulator } from '@/components/veritaslens/KafkaPipelineSimulator';
import { BERTClassifierStudio } from '@/components/veritaslens/BERTClassifierStudio';
import { LieDetectorStudio } from '@/components/veritaslens/LieDetectorStudio';
import { KnowledgeGraphViewer } from '@/components/veritaslens/KnowledgeGraphViewer';
import { TVScorecardStudio } from '@/components/veritaslens/TVScorecardStudio';
import { InvestigationWorkspace } from '@/components/veritaslens/InvestigationWorkspace';
import { BrandSafetyPortal } from '@/components/veritaslens/BrandSafetyPortal';
import { PublicReportGenerator } from '@/components/veritaslens/PublicReportGenerator';
import { PythonCliViewer } from '@/components/veritaslens/PythonCliViewer';
import { MobileAlertModal } from '@/components/veritaslens/MobileAlertModal';
import { HotTopicsRadar } from '@/components/veritaslens/HotTopicsRadar';
import { VeritasErrorBoundary } from '@/components/veritaslens/VeritasErrorBoundary';

import { 
  INITIAL_MEDIA_OUTLETS, 
  INITIAL_NEWS_CLUSTERS, 
  INITIAL_CLAIMS, 
  INITIAL_KAFKA_STREAM, 
  INITIAL_DLQ_RECORDS, 
  INITIAL_TV_SCORECARDS, 
  INITIAL_SPIN_CASES, 
  INITIAL_MODEL_METRICS, 
  INITIAL_GRAPH_NODES, 
  INITIAL_GRAPH_EDGES 
} from '@/lib/veritaslens/data';
import { NewsCluster } from '@/lib/veritaslens/types';

export default function VeritasLensPage() {
  const [activeTab, setActiveTab] = useState<VeritasTab>('lie-detector');
  const [clusters, setClusters] = useState(INITIAL_NEWS_CLUSTERS);
  const [outlets, setOutlets] = useState(INITIAL_MEDIA_OUTLETS);
  const [claims, setClaims] = useState(INITIAL_CLAIMS);
  const [kafkaMessages, setKafkaMessages] = useState(INITIAL_KAFKA_STREAM);
  const [dlqRecords, setDlqRecords] = useState(INITIAL_DLQ_RECORDS);
  const [tvScorecards, setTvScorecards] = useState(INITIAL_TV_SCORECARDS);
  const [spinCases, setSpinCases] = useState(INITIAL_SPIN_CASES);
  const [modelMetrics, setModelMetrics] = useState(INITIAL_MODEL_METRICS);
  const [graphNodes, setGraphNodes] = useState(INITIAL_GRAPH_NODES);
  const [graphEdges, setGraphEdges] = useState(INITIAL_GRAPH_EDGES);

  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncSuccessMsg, setSyncSuccessMsg] = useState<string | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const [isMobileAlertOpen, setIsMobileAlertOpen] = useState<boolean>(false);
  const [theme, setTheme] = useState<VeritasTheme>('navy');

  useEffect(() => {
    setLastSyncedAt(new Date());
    try {
      const savedTheme = localStorage.getItem('veritaslens_theme') as VeritasTheme;
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
      localStorage.setItem('veritaslens_theme', newTheme);
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
      const res = await fetch('/api/veritaslens/sync');
      const data = await res.json();
      if (data.clusters && data.clusters.length > 0) {
        setClusters([...data.clusters, ...INITIAL_NEWS_CLUSTERS]);
        if (data.kafkaMessages && data.kafkaMessages.length > 0) {
          setKafkaMessages(prev => [...data.kafkaMessages, ...prev].slice(0, 50));
        }
        if (data.claims && data.claims.length > 0) {
          setClaims(prev => [...data.claims, ...prev].slice(0, 40));
        }
        if (data.graphNodes && data.graphNodes.length > 0) {
          setGraphNodes(prev => [...data.graphNodes, ...prev]);
        }
        if (data.graphEdges && data.graphEdges.length > 0) {
          setGraphEdges(prev => [...data.graphEdges, ...prev]);
        }
        setLastSyncedAt(new Date(data.timestamp || new Date()));
        setSyncSuccessMsg(`✅ Synced ${data.totalArticlesIngested} live articles from 14 newsrooms across all tabs!`);
        setTimeout(() => setSyncSuccessMsg(null), 6000);
      } else {
        setLastSyncedAt(new Date());
      }
    } catch (err) {
      console.error('Failed to sync live news feeds:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  // Continuous background auto-refresh every 30 minutes across all tabs
  useEffect(() => {
    handleSyncLiveData();
    const interval = setInterval(() => {
      handleSyncLiveData();
    }, 30 * 60 * 1000); // Poll every 30 minutes
    return () => clearInterval(interval);
  }, []);

  const handleDlqResolved = (resolvedId: string) => {
    setDlqRecords(prev => prev.map(d => d.id === resolvedId ? { ...d, resolved: true, replayedAt: new Date().toISOString() } : d));
  };

  const handleSelectClusterForInvestigation = (cluster: NewsCluster) => {
    setActiveTab('investigations');
  };

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-500 relative overflow-hidden ${themeStyle.wrapper}`}>
      {/* Dynamic Ambient Background Meshes */}
      <div className={`absolute top-0 right-1/4 w-[600px] h-[600px] rounded-full blur-[140px] pointer-events-none transition-all duration-700 ${themeStyle.glow1}`} />
      <div className={`absolute bottom-1/3 left-10 w-[500px] h-[500px] rounded-full blur-[140px] pointer-events-none transition-all duration-700 ${themeStyle.glow2}`} />

      {/* Top Header & Status Bar */}
      <VeritasHeader 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        dlqCount={activeDlqCount}
        activeLearningCount={activeLearningCount}
        lastSyncedAt={lastSyncedAt}
        onOpenMobileAlert={() => setIsMobileAlertOpen(true)}
        currentTheme={theme}
        onThemeChange={handleThemeChange}
      />

      {/* Main Content Body */}
      <main className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full space-y-6">
        <VeritasErrorBoundary fallbackTabName={activeTab} onReset={() => setActiveTab('lie-detector')}>
          {activeTab === 'hot-topics' && (
            <HotTopicsRadar
              clusters={clusters}
              outlets={outlets}
              onSelectClusterForInvestigation={handleSelectClusterForInvestigation}
            />
          )}

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

          {activeTab === 'pipeline' && (
            <KafkaPipelineSimulator
              initialMessages={kafkaMessages}
              initialDlq={dlqRecords}
              onDlqResolved={handleDlqResolved}
            />
          )}

          {activeTab === 'classifier' && (
            <BERTClassifierStudio
              initialClaims={claims}
              modelMetrics={modelMetrics}
            />
          )}

          {activeTab === 'lie-detector' && (
            <LieDetectorStudio />
          )}

          {activeTab === 'graph' && (
            <KnowledgeGraphViewer
              nodes={graphNodes}
              edges={graphEdges}
              claims={claims}
            />
          )}

          {activeTab === 'tv-scorecard' && (
            <TVScorecardStudio
              scorecards={tvScorecards}
              spinCases={spinCases}
            />
          )}

          {activeTab === 'investigations' && (
            <InvestigationWorkspace
              claims={claims}
              clusters={clusters}
            />
          )}

          {activeTab === 'brand-safety' && (
            <BrandSafetyPortal
              outlets={outlets}
            />
          )}

          {activeTab === 'public-report' && (
            <PublicReportGenerator
              clusters={clusters}
              scorecards={tvScorecards}
              spinCases={spinCases}
            />
          )}

          {activeTab === 'python-cli' && (
            <PythonCliViewer />
          )}
        </VeritasErrorBoundary>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-900/60 py-4 px-6 text-xs text-slate-400 font-mono flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="font-bold text-white">VERITASLENS PLATFORM</span>
          <span>• Bloomberg Terminal + Ground News + Knowledge Graph + AI Copilot</span>
        </div>
        <div className="flex items-center gap-4 text-slate-500">
          <span>Ad Fontes / AllSides / MBFC Unified Standard</span>
          <span>Apache Kafka Event Bus</span>
          <span>Neo4j OpenLineage</span>
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
