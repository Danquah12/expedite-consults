#!/usr/bin/env python3
"""
VeritasLens Local Pipeline Engine
=================================
Simulates zero-dependency SQLite ingestion, lexical load analysis, 
and TF-IDF + K-Means clustering across major American media outlets.
"""

import sqlite3
import re
from datetime import datetime, timezone

try:
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.cluster import KMeans
    SKLEARN_AVAILABLE = True
except ImportError:
    SKLEARN_AVAILABLE = False


def initialize_local_database():
    """Create local SQLite tables and seed media rating registry."""
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


def calculate_lexical_load(text):
    """Calculates percentage of loaded / emotional words in text."""
    emotional_words = r'\b(threats|escalating|blasts|chaos|dodge|radical|disenfranchise|blistering|scathing|bombshell|panic|destroy)\b'
    words_found = re.findall(emotional_words, text.lower())
    total_tokens = len(text.split())
    if total_tokens == 0:
        return 0.0
    return round(len(words_found) / total_tokens, 3)


def ingest_mock_articles():
    """Simulates ingestion from RSS feeds."""
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
    
    pub_date = datetime.now(timezone.utc).isoformat()
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


def execute_clustering_engine():
    """Clusters articles using TF-IDF and K-Means."""
    conn = sqlite3.connect('veritaslens.db')
    cursor = conn.cursor()
    
    cursor.execute('SELECT id, cleaned_content, title FROM articles WHERE cluster_id IS NULL;')
    rows = cursor.fetchall()
    
    if len(rows) < 2:
        print("[VeritasLens] Not enough unclustered articles.")
        conn.close()
        return
        
    article_ids = [r[0] for r in rows]
    corpus = [r[1] for r in rows]
    titles = [r[2] for r in rows]
    
    if SKLEARN_AVAILABLE:
        vectorizer = TfidfVectorizer(stop_words='english')
        tfidf_matrix = vectorizer.fit_transform(corpus)
        k = min(2, len(rows))
        kmeans = KMeans(n_clusters=k, random_state=42, n_init='auto')
        labels = kmeans.fit_predict(tfidf_matrix)
    else:
        # Fallback heuristic clusterer if scikit-learn is not installed in environment
        labels = [0 if 'homan' in c.lower() or 'sanctuary' in c.lower() else 1 for c in corpus]
    
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
    print("[VeritasLens] Clustering complete. Articles mapped to news clusters.")
    
    cursor.execute('''
    SELECT clusters.representative_title, media_outlets.name, articles.title, articles.lexical_load
    FROM articles
    JOIN clusters ON articles.cluster_id = clusters.id
    JOIN media_outlets ON articles.outlet_id = media_outlets.id
    ORDER BY clusters.id;
    ''')
    
    print("\n=== Active Story Clusters & Lexical Scores ===")
    for row in cursor.fetchall():
        print(f"Cluster: {row[0][:40]}... | Outlet: {row[1]} | Lexical Load: {row[3] * 100:.1f}%")
        
    conn.close()


if __name__ == '__main__':
    initialize_local_database()
    ingest_mock_articles()
    execute_clustering_engine()
    print("\n[VeritasLens] Script completed successfully.")
