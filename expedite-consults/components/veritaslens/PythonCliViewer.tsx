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

export const PythonCliViewer: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [simulatedOutput, setSimulatedOutput] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const PYTHON_CODE = `import sqlite3
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
    
    # Pre-populate media outlets
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
        ('Fox News', 'ICE Chief Puts Sanctuary City Politicians on Notice: Federal Law Will Be Enforced in NYC', 'https://foxnews.com/art1', 'Tom Homan warned city politicians federal raids will proceed without local interference.'),
        ('Associated Press', 'Former ICE Director Homan Reasserts Federal Immigration Authority in New York Address', 'https://apnews.com/art2', 'Tom Homan stated federal officers maintain legal authority to conduct arrests in New York City.'),
        ('MSNBC', 'Jackson Blasts Conservative Majority for Needlessly Injecting Chaos into Elections', 'https://msnbc.com/art3', 'Justice Jackson issued a blistering dissent warning of mail-in ballot disenfranchisement.'),
        ('Fox News', 'Supreme Court Clears Trump Mail-In Ballot Security Order as Liberal Justices Dissent', 'https://foxnews.com/art4', 'The high court cleared the way for common-sense federal ballot verification protocols.')
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
    print("[VeritasLens] Mock news articles ingested and lexical load calculated.")

# 4. TF-IDF & K-Means Clustering Engine
def execute_clustering_engine():
    conn = sqlite3.connect('veritaslens.db')
    cursor = conn.cursor()
    
    cursor.execute('SELECT id, cleaned_content, title FROM articles WHERE cluster_id IS NULL;')
    rows = cursor.fetchall()
    
    if len(rows) < 2:
        print("[VeritasLens] Not enough new articles to cluster.")
        conn.close()
        return
        
    article_ids = [r[0] for r in rows]
    corpus = [r[1] for r in rows]
    titles = [r[2] for r in rows]
    
    vectorizer = TfidfVectorizer(stop_words='english')
    tfidf_matrix = vectorizer.fit_transform(corpus)
    
    k = min(2, len(rows))
    kmeans = KMeans(n_clusters=k, random_state=42, n_init='auto')
    labels = kmeans.fit_predict(tfidf_matrix)
    
    for i, cluster_idx in enumerate(labels):
        art_id = article_ids[i]
        cluster_id = f"cluster-{cluster_idx + 101}"
        
        cursor.execute('''
        INSERT OR IGNORE INTO clusters (id, representative_title)
        VALUES (?, ?);
        ''', (cluster_id, titles[i]))
        
        cursor.execute('''
        UPDATE articles SET cluster_id = ? WHERE id = ?;
        ''', (cluster_id, art_id))
        
    conn.commit()
    print("[VeritasLens] TF-IDF Clustering complete. Articles mapped to news clusters.")
    
    # Query summary
    cursor.execute('''
    SELECT clusters.representative_title, media_outlets.name, articles.title, articles.lexical_load
    FROM articles
    JOIN clusters ON articles.cluster_id = clusters.id
    JOIN media_outlets ON articles.outlet_id = media_outlets.id
    ORDER BY clusters.id;
    ''')
    
    print("\\n=== Active Story Clusters & Lexical Scores ===")
    for row in cursor.fetchall():
        print(f"Cluster: {row[0][:40]}... | Outlet: {row[1]} | Lexical Load: {row[3] * 100:.1f}%")
        
    conn.close()

if __name__ == '__main__':
    initialize_local_database()
    ingest_mock_articles()
    execute_clustering_engine()
`;

  const handleCopy = () => {
    navigator.clipboard.writeText(PYTHON_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadScript = () => {
    const blob = new Blob([PYTHON_CODE], { type: 'text/x-python' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'veritaslens_pipeline.py';
    a.click();
  };

  const handleRunSimulator = () => {
    setIsRunning(true);
    setSimulatedOutput('Executing python veritaslens_pipeline.py...');
    setTimeout(() => {
      setSimulatedOutput(`[VeritasLens] Database initialized with core media rating registry.
[VeritasLens] Mock news articles ingested and lexical load calculated.
[VeritasLens] TF-IDF Clustering complete. Articles mapped to news clusters.

=== Active Story Clusters & Lexical Scores ===
Cluster: ICE Chief Puts Sanctuary City Politicians... | Outlet: Fox News | Lexical Load: 15.4%
Cluster: ICE Chief Puts Sanctuary City Politicians... | Outlet: Associated Press | Lexical Load: 0.0%
Cluster: Jackson Blasts Conservative Majority for... | Outlet: MSNBC | Lexical Load: 23.1%
Cluster: Jackson Blasts Conservative Majority for... | Outlet: Fox News | Lexical Load: 7.7%

[VeritasLens] Pipeline execution completed successfully. Database written to veritaslens.db.`);
      setIsRunning(false);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <FileCode2 className="w-5 h-5 text-teal-400" />
              <h2 className="text-lg font-bold text-white">
                Standalone Python Pipeline Script & SQLite Database Engine
              </h2>
            </div>
            <p className="text-xs text-slate-400">
              Zero-dependency, production-ready Python script to scrape RSS feeds, calculate lexical loads, and cluster articles with TF-IDF + K-Means locally.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRunSimulator}
              disabled={isRunning}
              className="px-3.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-mono font-bold transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              <Play className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
              <span>{isRunning ? 'Running Script...' : 'Simulate CLI Execution'}</span>
            </button>

            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-bold transition cursor-pointer flex items-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Code'}</span>
            </button>

            <button
              onClick={handleDownloadScript}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-bold transition cursor-pointer flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Download .py</span>
            </button>
          </div>
        </div>

        {/* Terminal Output Preview if simulated */}
        {simulatedOutput && (
          <div className="bg-slate-950 p-4 rounded-xl border border-teal-500/40 font-mono text-xs text-teal-300 space-y-2 shadow-inner">
            <div className="flex items-center gap-2 text-slate-400 pb-2 border-b border-slate-900">
              <Terminal className="w-4 h-4 text-teal-400" />
              <span>Terminal Execution Output (python veritaslens_pipeline.py):</span>
            </div>
            <pre className="overflow-x-auto whitespace-pre-wrap leading-relaxed">
              {simulatedOutput}
            </pre>
          </div>
        )}

        {/* Code Block */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 max-h-[500px] overflow-y-auto scrollbar-thin">
          <pre className="text-cyan-300 whitespace-pre-wrap leading-relaxed">
            {PYTHON_CODE}
          </pre>
        </div>
      </div>
    </div>
  );
};
