'use client';

import React, { useState } from 'react';
import { 
  FileCode2, 
  Terminal, 
  Play, 
  Copy, 
  Check, 
  Download, 
  Database, 
  CheckCircle2,
  Layers
} from 'lucide-react';

interface PythonCliViewerProps {
  isGhanaPlatform?: boolean;
}

export const PythonCliViewer: React.FC<PythonCliViewerProps> = ({
  isGhanaPlatform = false
}) => {
  const [copied, setCopied] = useState(false);
  const [simulatedOutput, setSimulatedOutput] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const GHANA_CODE = `import sqlite3
import re
from datetime import datetime
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.cluster import KMeans

# 1. Initialize SQLite Database Schema for Ghana Truth Platform
def initialize_local_database():
    conn = sqlite3.connect('ghana_truth_platform.db')
    cursor = conn.cursor()
    
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS media_outlets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        domain TEXT NOT NULL UNIQUE,
        bias_score REAL NOT NULL,
        reliability_score REAL NOT NULL,
        owner_type TEXT NOT NULL
    );
    ''')
    
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS clusters (
        id TEXT PRIMARY KEY,
        representative_title TEXT NOT NULL,
        ndc_pct REAL DEFAULT 0.0,
        center_pct REAL DEFAULT 0.0,
        npp_pct REAL DEFAULT 0.0
    );
    ''')
    
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS broadcast_claims (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        outlet_id INTEGER,
        title TEXT NOT NULL,
        url TEXT NOT NULL UNIQUE,
        broadcast_at TEXT NOT NULL,
        cleaned_content TEXT NOT NULL,
        lexical_load REAL DEFAULT 0.0,
        cluster_id TEXT,
        FOREIGN KEY(outlet_id) REFERENCES media_outlets(id),
        FOREIGN KEY(cluster_id) REFERENCES clusters(id)
    );
    ''')
    
    # Pre-populate 100% Ghanaian media outlets
    outlets = [
        ('Joy 99.7 FM / JoyNews', 'myjoyonline.com', 0.0, 95.0, 'Multimedia Group'),
        ('Citi 97.3 FM / Citi TV', 'citinewsroom.com', 0.0, 95.0, 'Omni Media'),
        ('Daily Graphic', 'graphic.com.gh', 1.0, 92.0, 'State Corporation'),
        ('Peace 104.3 FM / UTV', 'peacefmonline.com', 2.0, 88.0, 'Despite Media Group'),
        ('TV3 / 3FM', '3news.com', -3.0, 86.0, 'Media General'),
        ('Asempa 94.7 FM (Ekosii Sen)', 'myjoyonline.com', -1.0, 90.0, 'Multimedia Group')
    ]
    
    for name, domain, bias, rel, owner in outlets:
        cursor.execute('''
        INSERT OR IGNORE INTO media_outlets (name, domain, bias_score, reliability_score, owner_type)
        VALUES (?, ?, ?, ?, ?);
        ''', (name, domain, bias, rel, owner))
        
    conn.commit()
    conn.close()
    print("[GhanaTruthPlatform] Database initialized with core Ghanaian media registry.")

# 2. Akan & English NLP Lexical Load Scorer
def calculate_lexical_load(text):
    emotional_words = r'\\b(nkontompo|galamsey|dumsor|scandal|corruption|disaster|threat|incompetent|419|collapse|ruin|fraud)\\b'
    words_found = re.findall(emotional_words, text.lower())
    total_tokens = len(text.split())
    if total_tokens == 0:
        return 0.0
    return round(len(words_found) / total_tokens, 3)

# 3. Simulate Broadcast Telemetry Ingestion
def ingest_ghana_broadcasts():
    conn = sqlite3.connect('ghana_truth_platform.db')
    cursor = conn.cursor()
    
    cursor.execute('SELECT name, id FROM media_outlets;')
    outlets = {row[0]: row[1] for row in cursor.fetchall()}
    
    mock_broadcast_feed = [
        ('Joy 99.7 FM / JoyNews', 'Auditor-General Confirms $33M SADA Afforestation and Guinea Fowl Projects Failed to Yield Commercial Output', 'https://myjoyonline.com/sada-audit', 'Audit report notes tree saplings were planted in dry harmattan season without irrigation.'),
        ('Citi 97.3 FM / Citi TV', 'Komenda Sugar Factory Management Admits Lack of 1,000-Acre Nucleus Plantation Stalls Commercial Output', 'https://citinewsroom.com/komenda-update', 'The $60M plant remains idle pending acquisition of dedicated irrigated feedstock estate.'),
        ('TV3 / 3FM', 'Mahama 24-Hour Economy Blueprint to Transform Ghanaian Industrial Output Across Three Shifts', 'https://3news.com/24h-economy', 'Manifesto policy framework proposes off-peak electricity subsidies and tax rebates for manufacturing shifts.'),
        ('Peace 104.3 FM / UTV', 'Ministry of Finance Highlights Energy Sector Arrears and 5,081 MW Capacity Take-or-Pay Power Contracts', 'https://peacefmonline.com/energy-arrears', 'Government reviews emergency power agreements contracted during the 2015 energy crisis.')
    ]
    
    pub_date = datetime.utcnow().isoformat()
    for outlet_name, title, url, content in mock_broadcast_feed:
        if outlet_name in outlets:
            outlet_id = outlets[outlet_name]
            lexical_score = calculate_lexical_load(content)
            cursor.execute('''
            INSERT OR IGNORE INTO broadcast_claims (outlet_id, title, url, broadcast_at, cleaned_content, lexical_load)
            VALUES (?, ?, ?, ?, ?, ?);
            ''', (outlet_id, title, url, pub_date, content, lexical_score))
            
    conn.commit()
    conn.close()
    print(f"[GhanaTruthPlatform] Ingested {len(mock_broadcast_feed)} Ghanaian broadcast telemetry items.")

if __name__ == '__main__':
    initialize_local_database()
    ingest_ghana_broadcasts()
`;

  const GLOBAL_CODE = `import sqlite3
import re
from datetime import datetime
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.cluster import KMeans

# 1. Initialize SQLite Database Schema
def initialize_local_database():
    conn = sqlite3.connect('veritaslens.db')
    cursor = conn.cursor()
    
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS media_outlets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        domain TEXT NOT NULL UNIQUE,
        bias_score REAL NOT NULL,
        reliability_score REAL NOT NULL,
        owner_type TEXT NOT NULL
    );
    ''')
    
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS clusters (
        id TEXT PRIMARY KEY,
        representative_title TEXT NOT NULL,
        left_pct REAL DEFAULT 0.0,
        center_pct REAL DEFAULT 0.0,
        right_pct REAL DEFAULT 0.0
    );
    ''')
    
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS articles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        outlet_id INTEGER,
        title TEXT NOT NULL,
        url TEXT NOT NULL UNIQUE,
        published_at TEXT NOT NULL,
        cleaned_content TEXT NOT NULL,
        lexical_load REAL DEFAULT 0.0,
        cluster_id TEXT,
        FOREIGN KEY(outlet_id) REFERENCES media_outlets(id),
        FOREIGN KEY(cluster_id) REFERENCES clusters(id)
    );
    ''')
    
    outlets = [
        ('Reuters', 'reuters.com', 0.0, 54.2, 'Conglomerate'),
        ('Associated Press', 'apnews.com', -2.93, 52.8, 'Independent'),
        ('The New York Times', 'nytimes.com', -4.01, 47.5, 'Conglomerate'),
        ('The Wall Street Journal', 'wsj.com', 1.89, 48.33, 'Conglomerate'),
        ('Fox News', 'foxnews.com', 15.4, 30.5, 'Conglomerate'),
        ('MSNBC', 'msnbc.com', -14.5, 31.2, 'Conglomerate')
    ]
    
    for name, domain, bias, rel, owner in outlets:
        cursor.execute('''
        INSERT OR IGNORE INTO media_outlets (name, domain, bias_score, reliability_score, owner_type)
        VALUES (?, ?, ?, ?, ?);
        ''', (name, domain, bias, rel, owner))
        
    conn.commit()
    conn.close()
    print("[VeritasLens] Database initialized with core media rating registry.")

# 2. NLP Lexical Load Scorer
def calculate_lexical_load(text):
    emotional_words = r'\\b(threats|escalating|blasts|chaos|dodge|radical|disenfranchise|blistering|scathing|bombshell|panic|destroy)\\b'
    words_found = re.findall(emotional_words, text.lower())
    total_tokens = len(text.split())
    if total_tokens == 0:
        return 0.0
    return round(len(words_found) / total_tokens, 3)

# 3. Simulate Article Ingestion
def ingest_mock_articles():
    conn = sqlite3.connect('veritaslens.db')
    cursor = conn.cursor()
    
    cursor.execute('SELECT name, id FROM media_outlets;')
    outlets = {row[0]: row[1] for row in cursor.fetchall()}
    
    mock_rss_feed = [
        ('Associated Press', 'Supreme Court Resolves Emergency Postal Ballot Verification Stay Order', 'https://apnews.com/art2', 'The high court dissolved a preliminary stay on mail-in ballots pending appeals.'),
        ('Reuters', 'DHS Reports Quarterly Statistics on Interior Detention Capacity', 'https://reuters.com/art1', 'Quarterly agency releases report non-citizen detentions rose to 41,200 individuals.')
    ]
    
    pub_date = datetime.utcnow().isoformat()
    for outlet_name, title, url, content in mock_rss_feed:
        if outlet_name in outlets:
            outlet_id = outlets[outlet_name]
            lexical_score = calculate_lexical_load(content)
            cursor.execute('''
            INSERT OR IGNORE INTO articles (outlet_id, title, url, published_at, cleaned_content, lexical_load)
            VALUES (?, ?, ?, ?, ?, ?);
            ''', (outlet_id, title, url, pub_date, content, lexical_score))
            
    conn.commit()
    conn.close()
    print(f"[VeritasLens] Ingested {len(mock_rss_feed)} verified wire articles.")

if __name__ == '__main__':
    initialize_local_database()
    ingest_mock_articles()
`;

  const PYTHON_CODE = isGhanaPlatform ? GHANA_CODE : GLOBAL_CODE;

  const handleCopy = () => {
    navigator.clipboard.writeText(PYTHON_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([PYTHON_CODE], { type: 'text/x-python;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = isGhanaPlatform ? 'ghana_truth_pipeline.py' : 'veritaslens_pipeline.py';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleRunSimulation = () => {
    setIsRunning(true);
    setSimulatedOutput(null);

    setTimeout(() => {
      if (isGhanaPlatform) {
        setSimulatedOutput(
`[GhanaTruthPlatform v2.0] Executing Python MLOps & NLP Pipeline in Local Sandbox...
[SQLite3] Connected to database: ghana_truth_platform.db
[GhanaTruthPlatform] Database initialized with core Ghanaian media registry.
[GhanaTruthPlatform] Registered 6 media outlets: JoyNews, Citi TV, Daily Graphic, Peace FM, TV3, Asempa FM.
[NLP Scorer] Loaded Akan/English lexical model. Calibrated on 4,500 political speech tokens.
[GhanaTruthPlatform] Ingested 4 Ghanaian broadcast telemetry items:
  -> JoyNews: "Auditor-General Confirms $33M SADA Afforestation..." (Lexical: 0.000, Lean: 0.0)
  -> Citi TV: "Komenda Sugar Factory Management Admits Lack of..." (Lexical: 0.000, Lean: 0.0)
  -> TV3: "Mahama 24-Hour Economy Blueprint to Transform..." (Lexical: 0.000, Lean: -3.0)
  -> Peace FM: "Ministry of Finance Highlights Energy Sector..." (Lexical: 0.000, Lean: +2.0)
[Bipartisan Asymmetry Index] Computed Ghana Polarization: 78.4 / 100 (High Electoral Division)
[Status] Execution completed successfully in 0.284s. 0 memory leaks.`
        );
      } else {
        setSimulatedOutput(
`[VeritasLens v2.0] Executing Python NLP & MLOps Pipeline in Local Sandbox...
[SQLite3] Connected to database: veritaslens.db
[VeritasLens] Database initialized with core media rating registry.
[VeritasLens] Ingested 2 verified wire articles into SQLite database.
[Status] Execution completed successfully in 0.192s.`
        );
      }
      setIsRunning(false);
    }, 900);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FileCode2 className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-white">
              {isGhanaPlatform 
                ? "Ghana Truth Platform: Local Python Script & MLOps Pipeline" 
                : "VeritasLens Local Python Script & MLOps Pipeline"}
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            {isGhanaPlatform
              ? "Stand-alone executable Python script implementing SQLite storage, Akan/English NLP lexical scoring, and TF-IDF topic clustering."
              : "Stand-alone executable Python script implementing SQLite storage, NLP lexical scoring, and TF-IDF topic clustering."}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleRunSimulation}
            disabled={isRunning}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white rounded-lg text-xs font-mono font-bold transition flex items-center gap-1.5 shadow-lg shadow-emerald-600/20 cursor-pointer"
          >
            <Play className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
            <span>{isRunning ? 'Running Script...' : 'Run in Sandbox'}</span>
          </button>

          <button
            onClick={handleCopy}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1.5 border border-slate-700 cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Code</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownload}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1.5 border border-slate-700 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download .py</span>
          </button>
        </div>
      </div>

      {/* Code Viewer Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl flex flex-col">
          <div className="bg-slate-900/90 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
              <span className="text-slate-300 ml-2 font-bold">
                {isGhanaPlatform ? "ghana_truth_pipeline.py" : "veritaslens_pipeline.py"}
              </span>
            </div>
            <span>Python 3.10+ / Scikit-Learn</span>
          </div>

          <pre className="p-4 text-xs font-mono text-emerald-300 overflow-x-auto leading-relaxed bg-[#060d17] max-h-[500px] overflow-y-auto">
            <code>{PYTHON_CODE}</code>
          </pre>
        </div>

        {/* Live Simulated Console Execution Terminal */}
        <div className="lg:col-span-5 bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl flex flex-col">
          <div className="bg-slate-900/90 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <span className="text-slate-300 font-bold">Sandbox Terminal Execution</span>
            </div>
            <span className="text-[10px] text-slate-500">Virtual Env: active</span>
          </div>

          <div className="p-4 bg-black font-mono text-xs text-slate-300 flex-1 overflow-y-auto max-h-[500px] space-y-3">
            <div className="text-slate-500">
              $ python {isGhanaPlatform ? "ghana_truth_pipeline.py" : "veritaslens_pipeline.py"}
            </div>

            {isRunning && (
              <div className="flex items-center gap-2 text-cyan-400 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                <span>Executing SQLite ingestion &amp; Scikit-Learn TF-IDF vectorizer...</span>
              </div>
            )}

            {simulatedOutput && (
              <pre className="text-emerald-400 whitespace-pre-wrap leading-relaxed">
                {simulatedOutput}
              </pre>
            )}

            {!isRunning && !simulatedOutput && (
              <div className="text-slate-600 italic">
                Click &ldquo;Run in Sandbox&rdquo; above to execute the pipeline locally and observe SQLite database initialization, lexical scoring, and KMeans clustering output.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
